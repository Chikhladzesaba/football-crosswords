// Top 5: one game = 3 lists in a row. A list is shown with empty places. Type names: a right name fills its place, a wrong one costs a life.
// Finish a list and the next one starts. Finish all 3 and you win. Lose a list (out of lives, or give up) and the game is over.
// Lists are in top5-lists.js (English) or top5-lists-ka.js (Georgian). Test version.
// All words the player sees are in the TEXT block below. A language file can replace any of them with window.TOP5_TEXT.
(function () {
  const root = document.getElementById("top5");
  const LISTS = window.TOP5_LISTS || [];
  if (!root || !LISTS.length) return;

  const plural = (n) => (n === 1 ? "" : "s");
  const TEXT = Object.assign({
    backHref: "../", back: "← All games",
    h1: "Guess the <em>Top 5</em>",
    intro: "Name the players or clubs in the Top 5. Complete 3 lists in a row to win.",
    kicker: (r, total, n) => `Round ${r} of ${total} · Top ${n}`,
    asOf: (d) => `Numbers as of ${d}`,
    found: (f, t) => `${f} of ${t} found`,
    lives: "Lives", ariaRound: "Round", ariaLives: "Lives", ariaGuess: "Your guess",
    placeholder: "Type a name", guess: "Guess", hint: "Show first letter", give: "Give up",
    rulesTitle: "How to play",
    rules: [
      "One game is 3 lists in a row. Finish a list and the next one starts. Finish all 3 and you win.",
      "You see a list, for example the top scorers in a competition. The names are hidden.",
      "Type a name and press Guess. If it is in the list, it jumps into its place and shows its number. You can guess in any order.",
      "A wrong name costs a life. You get 3 lives for each list. Out of lives, or giving up, ends the game.",
      "Stuck? “Show first letter” gives the first letter of the highest hidden name. It counts as help in your final result.",
      "Surnames are fine. Small typing mistakes and accents do not matter.",
    ],
    vague: "Too vague. Be more specific.",
    already: (name) => `${name} is already in.`,
    yes: (name, rank) => `Yes! ${name} is number ${rank}.`,
    notIn: (n) => `Not in the Top ${n}.`,
    hintMsg: (letter) => `The highest hidden name starts with “${letter}”.`,
    source: "Source",
    listDone: (n) => `List ${n} done! 🎉 Next list coming up…`,
    gaveUp: "Here are the answers.", outOfLives: "Out of lives. Here are the answers.",
    wonTitle: (total) => `You won! ${total} tops in a row 🏆`, lostTitle: "Game over",
    hintsUsed: (h) => `You used ${h} letter hint${plural(h)}.`,
    lostText: (done, total) => `You completed ${done} of ${total} lists.`,
    perfect: "⭐ With no help!",
    share: "Share my result", again: "Play again", seeLast: "See the last list", seeAnswers: "See the answers",
    copied: "Copied! Paste it anywhere to share.",
    shareTitle: "⚽ Guess the Top 5",
    shareScore: (won, done, total, help) => `${won ? "🏆" : "✅"} ${done}/${total} tops in a row · ${help}`,
    shareHelp: (h) => (h ? `${h} letter hint${plural(h)}` : "no help"),
  }, window.TOP5_TEXT || {});
  const LIVES = 3;
  const ROUNDS = Math.min(3, LISTS.length);
  const NEXT_DELAY = 2200; // ms to look at a finished list before the next one starts

  root.innerHTML = `
    <main class="narrow">
      <div class="page-head"><div class="ph-text"><h1>${TEXT.h1}</h1><p class="intro">${TEXT.intro}</p></div><span class="pill" data-pill id="t5Kicker"></span></div>
      <div class="t5-game" id="t5Game">
        <div class="t5-card">
          <div class="t5-pips" id="t5Pips" aria-label="${TEXT.ariaRound}"></div>
          <div class="t5-cardhead"><h2 class="t5-title" id="t5Title"></h2><div class="count" id="t5Count"></div></div>
          <p class="t5-asof" id="t5AsOf"></p>
          <ol class="t5-board" id="t5Board"></ol>
        </div>
        <div class="t5-side">
        <div class="t5-lives" id="t5Lives" aria-label="${TEXT.ariaLives}"></div>
        <p class="t5-note" id="t5Note" hidden></p>
        <form class="t5-form" id="t5Form" autocomplete="off">
          <input class="t5-input" id="t5Input" type="text" placeholder="${TEXT.placeholder}" enterkeyhint="go" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="${TEXT.ariaGuess}">
          <button class="primary" type="submit">${TEXT.guess}</button>
        </form>
        <p class="t5-msg" id="t5Msg" aria-live="polite"></p>
        <div class="actions">
          <button id="t5Hint" type="button">${TEXT.hint}</button>
          <button id="t5Give" type="button">${TEXT.give}</button>
        </div>
        </div>
      </div>
      <details class="t5-rules">
        <summary>${TEXT.rulesTitle}</summary>
        <ul>${TEXT.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
      </details>
    </main>
    <div class="t5-modal" id="t5Modal" hidden>
      <div class="t5-modal-card" role="dialog" aria-modal="true" aria-labelledby="t5ModalTitle">
        <h2 id="t5ModalTitle"></h2>
        <p id="t5ModalText"></p>
        <p class="win-perfect" id="t5Perfect" hidden>${TEXT.perfect}</p>
        <button class="primary" id="t5Share" type="button">${TEXT.share}</button>
        <p class="share-note" id="t5ShareNote" hidden></p>
        <button id="t5Again" type="button">${TEXT.again}</button>
        <button class="t5-link" id="t5See" type="button">${TEXT.seeAnswers}</button>
      </div>
    </div>`;
  const $ = (id) => document.getElementById(id);

  // ---- Helpers ----
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ა-ჰ]/g, "");
  function dist(a, b) { // number of small edits between two words (a swapped pair of letters counts as one)
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    for (let i = 2; i <= a.length; i++) for (let j = 2; j <= b.length; j++) if (a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // two neighbouring letters swapped
    return d[a.length][b.length];
  }

  // Some lists have a tie: two names can share the same place (rank: 5). The "Top N" is the highest place.
  const rankOf = (i) => list.items[i].rank || i + 1;
  const topN = () => Math.max(...list.items.map((_, i) => rankOf(i)));

  // ---- State ----
  let run = [], round = 0, list, found, lives, hints = 0, over, done = 0, timer;
  const wanted = new URLSearchParams(location.search).get("list"); // ?list=laliga-scorers opens one list (for testing)

  // A new game: pick 3 different lists at random (?list=id puts that list first)
  function newRun() {
    clearTimeout(timer);
    let idx = shuffle(LISTS.map((_, i) => i));
    const w = LISTS.findIndex((l) => l.id === wanted);
    if (w >= 0) idx = [w, ...idx.filter((i) => i !== w)];
    run = idx.slice(0, ROUNDS); round = 0; hints = 0; done = 0;
    $("t5Modal").hidden = true;
    start(LISTS[run[0]]);
  }

  function start(l) {
    list = l; list.items.forEach((it) => (it.hint = "")); found = list.items.map(() => false); lives = LIVES; over = false;
    $("t5Game").hidden = false;
    $("t5Kicker").textContent = TEXT.kicker(round + 1, ROUNDS, topN());
    drawPips();
    $("t5Title").textContent = list.title;
    $("t5AsOf").textContent = TEXT.asOf(list.asOf);
    $("t5Note").hidden = true;
    $("t5Msg").textContent = ""; $("t5Msg").className = "t5-msg";
    $("t5Input").value = ""; $("t5Input").disabled = false;
    $("t5Hint").disabled = false; $("t5Give").disabled = false;
    drawBoard(); drawLives();
    if (matchMedia("(pointer: fine)").matches) $("t5Input").focus();
  }

  function drawPips() {
    const box = $("t5Pips"); box.innerHTML = "";
    for (let i = 0; i < ROUNDS; i++) {
      const p = document.createElement("span");
      p.className = "t5-pip" + (i < done ? " done" : i === round ? " now" : "");
      box.appendChild(p);
    }
  }

  function drawBoard(reveal) {
    const b = $("t5Board"); b.innerHTML = "";
    list.items.forEach((it, i) => {
      const li = document.createElement("li");
      li.className = "t5-row" + (found[i] ? " found" : reveal ? " missed" : "");
      const show = found[i] || reveal;
      li.innerHTML = `<span class="t5-rank">${rankOf(i)}</span><span class="t5-name"></span><span class="t5-val"></span>`;
      const nm = li.querySelector(".t5-name");
      if (show) nm.textContent = it.name;
      else if (it.hint) nm.textContent = it.hint;
      else nm.classList.add("t5-blank");
      li.querySelector(".t5-val").textContent = show ? `${it.value} ${list.unit}` : "";
      b.appendChild(li);
    });
    $("t5Count").textContent = TEXT.found(found.filter(Boolean).length, list.items.length);
  }
  function drawLives() {
    const box = $("t5Lives"); box.innerHTML = `<span>${TEXT.lives}</span><span class="t5-dots"></span>`;
    const dots = box.querySelector(".t5-dots");
    for (let i = 0; i < LIVES; i++) { const d = document.createElement("span"); d.className = "t5-dot" + (i >= lives ? " lost" : ""); dots.appendChild(d); }
  }
  function say(text, kind) { const m = $("t5Msg"); m.textContent = text; m.className = "t5-msg" + (kind ? " " + kind : ""); }

  // Which place does this guess belong to? -1 = nobody, -2 = too vague, index = place
  function match(raw) {
    const g = norm(raw);
    if (!g) return -3;
    if ((list.ambiguous || []).some((w) => norm(w) === g)) return -2;
    let best = -1;
    list.items.forEach((it, i) => {
      const base = [it.name, ...(it.alt || [])].map(norm).filter(Boolean);
      const names = base.concat(base.filter((n) => /[ა-ჰ]{4,}ი$/.test(n)).map((n) => n.slice(0, -1))); // Georgian names end in -ი: "კეინ" counts as "კეინი"
      const ok = names.some((n) => n === g || (g.length >= 6 && n.length >= 6 && dist(g, n) <= 1));
      if (ok && best < 0) best = i;
    });
    return best;
  }

  function guess(e) {
    e.preventDefault();
    if (over) return;
    const raw = $("t5Input").value;
    const i = match(raw);
    if (i === -3) return;
    $("t5Input").value = "";
    if (i === -2) return say(TEXT.vague);
    if (i >= 0) {
      if (found[i]) return say(TEXT.already(list.items[i].name));
      found[i] = true; list.items[i].hint = "";
      drawBoard(); say(TEXT.yes(list.items[i].name, rankOf(i)), "good");
      if (found.every(Boolean)) finish(true);
      return;
    }
    lives--; drawLives(); say(TEXT.notIn(topN()), "bad");
    const g = $("t5Game"); g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
    if (lives <= 0) finish(false);
  }

  function hint() {
    if (over) return;
    const i = found.findIndex((f) => !f);
    if (i < 0) return;
    const n = list.items[i];
    if (!n.hint) { n.hint = n.name[0] + " …"; hints++; drawBoard(); }
    say(TEXT.hintMsg(n.name[0]));
  }

  function showNote() {
    $("t5Note").innerHTML = (list.note ? list.note + " " : "") + (list.source ? `<a href="${list.source}" target="_blank" rel="noopener">${TEXT.source}</a>` : "");
    $("t5Note").hidden = false;
  }

  // End of one list. Won: next list starts by itself (or the game is won after the last one). Lost: the game is over.
  function finish(won, gaveUp) {
    over = true;
    $("t5Input").disabled = true; $("t5Hint").disabled = true; $("t5Give").disabled = true;
    drawBoard(true); showNote();
    if (won) {
      done = round + 1; drawPips();
      if (round + 1 < ROUNDS) {
        say(TEXT.listDone(round + 1), "good");
        timer = setTimeout(() => { round++; start(LISTS[run[round]]); }, NEXT_DELAY);
      } else {
        timer = setTimeout(() => modal(true), 900);
      }
    } else {
      say(gaveUp ? TEXT.gaveUp : TEXT.outOfLives, "bad");
      timer = setTimeout(() => modal(false), 700);
    }
  }

  function modal(won) {
    $("t5ModalTitle").textContent = won ? TEXT.wonTitle(ROUNDS) : TEXT.lostTitle;
    $("t5ModalText").textContent = won
      ? (hints ? TEXT.hintsUsed(hints) : "")
      : TEXT.lostText(done, ROUNDS) + (hints ? " " + TEXT.hintsUsed(hints) : "");
    $("t5Perfect").hidden = !(won && hints === 0);
    $("t5See").textContent = won ? TEXT.seeLast : TEXT.seeAnswers;
    $("t5ShareNote").hidden = true;
    $("t5Modal").hidden = false;
    $("t5Again").focus();
  }

  async function share() {
    const won = done === ROUNDS;
    const url = location.origin + location.pathname + "?utm_source=share&utm_medium=social&utm_campaign=top5";
    const full = `${TEXT.shareTitle}\n${TEXT.shareScore(won, done, ROUNDS, TEXT.shareHelp(hints))}\n${url}`;
    const note = $("t5ShareNote");
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(full); note.textContent = TEXT.copied; } catch (e) { note.textContent = full; }
    note.hidden = false;
    clearTimeout(note._t); note._t = setTimeout(() => (note.hidden = true), 4000);
  }

  $("t5Form").addEventListener("submit", guess);
  $("t5Hint").addEventListener("click", hint);
  $("t5Give").addEventListener("click", () => { if (!over) finish(false, true); });
  $("t5Share").addEventListener("click", share);
  $("t5Again").addEventListener("click", newRun);
  $("t5See").addEventListener("click", () => { $("t5Modal").hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("t5Modal").hidden = true; });

  newRun();
})();
