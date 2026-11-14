// Scramble: the letters of a player's name are mixed up; tap them in the right order.
// One file for both languages: <html lang="ka"> = Georgian. Names come from scramble-names.js.
(function () {
  const root = document.getElementById("scramble");
  const ALL = window.SCRAMBLE_NAMES || [];
  if (!root || !ALL.length) return;
  const KA = document.documentElement.lang === "ka";
  const ROUND = 10; // names per round
  const HOME = KA ? "../" : "../"; // ka/scramble/ → ka/ ; scramble/ → home

  const T = KA ? {
    back: "← სხვა თამაშები", title: "გვარების დალაგობანა",
    intro: "დაალაგე ცნობილი ფეხბურთელების გვარები. აირჩიე ასოები სწორი თანმიმდევრობით.",
    progress: (i, n) => `${i} / ${n}`, score: (s) => `სწორი პასუხები: ${s}`,
    hint: "ასოს ჩვენება", clear: "წაშლა", skip: "გამოტოვება",
    endTitle: "გილოცავ! 🏆", endTitleLow: "შედეგი",
    endText: (s, n) => `${n}-დან ${s} გვარი გამოიცანი!`,
    perfect: "⭐ დახმარების გამოყენების გარეშე!", help: (h) => `დახმარებით ნახე ${h} ასო.`,
    share: "შედეგის გაზიარება", again: "თავიდან თამაში", crosswords: "ითამაშე კროსვორდი",
    shareText: (s, n, h) => `⚽ გვარების დალაგობანა\n✅ ${s}/${n} · ${h ? h + " ასო ნაჩვენები" : "დახმარების გარეშე"}`,
    copied: "დაკოპირდა! ჩასვი სადაც გინდა.",
  } : {
    back: "← All games", title: "Name <em>Scramble</em>",
    intro: "The letters of a famous player's name are mixed up. Tap them in the right order.",
    progress: (i, n) => `${i} of ${n}`, score: (s) => `Correct: ${s}`,
    hint: "Show letter", clear: "Delete", skip: "Skip",
    endTitle: "You did it! 🏆", endTitleLow: "Your result",
    endText: (s, n) => `You got ${s} of ${n} names!`,
    perfect: "⭐ With no help!", help: (h) => `You used ${h} letter hint${h === 1 ? "" : "s"}.`,
    share: "Share my result", again: "Play again", crosswords: "Play a crossword",
    shareText: (s, n, h) => `⚽ Name Scramble\n✅ ${s}/${n} · ${h ? h + " letter hint" + (h === 1 ? "" : "s") : "no help"}`,
    copied: "Copied! Paste it anywhere to share.",
  };

  root.innerHTML = `
    <main class="narrow">
      <a class="back" href="${HOME}">${T.back}</a>
      <h1>${T.title}</h1>
      <p class="intro">${T.intro}</p>
      <div class="sc-game" id="scGame">
        <div class="meta"><div class="count" id="scProgress"></div><div class="count" id="scScore"></div></div>
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
        <p class="share-note" id="scNote" hidden></p>
        <button id="scAgain" type="button">${T.again}</button>
        <a class="sc-link" href="${HOME}">${T.crosswords}</a>
      </div>
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

  function newRound() {
    names = shuffle(ALL).slice(0, ROUND).map((n) => (KA ? n.ka : n.en));
    index = 0; score = 0; hints = 0;
    $("scEnd").hidden = true; $("scGame").hidden = false;
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
  }

  function place(tile) {
    if (busy || tile.slot >= 0) return;
    const i = slots.indexOf(null);
    if (i < 0) return;
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
    busy = true;
    const s = $("scSlots");
    s.innerHTML = "";
    [...word].forEach((letter) => { const b = document.createElement("span"); b.className = "sc-slot filled"; b.textContent = letter; s.appendChild(b); });
    s.classList.add("shown");
    setTimeout(() => { index++; nextWord(); }, 1400);
  }

  function finish() {
    $("scGame").hidden = true; $("scEnd").hidden = false;
    $("scEndTitle").textContent = score === names.length ? T.endTitle : T.endTitleLow;
    $("scEndText").textContent = T.endText(score, names.length);
    $("scPerfect").hidden = !(score === names.length && hints === 0);
    $("scHelp").hidden = hints === 0;
    $("scHelp").textContent = hints ? T.help(hints) : "";
  }

  // Phones: opens the share menu. Computers: copies the text.
  async function share() {
    const url = location.origin + location.pathname + "?utm_source=share&utm_medium=social&utm_campaign=scramble";
    const full = T.shareText(score, names.length, hints) + "\n" + url;
    const note = $("scNote");
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
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
