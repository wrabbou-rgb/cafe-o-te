// ===== CAFÉ O TÉ — CLIENT GAME LOGIC =====

const socket = io({ transports: ['websocket'] });

// ===== TRANSLATIONS =====
const T = {
  es: {
    yourName:'Tu nombre',namePlaceholder:'¿Cómo te llamas?',nameError:'Escribe tu nombre para continuar',
    play:'Jugar ☕',howToPlay:'¿Cómo se juega?',quickMatch:'🎲 Partida rápida (random)',
    createRoom:'🔒 Crear sala privada',joinRoom:'🔑 Unirse con código',back:'Volver',
    searching:'Buscando rival',searchingSub:'Te emparejamos con alguien al azar',cancel:'Cancelar',
    roomCode:'Código de sala',tapToCopy:'Toca el código para copiar',waiting:'Esperando jugadores',
    waitingHost:'Esperando que el anfitrión inicie',ready:'¡Listo para jugar!',start:'¡Empezar!',
    leave:'Salir',joinTitle:'Unirse a sala',joinBtn:'Unirse',roomNotFound:'Sala no encontrada',
    roomFull:'Sala llena',thinkerRole:'🧠 Piensa en una persona o personaje',
    thinkingPrompt:'¿En quién estás pensando?',thinkingPlaceholder:'Ej: Shakira, Harry Potter...',
    ready2:'Listo',guessingMsg:'El otro jugador está adivinando',
    guessAttemptTitle:'El adivinador dice que eres:',correct:'Correcto',incorrect:'Incorrecto',
    guesserRole:'🔍 Adivina en quién está pensando',opponentChoosing:'El otro jugador elige su personaje',
    writeQuestion:'Escribe tu pregunta:',askBtn:'Preguntar',orIfYouKnow:'o si ya sabes',
    guessPlaceholder:'Mi respuesta es...',guessBtn:'¡Adivinar!',
    waitError:'Espera la respuesta antes de preguntar de nuevo',answerLabel:'Respuesta:',
    nextQuestion:'Ahora haz otra pregunta',won:'¡Lo adivinaste!',lost:'Se acabó',
    playAgain:'Jugar otra vez',home:'Inicio',host:'★ Anfitrión',codeCopied:'Código copiado ✓',
    thinkerChose:'¡El pensador eligió! La primera pregunta es ☕ Café o 🍵 Té',
    wrongGuess:'❌ ¡Incorrecto! Sigue preguntando',opponentLeft:'El rival abandonó la partida 😞',
    writeBothOptions:'Escribe las dos opciones',waitingConfirm:'Esperando que el rival confirme...',
    howTitle:'☕ ¿Cómo se juega?',howOk:'¡Entendido!',searchingEntity:'Buscando...',
    noResults:'Sin resultados, escribe tú mismo',fixedOption:'Opción fija:',serverLabel:'Servidor',tagline:'el juego de asociación mental más viral',
    howToPlay2:'¿Cómo quieres jugar?',
    howSteps:[
      ["Zwei Spieler verbinden sich. Einer ist der ","Denker"," (wählt heimlich eine Figur) und der andere der ","Rater"," (stellt Fragen)."],
      ["Der Denker kann jede ","echte Person, fiktive Figur oder Prominente"," wählen. Zum Beispiel: Shakira, Harry Potter, Albert Einstein..."],
      ["Die erste Frage ist IMMER ","Kaffee oder Tee?",". Wenn der Denker Kaffee sagt, bleibt diese Option ","FEST für das gesamte Spiel",". Der Rater kann nur den anderen Begriff ändern."],
      ["Beispiel: War die Antwort Kaffee, könnte die nächste Frage ","Kaffee oder Strand?"," sein, dann ","Kaffee oder Nacht?",", usw. Kaffee bleibt immer fest."],
      ["Wenn der Rater glaubt zu wissen wer es ist, schreibt er seine Antwort. Der Denker bestätigt ","✓ Richtig"," oder ","✗ Falsch",". Bei Fehler weiterspielen!"],
    ]
  },
  en: {
    yourName:'Your name',namePlaceholder:"What's your name?",nameError:'Enter your name to continue',
    play:'Play ☕',howToPlay:'How to play?',quickMatch:'🎲 Quick match (random)',
    createRoom:'🔒 Create private room',joinRoom:'🔑 Join with code',back:'Back',
    searching:'Finding opponent',searchingSub:"We'll match you with someone random",cancel:'Cancel',
    roomCode:'Room code',tapToCopy:'Tap code to copy',waiting:'Waiting for players',
    waitingHost:'Waiting for host to start',ready:'Ready to play!',start:'Start!',
    leave:'Leave',joinTitle:'Join room',joinBtn:'Join',roomNotFound:'Room not found',
    roomFull:'Room is full',thinkerRole:'🧠 Think of a person or character',
    thinkingPrompt:'Who are you thinking of?',thinkingPlaceholder:'E.g.: Shakira, Harry Potter...',
    ready2:'Ready',guessingMsg:'Other player is guessing',guessAttemptTitle:'The guesser thinks you are:',
    correct:'Correct',incorrect:'Wrong',guesserRole:"🔍 Guess who they're thinking of",
    opponentChoosing:'Other player is choosing their character',writeQuestion:'Write your question:',
    askBtn:'Ask',orIfYouKnow:'or if you already know',guessPlaceholder:'My answer is...',
    guessBtn:'Guess!',waitError:'Wait for the answer before asking again',answerLabel:'Answer:',
    nextQuestion:'Now ask another question',won:'You guessed it!',lost:'Game over',
    playAgain:'Play again',home:'Home',host:'★ Host',codeCopied:'Code copied ✓',
    thinkerChose:'Thinker chose! First question is ☕ Coffee or 🍵 Tea',
    wrongGuess:'❌ Wrong! Keep asking',opponentLeft:'Opponent left the game 😞',
    writeBothOptions:'Write both options',waitingConfirm:'Waiting for opponent to confirm...',
    howTitle:'☕ How to play?',howOk:'Got it!',searchingEntity:'Searching...',
    noResults:'No results, type yourself',fixedOption:'Fixed option:',serverLabel:'Server',tagline:'the most viral mental association game',
    howToPlay2:'How do you want to play?',
    howSteps:[
      ['Two players connect. One is the ','Thinker',' and the other the ','Guesser.'],
      ['The Thinker secretly picks a ','person or character',' (real or fictional).'],
      ['The first question is always ','Coffee or Tea?',' and that answer stays fixed throughout.'],
      ['The Thinker picks ','the option that best fits',' their character. No cheating!'],
      ['When the Guesser thinks they know, ','they guess!',' If wrong, keep playing.'],
    ]
  },
  fr: {
    yourName:'Ton prénom',namePlaceholder:"Comment tu t'appelles ?",nameError:'Écris ton prénom pour continuer',
    play:'Jouer ☕',howToPlay:'Comment jouer ?',quickMatch:'🎲 Partie rapide (aléatoire)',
    createRoom:'🔒 Créer une salle privée',joinRoom:'🔑 Rejoindre avec un code',back:'Retour',
    searching:"Recherche d'adversaire",searchingSub:'On te trouvera quelqu\'un au hasard',cancel:'Annuler',
    roomCode:'Code de la salle',tapToCopy:'Touche le code pour copier',waiting:'En attente de joueurs',
    waitingHost:"En attente que l'hôte démarre",ready:'Prêt à jouer !',start:'Commencer !',
    leave:'Quitter',joinTitle:'Rejoindre une salle',joinBtn:'Rejoindre',roomNotFound:'Salle introuvable',
    roomFull:'Salle complète',thinkerRole:'🧠 Pense à une personne ou un personnage',
    thinkingPrompt:'À qui tu penses ?',thinkingPlaceholder:'Ex : Shakira, Harry Potter...',
    ready2:'Prêt',guessingMsg:"L'autre joueur devine",guessAttemptTitle:'Le devineur pense que tu es :',
    correct:'Correct',incorrect:'Incorrect',guesserRole:'🔍 Devine à qui il pense',
    opponentChoosing:"L'autre joueur choisit son personnage",writeQuestion:'Écris ta question :',
    askBtn:'Demander',orIfYouKnow:'ou si tu sais déjà',guessPlaceholder:'Ma réponse est...',
    guessBtn:'Deviner !',waitError:"Attends la réponse avant de poser une autre question",answerLabel:'Réponse :',
    nextQuestion:'Pose une autre question',won:"Tu l'as deviné !",lost:'Fin de partie',
    playAgain:'Rejouer',home:'Accueil',host:'★ Hôte',codeCopied:'Code copié ✓',
    thinkerChose:"Le penseur a choisi ! Première question : ☕ Café ou 🍵 Thé",
    wrongGuess:'❌ Faux ! Continue à demander',opponentLeft:"L'adversaire a quitté 😞",
    writeBothOptions:'Écris les deux options',waitingConfirm:'En attente de confirmation...',
    howTitle:'☕ Comment jouer ?',howOk:'Compris !',searchingEntity:'Recherche...',
    noResults:'Pas de résultats, écris toi-même',fixedOption:'Option fixe :',serverLabel:'Serveur',tagline:'le jeu d\'association mentale le plus viral',
    howToPlay2:'Comment veux-tu jouer ?',
    howSteps:[
      ["Deux joueurs se connectent. L'un est le ","Penseur"," et l'autre le ","Devineur."],
      ["Le Penseur choisit secrètement une ","personne ou un personnage"," (réel ou fictif)."],
      ["La première question est toujours ","Café ou Thé ?"," et cette réponse reste fixe."],
      ["Le Penseur choisit ","l'option qui correspond le mieux"," à son personnage. Sans tricher !"],
      ["Quand le Devineur pense savoir, ","il devine !"," S'il se trompe, on continue."],
    ]
  },
  de: {
    yourName:'Dein Name',namePlaceholder:'Wie heißt du?',nameError:'Schreib deinen Namen um fortzufahren',
    play:'Spielen ☕',howToPlay:'Wie spielt man?',quickMatch:'🎲 Schnelles Spiel (zufällig)',
    createRoom:'🔒 Privaten Raum erstellen',joinRoom:'🔑 Mit Code beitreten',back:'Zurück',
    searching:'Gegner suchen',searchingSub:'Wir suchen jemanden für dich',cancel:'Abbrechen',
    roomCode:'Raumcode',tapToCopy:'Code antippen zum Kopieren',waiting:'Warte auf Spieler',
    waitingHost:'Warte auf den Gastgeber',ready:'Bereit zum Spielen!',start:'Starten!',
    leave:'Verlassen',joinTitle:'Raum beitreten',joinBtn:'Beitreten',roomNotFound:'Raum nicht gefunden',
    roomFull:'Raum ist voll',thinkerRole:'🧠 Denk an eine Person oder Figur',
    thinkingPrompt:'An wen denkst du?',thinkingPlaceholder:'Z.B.: Shakira, Harry Potter...',
    ready2:'Fertig',guessingMsg:'Der andere Spieler rät',guessAttemptTitle:'Der Rater denkt du bist:',
    correct:'Richtig',incorrect:'Falsch',guesserRole:'🔍 Rate an wen er denkt',
    opponentChoosing:'Der andere Spieler wählt seine Figur',writeQuestion:'Schreib deine Frage:',
    askBtn:'Fragen',orIfYouKnow:'oder wenn du es weißt',guessPlaceholder:'Meine Antwort ist...',
    guessBtn:'Raten!',waitError:'Warte auf die Antwort bevor du erneut fragst',answerLabel:'Antwort:',
    nextQuestion:'Stelle jetzt eine weitere Frage',won:'Du hast es erraten!',lost:'Spiel vorbei',
    playAgain:'Nochmal spielen',home:'Startseite',host:'★ Gastgeber',codeCopied:'Code kopiert ✓',
    thinkerChose:'Der Denker hat gewählt! Erste Frage: ☕ Kaffee oder 🍵 Tee',
    wrongGuess:'❌ Falsch! Weiter fragen',opponentLeft:'Gegner hat das Spiel verlassen 😞',
    writeBothOptions:'Schreib beide Optionen',waitingConfirm:'Warte auf Bestätigung...',
    howTitle:'☕ Wie spielt man?',howOk:'Verstanden!',searchingEntity:'Suche...',
    noResults:'Keine Ergebnisse, selbst eingeben',fixedOption:'Feste Option:',serverLabel:'Server',tagline:'das viralste mentale Assoziationsspiel',
    howToPlay2:'Wie möchtest du spielen?',
    howSteps:[
      ['Zwei Spieler verbinden sich. Einer ist der ','Denker',' und der andere der ','Rater.'],
      ['Der Denker wählt heimlich eine ','Person oder Figur',' (real oder fiktiv).'],
      ['Die erste Frage ist immer ','Kaffee oder Tee?',' und diese Antwort bleibt fest.'],
      ['Der Denker wählt immer ','die Option die am besten passt',' zu seiner Figur. Nicht schummeln!'],
      ['Wenn der Rater glaubt es zu wissen, ','rät er!',' Bei Fehler weiterspielen.'],
    ]
  }
};

let lang = 'es';
let state = {
  playerName:'',roomCode:'',role:null,wordChosen:'',waitingForAnswer:false,
  gameHistory:[],isHost:false,opponentName:'',round:1,
  firstAnswerFixed:null,firstQuestion:true,
};

function t(key){ return (T[lang]&&T[lang][key])||T.es[key]||key; }


// ===== SERVER SELECTION =====
let selectedServer = 'eu';
function setServer(s) {
  selectedServer = s;
  document.querySelectorAll('.server-btn').forEach(b => b.classList.toggle('active', b.dataset.s === s));
}

// ===== TITLE TRANSLATIONS =====
const titles = { es:'Café o Té', en:'Coffee or Tea', fr:'Café ou Thé', de:'Kaffee oder Tee' };
function setLang(l){
  lang=l;
  document.querySelectorAll('[data-lang]').forEach(el=>{
    const key=el.getAttribute('data-lang');
    if(el.tagName==='INPUT') el.placeholder=t(key); else el.textContent=t(key);
  });
  renderHowSteps();
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.l===lang));
  // Update page title
  const titleEl = document.getElementById('page-title');
  if(titleEl) titleEl.textContent = '☕ ' + (titles[l] || 'Café o Té');
}

function renderHowSteps(){
  const steps=t('howSteps');
  const container=document.getElementById('how-steps');
  if(!container) return;
  container.innerHTML=steps.map((step,i)=>{
    const content=step.map((part,j)=>j%2===1?`<strong>${part}</strong>`:part).join('');
    return `<div class="how-step"><div class="step-num">${i+1}</div><div class="step-text">${content}</div></div>`;
  }).join('');
}

// ===== WIKIPEDIA SEARCH =====
let searchTimeout=null;
let selectedEntity=null;

async function searchWikipedia(query){
  try{
    const url=`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=7&namespace=0&format=json&origin=*`;
    const res=await fetch(url);
    const data=await res.json();
    showDropdown(data[1],query);
  }catch(e){ hideDropdown(); }
}

function showDropdown(titles,query){
  const dd=document.getElementById('entity-dropdown');
  if(!titles||titles.length===0){
    dd.innerHTML=`<div class="dd-item dd-none">${t('noResults')}</div>`;
    dd.style.display='block'; return;
  }
  dd.innerHTML=titles.map(title=>`<div class="dd-item" onclick="selectEntity('${title.replace(/'/g,"\\'")}')">${title}</div>`).join('');
  dd.style.display='block';
}

function hideDropdown(){
  const dd=document.getElementById('entity-dropdown');
  if(dd) dd.style.display='none';
}

function selectEntity(name){
  selectedEntity=name;
  document.getElementById('thinking-word-input').value=name;
  hideDropdown();
}

function onThinkingInput(e){
  selectedEntity=null;
  const query=e.target.value.trim();
  clearTimeout(searchTimeout);
  if(query.length<2){hideDropdown();return;}
  document.getElementById('entity-dropdown').innerHTML=`<div class="dd-item dd-loading">${t('searchingEntity')}</div>`;
  document.getElementById('entity-dropdown').style.display='block';
  searchTimeout=setTimeout(()=>searchWikipedia(query),400);
}

// ===== SCREENS =====
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  hideDropdown();
}

function showToast(msg,duration=2500){
  const ex=document.querySelector('.toast');
  if(ex) ex.remove();
  const t2=document.createElement('div');
  t2.className='toast'; t2.textContent=msg;
  document.body.appendChild(t2);
  setTimeout(()=>t2.remove(),duration);
}

function goToPlay(){
  const name=document.getElementById('player-name').value.trim();
  if(!name){document.getElementById('name-error').style.display='block';document.getElementById('player-name').focus();return;}
  document.getElementById('name-error').style.display='none';
  state.playerName=name; showScreen('screen-play');
}

function showHowToPlay(){renderHowSteps();document.getElementById('modal-howto').classList.add('active');}
function closeHowToPlay(){document.getElementById('modal-howto').classList.remove('active');}
function findRandom(){showScreen('screen-matchmaking');socket.emit('find_random',{name:state.playerName,server:selectedServer});}
function cancelMatchmaking(){socket.emit('cancel_matchmaking');showScreen('screen-play');}
function createRoom(){socket.emit('create_room',{name:state.playerName});}
function showJoinRoom(){document.getElementById('join-code').value='';document.getElementById('join-error').style.display='none';showScreen('screen-join');}
function joinRoom(){const code=document.getElementById('join-code').value.trim().toUpperCase();if(code.length<2)return;socket.emit('join_room',{name:state.playerName,code});}
function leaveLobby(){socket.emit('leave_room');showScreen('screen-play');}
function copyRoomCode(){navigator.clipboard.writeText(state.roomCode).then(()=>showToast(t('codeCopied')));}

function updateLobby(data){
  state.roomCode=data.code; state.isHost=data.hostId===socket.id;
  document.getElementById('room-code-display').textContent=data.code;
  document.getElementById('players-list').innerHTML=data.players.map(p=>`
    <div class="player-item">
      <div class="player-avatar">${p.name.charAt(0).toUpperCase()}</div>
      <span class="player-name">${p.name}</span>
      ${p.id===data.hostId?`<span class="player-host">${t('host')}</span>`:''}
    </div>`).join('');
  const startBtn=document.getElementById('start-game-btn');
  const statusEl=document.getElementById('lobby-status');
  if(data.players.length>=2&&state.isHost){
    startBtn.style.display='block'; statusEl.innerHTML=t('ready');
  } else if(data.players.length>=2){
    startBtn.style.display='none';
    statusEl.innerHTML=t('waitingHost')+'<span class="waiting-dots"><span></span><span></span><span></span></span>';
  } else {
    startBtn.style.display='none';
    statusEl.innerHTML=t('waiting')+'<span class="waiting-dots"><span></span><span></span><span></span></span>';
  }
}

function startGame(){socket.emit('start_game',{code:state.roomCode});}

function initThinker(data){
  state.role='thinker'; state.opponentName=data.opponentName;
  state.gameHistory=[]; state.wordChosen=''; state.waitingForAnswer=false;
  state.firstAnswerFixed=null; state.firstQuestion=true; state.round=data.round||1;
  document.getElementById('round-num').textContent=state.round;
  document.getElementById('vs-name-thinker').textContent=state.opponentName;
  document.getElementById('thinking-word-display').textContent=t('thinkingPrompt');
  document.getElementById('thinking-input-row').style.display='flex';
  document.getElementById('thinker-waiting').style.display='none';
  document.getElementById('answer-section').style.display='none';
  document.getElementById('guess-confirm-section').style.display='none';
  document.getElementById('thinking-word-input').value='';
  document.getElementById('history-thinker').innerHTML='';
  selectedEntity=null; hideDropdown();
  showScreen('screen-thinker');
}

function submitThinkingWord(){
  const word=(selectedEntity||document.getElementById('thinking-word-input').value).trim();
  if(!word) return;
  state.wordChosen=word;
  document.getElementById('thinking-word-display').textContent=word;
  document.getElementById('thinking-input-row').style.display='none';
  document.getElementById('thinker-waiting').style.display='block';
  socket.emit('word_chosen',{code:state.roomCode});
}

function answerQuestion(choice){
  if(state.firstQuestion){state.firstAnswerFixed=choice; state.firstQuestion=false;}
  socket.emit('answer_question',{code:state.roomCode,choice});
  document.getElementById('answer-section').style.display='none';
  document.getElementById('thinker-waiting').style.display='block';
}

function initGuesser(data){
  state.role='guesser'; state.opponentName=data.opponentName;
  state.gameHistory=[]; state.waitingForAnswer=false;
  state.firstAnswerFixed=null; state.firstQuestion=true; state.round=data.round||1;
  document.getElementById('round-num-g').textContent=state.round;
  document.getElementById('vs-name-guesser').textContent=state.opponentName;
  document.getElementById('guesser-waiting').style.display='block';
  document.getElementById('question-builder').style.display='none';
  document.getElementById('guesser-answer-display').style.display='none';
  document.getElementById('history-guesser').innerHTML='';
  document.getElementById('guess-input').value='';
  document.getElementById('guess-error').style.display='none';
  showScreen('screen-guesser');
}

function setupFirstQuestion(){
  // Always Café/Té for first question, both editable
  const optAInput=document.getElementById('opt-a-input');
  const optBInput=document.getElementById('opt-b-input');
  optAInput.value='Café'; optBInput.value='Té';
  optAInput.readOnly=false; optBInput.readOnly=false;
  optAInput.style.opacity='1'; optBInput.style.opacity='1';
  const fixedRow=document.getElementById('fixed-option-row');
  if(fixedRow) fixedRow.style.display='none';
}

function updateFixedOptionUI(){
  const last=state.gameHistory[state.gameHistory.length-1];
  if(!last||!state.firstAnswerFixed) return;
  const optAInput=document.getElementById('opt-a-input');
  const optBInput=document.getElementById('opt-b-input');
  const fixedRow=document.getElementById('fixed-option-row');
  const fixedLabel=document.getElementById('fixed-option-label');

  if(state.firstAnswerFixed==='A'){
    // Coffee side fixed
    optAInput.value=last.optA; optAInput.readOnly=true; optAInput.style.opacity='0.5';
    optBInput.readOnly=false; optBInput.style.opacity='1'; optBInput.value=''; optBInput.focus();
    if(fixedRow){fixedRow.style.display='flex'; fixedLabel.textContent=`☕ ${last.optA}`;}
  } else {
    // Tea side fixed
    optBInput.value=last.optB; optBInput.readOnly=true; optBInput.style.opacity='0.5';
    optAInput.readOnly=false; optAInput.style.opacity='1'; optAInput.value=''; optAInput.focus();
    if(fixedRow){fixedRow.style.display='flex'; fixedLabel.textContent=`🍵 ${last.optB}`;}
  }
}

function sendQuestion(){
  if(state.waitingForAnswer){
    document.getElementById('guess-error').style.display='block';
    setTimeout(()=>document.getElementById('guess-error').style.display='none',2000); return;
  }
  const optA=document.getElementById('opt-a-input').value.trim();
  const optB=document.getElementById('opt-b-input').value.trim();
  if(!optA||!optB){showToast(t('writeBothOptions'));return;}
  state.waitingForAnswer=true;
  document.getElementById('guesser-answer-display').style.display='none';
  socket.emit('send_question',{code:state.roomCode,optA,optB});
}

function makeGuess(){
  const guess=document.getElementById('guess-input').value.trim();
  if(!guess) return;
  socket.emit('make_guess',{code:state.roomCode,guess});
}

function addToHistory(optA,optB,choice,container){
  state.gameHistory.push({optA,optB,choice});
  const el=document.getElementById(container);
  const label=choice==='A'?`☕ ${optA}`:`🍵 ${optB}`;
  el.innerHTML+=`<div class="history-item"><span>¿${optA} o ${optB}?</span><span class="chosen">${label}</span></div>`;
}

function showResult(data){
  document.getElementById('result-emoji').textContent=data.correct?'🎉':'😅';
  document.getElementById('result-title').textContent=data.correct?t('won'):t('lost');
  document.getElementById('result-word').textContent=data.word||'';
  document.getElementById('result-sub').textContent=data.correct?`${data.questions} preguntas`:'';
  showScreen('screen-result');
}

function playAgain(){socket.emit('play_again',{code:state.roomCode});showToast(t('waitingConfirm'));}
function backToHome(){socket.emit('leave_room');showScreen('screen-home');}
function confirmGuess(correct){
  socket.emit('confirm_guess',{code:state.roomCode,correct});
  document.getElementById('guess-confirm-section').style.display='none';
  document.getElementById('thinker-waiting').style.display='block';
}

// ===== SOCKET =====
socket.on('room_created',data=>{state.roomCode=data.code;updateLobby(data);showScreen('screen-lobby');});
socket.on('room_joined',data=>{state.roomCode=data.code;updateLobby(data);showScreen('screen-lobby');});
socket.on('room_updated',data=>updateLobby(data));
socket.on('join_error',data=>{document.getElementById('join-error').textContent=t('roomNotFound');document.getElementById('join-error').style.display='block';});
socket.on('matched',data=>{state.roomCode=data.code;});
socket.on('game_start',data=>{
  const myRole=data.roles[socket.id];
  const opponentId=Object.keys(data.roles).find(id=>id!==socket.id);
  state.opponentName=data.players[opponentId];
  if(myRole==='thinker') initThinker({opponentName:state.opponentName,round:data.round});
  else initGuesser({opponentName:state.opponentName,round:data.round});
});

socket.on('word_ready',()=>{
  document.getElementById('guesser-waiting').style.display='none';
  document.getElementById('question-builder').style.display='block';
  setupFirstQuestion();
  showToast(t('thinkerChose'));
});

socket.on('question_received',data=>{
  document.getElementById('thinker-waiting').style.display='none';
  document.getElementById('answer-section').style.display='block';
  document.getElementById('current-question-thinker').innerHTML=`¿<span class="opt-a">${data.optA}</span> o <span class="opt-b">${data.optB}</span>?`;
  document.getElementById('opt-a-label').textContent=data.optA;
  document.getElementById('opt-b-label').textContent=data.optB;
});

socket.on('answer_received',data=>{
  state.waitingForAnswer=false;
  if(state.firstQuestion){state.firstAnswerFixed=data.choice;state.firstQuestion=false;}
  const label=data.choice==='A'?`☕ ${data.optA}`:`🍵 ${data.optB}`;
  document.getElementById('guesser-answer-display').style.display='block';
  document.getElementById('answer-received').textContent=label;
  addToHistory(data.optA,data.optB,data.choice,'history-guesser');
  updateFixedOptionUI();
});

socket.on('question_answered',data=>{
  addToHistory(data.optA,data.optB,data.choice,'history-thinker');
  document.getElementById('thinker-waiting').style.display='block';
});

socket.on('guess_attempt',data=>{
  document.getElementById('thinker-waiting').style.display='none';
  document.getElementById('answer-section').style.display='none';
  document.getElementById('guess-confirm-section').style.display='block';
  document.getElementById('guess-attempt-display').textContent=data.guess;
});

socket.on('guess_result',data=>{
  if(data.correct) showResult({correct:true,word:data.word,questions:data.questions});
  else{showToast(t('wrongGuess'));if(state.role==='guesser')state.waitingForAnswer=false;}
});

socket.on('game_over',data=>showResult({correct:data.correct,word:data.word,questions:data.questions}));
socket.on('opponent_left',()=>{showToast(t('opponentLeft'),3000);setTimeout(()=>showScreen('screen-play'),2000);});
socket.on('play_again_ready',()=>showToast('¡Revancha!'));
socket.on('error',data=>showToast('Error: '+data.message));

document.getElementById('player-name').addEventListener('keydown',e=>{if(e.key==='Enter')goToPlay();});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    if(document.getElementById('screen-join').classList.contains('active'))joinRoom();
    if(document.getElementById('screen-thinker').classList.contains('active'))submitThinkingWord();
  }
  if(e.key==='Escape')hideDropdown();
});
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrapper'))hideDropdown();});

setLang('es');

