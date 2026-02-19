// ===== CAFÉ O TÉ — SERVER =====
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ===== STATE =====
const rooms = new Map();      // code -> room
const matchQueues = { eu: [], us: [], as: [] }; // per-region queues
const playerRoom = new Map();  // socketId -> roomCode

// ===== HELPERS =====
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function createRoom(code, hostSocket, hostName) {
  const room = {
    code,
    hostId: hostSocket.id,
    players: [{ id: hostSocket.id, name: hostName }],
    state: 'lobby',   // lobby | playing
    thinker: null,
    guesser: null,
    word: null,
    history: [],
    round: 1,
  };
  rooms.set(code, room);
  playerRoom.set(hostSocket.id, code);
  hostSocket.join(code);
  return room;
}

function roomData(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players,
  };
}

function startGameInRoom(room, io) {
  // Alternate roles each round
  const p = room.players;
  const thinkerIndex = (room.round - 1) % 2;
  room.thinker = p[thinkerIndex].id;
  room.guesser = p[1 - thinkerIndex].id;

  const roles = {};
  roles[room.thinker] = 'thinker';
  roles[room.guesser] = 'guesser';

  const playerNames = {};
  p.forEach(pl => { playerNames[pl.id] = pl.name; });

  room.word = null;
  room.history = [];
  room.state = 'playing';

  io.to(room.code).emit('game_start', {
    roles,
    players: playerNames,
    round: room.round,
  });
}

function leaveRoom(socket, io) {
  const code = playerRoom.get(socket.id);
  if (!code) return;
  const room = rooms.get(code);
  if (!room) return;

  room.players = room.players.filter(p => p.id !== socket.id);
  playerRoom.delete(socket.id);
  socket.leave(code);

  if (room.players.length === 0) {
    rooms.delete(code);
  } else {
    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
    }
    io.to(code).emit('room_updated', roomData(room));
    if (room.state === 'playing') {
      io.to(code).emit('opponent_left');
      room.state = 'lobby';
    }
  }
}

// ===== SOCKET EVENTS =====
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // --- CREATE ROOM ---
  socket.on('create_room', ({ name }) => {
    const code = generateCode();
    const room = createRoom(code, socket, name);
    socket.emit('room_created', roomData(room));
  });

  // --- JOIN ROOM ---
  socket.on('join_room', ({ name, code }) => {
    const upperCode = code.toUpperCase();
    const room = rooms.get(upperCode);

    if (!room) {
      socket.emit('join_error', { message: 'Sala no encontrada' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('join_error', { message: 'Sala llena' });
      return;
    }
    if (room.state !== 'lobby') {
      socket.emit('join_error', { message: 'Partida en curso' });
      return;
    }

    room.players.push({ id: socket.id, name });
    playerRoom.set(socket.id, upperCode);
    socket.join(upperCode);

    socket.emit('room_joined', roomData(room));
    socket.to(upperCode).emit('room_updated', roomData(room));
    io.to(upperCode).emit('room_updated', roomData(room));
  });

  // --- LEAVE ROOM ---
  socket.on('leave_room', () => {
    leaveRoom(socket, io);
  });

  // --- FIND RANDOM ---
  socket.on('find_random', ({ name, server }) => {
    const region = ['eu','us','as'].includes(server) ? server : 'eu';
    const queue = matchQueues[region];
    socket._gameName = name;
    socket._gameServer = region;

    // Try to find someone in same region
    if (queue.length > 0) {
      const otherSocket = queue.shift();
      if (!otherSocket.connected) {
        queue.push(socket);
        return;
      }
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
    // We don't send the word to server for privacy, just signal ready
    socket.to(code).emit('word_ready');
  });

  // --- SEND QUESTION ---
  socket.on('send_question', ({ code, optA, optB }) => {
    const room = rooms.get(code);
    if (!room || room.guesser !== socket.id) return;
    room.history.push({ optA, optB });
    socket.to(code).emit('question_received', { optA, optB });
  });

  // --- ANSWER QUESTION ---
  socket.on('answer_question', ({ code, choice }) => {
    const room = rooms.get(code);
    if (!room || room.thinker !== socket.id) return;

    const last = room.history[room.history.length - 1];
    if (!last) return;
    last.choice = choice;

    socket.to(code).emit('answer_received', { optA: last.optA, optB: last.optB, choice });
    socket.emit('question_answered', { optA: last.optA, optB: last.optB, choice });
  });

  // --- MAKE GUESS ---
  socket.on('make_guess', ({ code, guess }) => {
    const room = rooms.get(code);
    if (!room || room.guesser !== socket.id) return;

    // We ask the thinker to confirm
    socket.to(code).emit('guess_attempt', { guess, guesserName: room.players.find(p => p.id === socket.id)?.name });
  });

  // --- CONFIRM GUESS (THINKER) ---
  socket.on('confirm_guess', ({ code, correct, word }) => {
    const room = rooms.get(code);
    if (!room || room.thinker !== socket.id) return;

    const guesserName = room.players.find(p => p.id === room.guesser)?.name;
    const thinkerName = room.players.find(p => p.id === room.thinker)?.name;

    // Store word in room for reference
    if (word) room.word = word;

    io.to(code).emit('game_over', {
      correct,
      word: room.word || word || '???',
      guesserName,
      thinkerName,
      questions: room.history.length,
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
    for (const queue of Object.values(matchQueues)) {
      const idx = queue.indexOf(socket);
      if (idx > -1) { queue.splice(idx, 1); break; }
    }
    leaveRoom(socket, io);
  });
});

// ===== START =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`☕ Café o Té server running on http://localhost:${PORT}`);
});


