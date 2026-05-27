/* ════════════════════════════════════════════
   NEXUS TTT — script.js
   Complete Game Logic + Animations + AI
════════════════════════════════════════════ */
'use strict';

// ══════════════════════════════════════════
// 1. LOADING SCREEN
// ══════════════════════════════════════════
(function initLoader() {
  const screen = document.getElementById('loadingScreen');
  const bar    = document.getElementById('loaderBar');
  const pct    = document.getElementById('loaderPct');
  const canvas = document.getElementById('loaderCanvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  // Mini particles for loader
  const pts = Array.from({length:60}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: Math.random()*1.5+0.5,
    vx: (Math.random()-.5)*0.4, vy: (Math.random()-.5)*0.4,
    a: Math.random()
  }));
  let loaderRAF;
  function drawLoader() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,240,255,${p.a*0.5})`;
      ctx.fill();
    });
    loaderRAF = requestAnimationFrame(drawLoader);
  }
  drawLoader();

  let progress = 0;
  const iv = setInterval(() => {
    progress += Math.random()*12 + 3;
    if(progress >= 100) { progress = 100; clearInterval(iv); }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
    if(progress === 100) {
      setTimeout(() => {
        screen.classList.add('hide');
        cancelAnimationFrame(loaderRAF);
        setTimeout(() => { screen.style.display='none'; }, 700);
        startApp();
      }, 350);
    }
  }, 60);
})();

// ══════════════════════════════════════════
// 2. APP START
// ══════════════════════════════════════════
function startApp() {
  initCursor();
  initBgCanvas();
  initNavbar();
  initThemeToggle();
  initSoundToggle();
  initHero();
  initFadeObserver();
  initGame();
  animateCounters();
}

// ══════════════════════════════════════════
// 3. CUSTOM CURSOR
// ══════════════════════════════════════════
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  (function loop() {
    rx += (mx-rx)*0.14; ry += (my-ry)*0.14;
    dot.style.left  = mx+'px'; dot.style.top  = my+'px';
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('button,a,.cell').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hovered'); ring.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hovered'); ring.classList.remove('hovered'); });
  });
}

// ══════════════════════════════════════════
// 4. BACKGROUND PARTICLES CANVAS
// ══════════════════════════════════════════
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], lines = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(0,240,255,', 'rgba(155,93,229,', 'rgba(247,37,133,', 'rgba(74,128,255,'];
  for(let i=0; i<80; i++) {
    particles.push({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      vx: (Math.random()-.5)*0.3, vy: (Math.random()-.5)*0.3,
      r: Math.random()*2+0.5,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      a: Math.random()*0.5+0.1
    });
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    // Draw lines between nearby particles
    for(let i=0;i<particles.length;i++) {
      for(let j=i+1;j<particles.length;j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle=`rgba(100,80,255,${(1-dist/120)*0.15})`;
          ctx.lineWidth=0.6;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+p.a+')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════
// 5. NAVBAR
// ══════════════════════════════════════════
function initNavbar() {
  const nav   = document.getElementById('navbar');
  const ham   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 20
      ? 'rgba(5,5,16,0.95)' : 'rgba(5,5,16,0.7)';
  });
  ham.addEventListener('click', () => links.classList.toggle('open'));
  // Active link
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let curr = '';
    sections.forEach(s => { if(window.scrollY >= s.offsetTop-120) curr=s.id; });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href')==='#'+curr);
    });
  });
}

// ══════════════════════════════════════════
// 6. THEME TOGGLE
// ══════════════════════════════════════════
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme==='dark' ? 'light' : 'dark';
  });
}

// ══════════════════════════════════════════
// 7. SOUND
// ══════════════════════════════════════════
let soundOn = true;
function initSoundToggle() {
  const btn = document.getElementById('soundToggle');
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    btn.style.opacity = soundOn ? '1' : '0.4';
  });
}

// Web Audio API for sound effects
let audioCtx = null;
function getAudioCtx() {
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type='sine', dur=0.12, vol=0.2, delay=0) {
  if(!soundOn) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime+delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime+delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+delay+dur);
    osc.start(ctx.currentTime+delay);
    osc.stop(ctx.currentTime+delay+dur+0.01);
  } catch(e){}
}
function playClick()  { playTone(440,'sine',0.08,0.15); }
function playPlaceX() { playTone(600,'sine',0.15,0.2); }
function playPlaceO() { playTone(500,'triangle',0.15,0.2); }
function playWin()    {
  [523,659,784,1047].forEach((f,i) => playTone(f,'sine',0.2,0.25,i*0.12));
}
function playDraw()   { playTone(300,'sawtooth',0.35,0.15); }
function playTimer()  { playTone(880,'sine',0.07,0.1); }

// ══════════════════════════════════════════
// 8. HERO
// ══════════════════════════════════════════
function initHero() {
  // Typing effect
  const el   = document.getElementById('typedTitle');
  const text = 'TIC TAC TOE';
  let i = 0;
  function type() {
    if(i <= text.length) {
      el.textContent = text.slice(0,i++);
      setTimeout(type, 90);
    }
  }
  setTimeout(type, 900);

  // Hero buttons
  document.getElementById('heroPlayBtn').addEventListener('click', () => {
    playClick();
    document.getElementById('game-section').scrollIntoView({behavior:'smooth'});
  });
  document.getElementById('heroAIBtn').addEventListener('click', () => {
    playClick();
    document.getElementById('game-section').scrollIntoView({behavior:'smooth'});
    // Switch to AI mode
    setTimeout(() => {
      document.querySelector('[data-mode="pva"]').click();
    }, 600);
  });
}

// ══════════════════════════════════════════
// 9. FADE ON SCROLL
// ══════════════════════════════════════════
function initFadeObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in-section').forEach(el => obs.observe(el));
}

// ══════════════════════════════════════════
// 10. COUNTER ANIMATION
// ══════════════════════════════════════════
function animateCounters() {
  const els = document.querySelectorAll('[data-count]');
  els.forEach(el => {
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.ceil(target/50);
    const iv = setInterval(() => {
      cur = Math.min(cur+step, target);
      el.textContent = cur.toLocaleString();
      if(cur>=target) clearInterval(iv);
    }, 30);
  });
}

// ══════════════════════════════════════════
// 11. GAME ENGINE
// ══════════════════════════════════════════
const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

const state = {
  board:      Array(9).fill(''),
  current:    'X',
  gameActive: true,
  mode:       'pvp',       // pvp | pva
  difficulty: 'medium',    // easy | medium | hard
  scores:     { X:0, O:0, D:0 },
  stats:      { total:0, xWins:0, oWins:0, draws:0, streakCurr:0, streakBest:0, streakPlayer:'' },
  history:    [],
  moveLog:    [],
  timerOn:    false,
  timerSecs:  10,
  timerLeft:  10,
  timerIv:    null,
  gameMoves:  0
};

// DOM refs
const cells         = Array.from(document.querySelectorAll('.cell'));
const turnIndicator = document.getElementById('turnIndicator');
const turnText      = document.getElementById('turnText');
const timerRing     = document.getElementById('timerRing');
const timerCircle   = document.getElementById('timerCircle');
const timerVal      = document.getElementById('timerVal');
const scoreX        = document.getElementById('scoreX');
const scoreO        = document.getElementById('scoreO');
const scoreDraw     = document.getElementById('scoreDraw');
const nameX         = document.getElementById('nameX');
const nameO         = document.getElementById('nameO');
const moveLogEl     = document.getElementById('moveLog');
const modalOverlay  = document.getElementById('modalOverlay');
const modalIcon     = document.getElementById('modalIcon');
const modalTitle    = document.getElementById('modalTitle');
const modalSub      = document.getElementById('modalSub');
const winCanvas     = document.getElementById('winCanvas');
const historyGrid   = document.getElementById('historyGrid');

function initGame() {
  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      updateNames();
      newGame();
      playClick();
    });
  });

  // Difficulty
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.dataset.diff;
      playClick();
    });
  });

  // Timer toggle
  document.getElementById('timerToggle').addEventListener('change', e => {
    state.timerOn = e.target.checked;
    timerRing.style.display = state.timerOn ? 'flex' : 'none';
    newGame(); playClick();
  });

  // Cells
  cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(+cell.dataset.index));
  });

  // Buttons
  document.getElementById('newGameBtn').addEventListener('click', () => { newGame(); playClick(); });
  document.getElementById('resetBtn').addEventListener('click', () => { resetBoard(); playClick(); });
  document.getElementById('resetScoreBtn').addEventListener('click', () => {
    state.scores = {X:0,O:0,D:0};
    state.stats  = {total:0,xWins:0,oWins:0,draws:0,streakCurr:0,streakBest:0,streakPlayer:''};
    updateScoreboard(); updateStats(); playClick();
  });

  // Modal
  document.getElementById('modalPlay').addEventListener('click', () => { closeModal(); newGame(); playClick(); });
  document.getElementById('modalClose').addEventListener('click', () => { closeModal(); playClick(); });

  // History clear
  document.getElementById('clearHistBtn').addEventListener('click', () => {
    state.history = [];
    renderHistory(); playClick();
  });

  updateNames();
  updateScoreboard();
  updateStats();
  renderHistory();
}

// ── Names based on mode ──
function updateNames() {
  nameX.textContent = 'Player X';
  nameO.textContent = state.mode==='pva' ? 'AI' : 'Player O';
  updateTurnIndicator();
}

// ── Cell Click ──
function handleCellClick(idx) {
  if(!state.gameActive || state.board[idx]) return;
  if(state.mode==='pva' && state.current==='O') return; // AI's turn
  placeMove(idx, state.current);
}

function placeMove(idx, player) {
  state.board[idx] = player;
  const cell = cells[idx];
  cell.classList.add(player==='X'?'x-cell':'o-cell', 'played');
  cell.textContent = player==='X' ? '✕' : '○';

  // Ripple
  cell.classList.remove('ripple');
  void cell.offsetWidth;
  cell.classList.add('ripple');

  // Sound
  player==='X' ? playPlaceX() : playPlaceO();

  // Log move
  state.gameMoves++;
  addMoveLog(player, idx);

  // Check result
  const winner = checkWinner();
  if(winner) { endGame(winner); return; }
  if(state.board.every(c=>c)) { endGame('D'); return; }

  // Switch turn
  state.current = state.current==='X' ? 'O' : 'X';
  updateTurnIndicator();
  resetTimer();

  // AI move
  if(state.mode==='pva' && state.current==='O' && state.gameActive) {
    setTimeout(doAIMove, 480);
  }
}

function addMoveLog(player, idx) {
  const row = Math.floor(idx/3)+1, col=(idx%3)+1;
  state.moveLog.unshift({ player, pos:`R${row}C${col}` });
  if(state.moveLog.length>10) state.moveLog.pop();
  renderMoveLog();
}

function renderMoveLog() {
  moveLogEl.innerHTML = '';
  if(!state.moveLog.length) {
    moveLogEl.innerHTML = '<div class="move-empty">No moves yet...</div>'; return;
  }
  state.moveLog.forEach((m,i) => {
    const d = document.createElement('div');
    d.className = 'move-entry';
    d.innerHTML = `<span class="move-sym ${m.player.toLowerCase()}">${m.player==='X'?'✕':'○'}</span>
                   <span>→ ${m.pos}</span>`;
    moveLogEl.appendChild(d);
  });
}

// ── Win Detection ──
function checkWinner() {
  for(const [a,b,c] of WIN_COMBOS) {
    if(state.board[a] && state.board[a]===state.board[b] && state.board[a]===state.board[c]) {
      return { player: state.board[a], combo: [a,b,c] };
    }
  }
  return null;
}

// ── End Game ──
function endGame(result) {
  state.gameActive = false;
  clearTimerInterval();

  state.stats.total++;
  state.scores.D = state.scores.D || 0;

  if(result==='D') {
    state.scores.D++;
    state.stats.draws++;
    state.stats.streakCurr = 0;
    playDraw();
    showModal('draw', null, '— Draw —', 'A perfectly balanced match!');
    addHistory('Draw', state.mode, state.gameMoves);
  } else {
    const p = result.player;
    state.scores[p]++;
    p==='X' ? state.stats.xWins++ : state.stats.oWins++;

    // Streak
    if(state.stats.streakPlayer===p) {
      state.stats.streakCurr++;
    } else {
      state.stats.streakCurr=1;
      state.stats.streakPlayer=p;
    }
    state.stats.streakBest = Math.max(state.stats.streakBest, state.stats.streakCurr);

    // Highlight winner cells
    result.combo.forEach(i => {
      cells[i].classList.add('winner');
    });
    drawWinLine(result.combo);
    playWin();

    const isAI = state.mode==='pva' && p==='O';
    const label = isAI ? 'AI' : `Player ${p}`;
    const subs  = ['Flawless victory!','Outstanding moves!','Pure dominance!','Tactical genius!'];
    showModal(p.toLowerCase(), p==='X'?'✕':'○', `${label} Wins!`, subs[Math.floor(Math.random()*subs.length)]);
    addHistory(`${label} Wins`, state.mode, state.gameMoves);

    setTimeout(launchConfetti, 200);
  }

  updateScoreboard();
  updateStats();
}

// ── New Game & Reset ──
function newGame() {
  state.board = Array(9).fill('');
  state.current = 'X';
  state.gameActive = true;
  state.gameMoves = 0;
  state.moveLog = [];
  clearTimerInterval();
  cells.forEach(c => {
    c.className = 'cell';
    c.textContent = '';
  });
  clearWinLine();
  updateTurnIndicator();
  resetTimer();
  renderMoveLog();
  // Re-attach cursor hover events
  cells.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.getElementById('cursorDot').classList.add('hovered');
      document.getElementById('cursorRing').classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      document.getElementById('cursorDot').classList.remove('hovered');
      document.getElementById('cursorRing').classList.remove('hovered');
    });
  });
}
function resetBoard() { newGame(); }

// ── Turn Indicator ──
function updateTurnIndicator() {
  const p = state.current;
  turnIndicator.className = 'turn-indicator turn-' + p.toLowerCase();
  const isAI = state.mode==='pva' && p==='O';
  turnText.textContent = isAI ? 'AI is thinking…' : `Player ${p}'s Turn`;
}

// ══════════════════════════════════════════
// 12. TIMER
// ══════════════════════════════════════════
function resetTimer() {
  clearTimerInterval();
  if(!state.timerOn || !state.gameActive) return;
  state.timerLeft = state.timerSecs;
  updateTimerDisplay();
  state.timerIv = setInterval(() => {
    state.timerLeft--;
    updateTimerDisplay();
    if(state.timerLeft<=3) {
      playTimer();
      timerCircle.classList.add('urgent');
    }
    if(state.timerLeft<=0) {
      clearTimerInterval();
      // Force a random move or skip turn
      if(state.gameActive) {
        const empty = state.board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
        if(empty.length) {
          // Auto-place for current player to avoid infinite loop
          placeMove(empty[Math.floor(Math.random()*empty.length)], state.current);
        }
      }
    }
  }, 1000);
}
function clearTimerInterval() {
  clearInterval(state.timerIv);
  timerCircle.classList.remove('urgent');
}
function updateTimerDisplay() {
  timerVal.textContent = state.timerLeft;
  const pct = state.timerLeft / state.timerSecs;
  const circ = 2*Math.PI*15; // 94.25
  timerCircle.style.strokeDashoffset = circ * (1-pct);
}

// ══════════════════════════════════════════
// 13. AI LOGIC (Minimax + Easy/Medium/Hard)
// ══════════════════════════════════════════
function doAIMove() {
  if(!state.gameActive) return;
  const idx = getAIMove();
  if(idx !== -1) placeMove(idx, 'O');
}

function getAIMove() {
  const empty = state.board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
  if(!empty.length) return -1;

  switch(state.difficulty) {
    case 'easy':   return easyAI(empty);
    case 'medium': return mediumAI(empty);
    case 'hard':   return hardAI();
  }
}

// Easy: mostly random, occasionally blocks
function easyAI(empty) {
  if(Math.random() < 0.3) {
    const block = findThreat('X');
    if(block!==-1) return block;
  }
  return empty[Math.floor(Math.random()*empty.length)];
}

// Medium: block and win, but not perfect
function mediumAI(empty) {
  // Win immediately
  const win = findThreat('O');
  if(win!==-1) return win;
  // Block player from winning
  const block = findThreat('X');
  if(block!==-1) return block;
  // Prefer center
  if(Math.random()<0.7 && !state.board[4]) return 4;
  // Random corner
  const corners = [0,2,6,8].filter(i=>!state.board[i]);
  if(corners.length && Math.random()<0.5) return corners[Math.floor(Math.random()*corners.length)];
  return empty[Math.floor(Math.random()*empty.length)];
}

// Hard: perfect Minimax
function hardAI() {
  let best = -Infinity, move = -1;
  state.board.forEach((v,i) => {
    if(!v) {
      state.board[i] = 'O';
      const score = minimax(state.board, 0, false, -Infinity, Infinity);
      state.board[i] = '';
      if(score > best) { best=score; move=i; }
    }
  });
  return move;
}

function minimax(board, depth, isMax, alpha, beta) {
  const w = evalBoard(board);
  if(w!==null) return w - (isMax?0:0) + (w>0?-depth:depth);
  if(board.every(c=>c)) return 0;

  if(isMax) {
    let best=-Infinity;
    board.forEach((v,i) => {
      if(!v) {
        board[i]='O';
        best=Math.max(best,minimax(board,depth+1,false,alpha,beta));
        board[i]='';
        alpha=Math.max(alpha,best);
        if(beta<=alpha) return;
      }
    });
    return best;
  } else {
    let best=Infinity;
    board.forEach((v,i) => {
      if(!v) {
        board[i]='X';
        best=Math.min(best,minimax(board,depth+1,true,alpha,beta));
        board[i]='';
        beta=Math.min(beta,best);
        if(beta<=alpha) return;
      }
    });
    return best;
  }
}
function evalBoard(board) {
  for(const [a,b,c] of WIN_COMBOS) {
    if(board[a]&&board[a]===board[b]&&board[a]===board[c])
      return board[a]==='O' ? 10 : -10;
  }
  return null;
}

// Find threatening move for player
function findThreat(player) {
  for(const [a,b,c] of WIN_COMBOS) {
    const arr = [state.board[a],state.board[b],state.board[c]];
    const count = arr.filter(v=>v===player).length;
    const empty = arr.findIndex(v=>v==='');
    if(count===2 && empty!==-1) {
      return [a,b,c][empty];
    }
  }
  return -1;
}

// ══════════════════════════════════════════
// 14. WIN LINE CANVAS
// ══════════════════════════════════════════
function drawWinLine(combo) {
  const cvs = winCanvas;
  const ctx  = cvs.getContext('2d');
  cvs.width  = cvs.offsetWidth;
  cvs.height = cvs.offsetHeight;

  const getCellCenter = (idx) => {
    const cell = cells[idx];
    const br   = cell.getBoundingClientRect();
    const pbr  = cvs.getBoundingClientRect();
    return { x: br.left-pbr.left+br.width/2, y: br.top-pbr.top+br.height/2 };
  };

  const a = getCellCenter(combo[0]);
  const b = getCellCenter(combo[2]);
  const player = state.board[combo[0]];
  const color  = player==='X' ? '#f72585' : '#00f0ff';
  const glow   = player==='X' ? 'rgba(247,37,133,0.6)' : 'rgba(0,240,255,0.6)';

  let progress = 0;
  function animate() {
    ctx.clearRect(0,0,cvs.width,cvs.height);
    progress = Math.min(progress+0.06, 1);
    const cx = a.x + (b.x-a.x)*progress;
    const cy = a.y + (b.y-a.y)*progress;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 4;
    ctx.lineCap     = 'round';
    ctx.shadowColor = glow;
    ctx.shadowBlur  = 18;
    ctx.stroke();
    if(progress<1) requestAnimationFrame(animate);
  }
  animate();
}
function clearWinLine() {
  const ctx = winCanvas.getContext('2d');
  ctx.clearRect(0,0,winCanvas.width,winCanvas.height);
}

// ══════════════════════════════════════════
// 15. SCOREBOARD & STATS
// ══════════════════════════════════════════
function updateScoreboard() {
  scoreX.textContent    = state.scores.X || 0;
  scoreO.textContent    = state.scores.O || 0;
  scoreDraw.textContent = state.scores.D || 0;
}
function updateStats() {
  const t  = state.stats.total;
  document.getElementById('statTotal').textContent    = t;
  document.getElementById('statXRate').textContent    = t ? Math.round(state.stats.xWins/t*100)+'%' : '—';
  document.getElementById('statORate').textContent    = t ? Math.round(state.stats.oWins/t*100)+'%' : '—';
  document.getElementById('statDrawRate').textContent = t ? Math.round(state.stats.draws/t*100)+'%' : '—';
  document.getElementById('statStreak').textContent   = state.stats.streakBest;
}

// ══════════════════════════════════════════
// 16. HISTORY
// ══════════════════════════════════════════
function addHistory(result, mode, moves) {
  const now  = new Date();
  const time = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  state.history.unshift({ result, mode: mode==='pvp'?'PvP':'vs AI', moves, time });
  if(state.history.length>20) state.history.pop();
  renderHistory();
}
function renderHistory() {
  historyGrid.innerHTML = '';
  if(!state.history.length) {
    historyGrid.innerHTML = '<div class="history-empty">Play your first game to see history here.</div>';
    return;
  }
  state.history.forEach(h => {
    const cls = h.result.includes('X') ? 'x' : h.result.includes('AI')||h.result.includes('O') ? 'o' : 'draw';
    const d = document.createElement('div');
    d.className='history-card';
    d.innerHTML=`<div class="hist-result ${cls}">${h.result}</div>
                 <div class="hist-mode">${h.mode}</div>
                 <div class="hist-moves">${h.moves} moves</div>
                 <div class="hist-time">${h.time}</div>`;
    historyGrid.appendChild(d);
  });
}

// ══════════════════════════════════════════
// 17. MODAL
// ══════════════════════════════════════════
function showModal(type, icon, title, sub) {
  modalIcon.className  = 'modal-icon ' + type;
  modalIcon.textContent= icon || '—';
  modalTitle.textContent = title;
  modalSub.textContent   = sub;
  modalOverlay.classList.add('open');
  setTimeout(()=>{ modalIcon.classList.add('win-anim'); }, 50);
}
function closeModal() {
  modalOverlay.classList.remove('open');
  modalIcon.classList.remove('win-anim');
  stopConfetti();
}

// ══════════════════════════════════════════
// 18. CONFETTI
// ══════════════════════════════════════════
let confettiParts = [], confettiRAF, confettiRunning=false;
function launchConfetti() {
  if(!soundOn && !state.gameActive) return;
  const cvs = document.getElementById('confettiCanvas');
  const ctx  = cvs.getContext('2d');
  cvs.width  = cvs.offsetWidth;
  cvs.height = cvs.offsetHeight;
  confettiParts = [];
  const COLORS2 = ['#f72585','#00f0ff','#9b5de5','#4a80ff','#00ff88','#ffd60a'];
  for(let i=0;i<120;i++) {
    confettiParts.push({
      x:   Math.random()*cvs.width,
      y:   -10 - Math.random()*cvs.height*0.3,
      w:   Math.random()*8+3,
      h:   Math.random()*5+2,
      rot: Math.random()*360,
      vx:  (Math.random()-.5)*3,
      vy:  Math.random()*4+2,
      vr:  (Math.random()-.5)*6,
      color: COLORS2[Math.floor(Math.random()*COLORS2.length)],
      alpha: 1
    });
  }
  confettiRunning=true;
  function draw() {
    if(!confettiRunning) return;
    ctx.clearRect(0,0,cvs.width,cvs.height);
    confettiParts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      if(p.y>cvs.height) p.y=-10;
      p.alpha = Math.max(0, p.alpha-0.003);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.globalAlpha=p.alpha;
      ctx.fillStyle=p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    confettiRAF=requestAnimationFrame(draw);
  }
  draw();
  setTimeout(stopConfetti, 4500);
}
function stopConfetti() {
  confettiRunning=false;
  cancelAnimationFrame(confettiRAF);
  const cvs=document.getElementById('confettiCanvas');
  cvs.getContext('2d').clearRect(0,0,cvs.width,cvs.height);
}
