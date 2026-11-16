// Word Search: a grid of letters with 10 hidden football words. Drag across the letters to mark a word (or tap the first letter, then the last).
// Words are in wordsearch-words.js. Test version, English only. All words the player sees are in TEXT below.
(function () {
  const root = document.getElementById("wordsearch");
  const POOL = window.WORDSEARCH_WORDS || [];
  if (!root || !POOL.length) return;

  const SIZE = 14;                                  // the grid is 14 x 14
  const MIX = { easy: 4, medium: 3, hard: 3 };      // words per round: 4 easy, 3 medium, 3 hard
  // Directions are [row step, column step]. Easy words only run left to right or top to bottom,
  // medium words may also run diagonally (still forward), hard words can run in all 8 directions, also backwards.
  const DIRS = {
    easy: [[0, 1], [1, 0]],
    medium: [[0, 1], [1, 0], [1, 1], [-1, 1]],
    hard: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]],
  };
  const ALL8 = DIRS.hard;
  const CATS = ["players", "coaches", "stadiums", "teams"];
  const COLORS = 6;                                 // number of colours for found words (see wordsearch.css)

  const TEXT = Object.assign({
    backHref: "../", back: "← All games",
    h1: "Word <em>Search</em>",
    intro: "Find the hidden football words: players, coaches, stadiums and teams.",
    cats: { players: "Players", coaches: "Coaches", stadiums: "Stadiums", teams: "Teams" },
    found: (f, t) => `${f} of ${t} found`,
    hint: "Show a hint", give: "Give up", newGame: "New game",
    rulesTitle: "How to play",
    rules: [
      "Ten football words are hidden in the grid. Players, coaches, stadiums and teams.",
      "Drag your finger (or mouse) across the letters to mark a word. Or tap the first letter, then tap the last letter.",
      "Words run straight: across, down or diagonally. The harder words can also be backwards.",
      "Stuck? “Show a hint” marks the first letter of one word. It counts as help in your final result.",
      "Names are written without spaces and accents: Bernabéu is BERNABEU.",
    ],
    hintMsg: "One first letter is marked.",
    wrong: "Not a word on the list.",
    foundMsg: (w) => `Found ${w}!`,
    wonTitle: "You found them all! 🏆",
    wonText: (t, h) => `${t}` + (h ? ` · ${h} hint${h === 1 ? "" : "s"}` : ""),
    lostTitle: "Here are the words",
    lostText: (f, t) => `You found ${f} of ${t}.`,
    perfect: "⭐ With no help!",
    share: "Share my result", again: "Play again", seeGrid: "See the grid",
    copied: "Copied! Paste it anywhere to share.",
    shareTitle: "⚽ Word Search",
    shareLine: (f, t, time, help) => `${f === t ? "🏆" : "✅"} ${f}/${t} words · ${time} · ${help}`,
    shareHelp: (h) => (h ? `${h} hint${h === 1 ? "" : "s"}` : "no help"),
    ariaGrid: "Letter grid", ariaTime: "Time",
  }, window.WORDSEARCH_TEXT || {});

  root.innerHTML = `
    <main class="narrow">
      <a class="back" href="${TEXT.backHref}">${TEXT.back}</a>
      <h1>${TEXT.h1}</h1>
      <p class="intro">${TEXT.intro}</p>
      <div class="ws-game" id="wsGame">
        <div class="meta"><div class="ws-time" id="wsTime" aria-label="${TEXT.ariaTime}">0:00</div><div class="count" id="wsCount"></div></div>
        <div class="ws-grid" id="wsGrid" role="grid" aria-label="${TEXT.ariaGrid}"></div>
        <p class="ws-msg" id="wsMsg" aria-live="polite"></p>
        <div class="ws-words" id="wsWords"></div>
        <div class="actions">
          <button id="wsHint" type="button">${TEXT.hint}</button>
          <button id="wsGive" type="button">${TEXT.give}</button>
        </div>
      </div>
      <details class="ws-rules">
        <summary>${TEXT.rulesTitle}</summary>
        <ul>${TEXT.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
      </details>
    </main>
    <div class="ws-modal" id="wsModal" hidden>
      <div class="ws-modal-card" role="dialog" aria-modal="true" aria-labelledby="wsModalTitle">
        <h2 id="wsModalTitle"></h2>
        <p id="wsModalText"></p>
        <p class="win-perfect" id="wsPerfect" hidden>${TEXT.perfect}</p>
        <button class="primary" id="wsShare" type="button">${TEXT.share}</button>
        <p class="share-note" id="wsShareNote" hidden></p>
        <button id="wsAgain" type="button">${TEXT.again}</button>
        <button class="ws-link" id="wsSee" type="button">${TEXT.seeGrid}</button>
      </div>
    </div>`;
  const $ = (id) => document.getElementById(id);

  // ---- Helpers ----
  const rand = (n) => Math.floor(Math.random() * n);
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Pick the words for one round: 4 easy, 3 medium, 3 hard, at random
  function pickWords() {
    let out = [];
    for (const lvl of Object.keys(MIX)) out = out.concat(shuffle(POOL.filter((x) => x.lvl === lvl)).slice(0, MIX[lvl]));
    return out;
  }

  // How many times does a word appear in the grid (any direction, also backwards)? It must be exactly once.
  function countIn(g, word) {
    let n = 0;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of ALL8) {
      const r1 = r + dr * (word.length - 1), c1 = c + dc * (word.length - 1);
      if (r1 < 0 || r1 >= SIZE || c1 < 0 || c1 >= SIZE) continue;
      let ok = true;
      for (let i = 0; i < word.length; i++) if (g[r + dr * i][c + dc * i] !== word[i]) { ok = false; break; }
      if (ok) n++;
    }
    return n;
  }

  // Build a grid: place the longest words first, fill the rest with letters taken from the pool (so the filler looks like the words).
  function build(words) {
    const fillLetters = POOL.map((x) => x.w).join("");
    for (let attempt = 0; attempt < 200; attempt++) {
      const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
      const placed = [];
      let ok = true;
      for (const it of words.slice().sort((a, b) => b.w.length - a.w.length)) {
        const dirs = DIRS[it.lvl], L = it.w.length;
        let done = false;
        for (let t = 0; t < 400 && !done; t++) {
          const [dr, dc] = dirs[rand(dirs.length)];
          const r0 = rand(SIZE), c0 = rand(SIZE);
          const r1 = r0 + dr * (L - 1), c1 = c0 + dc * (L - 1);
          if (r1 < 0 || r1 >= SIZE || c1 < 0 || c1 >= SIZE) continue;
          let fits = true;
          for (let i = 0; i < L; i++) { const ch = g[r0 + dr * i][c0 + dc * i]; if (ch && ch !== it.w[i]) { fits = false; break; } }
          if (!fits) continue;
          const cells = [];
          for (let i = 0; i < L; i++) { g[r0 + dr * i][c0 + dc * i] = it.w[i]; cells.push([r0 + dr * i, c0 + dc * i]); }
          placed.push({ w: it.w, cat: it.cat, lvl: it.lvl, cells });
          done = true;
        }
        if (!done) { ok = false; break; }
      }
      if (!ok) continue;
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!g[r][c]) g[r][c] = fillLetters[rand(fillLetters.length)];
      if (placed.every((p) => countIn(g, p.w) === 1)) return { g, placed };
    }
    return null;
  }

  // ---- State ----
  let grid, placed, found, hints, over, startTs, tick, anchor, drag;

  function newGame() {
    clearInterval(tick);
    let b = null;
    while (!b) b = build(pickWords());
    grid = b.g; placed = b.placed; found = placed.map(() => false); hints = 0; over = false; anchor = null; drag = null;
    $("wsModal").hidden = true;
    $("wsHint").disabled = false; $("wsGive").disabled = false;
    $("wsMsg").textContent = ""; $("wsMsg").className = "ws-msg";
    drawGrid(); drawWords(); drawCount();
    startTs = Date.now(); $("wsTime").textContent = "0:00";
    tick = setInterval(() => { if (!over) $("wsTime").textContent = clock(Math.floor((Date.now() - startTs) / 1000)); }, 500);
  }

  function drawGrid() {
    const el = $("wsGrid"); el.innerHTML = "";
    el.style.setProperty("--n", SIZE);
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      const d = document.createElement("div");
      d.className = "ws-cell"; d.textContent = grid[r][c]; d.dataset.r = r; d.dataset.c = c; d.id = `wc-${r}-${c}`;
      el.appendChild(d);
    }
  }
  const cellEl = (r, c) => $(`wc-${r}-${c}`);

  function drawWords() {
    const box = $("wsWords"); box.innerHTML = "";
    for (const cat of CATS) {
      const items = placed.map((p, i) => ({ p, i })).filter((x) => x.p.cat === cat).sort((a, b) => a.p.w.localeCompare(b.p.w));
      if (!items.length) continue;
      const g = document.createElement("div"); g.className = "ws-group";
      g.innerHTML = `<h3>${TEXT.cats[cat]}</h3><ul>${items.map((x) => `<li class="ws-w" id="ww-${x.i}">${x.p.w}</li>`).join("")}</ul>`;
      box.appendChild(g);
    }
  }
  const drawCount = () => { $("wsCount").textContent = TEXT.found(found.filter(Boolean).length, placed.length); };
  function say(t, kind) { const m = $("wsMsg"); m.textContent = t; m.className = "ws-msg" + (kind ? " " + kind : ""); }

  // ---- Selecting a word ----
  // The cells of the straight line from a to b. If the player drags a little off-line, snap to the nearest of the 8 directions.
  function lineCells(a, b) {
    let dr = b[0] - a[0], dc = b[1] - a[1];
    const ar = Math.abs(dr), ac = Math.abs(dc);
    if (ar && ac && ar !== ac) {
      if (ar > ac * 2) dc = 0; else if (ac > ar * 2) dr = 0;
      else { const m = Math.round((ar + ac) / 2); dr = Math.sign(dr) * m; dc = Math.sign(dc) * m; }
    }
    const len = Math.max(Math.abs(dr), Math.abs(dc)), sr = Math.sign(dr), sc = Math.sign(dc), out = [];
    for (let i = 0; i <= len; i++) {
      const r = a[0] + sr * i, c = a[1] + sc * i;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break; // never leave the grid
      out.push([r, c]);
    }
    return out;
  }
  function showSel(cells) {
    document.querySelectorAll(".ws-cell.sel").forEach((e) => e.classList.remove("sel"));
    (cells || []).forEach(([r, c]) => cellEl(r, c).classList.add("sel"));
  }
  function clearAnchor() { if (anchor) cellEl(anchor[0], anchor[1]).classList.remove("anchor"); anchor = null; }

  function tryWord(cells) {
    if (over || cells.length < 2) return false;
    const s = cells.map(([r, c]) => grid[r][c]).join(""), rev = [...s].reverse().join("");
    const i = placed.findIndex((p, k) => !found[k] && (p.w === s || p.w === rev));
    if (i < 0) return false;
    found[i] = true;
    placed[i].cells.forEach(([r, c]) => { const e = cellEl(r, c); e.classList.remove("hint"); COLOR_CLASSES.forEach((k) => e.classList.remove(k)); e.classList.add("found", "f" + (i % COLORS)); });
    $("ww-" + i).classList.add("found", "f" + (i % COLORS));
    drawCount(); say(TEXT.foundMsg(placed[i].w), "good");
    if (found.every(Boolean)) finish(true);
    return true;
  }
  const COLOR_CLASSES = Array.from({ length: COLORS }, (_, k) => "f" + k);

  function release(cells) {
    showSel(null);
    if (cells.length >= 2 && !tryWord(cells) && !over) {
      say(TEXT.wrong, "bad");
      cells.forEach(([r, c]) => cellEl(r, c).classList.add("nope"));
      setTimeout(() => cells.forEach(([r, c]) => cellEl(r, c).classList.remove("nope")), 300);
    }
  }

  // Pointer events work for mouse, pen and touch. touch-action: none (in the CSS) stops the page from scrolling while dragging.
  function cellAt(e) {
    const rect = $("wsGrid").getBoundingClientRect();
    const c = Math.min(SIZE - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)));
    const r = Math.min(SIZE - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)));
    return [r, c];
  }
  const grd = $("wsGrid");
  grd.addEventListener("pointerdown", (e) => {
    if (over) return;
    e.preventDefault();
    try { grd.setPointerCapture(e.pointerId); } catch (_) {}
    drag = { start: cellAt(e), end: cellAt(e), moved: false };
    showSel([drag.start]);
  });
  grd.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = cellAt(e);
    if (p[0] === drag.end[0] && p[1] === drag.end[1]) return;
    drag.end = p; drag.moved = true;
    showSel(lineCells(drag.start, drag.end));
  });
  function endDrag(e, cancelled) {
    if (!drag) return;
    const d = drag; drag = null;
    if (cancelled) { showSel(null); return; }
    if (d.moved) { clearAnchor(); release(lineCells(d.start, d.end)); return; }
    // A tap (no drag): first tap marks the start, second tap marks the end
    showSel(null);
    if (anchor && !(anchor[0] === d.start[0] && anchor[1] === d.start[1])) { const a = anchor; clearAnchor(); release(lineCells(a, d.start)); }
    else if (anchor) clearAnchor();
    else { anchor = d.start; cellEl(anchor[0], anchor[1]).classList.add("anchor"); }
  }
  grd.addEventListener("pointerup", (e) => endDrag(e, false));
  grd.addEventListener("pointercancel", (e) => endDrag(e, true));

  // ---- Hint, give up, finish ----
  function hint() {
    if (over) return;
    const left = placed.map((p, i) => i).filter((i) => !found[i]);
    if (!left.length) return;
    const p = placed[left[rand(left.length)]], [r, c] = p.cells[0], e = cellEl(r, c);
    hints++; e.classList.add("hint"); setTimeout(() => e.classList.remove("hint"), 3000);
    say(TEXT.hintMsg);
  }
  function finish(won) {
    over = true; clearAnchor(); showSel(null);
    $("wsHint").disabled = true; $("wsGive").disabled = true;
    if (!won) placed.forEach((p, i) => { if (!found[i]) p.cells.forEach(([r, c]) => cellEl(r, c).classList.add("missed")); });
    timeText = clock(Math.floor((Date.now() - startTs) / 1000));
    setTimeout(() => modal(won), won ? 700 : 500);
  }
  let timeText = "0:00";

  function modal(won) {
    const n = found.filter(Boolean).length;
    $("wsModalTitle").textContent = won ? TEXT.wonTitle : TEXT.lostTitle;
    $("wsModalText").textContent = won ? TEXT.wonText(timeText, hints) : TEXT.lostText(n, placed.length);
    $("wsPerfect").hidden = !(won && hints === 0);
    $("wsShareNote").hidden = true;
    $("wsModal").hidden = false;
    $("wsAgain").focus();
  }

  async function share() {
    const n = found.filter(Boolean).length;
    const url = location.origin + location.pathname + "?utm_source=share&utm_medium=social&utm_campaign=wordsearch";
    const full = `${TEXT.shareTitle}\n${TEXT.shareLine(n, placed.length, timeText, TEXT.shareHelp(hints))}\n${url}`;
    const note = $("wsShareNote");
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(full); note.textContent = TEXT.copied; } catch (e) { note.textContent = full; }
    note.hidden = false;
    clearTimeout(note._t); note._t = setTimeout(() => (note.hidden = true), 4000);
  }

  $("wsHint").addEventListener("click", hint);
  $("wsGive").addEventListener("click", () => { if (!over) finish(false); });
  $("wsShare").addEventListener("click", share);
  $("wsAgain").addEventListener("click", newGame);
  $("wsSee").addEventListener("click", () => { $("wsModal").hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("wsModal").hidden = true; });

  newGame();
})();
