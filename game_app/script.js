// ===== Data: Problem ↔ Solution pairs with micro-tips =====
const PAIRS = [
  {
    id: "plastic-bag",
    problem: { label: "Plastic bag", badge: "Problem" },
    solution: { label: "Reusable tote", badge: "Solution" },
    tip: "Switching to reusable totes cuts thousands of bags per household."
  },
  {
    id: "styrofoam-box",
    problem: { label: "Styrofoam lunch box", badge: "Problem" },
    solution: { label: "Reusable lunch box", badge: "Solution" },
    tip: "Bring your own lunch box when ordering cơm tấm or bún for takeout."
  },
  {
    id: "single-straw",
    problem: { label: "Single-use straw", badge: "Problem" },
    solution: { label: "Metal/Bamboo straw", badge: "Solution" },
    tip: "Shops in HCMC and Đà Nẵng offer bamboo and metal straw options."
  },
  {
    id: "ghost-nets",
    problem: { label: "Ghost fishing nets", badge: "Problem" },
    solution: { label: "Net retrieval & recycling", badge: "Solution" },
    tip: "Recovered nets can be recycled into new nylon products."
  },
  {
    id: "polluted-canal",
    problem: { label: "Polluted canal", badge: "Problem" },
    solution: { label: "Community cleanup & booms", badge: "Solution" },
    tip: "Floating booms trap trash for easier collection after rains."
  },
  {
    id: "clogged-drains",
    problem: { label: "Trash in drains", badge: "Problem" },
    solution: { label: "Grate cleaning & awareness", badge: "Solution" },
    tip: "Keeping street grates clear reduces flood-borne plastic."
  },
  {
    id: "open-burning",
    problem: { label: "Open burning", badge: "Problem" },
    solution: { label: "Sorting & proper collection", badge: "Solution" },
    tip: "Sorted plastics can be picked up or dropped at collection points."
  },
  {
    id: "festival-litter",
    problem: { label: "Festival litter", badge: "Problem" },
    solution: { label: "Green events & volunteers", badge: "Solution" },
    tip: "Volunteer teams help event-goers sort waste on-site."
  }
];

// ===== State =====
let firstCard = null;
let lock = false;
let pairsFound = 0;
let moves = 0;
let timer = null;
let seconds = 0;

// ===== Elements =====
const elMenu = document.getElementById("main-menu");
const elGame = document.getElementById("game-play");
const elResults = document.getElementById("results");
const elGrid = document.getElementById("grid");
const elTip = document.getElementById("tip");

const elPairsFound = document.getElementById("pairs-found");
const elPairsTotal = document.getElementById("pairs-total");
const elMoves = document.getElementById("moves");
const elTime = document.getElementById("time");

const elStart = document.getElementById("start-btn");
const elInfo = document.getElementById("info-btn");
const elDialog = document.getElementById("info-dialog");

const elRestart = document.getElementById("restart-btn");
const elQuit = document.getElementById("quit-btn");

const elRPairs = document.getElementById("r-pairs");
const elRMoves = document.getElementById("r-moves");
const elRTime = document.getElementById("r-time");
const elPlayAgain = document.getElementById("play-again-btn");
const elBackMenu = document.getElementById("back-menu-btn");

// ===== Utils =====
const pad = n => n.toString().padStart(2, "0");
function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${pad(m)}:${pad(r)}`;
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function startTimer() {
  stopTimer();
  seconds = 0;
  elTime.textContent = "00:00";
  timer = setInterval(() => {
    seconds += 1;
    elTime.textContent = formatSeconds(seconds);
  }, 1000);
}
function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}


// ===== Fireworks engine (canvas) =====
let fxReq = null;
let fxRunning = false;

function startFireworks(durationMs = 6000) {
  const canvas = document.getElementById("fx-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    const { innerWidth:w, innerHeight:h } = window;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const sparks = [];
  const GRAVITY = 0.12;
  const FRICTION = 0.996;

  function burst(x, y, hueBase) {
    const N = 60 + (Math.random()*20|0);
    for (let i=0;i<N;i++){
      const angle = (Math.PI*2*i)/N + (Math.random()*0.2 - 0.1);
      const speed = 2 + Math.random()*3.5;
      sparks.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        life: 60 + (Math.random()*20|0),
        age: 0,
        hue: hueBase + (Math.random()*20-10)
      });
    }
  }

  const endAt = performance.now() + durationMs;
  fxRunning = true;

  function loop(ts){
    if (!fxRunning) return;
    fxReq = requestAnimationFrame(loop);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (ts < endAt && Math.random() < 0.08){
      const w = canvas.width / (window.devicePixelRatio||1);
      const h = canvas.height / (window.devicePixelRatio||1);
      burst(Math.random()*w*0.8 + w*0.1, Math.random()*h*0.5 + h*0.1, 110+Math.random()*40);
    }

    for (let i=sparks.length-1;i>=0;i--){
      const s = sparks[i];
      s.age++;
      s.vx *= FRICTION;
      s.vy = s.vy*FRICTION + GRAVITY;
      s.x += s.vx;
      s.y += s.vy;

      const alpha = Math.max(0, 1 - s.age / s.life);
      if (alpha <= 0){ sparks.splice(i,1); continue; }

      const ctx2 = ctx;
      ctx2.beginPath();
      ctx2.arc(s.x, s.y, 2.2, 0, Math.PI*2);
      ctx2.fillStyle = `hsla(${s.hue}, 70%, 55%, ${alpha})`;
      ctx2.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  loop();

  setTimeout(stopFireworks, durationMs + 1000);
}

function stopFireworks(){
  fxRunning = false;
  if (fxReq) cancelAnimationFrame(fxReq);
  fxReq = null;
  const canvas = document.getElementById("fx-canvas");
  if (canvas){
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
}

// ===== Count-up animation for stats =====
function countUp(el, to, duration=700, formatter=(v)=>v.toString()){
  const start = 0;
  const t0 = performance.now();
  function step(t){
    const p = Math.min(1, (t - t0) / duration);
    const val = Math.round(start + (to - start) * (1 - Math.pow(1-p, 3))); // easeOutCubic
    el.textContent = formatter(val);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


// ===== Deck building: turn pairs into 16 cards (8 problems + 8 solutions) =====
function buildDeck(pairs) {
  const cards = [];
  for (const p of pairs) {
    cards.push({
      key: `${p.id}-problem`,
      pairId: p.id,
      kind: "problem",
      label: p.problem.label,
      badge: p.problem.badge,
      tip: p.tip
    });
    cards.push({
      key: `${p.id}-solution`,
      pairId: p.id,
      kind: "solution",
      label: p.solution.label,
      badge: p.solution.badge,
      tip: p.tip
    });
  }
  return shuffle(cards);
}

// ===== Rendering =====
function cardTemplate(card, index) {
  return `
    <button class="card" role="button" aria-pressed="false" data-key="${card.key}" data-pair="${card.pairId}" data-kind="${card.kind}" data-index="${index}">
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="face-content">
            <div class="label">${card.label}</div>
            <span class="badge">${card.badge}</span>
          </div>
        </div>
        <div class="card-face card-back" aria-hidden="true">
          COASTGUARD
        </div>
      </div>
    </button>
  `;
}

function renderGrid(deck) {
  elGrid.innerHTML = deck.map(cardTemplate).join("");
  // Set accessible grid roles
  [...elGrid.children].forEach((btn, i) => {
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("tabindex", "0");
  });
}

// ===== Game flow =====
let deck = [];

function resetState() {
  firstCard = null;
  lock = false;
  pairsFound = 0;
  moves = 0;
  seconds = 0;
  elPairsFound.textContent = "0";
  elMoves.textContent = "0";
  elTip.textContent = "";
}

function startGame() {
  switchScreen("game");
  resetState();
  deck = buildDeck(PAIRS);
  elPairsTotal.textContent = (deck.length / 2).toString();
  renderGrid(deck);
  startTimer();
}

function onCardClick(e) {
  const btn = e.target.closest(".card");
  if (!btn || lock) return;

  const alreadyMatched = btn.getAttribute("aria-pressed") === "true";
  if (alreadyMatched) return;

  flip(btn, true);

  if (!firstCard) {
    firstCard = btn;
    return;
  }

  // second card
  moves += 1;
  elMoves.textContent = moves.toString();
  const match = isMatch(firstCard, btn);

  if (match) {
    // lock both as matched
    firstCard.setAttribute("aria-pressed", "true");
    btn.setAttribute("aria-pressed", "true");
    const tip = btn.dataset.kind === "solution" ? btn : firstCard; // show tip once
    showTip(getTip(tip));
    firstCard = null;
    pairsFound += 1;
    elPairsFound.textContent = pairsFound.toString();
    if (pairsFound === deck.length / 2) {
      // win
      stopTimer();
      setTimeout(showResults, 500);
    }
  } else {
    lock = true;
    setTimeout(() => {
      flip(firstCard, false);
      flip(btn, false);
      firstCard = null;
      lock = false;
    }, 850);
  }
}

function getTip(btn) {
  const pairId = btn.getAttribute("data-pair");
  const p = PAIRS.find(x => x.id === pairId);
  return p ? p.tip : "";
}

function showTip(text) {
  elTip.textContent = text;
  // Clear after a few seconds
  setTimeout(() => { if (elTip.textContent === text) elTip.textContent = ""; }, 3500);
}

function isMatch(a, b) {
  if (a === b) return false;
  const aPair = a.getAttribute("data-pair");
  const bPair = b.getAttribute("data-pair");
  const aKind = a.getAttribute("data-kind");
  const bKind = b.getAttribute("data-kind");
  return aPair === bPair && aKind !== bKind;
}

function flip(btn, on) {
  if (on) {
    btn.classList.add("flipped");
  } else {
    btn.classList.remove("flipped");
  }
}

function showResults() {
  const totalPairs = deck.length / 2;
  const movesFinal = moves;
  const secondsFinal = seconds;

  switchScreen("results");

  // animate stats
  countUp(document.getElementById("r-pairs"), totalPairs, 600);
  countUp(document.getElementById("r-moves"), movesFinal, 700);
  countUp(
    { textContent: "0", set textContent(v){ this._v=v; document.getElementById("r-time").textContent = formatSeconds(v); } },
    secondsFinal,
    900
  );

  // launch fireworks
  startFireworks(6500);
}


function switchScreen(name) {
  elMenu.classList.remove("active");
  elGame.classList.remove("active");
  elResults.classList.remove("active");
  if (name === "menu") elMenu.classList.add("active");
  if (name === "game") elGame.classList.add("active");
  if (name === "results") elResults.classList.add("active");
}

// ===== Events =====
elStart.addEventListener("click", startGame);
elRestart.addEventListener("click", startGame);
elQuit.addEventListener("click", () => { stopTimer(); switchScreen("menu"); });

elPlayAgain.addEventListener("click", startGame);
elBackMenu.addEventListener("click", () => switchScreen("menu"));

elGrid.addEventListener("click", onCardClick);

elPlayAgain.addEventListener("click", () => { stopFireworks(); startGame(); });
elBackMenu.addEventListener("click", () => { stopFireworks(); switchScreen("menu"); });


// Keyboard support
elGrid.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onCardClick(e);
  }
});

// Info dialog
elInfo.addEventListener("click", () => {
  try { elDialog.showModal(); } catch { elDialog.setAttribute("open", ""); }
});

// Close dialog via ESC for browsers without native dialog keyboard handling
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && elDialog.open) {
    elDialog.close();
  }
});

// Start at menu
switchScreen("menu");
