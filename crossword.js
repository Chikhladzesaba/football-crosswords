// Football Crosswords — the shared game. Every puzzle page uses this same file.
// It reads the puzzle from PUZZLE (in that puzzle's puzzle.js) and builds the page inside <div id="crossword">.
(function () {
  const P = window.PUZZLE;
  const root = document.getElementById("crossword");
  if (!P || !root) return;

  const words = P.words.map((w) => ({ ...w }));
  document.documentElement.style.setProperty("--cols", P.cols);

  // ---- PAGE LAYOUT --------------------------------------------------------
  root.innerHTML = `
    <main>
      <a class="back" href="../">← All crosswords</a>
      <h1>${P.title}</h1>
      <p class="intro">${P.intro}</p>
      <div class="meta">
        <div class="count" id="count"></div>
        <div class="timer" id="timer" aria-label="Time">00:00</div>
      </div>
      <div class="board">
        <div class="play">
          <div class="clue-bar" aria-live="polite"><b id="clueNum"></b><span id="clueText"></span></div>
          <div class="grid" id="grid" role="grid" aria-label="Crossword grid"></div>
          <div class="actions">
            <button class="primary" id="btnCheck" type="button">Check letters</button>
            <button id="btnReveal" type="button">Reveal word</button>
            <button id="btnClear" type="button">Start over</button>
            <button id="btnSharePuzzle" type="button">Share</button>
          </div>
          <p class="share-note" id="sharePuzzleNote" hidden></p>
          <div class="result" id="result" hidden>
            <p id="resultText"></p>
            <button class="primary" id="btnShareResult" type="button">Share my result</button>
            <p class="share-note" id="shareResultNote" hidden></p>
          </div>
        </div>
        <div class="clues">
          <section><h3>Across</h3><ol id="across"></ol></section>
          <section><h3>Down</h3><ol id="down"></ol></section>
        </div>
      </div>
      ${P.note ? `<p class="legend">${P.note}</p>` : ""}
    </main>`;

  const $ = (id) => document.getElementById(id);
  const key = (r, c) => r + "," + c;
  const cells = {};

  // ---- GRID FROM THE DATA -------------------------------------------------
  words.forEach((w) => {
    w.cells = [];
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.row + (w.dir === "D" ? i : 0);
      const c = w.col + (w.dir === "A" ? i : 0);
      const k = key(r, c);
      if (!cells[k]) cells[k] = { r, c, answer: w.answer[i], words: {} };
      cells[k].words[w.dir] = w;
      w.cells.push(cells[k]);
    }
  });

  // Clue numbers: left-to-right, top-to-bottom; each square where a word starts gets the next number
  let n = 0;
  for (let r = 0; r < P.rows; r++) {
    for (let c = 0; c < P.cols; c++) {
      const starts = words.filter((w) => w.row === r && w.col === c);
      if (starts.length) { n++; starts.forEach((w) => (w.num = n)); cells[key(r, c)].num = n; }
    }
  }
  words.sort((a, b) => a.num - b.num);

  const state = { cell: null, dir: "A", started: null, elapsed: 0, done: false, timerId: null, revealed: new Set() };

  for (let r = 0; r < P.rows; r++) {
    for (let c = 0; c < P.cols; c++) {
      const cell = cells[key(r, c)];
      const el = document.createElement("div");
      el.className = "cell";
      if (cell) {
        el.classList.add("open");
        if (cell.num) el.innerHTML = `<span class="num">${cell.num}</span>`;
        const input = document.createElement("input");
        input.id = "c" + r + "-" + c;
        input.maxLength = 1;
        input.autocomplete = "off";
        input.setAttribute("autocapitalize", "characters");
        input.setAttribute("autocorrect", "off");
        input.spellcheck = false;
        input.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}`);
        el.appendChild(input);
        cell.el = el; cell.input = input;
        input.addEventListener("mousedown", (e) => { e.preventDefault(); onCellTap(cell); });
        input.addEventListener("focus", () => { if (state.cell !== cell) select(cell, state.dir); });
        input.addEventListener("keydown", (e) => onKey(e, cell));
        input.addEventListener("input", () => onInput(cell));
      }
      $("grid").appendChild(el);
    }
  }

  words.forEach((w) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="n">${w.num}</span><span class="text">${w.clue} <span class="len">(${w.answer.length})</span></span>`;
    li.addEventListener("click", () => select(w.cells[0], w.dir));
    $(w.dir === "A" ? "across" : "down").appendChild(li);
    w.li = li;
  });

  // ---- PLAYING ------------------------------------------------------------
  const other = (d) => (d === "A" ? "D" : "A");
  const wordAt = (cell, dir) => cell.words[dir] || cell.words[other(dir)];

  function select(cell, dir) {
    if (!cell.words[dir]) dir = other(dir);
    state.cell = cell; state.dir = dir;
    const w = cell.words[dir];
    Object.values(cells).forEach((c) => c.el.classList.remove("inword", "active"));
    w.cells.forEach((c) => c.el.classList.add("inword"));
    cell.el.classList.add("active");
    words.forEach((x) => x.li.classList.toggle("current", x === w));
    $("clueNum").textContent = w.num + w.dir;
    $("clueText").textContent = w.clue;
    if (document.activeElement !== cell.input) cell.input.focus({ preventScroll: true });
  }

  function onCellTap(cell) {
    // Tapping the active square again flips between across and down
    if (state.cell === cell && cell.words.A && cell.words.D) select(cell, other(state.dir));
    else select(cell, state.dir);
  }

  function move(step) {
    const w = wordAt(state.cell, state.dir);
    const i = w.cells.indexOf(state.cell) + step;
    if (i >= 0 && i < w.cells.length) select(w.cells[i], w.dir);
  }

  function nextWord(step) {
    const w = wordAt(state.cell, state.dir);
    const nw = words[(words.indexOf(w) + step + words.length) % words.length];
    select(nw.cells.find((c) => !c.input.value) || nw.cells[0], nw.dir);
  }

  function setLetter(cell, letter) {
    startTimer();
    cell.input.value = letter;
    cell.el.classList.remove("wrong", "revealed");
    afterChange();
  }

  function onKey(e, cell) {
    if (state.done) return;
    const k = e.key;
    if (/^[a-zA-Z]$/.test(k) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault(); setLetter(cell, k.toUpperCase()); move(1);
    } else if (k === "Backspace") {
      e.preventDefault();
      if (cell.input.value) setLetter(cell, "");
      else { move(-1); setLetter(state.cell, ""); }
    } else if (k === "Delete") {
      e.preventDefault(); setLetter(cell, "");
    } else if (k.startsWith("Arrow")) {
      e.preventDefault();
      const d = { ArrowRight: [0, 1, "A"], ArrowLeft: [0, -1, "A"], ArrowDown: [1, 0, "D"], ArrowUp: [-1, 0, "D"] }[k];
      if (state.dir !== d[2] && cell.words[d[2]]) { select(cell, d[2]); return; }
      const next = cells[key(cell.r + d[0], cell.c + d[1])];
      if (next) select(next, d[2]);
    } else if (k === "Tab" || k === "Enter") {
      e.preventDefault(); nextWord(e.shiftKey ? -1 : 1);
    } else if (k === " ") {
      e.preventDefault(); if (cell.words.A && cell.words.D) select(cell, other(state.dir));
    }
  }

  // Phones often don't say which key was pressed, so read what landed in the box instead
  function onInput(cell) {
    const letter = (cell.input.value.match(/[a-z]/gi) || []).pop();
    if (letter) { setLetter(cell, letter.toUpperCase()); move(1); }
    else setLetter(cell, "");
  }

  const isWordDone = (w) => w.cells.every((c) => c.input.value === c.answer);

  function afterChange() {
    let solved = 0;
    Object.values(cells).forEach((c) => c.el.classList.remove("solved"));
    words.forEach((w) => {
      const d = isWordDone(w);
      w.li.classList.toggle("done", d);
      if (d) { solved++; w.cells.forEach((c) => c.el.classList.add("solved")); } // finished words turn green
    });
    $("count").textContent = `${solved} of ${words.length} solved`;
    save();
    if (solved === words.length && !state.done) finish();
  }

  function finish() {
    state.done = true; stopTimer();
    Object.values(cells).forEach((c) => (c.input.readOnly = true));
    $("result").hidden = false;
    const r = state.revealed.size;
    $("resultText").textContent = `Full time! You got all ${words.length} answers in ${fmt(state.elapsed)}` +
      (r ? `, with ${r} revealed.` : ", with no reveals.");
  }

  // ---- SHARING ------------------------------------------------------------
  // Phones: opens the phone's share menu (WhatsApp, Messenger…). Computers: copies the text instead.
  const plainTitle = P.title.replace(/<[^>]+>/g, "");
  function shareLink(content) {
    // UTM tags let analytics count visitors who arrive from shared links
    return location.origin + location.pathname +
      `?utm_source=share&utm_medium=social&utm_campaign=${encodeURIComponent(P.id)}&utm_content=${content}`;
  }
  function resultText() {
    const squares = words.map((w) => (state.revealed.has(w.answer) ? "🟨" : "🟩"));
    const rows = [];
    for (let i = 0; i < squares.length; i += 10) rows.push(squares.slice(i, i + 10).join(""));
    const r = state.revealed.size;
    return `⚽ ${plainTitle} crossword\n✅ ${words.length}/${words.length} in ${fmt(state.elapsed)} · ${r} reveal${r === 1 ? "" : "s"}\n${rows.join("\n")}`;
  }
  async function share(text, url, noteId) {
    const note = $(noteId);
    const full = text + "\n" + url;
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; }
      catch (e) { if (e.name === "AbortError") return; } // the player closed the share menu
    }
    try {
      await navigator.clipboard.writeText(full);
      note.textContent = "Copied! Paste it anywhere to share.";
    } catch (e) {
      note.textContent = full; // clipboard blocked: show the text so it can be copied by hand
    }
    note.hidden = false;
    clearTimeout(note._t);
    note._t = setTimeout(() => (note.hidden = true), 4000);
  }
  $("btnShareResult").addEventListener("click", () => share(resultText(), shareLink("result"), "shareResultNote"));
  $("btnSharePuzzle").addEventListener("click", () =>
    share(`⚽ Can you solve the ${plainTitle} football crossword? ${words.length} answers.`, shareLink("puzzle"), "sharePuzzleNote"));

  // ---- BUTTONS ------------------------------------------------------------
  $("btnCheck").addEventListener("click", () => {
    Object.values(cells).forEach((c) => c.el.classList.toggle("wrong", !!c.input.value && c.input.value !== c.answer));
    if (state.cell) state.cell.input.focus({ preventScroll: true });
  });
  $("btnReveal").addEventListener("click", () => {
    if (!state.cell || state.done) return;
    startTimer();
    const w = wordAt(state.cell, state.dir);
    if (!isWordDone(w)) state.revealed.add(w.answer); // counted in the shared result as 🟨
    w.cells.forEach((c) => {
      if (c.input.value !== c.answer) { c.input.value = c.answer; c.el.classList.remove("wrong"); c.el.classList.add("revealed"); }
    });
    afterChange();
  });
  $("btnClear").addEventListener("click", () => {
    Object.values(cells).forEach((c) => { c.input.value = ""; c.input.readOnly = false; c.el.classList.remove("wrong", "revealed"); });
    stopTimer(); state.elapsed = 0; state.done = false; state.revealed.clear();
    $("timer").textContent = "00:00"; $("result").hidden = true;
    afterChange();
    select(words[0].cells[0], words[0].dir);
  });

  // ---- TIMER --------------------------------------------------------------
  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function startTimer() {
    if (state.timerId || state.done) return;
    state.started = Date.now() - state.elapsed * 1000;
    state.timerId = setInterval(() => {
      state.elapsed = Math.floor((Date.now() - state.started) / 1000);
      $("timer").textContent = fmt(state.elapsed);
    }, 250);
  }
  function stopTimer() {
    if (state.timerId) state.elapsed = Math.floor((Date.now() - state.started) / 1000);
    clearInterval(state.timerId); state.timerId = null;
    $("timer").textContent = fmt(state.elapsed);
  }

  // ---- SAVE PROGRESS ON THIS DEVICE (one key per puzzle) -------------------
  const STORE = "crossword:" + P.id;
  function save() {
    try {
      const letters = {};
      Object.entries(cells).forEach(([k, c]) => { if (c.input.value) letters[k] = c.input.value; });
      localStorage.setItem(STORE, JSON.stringify({ letters, elapsed: state.elapsed, revealed: [...state.revealed] }));
    } catch (e) {}
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE) || "null");
      if (!data) return;
      Object.entries(data.letters || {}).forEach(([k, v]) => { if (cells[k]) cells[k].input.value = v; });
      state.elapsed = data.elapsed || 0;
      (data.revealed || []).forEach((a) => state.revealed.add(a));
      $("timer").textContent = fmt(state.elapsed);
    } catch (e) {}
  }

  load();
  afterChange();
  select(words[0].cells[0], words[0].dir);
})();
