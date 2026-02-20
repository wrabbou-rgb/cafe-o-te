const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ['websocket'] });

app.use(express.static(path.join(__dirname, 'public')));

// ===== STATE =====
const rooms = new Map();
const playerRoom = new Map();
const matchQueues = {}; // keyed by 'region_lang' e.g. 'eu_es', 'us_en'

// Penalty tracking: clientId (persistent) -> { quits, penaltyUntil }
const penalties = new Map();
const QUIT_PENALTIES = [0, 60, 300, 900, 3600]; // 0, 1min, 5min, 15min, 1h
const socketToClient = new Map(); // socketId -> clientId

const TURN_TIMEOUT = 45000; // 45 seconds

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}

function createRoom(code, socket, name) {
  const room = {
    code, hostId: socket.id,
    players: [{ id: socket.id, name }],
    state: 'lobby', thinker: null, guesser: null,
    history: [], word: null, rematchVotes: null,
    round: 1, turnTimer: null,
  };
  rooms.set(code, room);
  playerRoom.set(socket.id, code);
  socket.join(code);
  return room;
}

function roomData(room) {
  return { code: room.code, hostId: room.hostId, players: room.players, state: room.state };
}

function clearTurnTimer(room) {
  if (room.turnTimer) { clearTimeout(room.turnTimer); room.turnTimer = null; }
}

function startTurnTimer(room, code, waitingFor) {
  clearTurnTimer(room);
  room.turnTimer = setTimeout(() => {
    if (!rooms.has(code)) return;
    io.to(code).emit('opponent_timeout');
    room.state = 'lobby';
    clearTurnTimer(room);
  }, TURN_TIMEOUT);
}

function startGameInRoom(room, io) {
  const [p1, p2] = room.players;
  const thinker = room.round % 2 === 1 ? p1 : p2;
  const guesser = thinker.id === p1.id ? p2 : p1;
  room.thinker = thinker.id;
  room.guesser = guesser.id;
  room.state = 'playing';
  room.history = [];
  room.word = null;

  const roles = { [thinker.id]: 'thinker', [guesser.id]: 'guesser' };
  const players = { [p1.id]: p1.name, [p2.id]: p2.name };
  io.to(room.code).emit('game_start', { roles, players, round: room.round });

  // Start timer for thinker to choose word
  startTurnTimer(room, room.code, 'word');
}

function leaveRoom(socket, io) {
  const code = playerRoom.get(socket.id);
  if (!code) return;
  const room = rooms.get(code);
  if (!room) return;

  clearTurnTimer(room);
  room.players = room.players.filter(p => p.id !== socket.id);
  playerRoom.delete(socket.id);
  socket.leave(code);

  if (room.players.length === 0) {
    rooms.delete(code);
  } else {
    if (room.hostId === socket.id) room.hostId = room.players[0].id;
    io.to(code).emit('room_updated', roomData(room));
    if (room.state === 'playing') {
      io.to(code).emit('opponent_left');
      room.state = 'lobby';
    }
  }
}

function getClientId(socketId) {
  return socketToClient.get(socketId) || socketId;
}

function recordQuit(socketId) {
  const clientId = getClientId(socketId);
  const now = Date.now();
  let rec = penalties.get(clientId) || { quits: 0, penaltyUntil: 0 };
  rec.quits = Math.min(rec.quits + 1, QUIT_PENALTIES.length - 1);
  const penaltyMs = QUIT_PENALTIES[rec.quits] * 1000;
  rec.penaltyUntil = now + penaltyMs;
  penalties.set(clientId, rec);
  return { quits: rec.quits, penaltySeconds: QUIT_PENALTIES[rec.quits] };
}

function checkPenalty(socketId) {
  const clientId = getClientId(socketId);
  const rec = penalties.get(clientId);
  if (!rec) return 0;
  const remaining = Math.ceil((rec.penaltyUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

// ===== SOCKET EVENTS =====
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // --- REGISTER CLIENT ID (persistent across reloads) ---
  socket.on('register_client', ({ clientId }) => {
    if (clientId) socketToClient.set(socket.id, clientId);
  });

  // --- CHECK PENALTY ---
  socket.on('check_penalty', () => {
    const remaining = checkPenalty(socket.id);
    if (remaining > 0) socket.emit('penalty_active', { seconds: remaining });
  });

  // --- CREATE ROOM ---
  socket.on('create_room', ({ name }) => {
    const pen = checkPenalty(socket.id);
    if (pen > 0) { socket.emit('penalty_active', { seconds: pen }); return; }
    const code = generateCode();
    const room = createRoom(code, socket, name);
    socket.emit('room_created', roomData(room));
  });

  // --- JOIN ROOM ---
  socket.on('join_room', ({ name, code }) => {
    const pen = checkPenalty(socket.id);
    if (pen > 0) { socket.emit('penalty_active', { seconds: pen }); return; }
    const upperCode = code.toUpperCase();
    const room = rooms.get(upperCode);
    if (!room) { socket.emit('join_error', { message: 'Sala no encontrada' }); return; }
    if (room.players.length >= 2) { socket.emit('join_error', { message: 'Sala llena' }); return; }
    if (room.state !== 'lobby') { socket.emit('join_error', { message: 'Partida en curso' }); return; }

    room.players.push({ id: socket.id, name });
    playerRoom.set(socket.id, upperCode);
    socket.join(upperCode);
    const rd = roomData(room);
    socket.emit('room_joined', rd);
    io.to(upperCode).emit('room_updated', rd);
    console.log(`Player ${name} joined room ${upperCode}`);
  });

  // --- LEAVE ROOM (voluntary) ---
  socket.on('leave_room', () => {
    const code = playerRoom.get(socket.id);
    const room = code ? rooms.get(code) : null;
    const wasPlaying = room && room.state === 'playing';
    leaveRoom(socket, io);
    // No penalty for leaving lobby/result screen
    // Penalty only if they explicitly quit mid-game (handled by quit_game event)
  });

  // --- QUIT GAME (mid-game intentional quit) ---
  socket.on('quit_game', () => {
    const code = playerRoom.get(socket.id);
    const room = code ? rooms.get(code) : null;
    if (room && room.state === 'playing') {
      const penalty = recordQuit(socket.id);
      socket.emit('quit_penalty', penalty);
      clearTurnTimer(room);
      room.players = room.players.filter(p => p.id !== socket.id);
      playerRoom.delete(socket.id);
      socket.leave(code);
      if (room.players.length === 0) {
        rooms.delete(code);
      } else {
        if (room.hostId === socket.id) room.hostId = room.players[0].id;
        io.to(code).emit('opponent_left');
        room.state = 'lobby';
      }
    } else {
      leaveRoom(socket, io);
    }
  });

  // --- FIND RANDOM ---
  socket.on('find_random', ({ name, server, lang }) => {
    const pen = checkPenalty(socket.id);
    if (pen > 0) { socket.emit('penalty_active', { seconds: pen }); return; }
    const region = ['eu','us','as'].includes(server) ? server : 'eu';
    const language = ['es','en','fr','de','pt','ru','zh'].includes(lang) ? lang : 'es';
    const queueKey = `${region}_${language}`;
    if (!matchQueues[queueKey]) matchQueues[queueKey] = [];
    const queue = matchQueues[queueKey];
    socket._gameName = name;
    socket._gameServer = region;
    socket._gameLang = language;
    if (queue.length > 0) {
      const otherSocket = queue.shift();
      if (!otherSocket.connected) { queue.push(socket); return; }
      const code = generateCode();
      const room = createRoom(code, otherSocket, otherSocket._gameName);
      room.players.push({ id: socket.id, name });
      playerRoom.set(socket.id, code);
      socket.join(code);
      otherSocket.emit('matched', { code });
      socket.emit('matched', { code });
      startGameInRoom(room, io);
    } else {
      queue.push(socket);
    }
  });

  // --- CANCEL MATCHMAKING ---
  socket.on('cancel_matchmaking', () => {
    for (const queue of Object.values(matchQueues)) {
      const idx = queue.indexOf(socket);
      if (idx > -1) { queue.splice(idx, 1); break; }
    }
  });

  // --- START GAME (HOST) ---
  socket.on('start_game', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id || room.players.length < 2) return;
    startGameInRoom(room, io);
  });

  // --- WORD CHOSEN ---
  socket.on('word_chosen', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.thinker !== socket.id) return;
    clearTurnTimer(room);
    socket.to(code).emit('word_ready');
    // Timer for guesser to start asking (thinker now chooses café/té)
    startTurnTimer(room, code, 'first_choice');
  });

  // --- FIRST CHOICE ---
  socket.on('first_choice', ({ code, optA, optB, choice }) => {
    const room = rooms.get(code);
    if (!room || room.thinker !== socket.id) return;
    clearTurnTimer(room);
    room.history.push({ optA, optB, choice });
    socket.emit('first_choice_confirmed', { optA, optB, choice });
    socket.to(code).emit('first_choice_made', { optA, optB, choice });
    // Timer for guesser to send first question
    startTurnTimer(room, code, 'question');
  });

  // --- SEND QUESTION ---
  socket.on('send_question', ({ code, optA, optB }) => {
    const room = rooms.get(code);
    if (!room || room.guesser !== socket.id) return;
    clearTurnTimer(room);
    room.history.push({ optA, optB });
    socket.to(code).emit('question_received', { optA, optB });
    // Timer for thinker to answer
    startTurnTimer(room, code, 'answer');
  });

  // --- ANSWER QUESTION ---
  socket.on('answer_question', ({ code, choice }) => {
    const room = rooms.get(code);
    if (!room || room.thinker !== socket.id) return;
    clearTurnTimer(room);
    const last = room.history[room.history.length - 1];
    if (!last) return;
    last.choice = choice;
    socket.to(code).emit('answer_received', { optA: last.optA, optB: last.optB, choice });
    socket.emit('question_answered', { optA: last.optA, optB: last.optB, choice });
    // Timer for guesser to ask next question
    startTurnTimer(room, code, 'question');
  });

  // --- MAKE GUESS ---
  socket.on('make_guess', ({ code, guess }) => {
    const room = rooms.get(code);
    if (!room || room.guesser !== socket.id) return;
    clearTurnTimer(room);
    socket.to(code).emit('guess_attempt', { guess });
    // Timer for thinker to confirm
    startTurnTimer(room, code, 'confirm');
  });

  // --- CONFIRM GUESS (THINKER) ---
  socket.on('confirm_guess', ({ code, correct, word }) => {
    const room = rooms.get(code);
    if (!room || room.thinker !== socket.id) return;
    clearTurnTimer(room);
    if (word) room.word = word;
    const guesserName = room.players.find(p => p.id === room.guesser)?.name;
    io.to(code).emit('game_over', {
      correct, word: room.word || word || '???',
      guesserName, questions: room.history.length,
    });
    room.state = 'lobby';
  });

  // --- PLAY AGAIN ---
  socket.on('play_again', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    if (!room.rematchVotes) room.rematchVotes = new Set();
    room.rematchVotes.add(socket.id);
    if (room.rematchVotes.size >= 2) {
      room.rematchVotes = null;
      room.round += 1;
      startGameInRoom(room, io);
    } else {
      socket.to(code).emit('play_again_request');
    }
  });

  // --- DISCONNECT ---
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    socketToClient.delete(socket.id);
    for (const queue of Object.values(matchQueues)) {
      const idx = queue.indexOf(socket);
      if (idx > -1) { queue.splice(idx, 1); break; }
    }
    leaveRoom(socket, io);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`☕ Café o Té server on http://localhost:${PORT}`));


