// Scramble: the letters of a player's name are mixed up; tap them in the right order.
// One file for both languages: <html lang="ka"> = Georgian. Names come from scramble-names.js.
(function () {
  const root = document.getElementById("scramble");
  const ALL = window.SCRAMBLE_NAMES || [];
  if (!root || !ALL.length) return;
  const KA = document.documentElement.lang === "ka";
  const ROUND = 10; // names per round
  const LENGTHS = [0, 5, 6, 7]; // minimum name length (0 = all). No 4+: it holds almost every name, so it was the same as "All"
  const HOME = KA ? "../ka/crosswords/" : "../crosswords/"; // gamoicani-pekhburtelebis-gvarebi/ → ka/ (Georgian home) ; scramble/ → home

  const T = KA ? {
    back: "← სხვა თამაშები", title: "დალაგობანა",
    intro: "დაალაგე ცნობილი ფეხბურთელების გვარები. აირჩიე ასოები სწორი თანმიმდევრობით.",
    lenAll: "ყველა", lenN: (n) => `${n}+ ასო`, lenLabel: "გვარის მინიმალური სიგრძე",
    progress: (i, n) => `${i} / ${n}`, score: (s) => `სწორი პასუხები: ${s}`,
    hint: "ასოს ჩვენება", clear: "წაშლა", skip: "გამოტოვება",
    endTitle: "გილოცავ! 🏆", endTitleMid: "კარგი შედეგია!", endTitleLow: "ამჯერად არ გამოგივიდა",
    endText: (s, n) => (s === n ? `${n}-ვე გვარი გამოიცანი!` : `${n} გვარიდან ${s} გამოიცანი.`),
    perfect: "⭐ დახმარების გამოყენების გარეშე!", help: (h) => `ასოს ჩვენება ${h}-ჯერ გამოიყენე.`,
    share: "გააზიარე", againWon: "ახალი თამაში", againLost: "კიდევ სცადე", crosswords: "საფეხბურთო კროსვორდი",
    shareText: (s, n, h) => `⚽ დალაგობანა\n✅ ${s}/${n} · ${h ? h + " ასო ნაჩვენები" : "დახმარების გარეშე"}`,
    copied: "დაკოპირდა! ჩასვი სადაც გინდა.",
    rulesTitle: "თამაშის წესები",
    rules: ["დაწყებამდე შეგიძლია აირჩიო გვარის მინიმალური სიგრძე, მოქმედი ან კარიერადასრულებული ფეხბურთელები და რაუნდის სიგრძე. გვარები ყოველ ჯერზე შემთხვევით ირჩევა. ასოები არეულია: დაალაგე ისინი სწორი თანმიმდევრობით და გამოიცანი ფეხბურთელი.", "შეცდი? „წაშლა“ ბოლო ასოს წაშლის. ჩასმულ ასოზე დაკლიკებითაც შეგიძლია მისი დაბრუნება.", "ვერ იხსენებ? „ასოს ჩვენება“ ერთ ასოს გაჩვენებს, „გამოტოვება“ კი შემდეგ გვარზე გადაგიყვანს.", "რაუნდის ბოლოს შენს შედეგს ნახავ. თუ მოგწონა თამაში, შეგიძლია შენი სტატისტიკა მეგობრებსაც გაუზიარო."],
  } : {
    back: "← All games", title: "Name <em>Scramble</em>",
    intro: "The letters of a famous player's name are mixed up. Tap them in the right order.",
    lenAll: "All", lenN: (n) => `${n}+`, lenLabel: "Minimum name length",
    progress: (i, n) => `${i} of ${n}`, score: (s) => `Correct: ${s}`,
    hint: "Show letter", clear: "Delete", skip: "Skip",
    endTitle: "You did it! 🏆", endTitleMid: "Nice result!", endTitleLow: "Not this time",
    endText: (s, n) => (s === n ? `You got all ${n} names!` : `You got ${s} of ${n} names.`),
    perfect: "⭐ With no help!", help: (h) => `You used ${h} letter hint${h === 1 ? "" : "s"}.`,
    share: "Share", againWon: "New game", againLost: "Try again", crosswords: "Football crosswords",
    shareText: (s, n, h) => `⚽ Name Scramble\n✅ ${s}/${n} · ${h ? h + " letter hint" + (h === 1 ? "" : "s") : "no help"}`,
    copied: "Copied! Paste it anywhere to share.",
    rulesTitle: "How to play",
    rules: ["Before you start, choose the minimum name length, active or retired players, and the round length. Names are picked at random every time. The letters are mixed up: put them in the right order to guess the player.", "Made a mistake? “Delete” removes the last letter. You can also tap a placed letter to take it back.", "Stuck? “Show letter” reveals one letter, and “Skip” moves on to the next name.", "At the end of the round you see your result and can share it with friends."],
  };

  root.innerHTML = `
    <main class="narrow">
      <div class="page-head"><div class="ph-text"><h1>${T.title}</h1><p class="intro">${T.intro}</p></div><span class="pill" data-pill id="scProgress"></span></div>
      <div class="sc-filter"><div class="sc-label">${T.lenLabel}</div><div class="sc-chips" id="scLen"></div></div>
      <div class="sc-game" id="scGame">
        <div class="meta"><div class="count" id="scScore"></div></div>
        <div class="sc-row sc-slots" id="scSlots" aria-label="Answer"></div>
        <div class="sc-row sc-tiles" id="scTiles" aria-label="Letters"></div>
        <div class="actions">
          <button id="scHint" type="button">${T.hint}</button>
          <button id="scClear" type="button">${T.clear}</button>
          <button id="scSkip" type="button">${T.skip}</button>
        </div>
      </div>
      <div class="sc-end" id="scEnd" hidden>
        <h2 id="scEndTitle"></h2>
        <p id="scEndText"></p>
        <p class="win-perfect" id="scPerfect" hidden>${T.perfect}</p>
        <p id="scHelp" hidden></p>
        <button class="primary" id="scShare" type="button">${T.share}</button>
        <button id="scAgain" type="button"></button>
        <p class="share-note" id="scNote" hidden></p>
        <a class="sc-link" href="${HOME}">${T.crosswords}</a>
      </div>
      <details class="sc-rules">
        <summary>${T.rulesTitle}</summary>
        <ul>${T.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
      </details>
    </main>`;
  const $ = (id) => document.getElementById(id);

  // ---- Helpers ----
  function shuffle(a) { // Fisher–Yates: every order is equally likely
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function mix(word) { // mixed letters, never in the original order
    const letters = [...word];
    for (let t = 0; t < 30; t++) { const m = shuffle(letters); if (m.join("") !== word) return m; }
    return letters.reverse();
  }

  // ---- State ----
  let names, index, score, hints, word, slots, tiles, busy;
  // ---- ANALYTICS (Google Analytics events; see consent.js) ----
  // Every event carries: which game, which puzzle, which language. "began" makes game_start fire once per game, on the player's first real action.
  const track = (name, extra) => { if (window.kpTrack) kpTrack(name, Object.assign({ game: "scramble", puzzle_id: "random", language: document.documentElement.lang === "ka" ? "ka" : "en" }, extra)); };
  let began = false;
  const begin = () => { if (!began) { began = true; track("game_start"); } };

  // ---- Filter: minimum name length (chips above the game). Choosing one starts a new round. ----
  let minLen = 0;
  const word_of = (n) => (KA ? n.ka : n.en);
  function drawFilter() {
    const box = $("scLen"); box.innerHTML = "";
    LENGTHS.forEach((n) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "sc-chip" + (minLen === n ? " on" : ""); b.textContent = n ? T.lenN(n) : T.lenAll;
      b.setAttribute("aria-pressed", minLen === n);
      b.addEventListener("click", () => { if (minLen === n) return; minLen = n; newRound(); });
      box.appendChild(b);
    });
  }

  function newRound() {
    const pool = ALL.filter((n) => [...word_of(n)].length >= minLen);
    names = shuffle(pool).slice(0, ROUND).map(word_of);
    index = 0; score = 0; hints = 0; began = false;
    $("scEnd").hidden = true; $("scGame").hidden = false;
    drawFilter();
    nextWord();
  }

  function nextWord() {
    if (index >= names.length) return finish();
    word = names[index]; busy = false;
    // slots[i] = tile placed there (or null); tiles = [{ letter, el, slot, locked }]
    slots = [...word].map(() => null);
    tiles = mix(word).map((letter) => ({ letter, slot: -1, locked: false }));
    draw();
  }

  function draw() {
    $("scProgress").textContent = T.progress(index + 1, names.length);
    $("scScore").textContent = T.score(score);
    const s = $("scSlots"), t = $("scTiles");
    s.innerHTML = ""; t.innerHTML = "";
    s.className = "sc-row sc-slots";
    slots.forEach((tile, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "sc-slot" + (tile ? " filled" : "") + (tile && tile.locked ? " locked" : "");
      b.textContent = tile ? tile.letter : "";
      b.addEventListener("click", () => takeBack(i));
      s.appendChild(b);
    });
    tiles.forEach((tile) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "sc-tile"; b.textContent = tile.letter;
      if (tile.slot >= 0) { b.disabled = true; b.classList.add("used"); }
      b.addEventListener("click", () => place(tile));
      t.appendChild(b);
    });
    const size = Math.min(Math.max(slots.length, 6), 8); // long names wrap onto two rows instead of shrinking
    root.style.setProperty("--sc-n", size);
    root.style.setProperty("--sc-nd", Math.min(Math.max(slots.length, 6), 12)); // computer: every letter on one row
  }

  function place(tile) {
    if (busy || tile.slot >= 0) return;
    const i = slots.indexOf(null);
    if (i < 0) return;
    begin();
    slots[i] = tile; tile.slot = i;
    draw(); check();
  }
  function takeBack(i) {
    const tile = slots[i];
    if (busy || !tile || tile.locked) return;
    slots[i] = null; tile.slot = -1;
    draw();
  }
  function deleteLast() { // the Delete button: take back only the last letter you placed
    if (busy) return;
    for (let i = slots.length - 1; i >= 0; i--) if (slots[i] && !slots[i].locked) { takeBack(i); break; }
  }
  function clearAll() {
    if (busy) return;
    slots.forEach((tile, i) => { if (tile && !tile.locked) { slots[i] = null; tile.slot = -1; } });
    draw();
  }

  function check() {
    if (slots.includes(null)) return;
    busy = true;
    const right = slots.map((t) => t.letter).join("") === word;
    $("scSlots").classList.add(right ? "right" : "wrong");
    if (right) { score++; $("scScore").textContent = T.score(score); setTimeout(() => { index++; nextWord(); }, 900); }
    else setTimeout(() => { busy = false; clearAll(); }, 800);
  }

  // Show letter: puts the right letter into the first square that isn't right yet, and fixes it there
  function hint() {
    if (busy) return;
    const i = slots.findIndex((t, k) => !t || (!t.locked && t.letter !== word[k]));
    const k = i >= 0 ? i : slots.findIndex((t) => !t.locked);
    if (k < 0) return;
    begin();
    if (slots[k]) { slots[k].slot = -1; slots[k] = null; }
    const letter = [...word][k];
    let tile = tiles.find((t) => t.letter === letter && t.slot < 0);
    if (!tile) { // the letter we need sits in another square: free it first
      tile = tiles.find((t) => t.letter === letter && !t.locked && [...word][t.slot] !== letter);
      if (!tile) return;
      slots[tile.slot] = null;
    }
    slots[k] = tile; tile.slot = k; tile.locked = true;
    hints++;
    draw(); check();
  }

  function skip() {
    if (busy) return;
    begin();
    busy = true;
    const s = $("scSlots");
    s.innerHTML = "";
    [...word].forEach((letter) => { const b = document.createElement("span"); b.className = "sc-slot filled"; b.textContent = letter; s.appendChild(b); });
    s.classList.add("shown");
    setTimeout(() => { index++; nextWord(); }, 1400);
  }

  function finish() {
    $("scGame").hidden = true; $("scEnd").hidden = false;
    const all = score === names.length;
    track("game_complete", { score, total: names.length, hints_used: hints, no_help: hints === 0 });
    $("scEndTitle").textContent = all ? T.endTitle : score * 2 >= names.length ? T.endTitleMid : T.endTitleLow;
    // All correct: Share is the main button. Otherwise "Try again" is the main button and Share comes second.
    const share = $("scShare"), again = $("scAgain");
    again.textContent = all ? T.againWon : T.againLost;
    share.className = all ? "primary" : ""; again.className = all ? "" : "primary";
    share.style.order = all ? 1 : 2; again.style.order = all ? 2 : 1;
    $("scEndText").textContent = T.endText(score, names.length);
    $("scPerfect").hidden = !(score === names.length && hints === 0);
    $("scHelp").hidden = hints === 0;
    $("scHelp").textContent = hints ? T.help(hints) : "";
  }

  // Phones: opens the share menu. Computers: copies the text.
  async function share() {
    track("share", { method: "result" });
    const url = location.origin + location.pathname + "?utm_source=share&utm_medium=social&utm_campaign=scramble";
    const text = T.shareText(score, names.length, hints);
    const full = text + "\n" + url;
    const note = $("scNote");
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    if (window.KPShare) { KPShare.open({ anchor: $("scShare"), text, url, note }); return; } // computers: WhatsApp / Facebook / X / Copy
    try { await navigator.clipboard.writeText(full); note.textContent = T.copied; } catch (e) { note.textContent = full; }
    note.hidden = false;
    clearTimeout(note._t); note._t = setTimeout(() => (note.hidden = true), 4000);
  }

  $("scHint").addEventListener("click", hint);
  $("scClear").addEventListener("click", deleteLast);
  $("scSkip").addEventListener("click", skip);
  $("scAgain").addEventListener("click", newRound);
  $("scShare").addEventListener("click", share);

  // Computer keyboard: type a letter to pick it, Backspace to take the last one back
  addEventListener("keydown", (e) => {
    if ($("scGame").hidden || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      for (let i = slots.length - 1; i >= 0; i--) if (slots[i] && !slots[i].locked) { takeBack(i); break; }
      return;
    }
    const k = /^[a-z]$/i.test(e.key) ? e.key.toUpperCase() : e.key;
    const tile = tiles.find((t) => t.letter === k && t.slot < 0);
    if (tile) place(tile);
  });

  newRound();
})();
