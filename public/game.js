// ===== CAFÉ O TÉ — CLIENT GAME LOGIC =====

const socket = io({ transports: ['websocket'] });

// ===== TRANSLATIONS =====
const T = {
  es: {
    yourName:'Tu apodo',namePlaceholder:'Tu apodo...',nameError:'Escribe tu nombre para continuar',
    play:'Jugar',howToPlay:'¿Cómo se juega?',quickMatch:'🎲 Partida rápida (random)',
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
    noResults:'Sin resultados, escribe tú mismo',fixedOption:'Opción fija:',serverLabel:'Servidor',firstQTitle:'Primera pregunta',fqCoffee:'Café',fqTea:'Té',questionSent:'Enviada...',opponentFirstQ:'El pensador está eligiendo',tagline:'el juego de asociación mental más viral',
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
    yourName:'Your nickname',namePlaceholder:'Your nickname...',nameError:'Enter your name to continue',
    play:'Play',howToPlay:'How to play?',quickMatch:'🎲 Quick match (random)',
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
    noResults:'No results, type yourself',fixedOption:'Fixed option:',serverLabel:'Server',firstQTitle:'First question',fqCoffee:'Coffee',fqTea:'Tea',questionSent:'Sent...',opponentFirstQ:'The thinker is making their first choice',tagline:'the most viral mental association game',
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
    yourName:'Ton pseudo',namePlaceholder:'Ton pseudo...',nameError:'Écris ton prénom pour continuer',
    play:'Jouer',howToPlay:'Comment jouer ?',quickMatch:'🎲 Partie rapide (aléatoire)',
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
    noResults:'Pas de résultats, écris toi-même',fixedOption:'Option fixe :',serverLabel:'Serveur',firstQTitle:'Première question',fqCoffee:'Café',fqTea:'Thé',questionSent:'Envoyée...',opponentFirstQ:'Le penseur fait son premier choix',tagline:'le jeu d\'association mentale le plus viral',
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
    yourName:'Dein Spitzname',namePlaceholder:'Dein Spitzname...',nameError:'Schreib deinen Namen um fortzufahren',
    play:'Spielen',howToPlay:'Wie spielt man?',quickMatch:'🎲 Schnelles Spiel (zufällig)',
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
    noResults:'Keine Ergebnisse, selbst eingeben',fixedOption:'Feste Option:',serverLabel:'Server',firstQTitle:'Erste Frage',fqCoffee:'Kaffee',fqTea:'Tee',questionSent:'Gesendet...',opponentFirstQ:'Der Denker trifft seine erste Wahl',tagline:'das viralste mentale Assoziationsspiel',
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
  firstAnswerFixed:null,firstQuestion:true,fixedOption:null,
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
  // Update page title and logo
  const titleText = titles[l] || 'Café o Té';
  document.title = titleText;
  const logoEl = document.getElementById('main-logo');
  if(logoEl) {
    const parts = titleText.split(' o ').length > 1 ? titleText.split(' o ') : titleText.split(' or ').length > 1 ? titleText.split(' or ') : titleText.split(' ou ').length > 1 ? titleText.split(' ou ') : titleText.split(' oder ');
    const sep = titleText.includes(' oder ') ? ' oder ' : titleText.includes(' ou ') ? ' ou ' : titleText.includes(' or ') ? ' or ' : ' o ';
    if(parts.length >= 2) {
      logoEl.innerHTML = `<span style="color:#f5a623">${parts[0]}</span> ${sep.trim()} <span style="color:#8bc34a">${parts[1]}</span>`;
    }
  }
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
    // Use Wikidata entity search - returns people and characters by name prefix
    const url=`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=${lang}&type=item&limit=12&format=json&origin=*`;
    const res=await fetch(url);
    const data=await res.json();
    // Filter to only humans and fictional characters by checking descriptions
    const people=(data.search||[]).filter(item=>{
      const desc=(item.description||'').toLowerCase();
      const label=(item.label||'').toLowerCase();
      // Keep if description suggests a person or character
      const isPerson=desc.includes('human')||desc.includes('person')||desc.includes('actor')||
        desc.includes('singer')||desc.includes('player')||desc.includes('politician')||
        desc.includes('musician')||desc.includes('director')||desc.includes('writer')||
        desc.includes('athlete')||desc.includes('footballer')||desc.includes('artist')||
        desc.includes('character')||desc.includes('fictional')||desc.includes('personaje')||
        desc.includes('cantante')||desc.includes('actor')||desc.includes('jugador')||
        desc.includes('político')||desc.includes('personnage')||desc.includes('chanteur')||
        desc.includes('sportif')||desc.includes('figur')||desc.includes('sänger')||
        desc.includes('schauspieler')||desc.includes('sportler');
      // Exclude obvious non-people
      const notPerson=desc.includes('municipality')||desc.includes('city')||desc.includes('town')||
        desc.includes('country')||desc.includes('film')||desc.includes('album')||
        desc.includes('song')||desc.includes('band')||desc.includes('company')||
        desc.includes('organization')||desc.includes('disease')||desc.includes('concept');
      return isPerson && !notPerson;
    }).map(item=>item.label);
    if(people.length>0){showDropdown(people,query);return;}
    // If no filtered results, show unfiltered but limit to items with descriptions
    const any=(data.search||[]).filter(i=>i.description&&i.label).slice(0,6).map(i=>`${i.label}`);
    showDropdown(any,query);
  }catch(e){hideDropdown();}
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
  // Hide lang bar during active game screens
  const gameScreens=['screen-thinker','screen-guesser','screen-lobby','screen-matchmaking'];
  document.body.classList.toggle('hide-lang', gameScreens.includes(id));
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
  // Tell server word is chosen so guesser sees waiting msg
  socket.emit('word_chosen',{code:state.roomCode});
  // Show first question overlay with animation
  showFirstQuestionOverlay();
}

function showFirstQuestionOverlay(){
  const overlay=document.getElementById('fq-overlay');
  // Set images and labels
  document.getElementById('fq-coffee-img').src='data:image/png;base64,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';
  document.getElementById('fq-tea-img').src='data:image/png;base64,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';
  document.getElementById('fq-label-a').textContent=t('fqCoffee');
  document.getElementById('fq-label-b').textContent=t('fqTea');
  document.getElementById('fq-title').textContent=t('firstQTitle');
  // Reset animation by re-inserting buttons
  const btns=overlay.querySelectorAll('.fq-btn');
  btns.forEach(b=>{b.style.animation='none';b.offsetHeight;b.style.animation='';});
  overlay.style.display='flex';
}

function selectFirstOption(choice){
  const overlay=document.getElementById('fq-overlay');
  overlay.style.display='none';
  // Send as a question: Café o Té with the chosen answer
  const optA=t('fqCoffee');
  const optB=t('fqTea');
  // Fix the chosen option
  state.fixedOption = choice==='A' ? optA : optB;
  state.firstQuestion=false;
  // Send to server as first question+answer combined
  socket.emit('first_choice',{code:state.roomCode, optA, optB, choice});
  // Show waiting
  document.getElementById('thinker-waiting').style.display='block';
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
  state.firstAnswerFixed=null; state.firstQuestion=true; state.fixedOption=null; state.round=data.round||1;
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
  if(!state.fixedOption) return;
  const optAInput=document.getElementById('opt-a-input');
  const optBInput=document.getElementById('opt-b-input');
  const fixedRow=document.getElementById('fixed-option-row');
  const fixedLabel=document.getElementById('fixed-option-label');
  // Fixed option always goes to slot A (left), free option to slot B (right)
  optAInput.value=state.fixedOption;
  optAInput.readOnly=true; optAInput.style.opacity='0.5';
  optBInput.readOnly=false; optBInput.style.opacity='1'; optBInput.value=''; optBInput.focus();
  if(fixedRow){fixedRow.style.display='flex'; fixedLabel.textContent=state.fixedOption;}
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
  // Visual feedback on button
  const btn=document.getElementById('ask-btn');
  btn.classList.add('btn-sent');
  btn.textContent=t('questionSent')||'Enviada';
  btn.disabled=true;
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
  socket.emit('confirm_guess',{code:state.roomCode,correct,word:state.wordChosen});
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
  document.getElementById('guesser-first-q').style.display='block';
});

socket.on('question_received',data=>{
  document.getElementById('thinker-waiting').style.display='none';
  document.getElementById('answer-section').style.display='block';
  document.getElementById('current-question-thinker').innerHTML=`¿<span class="opt-a">${data.optA}</span> o <span class="opt-b">${data.optB}</span>?`;
  document.getElementById('opt-a-label').textContent=data.optA;
  document.getElementById('opt-b-label').textContent=data.optB;
});

socket.on('first_choice_made',(data)=>{
  // Guesser: thinker made their first choice, now show question builder
  document.getElementById('guesser-first-q').style.display='none';
  document.getElementById('question-builder').style.display='block';
  // Show what was chosen
  const label=data.choice==='A'?`${data.optA}`:`${data.optB}`;
  state.fixedOption = data.choice==='A' ? data.optA : data.optB;
  state.firstQuestion=false;
  showToast(`${t('thinkerChose')}: ${label}`);
  updateFixedOptionUI();
  // Also add to history
  addToHistory(data.optA,data.optB,data.choice,'history-guesser');
});

socket.on('answer_received',data=>{
  state.waitingForAnswer=false;
  // Reset ask button
  const btn=document.getElementById('ask-btn');
  if(btn){btn.classList.remove('btn-sent');btn.textContent=t('askBtn');btn.disabled=false;}
  // The chosen option becomes the new fixed option (always moves to slot A)
  state.fixedOption = data.choice==='A' ? data.optA : data.optB;
  state.firstQuestion=false;
  const label=data.choice==='A'?`☕ ${data.optA}`:`🍵 ${data.optB}`;
  document.getElementById('guesser-answer-display').style.display='block';
  document.getElementById('answer-received').textContent=label;
  addToHistory(data.optA,data.optB,data.choice,'history-guesser');
  updateFixedOptionUI();
});

socket.on('first_choice_confirmed',(data)=>{
  addToHistory(data.optA,data.optB,data.choice,'history-thinker');
  document.getElementById('thinker-waiting').style.display='block';
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

document.addEventListener('DOMContentLoaded', () => setLang('es'));
