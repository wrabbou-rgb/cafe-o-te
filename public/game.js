// ===== CAFÉ O TÉ — CLIENT GAME LOGIC =====

// Forzar WebSocket puro (requerido por Google Cloud Run)
const socket = io({ transports: ['websocket'] });
let state = {
  playerName: '',
  roomCode: '',
  role: null, // 'thinker' | 'guesser'
  wordChosen: '',
  waitingForAnswer: false,
  gameHistory: [],
  isHost: false,
  opponentName: '',
  round: 1,
};

// ===== SCREEN MANAGEMENT =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showToast(msg, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

// ===== HOME =====
function goToPlay() {
  const name = document.getElementById('player-name').value.trim();
  if (!name) {
    document.getElementById('name-error').style.display = 'block';
    document.getElementById('player-name').focus();
    return;
  }
  document.getElementById('name-error').style.display = 'none';
  state.playerName = name;
  showScreen('screen-play');
}

function showHowToPlay() {
  document.getElementById('modal-howto').classList.add('active');
}
function closeHowToPlay() {
  document.getElementById('modal-howto').classList.remove('active');
}

// ===== MATCHMAKING =====
function findRandom() {
  showScreen('screen-matchmaking');
  socket.emit('find_random', { name: state.playerName });
}

function cancelMatchmaking() {
  socket.emit('cancel_matchmaking');
  showScreen('screen-play');
}

// ===== PRIVATE ROOM =====
function createRoom() {
  socket.emit('create_room', { name: state.playerName });
}

function showJoinRoom() {
  document.getElementById('join-code').value = '';
  document.getElementById('join-error').style.display = 'none';
  showScreen('screen-join');
}

function joinRoom() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (code.length < 2) return;
  socket.emit('join_room', { name: state.playerName, code });
}

function leaveLobby() {
  socket.emit('leave_room');
  showScreen('screen-play');
}

function copyRoomCode() {
  navigator.clipboard.writeText(state.roomCode).then(() => {
    showToast('Código copiado ✓');
  });
}

function updateLobby(data) {
  state.roomCode = data.code;
  state.isHost = data.hostId === socket.id;
  document.getElementById('room-code-display').textContent = data.code;

  const list = document.getElementById('players-list');
  list.innerHTML = data.players.map(p => `
    <div class="player-item">
      <div class="player-avatar">${p.name.charAt(0).toUpperCase()}</div>
      <span class="player-name">${p.name}</span>
      ${p.id === data.hostId ? '<span class="player-host">★ Anfitrión</span>' : ''}
    </div>
  `).join('');

  const startBtn = document.getElementById('start-game-btn');
  const statusEl = document.getElementById('lobby-status');

  if (data.players.length >= 2 && state.isHost) {
    startBtn.style.display = 'block';
    statusEl.innerHTML = '¡Listo para jugar!';
  } else if (data.players.length >= 2) {
    startBtn.style.display = 'none';
    statusEl.innerHTML = 'Esperando que el anfitrión inicie<span class="waiting-dots"><span></span><span></span><span></span></span>';
  } else {
    startBtn.style.display = 'none';
    statusEl.innerHTML = 'Esperando jugadores<span class="waiting-dots"><span></span><span></span><span></span></span>';
  }
}

function startGame() {
  socket.emit('start_game', { code: state.roomCode });
}

// ===== GAME: THINKER =====
function initThinker(data) {
  state.role = 'thinker';
  state.opponentName = data.opponentName;
  state.gameHistory = [];
  state.wordChosen = '';
  state.waitingForAnswer = false;
  state.round = data.round || 1;

  document.getElementById('round-num').textContent = state.round;
  document.getElementById('vs-name-thinker').textContent = state.opponentName;
  document.getElementById('thinking-word-display').textContent = '¿En quién estás pensando?';
  document.getElementById('thinking-input-row').style.display = 'flex';
  document.getElementById('thinker-waiting').style.display = 'none';
  document.getElementById('answer-section').style.display = 'none';
  document.getElementById('thinking-word-input').value = '';
  document.getElementById('history-thinker').innerHTML = '';

  showScreen('screen-thinker');
}

function submitThinkingWord() {
  const word = document.getElementById('thinking-word-input').value.trim();
  if (!word) return;
  state.wordChosen = word;
  document.getElementById('thinking-word-display').textContent = word;
  document.getElementById('thinking-input-row').style.display = 'none';
  document.getElementById('thinker-waiting').style.display = 'block';
  socket.emit('word_chosen', { code: state.roomCode });
}

function answerQuestion(choice) {
  socket.emit('answer_question', { code: state.roomCode, choice });
  document.getElementById('answer-section').style.display = 'none';
  document.getElementById('thinker-waiting').style.display = 'block';
}

// ===== GAME: GUESSER =====
function initGuesser(data) {
  state.role = 'guesser';
  state.opponentName = data.opponentName;
  state.gameHistory = [];
  state.waitingForAnswer = false;
  state.round = data.round || 1;

  document.getElementById('round-num-g').textContent = state.round;
  document.getElementById('vs-name-guesser').textContent = state.opponentName;
  document.getElementById('guesser-waiting').style.display = 'block';
  document.getElementById('question-builder').style.display = 'none';
  document.getElementById('guesser-answer-display').style.display = 'none';
  document.getElementById('opt-a-input').value = '';
  document.getElementById('opt-b-input').value = '';
  document.getElementById('guess-input').value = '';
  document.getElementById('guess-error').style.display = 'none';
  document.getElementById('history-guesser').innerHTML = '';

  showScreen('screen-guesser');
}

function sendQuestion() {
  if (state.waitingForAnswer) {
    document.getElementById('guess-error').style.display = 'block';
    setTimeout(() => document.getElementById('guess-error').style.display = 'none', 2000);
    return;
  }
  const optA = document.getElementById('opt-a-input').value.trim();
  const optB = document.getElementById('opt-b-input').value.trim();
  if (!optA || !optB) { showToast('Escribe las dos opciones'); return; }

  state.waitingForAnswer = true;
  document.getElementById('guesser-answer-display').style.display = 'none';
  socket.emit('send_question', { code: state.roomCode, optA, optB });
}

function makeGuess() {
  const guess = document.getElementById('guess-input').value.trim();
  if (!guess) return;
  socket.emit('make_guess', { code: state.roomCode, guess });
}

function addToHistory(optA, optB, choice, container) {
  const el = document.getElementById(container);
  const label = choice === 'A' ? `☕ ${optA}` : `🍵 ${optB}`;
  el.innerHTML += `
    <div class="history-item">
      <span>¿${optA} o ${optB}?</span>
      <span class="chosen">${label}</span>
    </div>`;
}

// ===== RESULT =====
function showResult(data) {
  const won = data.correct;
  document.getElementById('result-emoji').textContent = won ? '🎉' : '😅';
  document.getElementById('result-title').textContent = won ? '¡Lo adivinaste!' : 'Se acabó el tiempo';
  document.getElementById('result-word').textContent = data.word;
  document.getElementById('result-sub').textContent = won
    ? `Era: ${data.guesser} adivinó en ${data.questions} preguntas`
    : `La palabra era: ${data.word}`;
  showScreen('screen-result');
}

function playAgain() {
  socket.emit('play_again', { code: state.roomCode });
  showToast('Esperando que el rival confirme...');
}

function backToHome() {
  socket.emit('leave_room');
  showScreen('screen-home');
}

function confirmGuess(correct) {
  socket.emit('confirm_guess', { code: state.roomCode, correct });
  document.getElementById('guess-confirm-section').style.display = 'none';
  document.getElementById('thinker-waiting').style.display = 'block';
}

// ===== SOCKET EVENTS =====

socket.on('room_created', (data) => {
  state.roomCode = data.code;
  updateLobby(data);
  showScreen('screen-lobby');
});

socket.on('room_joined', (data) => {
  state.roomCode = data.code;
  updateLobby(data);
  showScreen('screen-lobby');
});

socket.on('room_updated', (data) => {
  updateLobby(data);
});

socket.on('join_error', (data) => {
  document.getElementById('join-error').textContent = data.message;
  document.getElementById('join-error').style.display = 'block';
});

socket.on('matched', (data) => {
  state.roomCode = data.code;
  // Will receive game_start right after
});

socket.on('game_start', (data) => {
  const myRole = data.roles[socket.id];
  const opponentId = Object.keys(data.roles).find(id => id !== socket.id);
  const opponentName = data.players[opponentId];
  state.opponentName = opponentName;

  if (myRole === 'thinker') {
    initThinker({ opponentName, round: data.round });
  } else {
    initGuesser({ opponentName, round: data.round });
  }
});

socket.on('word_ready', () => {
  // Guesser: thinker has chosen their word
  document.getElementById('guesser-waiting').style.display = 'none';
  document.getElementById('question-builder').style.display = 'block';
  showToast('¡El pensador eligió! Empieza a preguntar ☕');
});

socket.on('question_received', (data) => {
  // Thinker: guesser sent a question
  document.getElementById('thinker-waiting').style.display = 'none';
  document.getElementById('answer-section').style.display = 'block';
  document.getElementById('current-question-thinker').innerHTML =
    `¿<span class="opt-a">${data.optA}</span> o <span class="opt-b">${data.optB}</span>?`;
  document.getElementById('opt-a-label').textContent = data.optA;
  document.getElementById('opt-b-label').textContent = data.optB;
});

socket.on('answer_received', (data) => {
  // Guesser: thinker answered
  state.waitingForAnswer = false;
  const label = data.choice === 'A' ? `☕ ${data.optA}` : `🍵 ${data.optB}`;
  document.getElementById('guesser-answer-display').style.display = 'block';
  document.getElementById('answer-received').textContent = label;
  addToHistory(data.optA, data.optB, data.choice, 'history-guesser');
  document.getElementById('opt-a-input').value = '';
  document.getElementById('opt-b-input').value = '';
});

socket.on('question_answered', (data) => {
  // Thinker: confirm they answered
  addToHistory(data.optA, data.optB, data.choice, 'history-thinker');
  document.getElementById('thinker-waiting').style.display = 'block';
});

socket.on('guess_attempt', (data) => {
  // Thinker sees what the guesser guessed
  document.getElementById('thinker-waiting').style.display = 'none';
  document.getElementById('answer-section').style.display = 'none';
  document.getElementById('guess-confirm-section').style.display = 'block';
  document.getElementById('guess-attempt-display').textContent = data.guess;
});

socket.on('guess_result', (data) => {
  if (data.correct) {
    showResult({
      correct: true,
      word: data.word,
      guesser: state.opponentName,
      questions: data.questions,
    });
  } else {
    showToast('❌ ¡Incorrecto! Sigue preguntando');
    if (state.role === 'guesser') {
      state.waitingForAnswer = false;
    }
  }
});

socket.on('game_over', (data) => {
  showResult({
    correct: data.correct,
    word: data.word,
    guesser: data.guesserName,
    questions: data.questions,
  });
});

socket.on('opponent_left', () => {
  showToast('El rival abandonó la partida 😞', 3000);
  setTimeout(() => showScreen('screen-play'), 2000);
});

socket.on('play_again_ready', () => {
  showToast('¡Revancha! Empezamos...');
});

socket.on('error', (data) => {
  showToast('Error: ' + data.message);
});

// Enter key shortcuts
document.getElementById('player-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') goToPlay();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('screen-join').classList.contains('active')) joinRoom();
    if (document.getElementById('screen-thinker').classList.contains('active')) submitThinkingWord();
  }
});
