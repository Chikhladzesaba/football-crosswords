// Football Crosswords — the shared game. Every puzzle page uses this same file.
// It reads the puzzle from PUZZLE (in that puzzle's puzzle.js) and builds the page inside <div id="crossword">.
(function () {
  const P = window.PUZZLE;
  const root = document.getElementById("crossword");
  if (!P || !root) return;

  const words = P.words.map((w) => ({ ...w }));
  document.documentElement.style.setProperty("--cols", P.cols);

  // ---- LANGUAGE -----------------------------------------------------------
  // English by default. A puzzle with lang: ka in words.txt gets Georgian labels and a Georgian font.
  const KA = P.lang === "ka";
  const T = KA ? {
    back: "← ყველა კროსვორდი", check: "შემოწმება", clearWord: "სიტყვის წაშლა", reveal: "სიტყვის ჩვენება", letter: "ასოს ჩვენება",
    playNext: "ითამაშე სხვა", allDone: "ყველა კროსვორდი ამოხსნილი გაქვს! 🏆", home: "ყველა კროსვორდი",
    help: (l, w, a) => [(l || w) && [l && `${l} ასო`, w && `${w} სიტყვა`].filter(Boolean).join(" და ") + " ნაჩვენები", a && "ავტომატური შემოწმებით"].filter(Boolean).join(", ") || "დახმარების გარეშე",
    clear: "თავიდან", share: "გაზიარება", auto: "ავტ. შემოწმება",
    howTo: "თამაშის წესები", howToItems: [
      "დააკლიკე უჯრას და დაწერე პასუხი. მიმართულების შესაცვლელად კიდევ ერთხელ დააკლიკე.",
      "სწორი პასუხი გამწვანდება. თუ სიტყვა ბოლომდე შეავსე და არასწორია, გაწითლდება.",
      "მწვანე სიტყვის ასოებს ვეღარ შეცვლი. თუ იქ სხვა ასოს ჩაწერ, უჯრა წამით გაწითლდება. ესე იგი, ახალი სიტყვა არასწორია.",
      "<b>„შემოწმება“</b> არასწორ ასოებს წითლად მონიშნავს.",
      "<b>„სიტყვის წაშლა“</b> მონიშნულ სიტყვას ერთი დაკლიკვით წაშლის.",
      "<b>„ავტ. შემოწმება“</b>: ჩართვის შემდეგ ყოველი არასწორი ასო მაშინვე წითლდება. ეს დახმარებად ჩაითვლება.",
      "<b>„ასოს ჩვენება“</b> და <b>„სიტყვის ჩვენება“</b> სწორ პასუხს გაჩვენებს. ესეც დახმარებად ჩაითვლება.",
      "⭐-ს მხოლოდ მაშინ მიიღებ, თუ კროსვორდს დახმარების გარეშე ამოხსნი.",
    ],
    shareResult: "შედეგის გაზიარება", across: "ჰორიზონტალურად", down: "ვერტიკალურად",
    solved: (a, b) => `${a} / ${b} ამოხსნილი`,
    done: (n, t, h) => `დასრულდა! ${n}-ვე პასუხი ${t}-ში, ${h}.`,
    result: (n, t, h) => `⚽ ${plainTitle}\n✅ ${n}/${n} · ${t} · ${h}`,
    invite: (n) => `⚽ შეძლებ ამოხსნა? საფეხბურთო კროსვორდი „${plainTitle}“, ${n} პასუხი.`,
    copied: "დაკოპირდა! ჩასვი სადაც გინდა.",
    level: { "Easy": "მარტივი", "Medium": "საშუალო", "Hard": "რთული", "Very hard": "ძალიან რთული" },
    size: () => "",
  } : {
    back: "← All crosswords", check: "Check letters", clearWord: "Clear word", reveal: "Reveal word", letter: "Reveal letter",
    playNext: "Play another", allDone: "You've solved every crossword! 🏆", home: "See all crosswords",
    help: (l, w, a) => [(l || w) && [l && `${l} letter${l === 1 ? "" : "s"}`, w && `${w} word${w === 1 ? "" : "s"}`].filter(Boolean).join(" and ") + " revealed", a && "auto-check on"].filter(Boolean).join(", ") || "no help",
    clear: "Start over", share: "Share", auto: "Auto-check",
    howTo: "How to play?", howToItems: [
      "Tap a square and type your answer. Tap it again to switch between across and down.",
      "Correct words turn green. A full word that's wrong turns light red.",
      "Letters of green words are fixed. Type a different letter there and the square flashes red: your word doesn't fit.",
      "<b>Check letters</b> marks wrong letters in red.",
      "<b>Clear word</b> empties the selected word in one tap.",
      "<b>Auto-check</b> marks wrong letters red as you type. It counts as help.",
      "<b>Reveal letter</b> and <b>Reveal word</b> show the answer. They count as help too.",
      "⭐ means you solved the crossword with no help.",
    ],
    shareResult: "Share my result", across: "Across", down: "Down",
    solved: (a, b) => `${a} of ${b} solved`,
    done: (n, t, h) => `Full time! You got all ${n} answers in ${t}, with ${h}.`,
    result: (n, t, h) => `⚽ ${P.shareName || plainTitle + " crossword"}\n✅ ${n}/${n} in ${t} · ${h}`,
    invite: (n) => P.invite || `⚽ Can you solve the ${plainTitle} football crossword? ${n} answers.`,
    copied: "Copied! Paste it anywhere to share.",
    level: {},
    size: (n) => `${n} answers`,
  };
  if (KA) {
    document.documentElement.lang = "ka";
    const f = document.createElement("link"); f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;600&family=Noto+Serif+Georgian:wght@400&display=swap";
    document.head.appendChild(f);
  }
  // Letters players can type: English A–Z, plus Georgian ა–ჰ. Only English letters become capitals:
  // Georgian has no capitals in normal writing (upper-casing it would give Mtavruli).
  const LETTER = /^[a-zA-Z\u10D0-\u10FA]$/;
  const norm = (k) => (/[a-z]/i.test(k) ? k.toUpperCase() : k);

  // ---- PAGE LAYOUT --------------------------------------------------------
  root.innerHTML = `
    <main>
      <a class="back" href="${KA ? "../ka/" : "../"}">${T.back}</a>
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
            <button class="primary" id="btnCheck" type="button">${T.check}</button>
            <button id="btnClearWord" type="button">${T.clearWord}</button>
            <button id="btnAuto" type="button" aria-pressed="false">${T.auto}</button>
            <button id="btnLetter" type="button">${T.letter}</button>
            <button id="btnReveal" type="button">${T.reveal}</button>
            <button id="btnClear" type="button">${T.clear}</button>
            <button id="btnSharePuzzle" type="button">${T.share}</button>
          </div>
          <p class="share-note" id="sharePuzzleNote" hidden></p>
          <details class="howto"><summary>${T.howTo}</summary><ul>${T.howToItems.map((t) => `<li>${t}</li>`).join("")}</ul></details>
          <div class="result" id="result" hidden>
            <p id="resultText"></p>
            <button class="primary" id="btnShareResult" type="button">${T.shareResult}</button>
            <p class="share-note" id="shareResultNote" hidden></p>
          </div>
          <div class="next" id="next" hidden><h3>${T.playNext}</h3><div class="next-list" id="nextList"></div></div>
        </div>
        <div class="clues">
          <section><h3>${T.across}</h3><ol id="across"></ol></section>
          <section><h3>${T.down}</h3><ol id="down"></ol></section>
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
      if (!cells[k]) cells[k] = { k, r, c, answer: w.answer[i], words: {} };
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

  const state = { cell: null, dir: "A", started: null, elapsed: 0, done: false, timerId: null, revealed: new Set(), hinted: new Set(), wasDone: false, auto: false, autoUsed: false };

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
    if (typeof keepVisible === "function" && touch) requestAnimationFrame(keepVisible);
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
    if (LETTER.test(k) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault(); typeLetter(cell, norm(k));
    } else if (k === "Backspace") {
      e.preventDefault();
      if (cell.input.value && !locked(cell)) setLetter(cell, "");
      else { move(-1); if (!locked(state.cell)) setLetter(state.cell, ""); }
    } else if (k === "Delete") {
      e.preventDefault(); if (!locked(cell)) setLetter(cell, "");
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
    const letter = (cell.input.value.match(/[a-z\u10D0-\u10FA]/gi) || []).pop();
    if (letter) typeLetter(cell, norm(letter));
    else if (locked(cell)) { cell.input.value = cell.answer; move(-1); }
    else setLetter(cell, "");
  }

  // Letters of a solved (green) word are fixed. Typing a different letter there doesn't
  // overwrite it: the square flashes red, so you know your word doesn't fit the crossing one.
  const locked = (cell) => Object.values(cell.words).some((w) => isWordDone(w));
  function typeLetter(cell, letter) {
    if (locked(cell)) {
      cell.input.value = cell.answer;
      if (letter !== cell.answer) {
        cell.el.classList.remove("bump"); void cell.el.offsetWidth; cell.el.classList.add("bump");
        setTimeout(() => cell.el.classList.remove("bump"), 900);
      }
      move(1);
      return;
    }
    setLetter(cell, letter); move(1);
  }

  function isWordDone(w) { return w.cells.every((c) => c.input.value === c.answer); }

  function afterChange() {
    let solved = 0;
    Object.values(cells).forEach((c) => c.el.classList.remove("solved", "wordwrong"));
    words.forEach((w) => {
      const d = isWordDone(w);
      w.li.classList.toggle("done", d);
      if (d) { solved++; w.cells.forEach((c) => c.el.classList.add("solved")); } // finished words turn green
      else if (w.cells.every((c) => c.input.value)) w.cells.forEach((c) => c.el.classList.add("wordwrong")); // full but wrong: light red
    });
    if (state.auto) Object.values(cells).forEach((c) => c.el.classList.toggle("wrong", !!c.input.value && c.input.value !== c.answer));
    $("count").textContent = T.solved(solved, words.length);
    save();
    if (solved === words.length && !state.done) finish();
  }

  function finish() {
    state.done = true; stopTimer();
    Object.values(cells).forEach((c) => (c.input.readOnly = true));
    $("result").hidden = false;
    $("resultText").textContent = T.done(words.length, fmt(state.elapsed), helpText());
    recordSolve();
    withList(showNext);
  }
  const helpText = () => T.help(state.hinted.size, state.revealed.size, state.autoUsed);

  // ---- SOLVED RECORD (for the home page ticks and stats) ------------------
  // crossword:solved = { puzzleId: { time, perfect, date } }   crossword:days = ["2026-11-10", ...]
  const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
  function readJSON(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch (e) { return fallback; } }
  function recordSolve() {
    try {
      const solved = readJSON("crossword:solved", {});
      const perfect = state.hinted.size === 0 && state.revealed.size === 0 && !state.autoUsed;
      const old = solved[P.id];
      if (!old) solved[P.id] = { time: state.elapsed, perfect, date: today() };
      else { if (state.elapsed < old.time) old.time = state.elapsed; old.perfect = old.perfect || perfect; }
      localStorage.setItem("crossword:solved", JSON.stringify(solved));
      if (!state.wasDone) { // a fresh finish (not just reopening a finished puzzle) counts for the streak
        const days = readJSON("crossword:days", []);
        if (!days.includes(today())) { days.push(today()); localStorage.setItem("crossword:days", JSON.stringify(days.slice(-400))); }
      }
    } catch (e) {}
  }

  // ---- PLAY ANOTHER -------------------------------------------------------
  // Loads the home page list (crosswords.js) and suggests two unsolved puzzles in the same language
  let listWaiters = null;
  function withList(cb) {
    if (window.CROSSWORDS) return cb(window.CROSSWORDS);
    if (listWaiters) return listWaiters.push(cb);
    listWaiters = [cb];
    const s = document.createElement("script");
    s.src = "../crosswords.js";
    s.onload = s.onerror = () => listWaiters.forEach((f) => f(window.CROSSWORDS || []));
    document.head.appendChild(s);
  }
  function showNext(list) {
    const lang = P.lang || "en";
    const mine = list.filter((c) => (c.lang || "en") === lang);
    if (!mine.length) return;
    const me = mine.find((c) => c.folder === P.id) || {};
    const solved = readJSON("crossword:solved", {});
    const open = mine.filter((c) => c.folder !== P.id && !solved[c.folder]);
    const picks = [];
    [(c) => c.topic === me.topic, (c) => c.difficulty === me.difficulty, () => true].forEach((rule) => {
      const c = open.find((x) => rule(x) && !picks.includes(x));
      if (c && picks.length < 2) picks.push(c);
    });
    const box = $("nextList");
    box.innerHTML = "";
    if (!picks.length) {
      box.innerHTML = `<p class="all-done">${T.allDone}</p><a class="next-card" href="${KA ? "../ka/" : "../"}"><span class="name">${T.home}</span></a>`;
    }
    picks.forEach((c) => {
      const a = document.createElement("a");
      a.className = "next-card"; a.href = "../" + c.folder + "/";
      a.innerHTML = `<span class="name"></span><span class="meta-line"><span class="level level-${c.difficulty.toLowerCase().replace(" ", "-")}">${T.level[c.difficulty] || c.difficulty}</span><span class="size">${T.size(c.answers)}</span></span>`;
      a.querySelector(".name").textContent = c.name;
      box.appendChild(a);
    });
    $("next").hidden = false;
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
    // 🟩 solved alone · 🟨 a letter was revealed · 🟧 the whole word was revealed
    const squares = words.map((w) => (state.revealed.has(w.answer) ? "🟧" : w.cells.some((c) => state.hinted.has(c.k)) ? "🟨" : "🟩"));
    const rows = [];
    for (let i = 0; i < squares.length; i += 10) rows.push(squares.slice(i, i + 10).join(""));
    return T.result(words.length, fmt(state.elapsed), helpText()) + `\n${rows.join("\n")}`;
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
      note.textContent = T.copied;
    } catch (e) {
      note.textContent = full; // clipboard blocked: show the text so it can be copied by hand
    }
    note.hidden = false;
    clearTimeout(note._t);
    note._t = setTimeout(() => (note.hidden = true), 4000);
  }
  $("btnShareResult").addEventListener("click", () => share(resultText(), shareLink("result"), "shareResultNote"));
  $("btnSharePuzzle").addEventListener("click", () =>
    share(T.invite(words.length), shareLink("puzzle"), "sharePuzzleNote"));

  // ---- BUTTONS ------------------------------------------------------------
  $("btnCheck").addEventListener("click", () => {
    Object.values(cells).forEach((c) => c.el.classList.toggle("wrong", !!c.input.value && c.input.value !== c.answer));
    if (state.cell) state.cell.input.focus({ preventScroll: true });
  });
  $("btnLetter").addEventListener("click", () => {
    if (!state.cell || state.done) return;
    startTimer();
    const c = state.cell;
    if (c.input.value !== c.answer) {
      c.input.value = c.answer; state.hinted.add(c.k);
      c.el.classList.remove("wrong"); c.el.classList.add("revealed");
    }
    move(1);
    afterChange();
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
  // Auto-check: wrong letters turn red as you type. Optional, remembered on this device;
  // using it counts as help (no ⭐ "no help" for this puzzle).
  function setAuto(on) {
    state.auto = on;
    $("btnAuto").setAttribute("aria-pressed", on ? "true" : "false");
    if (on) { state.autoUsed = true; startTimer(); }
    else Object.values(cells).forEach((c) => c.el.classList.remove("wrong"));
    try { localStorage.setItem("crossword:autocheck", on ? "1" : "0"); } catch (e) {}
    afterChange();
  }
  $("btnAuto").addEventListener("click", () => {
    if (state.done) return;
    setAuto(!state.auto);
    if (state.cell) state.cell.input.focus({ preventScroll: true });
  });
  // Clear word: empties the selected word in one tap (long words took many Backspace taps).
  // Keeps letters that belong to a finished crossing word, and revealed letters.
  $("btnClearWord").addEventListener("click", () => {
    if (!state.cell || state.done) return;
    const w = wordAt(state.cell, state.dir);
    w.cells.forEach((c) => {
      const crossing = c.words[other(w.dir)];
      const keep = c.el.classList.contains("revealed") || (crossing && isWordDone(crossing));
      if (!keep) { c.input.value = ""; c.el.classList.remove("wrong"); }
    });
    afterChange();
    select(w.cells.find((c) => !c.input.value) || w.cells[0], w.dir);
  });
  $("btnClear").addEventListener("click", () => {
    Object.values(cells).forEach((c) => { c.input.value = ""; c.input.readOnly = false; c.el.classList.remove("wrong", "revealed"); });
    stopTimer(); state.elapsed = 0; state.done = false; state.wasDone = false; state.revealed.clear(); state.hinted.clear(); state.autoUsed = state.auto; $("next").hidden = true;
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
      localStorage.setItem(STORE, JSON.stringify({ letters, elapsed: state.elapsed, revealed: [...state.revealed], hinted: [...state.hinted], done: state.done, autoUsed: state.autoUsed }));
    } catch (e) {}
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE) || "null");
      if (!data) return;
      Object.entries(data.letters || {}).forEach(([k, v]) => { if (cells[k]) cells[k].input.value = v; });
      state.elapsed = data.elapsed || 0;
      (data.revealed || []).forEach((a) => state.revealed.add(a));
      state.autoUsed = !!data.autoUsed;
      (data.hinted || []).forEach((k) => state.hinted.add(k));
      state.wasDone = !!data.done;
      $("timer").textContent = fmt(state.elapsed);
    } catch (e) {}
  }

  // ---- PHONE TYPING MODE --------------------------------------------------
  // Phones keep their own keyboard. While typing we hide the title, pin the clue to the top of the
  // visible screen and scroll so the active square sits just above the keyboard.
  const touch = matchMedia("(pointer: coarse)").matches;
  const vv = window.visualViewport; // the part of the page not covered by the keyboard
  const bar = root.querySelector(".clue-bar");
  const spacer = document.createElement("div");
  spacer.className = "clue-spacer";
  bar.after(spacer);
  const typing = () => document.body.classList.contains("typing");
  function placeBar() {
    if (!typing()) return;
    spacer.style.height = bar.offsetHeight + "px"; // keeps the grid from jumping up under the bar
    bar.style.transform = vv ? `translateY(${vv.offsetTop}px)` : ""; // iPhone: follow the visible area
  }
  let userScrolling = false, scrollTimer = null; // true while the finger moves the page
  function keepVisible() {
    if (!touch || !state.cell || userScrolling) return; // never fight the user's own scroll
    const r = state.cell.el.getBoundingClientRect();
    const top = (vv ? vv.offsetTop : 0) + (typing() ? bar.offsetHeight : 0) + 8;
    const bottom = (vv ? vv.offsetTop + vv.height : innerHeight) - 12;
    if (r.bottom > bottom) scrollBy(0, r.bottom - bottom);
    else if (r.top < top) scrollBy(0, r.top - top);
  }
  let tapped = false; // the page focuses the first square on load; typing mode waits for a real tap
  if (touch) {
    root.addEventListener("pointerdown", () => (tapped = true), true);
    root.addEventListener("focusin", (e) => {
      if (!tapped || !e.target.closest("#grid")) return;
      document.body.classList.add("typing");
      requestAnimationFrame(() => { placeBar(); keepVisible(); });
    });
    root.addEventListener("focusout", () => setTimeout(() => {
      const a = document.activeElement;
      if (a && a.closest && a.closest("#grid")) return;
      document.body.classList.remove("typing");
      bar.style.transform = ""; spacer.style.height = "0";
    }, 60));
    addEventListener("touchmove", () => { userScrolling = true; clearTimeout(scrollTimer); }, { passive: true });
    addEventListener("touchend", () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(() => (userScrolling = false), 700); }, { passive: true });
    if (vv) {
      // Toolbars hiding/showing cause small resizes; only re-scroll when the keyboard opens or closes
      let lastH = vv.height;
      vv.addEventListener("resize", () => requestAnimationFrame(() => {
        placeBar();
        if (Math.abs(vv.height - lastH) > 150) keepVisible();
        lastH = vv.height;
      }));
      vv.addEventListener("scroll", placeBar);
    }
    // Hint buttons shouldn't close the keyboard
    ["btnCheck", "btnClearWord", "btnAuto", "btnLetter", "btnReveal"].forEach((id) => $(id).addEventListener("mousedown", (e) => e.preventDefault()));
  }

  load();
  try { if (localStorage.getItem("crossword:autocheck") === "1" && !state.done) { state.auto = true; state.autoUsed = true; $("btnAuto").setAttribute("aria-pressed", "true"); } } catch (e) {}
  afterChange();
  select(words[0].cells[0], words[0].dir);
})();
