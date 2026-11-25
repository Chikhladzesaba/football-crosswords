// Football Crosswords — the shared game. Every puzzle page uses this same file.
// It reads the puzzle from PUZZLE (in that puzzle's puzzle.js) and builds the page inside <div id="crossword">.
(function () {
  const P = window.PUZZLE;
  const root = document.getElementById("crossword");
  if (!P || !root) return;

  const words = P.words.map((w) => ({ ...w }));
  document.documentElement.style.setProperty("--cols", P.cols);
  document.documentElement.style.setProperty("--rows", P.rows); // the computer layout sizes the squares so the whole puzzle fits the screen height

  // ---- LANGUAGE -----------------------------------------------------------
  // English by default. A puzzle with lang: ka in words.txt gets Georgian labels and a Georgian font.
  const KA = P.lang === "ka";
  // ---- ANALYTICS (Google Analytics events; see consent.js) ----
  // The three details sent with every event: which game, which puzzle, which language.
  const track = (name, extra) => { if (window.kpTrack) kpTrack(name, Object.assign({ game: "crossword", puzzle_id: P.id, language: KA ? "ka" : "en" }, extra)); };
  const T = KA ? {
    back: "← ყველა კროსვორდი", check: "შემოწმება", clearWord: "სიტყვის წაშლა", reveal: "სიტყვის ჩვენება", letter: "ასოს ჩვენება",
    playNext: "ითამაშე სხვა კროსვორდი", more: "ითამაშე სხვა კროსვორდები", allDone: "ყველა კროსვორდი ამოხსნილი გაქვს! 🏆", home: "ყველა კროსვორდი",
    help: (l, w, a) => [(l || w) && [l && `${l} ასო`, w && `${w} სიტყვა`].filter(Boolean).join(" და ") + " ნაჩვენები", a && "ავტომატური შემოწმებით"].filter(Boolean).join(", ") || "დახმარების გარეშე",
    clear: "თავიდან", share: "გაზიარება", auto: "ავტ. შემოწმება",
    howTo: "თამაშის წესები", howToItems: [
      "დააკლიკე უჯრას და დაწერე პასუხი. მიმართულების შესაცვლელად კიდევ ერთხელ დააკლიკე.",
      "სწორი პასუხი გამწვანდება. თუ სიტყვა ბოლომდე შეავსე და არასწორია, გაწითლდება.",
      "მწვანე სიტყვის ასოებს ვეღარ შეცვლი. სიტყვის წერისას მწვანე ასო შეგიძლია ჩაწერო ან გამოტოვო: შემდეგი ასო თავისით ჩაჯდება შემდეგ ცარიელ უჯრაში.",
      "<b>„შემოწმება“</b> არასწორ ასოებს წითლად მონიშნავს.",
      "<b>„სიტყვის წაშლა“</b> მონიშნულ სიტყვას ერთი დაკლიკვით წაშლის.",
      "<b>„ავტ. შემოწმება“</b>: ჩართვის შემდეგ ყოველი არასწორი ასო მაშინვე წითლდება. ეს დახმარებად ჩაითვლება.",
      "<b>„ასოს ჩვენება“</b> და <b>„სიტყვის ჩვენება“</b> სწორ პასუხს გაჩვენებს. ესეც დახმარებად ჩაითვლება.",
      "⭐-ს მხოლოდ მაშინ მიიღებ, თუ კროსვორდს დახმარების გარეშე ამოხსნი.",
    ],
    winTitle: "გილოცავ! 🏆", perfect: "⭐ დახმარების გამოყენების გარეშე!", close: "დახურვა",
    winHelp: (l, w, a) => [
      (l || w) && "დახმარებით ნახე " + [l && `${l} ასო`, w && `${w} სიტყვა`].filter(Boolean).join(" და ") + ".",
      a && ((l || w) ? "ავტომატური შემოწმებაც ჩართული გქონდა." : "ავტომატური შემოწმება გქონდა ჩართული, მაგრამ არაუშავს!"),
    ].filter(Boolean).join(" "),
    shareResult: "გაზიარება", across: "ჰორიზონტალურად", down: "ვერტიკალურად",
    solved: (a, b) => `${a} / ${b} ამოხსნილი`,
    done: (n, t) => `${n}-ვე კითხვა ${t}-ში გამოიცანი!`,
    result: (n, t, h) => `⚽ ${P.shareName || plainTitle}\n✅ ${n}/${n} · ${t.replace(/^0(?=\d:)/, "")} წუთი · ${h}`, // 04:32 → 4:32 წუთი
    invite: (n) => P.invite || `⚽ შეძლებ ამოხსნა? საფეხბურთო კროსვორდი „${plainTitle}“, ${n} პასუხი.`,
    copied: "დაკოპირდა! ჩასვი სადაც გინდა.",
    level: { "Easy": "მარტივი", "Medium": "საშუალო", "Hard": "რთული", "Very hard": "ძალიან რთული" },
    size: () => "",
  } : {
    back: "← All crosswords", check: "Check letters", clearWord: "Clear word", reveal: "Reveal word", letter: "Reveal letter",
    playNext: "Play another", more: "Play more crosswords", allDone: "You've solved every crossword! 🏆", home: "See all crosswords",
    help: (l, w, a) => [(l || w) && [l && `${l} letter${l === 1 ? "" : "s"}`, w && `${w} word${w === 1 ? "" : "s"}`].filter(Boolean).join(" and ") + " revealed", a && "auto-check on"].filter(Boolean).join(", ") || "no help",
    clear: "Start over", share: "Share", auto: "Auto-check",
    howTo: "How to play?", howToItems: [
      "Tap a square and type your answer. Tap it again to switch between across and down.",
      "Correct words turn green. A full word that's wrong turns light red.",
      "Letters of green words are fixed. When you type a word, you can type the green letter or skip it: your next letter goes into the next empty square.",
      "<b>Check letters</b> marks wrong letters in red.",
      "<b>Clear word</b> empties the selected word in one tap.",
      "<b>Auto-check</b> marks wrong letters red as you type. It counts as help.",
      "<b>Reveal letter</b> and <b>Reveal word</b> show the answer. They count as help too.",
      "⭐ means you solved the crossword with no help.",
    ],
    winTitle: "You did it! 🏆", perfect: "⭐ Solved with no help!", close: "Close",
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
  }
  // Letters players can type: English A–Z, plus Georgian ა–ჰ. Only English letters become capitals:
  // Georgian has no capitals in normal writing (upper-casing it would give Mtavruli).
  const LETTER = /^[a-zA-Z\u10D0-\u10FA]$/;
  const norm = (k) => (/[a-z]/i.test(k) ? k.toUpperCase() : k);

  // ---- PAGE LAYOUT --------------------------------------------------------
  root.innerHTML = `
    <main>
      <a class="back" href="${KA ? "../ka/crosswords/" : "../crosswords/"}">${T.back}</a>
      <h1>${P.title}</h1>
      <p class="intro">${P.intro}</p>
      <div class="meta">
        <div class="count" id="count"></div>
        <div class="timer" id="timer" aria-label="Time">00:00</div>
      </div>
      <div class="board">
        <div class="clue-bar" aria-live="polite"><b id="clueNum"></b><span id="clueText"></span></div>
        <div class="play">
          <div class="grid" id="grid" role="grid" aria-label="Crossword grid"></div>
        </div>
        <div class="side">
          <div class="actions">
            <button class="primary" id="btnCheck" type="button">${T.check}</button>
            <span class="word-tools" id="wordTools">
              <button id="btnLetter" type="button">${T.letter}</button>
              <button id="btnReveal" type="button">${T.reveal}</button>
              <button class="quiet ibtn" id="btnClearWord" type="button" hidden title="${T.clearWord}" aria-label="${T.clearWord}"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5h10L18 7M9 7V4.5h6V7"/></svg><span class="lbl">${T.clearWord}</span></button>
              <button class="quiet ibtn" id="btnClear" type="button" title="${T.clear}" aria-label="${T.clear}"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2"/><path d="M3.5 4v5h5"/></svg><span class="lbl">${T.clear}</span></button>
            </span>
            <span class="actions-break" aria-hidden="true"></span>
            <button class="quiet" id="btnAuto" type="button" aria-pressed="false">${T.auto}</button>
          </div>
          <div class="result" id="result" hidden>
            <p id="resultText"></p>
            <button class="primary" id="btnShareResult" type="button">${T.shareResult}</button>
            <button class="result-next" id="btnNextResult" type="button">${T.playNext} →</button>
            <p class="share-note" id="shareResultNote" hidden></p>
          </div>
          <div class="clue-tabs" role="tablist">
            <button type="button" role="tab" data-d="A" aria-selected="true">${T.across}</button>
            <button type="button" role="tab" data-d="D" aria-selected="false">${T.down}</button>
          </div>
          <div class="clues" data-tab="A">
            <section><h3>${T.across}</h3><ol id="across"></ol></section>
            <section><h3>${T.down}</h3><ol id="down"></ol></section>
          </div>
        </div>
      </div>
    </main>
    <div class="below">
      <section class="more" id="next" hidden><h2>${T.more}</h2><div class="next-list" id="nextList"></div></section>
      <details class="howto"><summary>${T.howTo}</summary><ul>${T.howToItems.map((t) => `<li>${t}</li>`).join("")}</ul></details>
    </div>
    <div class="win" id="win" role="dialog" aria-modal="true" aria-labelledby="winTitle" hidden>
      <div class="win-card">
        <button class="win-x" id="winX" type="button" aria-label="${T.close}">×</button>
        <div class="win-cup"><svg viewBox='0 0 100 100' aria-hidden='true'><rect width='100' height='100' rx='18' fill='#1f6feb'/><g fill='#fff'><rect x='12' y='12' width='22' height='22' rx='3'/><rect x='39' y='12' width='22' height='22' rx='3'/><rect x='66' y='12' width='22' height='22' rx='3'/><rect x='12' y='39' width='22' height='22' rx='3'/><rect x='66' y='39' width='22' height='22' rx='3'/><rect x='12' y='66' width='22' height='22' rx='3'/><rect x='39' y='66' width='22' height='22' rx='3'/><rect x='66' y='66' width='22' height='22' rx='3'/></g><clipPath id='winBall'><circle cx='50' cy='50' r='12.5'/></clipPath><circle cx='50' cy='50' r='12.5' fill='#fff'/><g clip-path='url(#winBall)' fill='#111' stroke='#111' stroke-width='0.9' stroke-linejoin='round'><polygon points='50.00,46.00 53.80,48.76 52.35,53.24 47.65,53.24 46.20,48.76'/><line x1='50.00' y1='46.00' x2='50.00' y2='40.00'/><polygon points='50.00,40.00 46.77,37.65 48.00,33.85 52.00,33.85 53.23,37.65'/><line x1='53.80' y1='48.76' x2='59.51' y2='46.91'/><polygon points='59.51,46.91 60.75,43.11 64.74,43.11 65.98,46.91 62.74,49.26'/><line x1='52.35' y1='53.24' x2='55.88' y2='58.09'/><polygon points='55.88,58.09 59.87,58.09 61.11,61.89 57.88,64.24 54.64,61.89'/><line x1='47.65' y1='53.24' x2='44.12' y2='58.09'/><polygon points='44.12,58.09 45.36,61.89 42.12,64.24 38.89,61.89 40.13,58.09'/><line x1='46.20' y1='48.76' x2='40.49' y2='46.91'/><polygon points='40.49,46.91 37.26,49.26 34.02,46.91 35.26,43.11 39.25,43.11'/></g><circle cx='50' cy='50' r='12.5' fill='none' stroke='#111' stroke-width='1.3'/></svg></div>
        <h2 id="winTitle">${T.winTitle}</h2>
        <p id="winText"></p>
        <p class="win-perfect" id="winPerfect" hidden>${T.perfect}</p>
        <p id="winHelp" hidden></p>
        <button class="primary" id="winShare" type="button">${T.shareResult}</button>
        <p class="share-note" id="winShareNote" hidden></p>
        <button id="winNext" type="button">${T.playNext}</button>
      </div>
    </div>`;

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

  const state = { cell: null, dir: "A", started: null, elapsed: 0, done: false, timerId: null, revealed: new Set(), hinted: new Set(), shown: new Set(), wasDone: false, auto: false, autoUsed: false };

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

  // One clue box with an Across / Down tab
  function showTab(d) {
    const box = root.querySelector(".side .clues"); if (!box) return;
    box.dataset.tab = d;
    root.querySelectorAll(".clue-tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.d === d)));
  }
  root.querySelectorAll(".clue-tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.d)));

  let started = false; // the first word is selected automatically when the page opens; the word buttons wait for a real selection
  let onDirChange = () => {};
  function select(cell, dir) {
    if (!cell.words[dir]) dir = other(dir);
    state.cell = cell; state.dir = dir;
    onDirChange();
    const w = cell.words[dir];
    showTab(w.dir); // the list shows the direction of the selected word
    Object.values(cells).forEach((c) => c.el.classList.remove("inword", "active"));
    w.cells.forEach((c) => c.el.classList.add("inword"));
    cell.el.classList.add("active");
    words.forEach((x) => x.li.classList.toggle("current", x === w));
    // On computers the clue lists scroll inside their own box (the card, or the whole panel when the cards are stacked)
    const sec = w.li.closest("section"), box = sec && sec.scrollHeight > sec.clientHeight + 1 ? sec : w.li.closest(".clues");
    if (box && box.scrollHeight > box.clientHeight) {
      const t = w.li.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop, b = t + w.li.offsetHeight;
      if (t < box.scrollTop) box.scrollTop = t - 8; else if (b > box.scrollTop + box.clientHeight) box.scrollTop = b - box.clientHeight + 8;
    }
    updateDel();
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
  // Letters shown by the help buttons are fixed too (they are correct), so Backspace can't remove them.
  const locked = (cell) => state.shown.has(cell.k) || Object.values(cell.words).some((w) => isWordDone(w));
  function typeLetter(cell, letter) {
    if (locked(cell)) {
      cell.input.value = cell.answer;
      // The player skipped the green letter and typed the next one: put it in the next free square.
      // (Typing the green letter itself just moves on, so both ways of typing work.)
      if (letter !== cell.answer) {
        const w = wordAt(cell, state.dir);
        const next = w.cells.slice(w.cells.indexOf(cell) + 1).find((c) => !locked(c));
        if (next) { select(next, w.dir); setLetter(next, letter); move(1); return; }
      }
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

  // The delete-word button only shows when the selected word has letters that it could clear.
  let onDelChange = () => {};
  function updateDel() {
    const b = $("btnClearWord"); if (!b) return;
    let any = false;
    if (state.cell && !state.done) {
      const w = wordAt(state.cell, state.dir);
      any = w.cells.some((c) => c.input.value && !(c.el.classList.contains("revealed") || (c.words[other(w.dir)] && isWordDone(c.words[other(w.dir)]))));
    }
    if (b.hidden === !any) return;
    b.hidden = !any; onDelChange();
  }
  function afterChange() {
    setTimeout(updateDel, 0);
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
    const fresh = !state.wasDone; // reopening an already finished puzzle shows no popup
    if (fresh) track("game_complete", { duration_sec: state.elapsed, no_help: state.hinted.size === 0 && state.revealed.size === 0 && !state.autoUsed });
    recordSolve();
    withList(showNext);
    if (fresh) showWin();
  }

  // ---- WIN POPUP ----------------------------------------------------------
  function showWin() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // closes the phone keyboard
    document.body.classList.remove("typing");
    $("winText").textContent = $("resultText").textContent;
    const perfect = state.hinted.size === 0 && state.revealed.size === 0 && !state.autoUsed;
    $("winPerfect").hidden = !perfect;
    $("winHelp").hidden = perfect || !T.winHelp; // Georgian: says which help was used (English has it in the main line)
    if (T.winHelp) $("winHelp").textContent = T.winHelp(state.hinted.size, state.revealed.size, state.autoUsed);
    $("win").hidden = false;
    $("winShare").focus({ preventScroll: true });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) confetti();
  }
  function closeWin() { $("win").hidden = true; }
  function confetti() { // a short shower of little squares
    for (let i = 0; i < 24; i++) {
      const b = document.createElement("span"); // little crossword squares in the site colours
      b.className = "confetti";
      b.style.background = ["#1f6feb", "#13693a", "#d9f5e3", "#e3efff"][i % 4];
      b.style.left = Math.random() * 100 + "vw";
      b.style.animationDelay = Math.random() * 0.8 + "s";
      b.style.width = b.style.height = 8 + Math.random() * 10 + "px";
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 3500);
    }
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
    s.src = "../crosswords.js?v=3"; // keep the number the same as in the home pages
    s.onload = s.onerror = () => listWaiters.forEach((f) => f(window.CROSSWORDS || []));
    document.head.appendChild(s);
  }
  function showNext(list) {
    const lang = P.lang || "en";
    const mine = list.filter((c) => (c.lang || "en") === lang);
    if (!mine.length) return;
    const me = mine.find((c) => c.folder === P.id) || {};
    const solved = readJSON("crossword:solved", {});
    const others = mine.filter((c) => c.folder !== P.id);
    // Always shown under the puzzle: the other crosswords with the same topic AND the same difficulty (unsolved first)
    let picks = others.filter((c) => c.topic === me.topic && c.difficulty === me.difficulty)
      .sort((x, y) => !!solved[x.folder] - !!solved[y.folder]).slice(0, 3);
    let all = false;
    if (!picks.length && (state.done || state.wasDone)) { // finished and nothing similar: suggest up to two unsolved ones
      const open = others.filter((c) => !solved[c.folder]);
      [(c) => c.topic === me.topic, (c) => c.difficulty === me.difficulty, () => true].forEach((rule) => {
        const c = open.find((x) => rule(x) && !picks.includes(x));
        if (c && picks.length < 2) picks.push(c);
      });
      all = !picks.length;
    }
    const box = $("nextList");
    box.innerHTML = "";
    if (all) box.innerHTML = `<p class="all-done">${T.allDone}</p><a class="next-card" href="${KA ? "../ka/crosswords/" : "../crosswords/"}"><span class="name">${T.home}</span></a>`;
    picks.forEach((c) => {
      const a = document.createElement("a");
      a.className = "next-card"; a.href = "../" + c.folder + "/";
      a.innerHTML = `<span class="name"></span><span class="meta-line"><span class="level level-${c.difficulty.toLowerCase().replace(" ", "-")}">${T.level[c.difficulty] || c.difficulty}</span><span class="size">${T.size(c.answers)}</span></span>`;
      a.querySelector(".name").textContent = c.name;
      box.appendChild(a);
    });
    $("next").hidden = !(picks.length || all);
  }

  // ---- SHARING ------------------------------------------------------------
  // Phones: opens the phone's share menu (WhatsApp, Messenger…). Computers: copies the text instead.
  const plainTitle = P.title.replace(/<[^>]+>/g, "");
  function shareLink(content) {
    // UTM tags let analytics count visitors who arrive from shared links
    return location.origin + location.pathname +
      `?utm_source=share&utm_medium=social&utm_campaign=${encodeURIComponent(P.id)}&utm_content=${content}`;
  }
  function resultText() { return T.result(words.length, fmt(state.elapsed), helpText()); }
  async function share(text, url, noteId, anchor) {
    track("share", { method: "result" });
    const note = $(noteId);
    const full = text + "\n" + url;
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; }
      catch (e) { if (e.name === "AbortError") return; } // the player closed the share menu
    }
    if (window.KPShare) { KPShare.open({ anchor, text, url, note }); return; } // computers: WhatsApp / Facebook / X / Copy
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
  $("btnShareResult").addEventListener("click", (e) => share(resultText(), shareLink("result"), "shareResultNote", e.currentTarget));
  $("winShare").addEventListener("click", (e) => share(resultText(), shareLink("result"), "winShareNote", e.currentTarget));
  $("winX").addEventListener("click", closeWin);
  // On phones the "play more" list under the puzzle is hidden, so go straight to the first suggested crossword (or the list of all crosswords)
  function goNext() {
    if (!$("next").offsetParent) {
      const a = $("nextList").querySelector("a"), back = root.querySelector("a.back");
      const href = (a && a.getAttribute("href")) || (back && back.getAttribute("href"));
      if (href) location.href = href;
      return;
    }
    $("next").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("winNext").addEventListener("click", () => { closeWin(); goNext(); });
  $("btnNextResult").addEventListener("click", goNext);
  $("win").addEventListener("click", (e) => { if (e.target.id === "win") closeWin(); }); // tap outside the card
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("win").hidden) closeWin(); });

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
      c.input.value = c.answer; state.hinted.add(c.k); state.shown.add(c.k);
      c.el.classList.remove("wrong"); c.el.classList.add("revealed");
    }
    move(1);
    afterChange();
  });
  $("btnReveal").addEventListener("click", () => {
    if (!state.cell || state.done) return;
    startTimer();
    const w = wordAt(state.cell, state.dir);
    if (!isWordDone(w)) state.revealed.add(w.answer); // counted as a revealed word in the result
    w.cells.forEach((c) => {
      if (c.input.value !== c.answer) { c.input.value = c.answer; c.el.classList.remove("wrong"); c.el.classList.add("revealed"); }
      state.shown.add(c.k);
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
    stopTimer(); state.elapsed = 0; state.done = false; state.wasDone = false; state.revealed.clear(); state.hinted.clear(); state.shown.clear(); state.autoUsed = state.auto; withList(showNext);
    $("timer").textContent = "00:00"; $("result").hidden = true;
    afterChange();
    select(words[0].cells[0], words[0].dir);
  });

  // ---- TIMER --------------------------------------------------------------
  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function startTimer() {
    if (state.timerId || state.done) return;
    if (state.elapsed === 0 && !state.startSent) { state.startSent = true; track("game_start"); } // a brand new game, once per page load (resuming a saved game is not a new start)
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
      localStorage.setItem(STORE, JSON.stringify({ letters, elapsed: state.elapsed, revealed: [...state.revealed], hinted: [...state.hinted], shown: [...state.shown], done: state.done, autoUsed: state.autoUsed }));
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
      (data.shown || data.hinted || []).forEach((k) => state.shown.add(k));
      state.wasDone = !!data.done;
      $("timer").textContent = fmt(state.elapsed);
    } catch (e) {}
  }

  // ---- PHONE TYPING MODE --------------------------------------------------
  // Phones keep their own keyboard. While typing we hide the title, pin the clue to the top of the
  // visible screen and scroll so the active square sits just above the keyboard.
  const touch = matchMedia("(pointer: coarse)").matches;
  const PHONE = touch && matchMedia("(max-width: 760px)").matches; // phone layout (below)
  const vv = window.visualViewport; // the part of the page not covered by the keyboard
  const bar = root.querySelector(".clue-bar");
  const spacer = document.createElement("div");
  spacer.className = "clue-spacer";
  $("grid").before(spacer); // inside the left column, between the clue bar and the grid
  const typing = () => document.body.classList.contains("typing");
  function placeBar() {
    if (!typing()) return;
    spacer.style.height = bar.offsetHeight + "px"; // keeps the grid from jumping up under the bar
    bar.style.transform = vv ? `translateY(${vv.offsetTop}px)` : ""; // iPhone: follow the visible area
  }
  let userScrolling = false, scrollTimer = null; // true while the finger moves the page
  function keepVisible() {
    if (PHONE && state.cell) { // phone: the grid scrolls inside its own box; bring the WHOLE selected word into view so you can see how many letters it has
      const box = $("grid").parentElement, b = box.getBoundingClientRect(), cw = wordAt(state.cell, state.dir).cells;
      let l = 1e9, t = 1e9, r = -1e9, bt = -1e9;
      cw.forEach((c) => { const q = c.el.getBoundingClientRect(); l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); bt = Math.max(bt, q.bottom); });
      const pad = state.cell.el.getBoundingClientRect().height * 0.6;
      const fit = (lo, hi, blo, bhi) => { // how far to scroll so [lo, hi] sits inside [blo, bhi]; if it is too long, line its start up
        if (hi - lo + 2 * pad > bhi - blo) return lo - pad - blo;
        if (lo - pad < blo) return lo - pad - blo;
        if (hi + pad > bhi) return hi + pad - bhi;
        return 0;
      };
      box.scrollTop += fit(t, bt, b.top, b.bottom);
      box.scrollLeft += fit(l, r, b.left, b.right);
      return;
    }
    if (!touch || PHONE || !state.cell || userScrolling) return; // never fight the user's own scroll
    const r = state.cell.el.getBoundingClientRect();
    const top = (vv ? vv.offsetTop : 0) + (typing() ? bar.offsetHeight : 0) + 8;
    const bottom = (vv ? vv.offsetTop + vv.height : innerHeight) - 12;
    if (r.bottom > bottom) scrollBy(0, r.bottom - bottom);
    else if (r.top < top) scrollBy(0, r.top - top);
  }

  // ---- PHONE LAYOUT -------------------------------------------------------
  // On a phone the page keeps the phone's own keyboard. To stop the grid from hiding behind it or jumping around,
  // the header is one slim row, the clue box has a fixed height and the squares are sized so the whole grid fits
  // in the space above the keyboard (the CSS leaves room for it even before the keyboard is open).
  if (PHONE) {
    document.body.classList.add("phone-play");
    const kc = document.createElement("span"); kc.className = "play-count"; $("count").after(kc); // short progress, e.g. 3/8
    const upd = () => { kc.textContent = ($("count").textContent.match(/\d+\s*\/\s*\d+/) || [""])[0].replace(/\s/g, ""); };
    new MutationObserver(upd).observe($("count"), { childList: true, characterData: true, subtree: true }); upd();
    // The page is exactly as tall as the visible part of the screen (above the keyboard) and never scrolls itself
    const fit = () => {
      if (!vv) return;
      if (document.body.classList.contains("own-kb")) { // no phone keyboard to make room for; just make sure nothing is shifted
        document.body.style.setProperty("--vvh", vv.height + "px"); document.body.style.transform = "";
        if (vv.offsetLeft || vv.offsetTop || scrollX || scrollY) scrollTo(0, 0);
        return;
      }
      document.body.style.setProperty("--vvh", vv.height + "px");
      document.body.style.transform = vv.offsetTop ? `translateY(${vv.offsetTop}px)` : "";
      keepVisible();
    };
    if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); fit(); }
    addEventListener("scroll", () => { if (scrollY) scrollTo(0, 0); }, { passive: true });
  }
  // ---- OWN KEYBOARD (phones, live) --------------------------------
  // On by default on phones. ?kb=native switches back to the phone's own keyboard (and remembers it), ?kb=own turns ours on again. The squares keep their <input>,
  // but inputmode="none" tells the phone not to show its own keyboard, so our buttons (below) type the letters instead.
  let ownKb = true;
  try {
    const q = (location.search.match(/[?&]kb=(own|native)\b/) || [])[1];
    if (q) localStorage.setItem("crossword:kb", q);
    ownKb = localStorage.getItem("crossword:kb") !== "native";
  } catch (e) {}
  if (PHONE && ownKb) {
    document.body.classList.add("own-kb");
    // The title row (with the back arrow) is hidden while typing, so the clue bar carries its own back arrow
    const backLink = root.querySelector("a.back");
    if (backLink) {
      const ba = document.createElement("a");
      ba.className = "bar-back"; ba.href = backLink.getAttribute("href"); ba.setAttribute("aria-label", backLink.textContent.trim());
      ba.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6"/></svg>';
      bar.prepend(ba);
    }
    // The squares are never focused in this mode: Safari scrolls the whole page to reveal any focused field, even with its keyboard off,
    // and that shifted everything. Our code keeps track of the selected square itself, and a tap on the square (not the field) selects it.
    Object.values(cells).forEach((c) => {
      c.input.setAttribute("inputmode", "none");
      c.input.readOnly = true; c.input.tabIndex = -1;
      c.input.focus = () => {};
      c.input.style.pointerEvents = "none";
      c.el.addEventListener("click", () => onCellTap(c));
    });
    const KA = document.documentElement.lang === "ka";
    const LAY = {
      ka: ["ქწერტყუიოპ", "ასდფგჰჯკლ", "ზხცვბნმ"],
      kaShift: ["ქჭეღთყუიოპ", "აშდფგჰჟკლ", "ძხჩვბნმ"],
      en: ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"],
    };
    const SVG = (d, fill) => '<svg width="22" height="22" viewBox="0 0 24 24" fill="' + (fill || "none") + '" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
    const IC = {
      back: SVG('<path d="M21 6H9l-6 6 6 6h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="m12 9.5 5 5m0-5-5 5"/>'),
      shift: (on) => SVG('<path d="M12 4 3.5 12.5H8V19h8v-6.5h4.5z"/>', on ? "currentColor" : "none"),
      lang: SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>'),
      dir: SVG('<path d="M4 12h16m0 0-5-5m5 5-5 5"/>'),
      dirD: SVG('<path d="M12 4v16m0 0-5-5m5 5 5-5"/>'),
      prev: SVG('<path d="m15 5-7 7 7 7"/>'),
      next: SVG('<path d="m9 5 7 7-7 7"/>'),
      down: SVG('<path d="m6 9 6 6 6-6"/>'),
      kbd: SVG('<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
      list: SVG('<path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
    };
    const TXT = KA
      ? { prev: "წინა", next: "შემდეგი", back: "წაშლა", shift: "Shift", dir: "მიმართულების შეცვლა", lang: { ka: "ABC", en: "ქარ" }, list: "ყველა კითხვა", keys: "კლავიატურა", close: "კლავიატურის დამალვა", group: "კლავიატურა" }
      : { prev: "Prev", next: "Next", back: "Delete", shift: "Shift", dir: "Switch direction", lang: { ka: "ABC", en: "ქარ" }, list: "All clues", keys: "Keyboard", close: "Hide keyboard", group: "Keyboard" };
    let lang = KA ? "ka" : "en", shift = false, showList = false, listDir = "A";
    const kb = document.createElement("div");
    kb.id = "kb"; kb.setAttribute("role", "group"); kb.setAttribute("aria-label", TXT.group);
    document.body.appendChild(kb);
    const btn = (a, inner, label, k) => '<button type="button" data-a="' + a + '"' + (k ? ' data-k="' + k + '"' : "") + ' aria-label="' + label + '">' + inner + "</button>";
    function renderKb() {
      const rows = LAY[lang === "ka" && shift ? "kaShift" : lang];
      const keys = (r) => [...rows[r]].map((ch) => btn("key", ch, ch, ch)).join("");
      const sh = lang === "ka" ? btn("shift", IC.shift(shift), TXT.shift).replace("<button", '<button class="fk" aria-pressed="' + shift + '"') : "";
      const act = (id) => $(id).hidden ? "" : '<button type="button" class="kba' + (id === "btnCheck" ? " main" : "") + '" data-a="act" data-id="' + id + '"' + (id === "btnAuto" ? ' aria-pressed="' + $(id).getAttribute("aria-pressed") + '"' : "") + (id === "btnAuto" || !$(id).querySelector("svg") ? ">" + $(id).textContent.trim() : ' aria-label="' + $(id).getAttribute("aria-label") + '">' + $(id).querySelector("svg").outerHTML.replace(/ (width|height)="22"/g, "")) + "</button>";
      const top = '<div class="kbtop"><div class="kbscroll">' + ["btnLetter", "btnReveal", "btnClearWord", "btnClear", "btnAuto"].map(act).join("") + "</div>" + btn("close", IC.down, TXT.close).replace("<button", '<button class="kbx"') + "</div>";
      const ctl = '<div class="kbr ctl">' +
          btn("lang", IC.lang + "<span>" + TXT.lang[lang] + "</span>", TXT.lang[lang]).replace("<button", '<button class="w1"') +
          btn("dir", state.dir === "D" ? IC.dirD : IC.dir, TXT.dir).replace("<button", '<button class="w2"') +
          btn("list", showList ? IC.kbd : IC.list, showList ? TXT.keys : TXT.list).replace("<button", '<button class="w2' + (showList ? " on" : "") + '" aria-pressed="' + showList + '"') +
          btn("prev", IC.prev + "<span>" + TXT.prev + "</span>", TXT.prev) +
          btn("next", "<span>" + TXT.next + "</span>" + IC.next, TXT.next) +
        "</div>";
      if (showList) {
        const item = (w) => '<button type="button" data-a="clue" data-i="' + words.indexOf(w) + '" class="ci' + (state.cell && wordAt(state.cell, state.dir) === w ? " cur" : "") + (w.li.classList.contains("done") ? " done" : "") + '"><b>' + w.num + "</b><span>" + w.clue + "</span></button>";
        const tab = (d, h) => '<button type="button" data-a="ltab" data-d="' + d + '" aria-pressed="' + (listDir === d) + '">' + h + "</button>";
        kb.innerHTML = top + '<div class="ltabs">' + tab("A", T.across) + tab("D", T.down) + '</div><div class="kbl">' + words.filter((w) => w.dir === listDir).map(item).join("") + "</div>" + ctl;
        const cur = kb.querySelector(".ci.cur"); if (cur) kb.querySelector(".kbl").scrollTop = Math.max(0, cur.offsetTop - 44);
        return;
      }
      kb.innerHTML = top +
        '<div class="kbr">' + keys(0) + "</div>" +
        '<div class="kbr">' + keys(1) + "</div>" +
        '<div class="kbr">' + sh + keys(2) + btn("back", IC.back, TXT.back).replace("<button", '<button class="fk"') + "</div>" + ctl;
    }
    onDirChange = () => { const b = $("kb") && $("kb").querySelector('[data-a="dir"]'); if (b) b.innerHTML = state.dir === "D" ? IC.dirD : IC.dir; };
    onDelChange = () => { if (!showList) renderKb(); };
    renderKb();
    setTimeout(() => (root.dataset.ready = "1"), 600); // ignore the automatic focus on load
    const press = (b) => {
      const a = b.dataset.a, c = state.cell;
      if (!c || state.done) return;
      if (a === "key") { onKey({ key: b.dataset.k, metaKey: false, ctrlKey: false, preventDefault() {} }, c); if (shift) { shift = false; renderKb(); } }
      else if (a === "back") onKey({ key: "Backspace", preventDefault() {} }, c);
      else if (a === "shift") { shift = !shift; renderKb(); }
      else if (a === "lang") { lang = lang === "ka" ? "en" : "ka"; shift = false; renderKb(); }
      else if (a === "dir") { if (c.words.A && c.words.D) select(c, other(state.dir)); }
      else if (a === "close") { showList = false; shift = false; renderKb(); document.body.classList.remove("typing"); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
      else if (a === "act") { $(b.dataset.id).click(); if (b.dataset.id === "btnAuto") b.setAttribute("aria-pressed", $("btnAuto").getAttribute("aria-pressed")); if (showList) { showList = false; renderKb(); } }
      else if (a === "list") { showList = !showList; if (showList) listDir = state.dir; renderKb(); }
      else if (a === "ltab") { listDir = b.dataset.d; renderKb(); }
      else if (a === "clue") { const w = words[+b.dataset.i]; showList = false; select(w.cells[0], w.dir); renderKb(); }
      else if (a === "prev") { nextWord(-1); if (showList) renderKb(); }
      else if (a === "next") { nextWord(1); if (showList) renderKb(); }
    };
    // pointerdown = instant response. preventDefault keeps the focus on the square, so the keys never close the keyboard.
    kb.addEventListener("pointerdown", (e) => { const b = e.target.closest("button"); if (!b || b.dataset.a === "clue" || b.dataset.a === "close" || b.dataset.a === "act") return; e.preventDefault(); press(b); }); // clue rows act on click so scrolling the list doesn't pick one; close acts on click so the same tap can't land on a square that moves under the finger
    kb.addEventListener("mousedown", (e) => e.preventDefault());
    kb.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b && (e.detail === 0 || b.dataset.a === "clue" || b.dataset.a === "close" || b.dataset.a === "act")) press(b); }); // Enter/Space on a focused key (switch control, screen reader)
    // The keyboard opens when a square is tapped and closes when the focus leaves the grid (like the phone's own keyboard)
    const openKb = (e) => {
      if (!e.target.closest("#grid")) return;
      document.body.classList.add("typing");
      const ab = kb.querySelector('[data-id="btnAuto"]'); if (ab) ab.setAttribute("aria-pressed", $("btnAuto").getAttribute("aria-pressed"));
      requestAnimationFrame(keepVisible);
    };
    root.addEventListener("click", openKb); // a tap on a square (also when it is already the focused one)
    root.addEventListener("focusin", (e) => { if (e.isTrusted && root.dataset.ready) openKb(e); });
    root.addEventListener("focusout", () => setTimeout(() => {
      const a = document.activeElement;
      if (a && a.closest && a.closest("#grid")) return;
      document.body.classList.remove("typing");
    }, 60));
    // Hint buttons shouldn't close the keyboard
    ["btnCheck", "btnClearWord", "btnAuto", "btnLetter", "btnReveal"].forEach((id) => $(id).addEventListener("mousedown", (e) => e.preventDefault()));
  }
  let tapped = false; // the page focuses the first square on load; typing mode waits for a real tap
  if (touch && !PHONE) {
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
  started = true;
  withList(showNext); // "Play more crosswords" under the puzzle
  // Phone: stretch the grid to the same left and right edge as the header (logo and burger menu). Squares stay whole pixels:
  // the few leftover pixels are shared out one by one, so some columns are 1px wider.
  const gridEl = $("grid");
  function fitGrid() {
    gridEl.style.gridTemplateColumns = "";
    if (!document.body.classList.contains("phone-play")) return;
    const par = gridEl.parentElement, cs = getComputedStyle(par);
    const avail = Math.floor(par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    const cell = parseFloat(getComputedStyle(gridEl).gridTemplateColumns.split(" ")[0]);
    const n = getComputedStyle(gridEl).gridTemplateColumns.split(" ").length;
    const line = parseFloat(getComputedStyle(gridEl).paddingRight) || 2;
    const extra = avail - line - n * cell;
    if (!(cell > 0) || extra <= 0 || extra > n * 3) return; // small puzzles that are limited by height stay centred instead of stretching the squares
    const cols = [];
    for (let i = 0; i < n; i++) cols.push(cell + Math.floor(((i + 1) * extra) / n) - Math.floor((i * extra) / n) + "px");
    gridEl.style.gridTemplateColumns = cols.join(" ");
  }
  fitGrid();
  window.addEventListener("resize", fitGrid);
  new MutationObserver(fitGrid).observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
