// Top 5: one game = 3 lists in a row. A list is shown with empty places. Type names: a right name fills its place, a wrong one costs a life.
// Finish a list and the next one starts. Finish all 3 and you win. Lose a list (out of lives, or give up) and the game is over.
// Lists are in top5-lists.js. Test version, English only.
(function () {
  const root = document.getElementById("top5");
  const LISTS = window.TOP5_LISTS || [];
  if (!root || !LISTS.length) return;
  const LIVES = 3;
  const ROUNDS = Math.min(3, LISTS.length);
  const NEXT_DELAY = 2200; // ms to look at a finished list before the next one starts

  root.innerHTML = `
    <main class="narrow">
      <a class="back" href="../">← All games</a>
      <h1>Guess the <em>Top 5</em></h1>
      <p class="intro">Name the players or clubs in the Top 5. Complete 3 lists in a row to win.</p>
      <div class="t5-game" id="t5Game">
        <div class="t5-head">
          <div class="t5-pips" id="t5Pips" aria-label="Round"></div>
          <p class="t5-kicker" id="t5Kicker"></p>
          <h2 class="t5-title" id="t5Title"></h2>
          <p class="t5-asof" id="t5AsOf"></p>
        </div>
        <div class="meta"><div class="t5-lives" id="t5Lives" aria-label="Lives"></div><div class="count" id="t5Count"></div></div>
        <ol class="t5-board" id="t5Board"></ol>
        <p class="t5-note" id="t5Note" hidden></p>
        <form class="t5-form" id="t5Form" autocomplete="off">
          <input class="t5-input" id="t5Input" type="text" placeholder="Type a name" enterkeyhint="go" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Your guess">
          <button class="primary" type="submit">Guess</button>
        </form>
        <p class="t5-msg" id="t5Msg" aria-live="polite"></p>
        <div class="actions">
          <button id="t5Hint" type="button">Show first letter</button>
          <button id="t5Give" type="button">Give up</button>
        </div>
      </div>
      <details class="t5-rules">
        <summary>How to play</summary>
        <ul>
          <li>One game is 3 lists in a row. Finish a list and the next one starts. Finish all 3 and you win.</li>
          <li>You see a list, for example the top scorers in a competition. The names are hidden.</li>
          <li>Type a name and press Guess. If it is in the list, it jumps into its place and shows its number. You can guess in any order.</li>
          <li>A wrong name costs a life. You get 3 lives for each list. Out of lives, or giving up, ends the game.</li>
          <li>Stuck? “Show first letter” gives the first letter of the highest hidden name. It counts as help in your final result.</li>
          <li>Surnames are fine. Small typing mistakes and accents do not matter.</li>
        </ul>
      </details>
    </main>
    <div class="t5-modal" id="t5Modal" hidden>
      <div class="t5-modal-card" role="dialog" aria-modal="true" aria-labelledby="t5ModalTitle">
        <h2 id="t5ModalTitle"></h2>
        <p id="t5ModalText"></p>
        <p class="win-perfect" id="t5Perfect" hidden>⭐ With no help!</p>
        <button class="primary" id="t5Share" type="button">Share my result</button>
        <p class="share-note" id="t5ShareNote" hidden></p>
        <button id="t5Again" type="button">Play again</button>
        <button class="t5-link" id="t5See" type="button">See the answers</button>
      </div>
    </div>`;
  const $ = (id) => document.getElementById(id);

  // ---- Helpers ----
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
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
    $("t5Kicker").textContent = `Round ${round + 1} of ${ROUNDS} · Top ${topN()}`;
    drawPips();
    $("t5Title").textContent = list.title;
    $("t5AsOf").textContent = `Numbers as of ${list.asOf}`;
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
    $("t5Count").textContent = `${found.filter(Boolean).length} of ${list.items.length} found`;
  }
  function drawLives() {
    const box = $("t5Lives"); box.innerHTML = "Lives ";
    for (let i = 0; i < LIVES; i++) { const d = document.createElement("span"); d.className = "t5-dot" + (i >= lives ? " lost" : ""); box.appendChild(d); }
  }
  function say(text, kind) { const m = $("t5Msg"); m.textContent = text; m.className = "t5-msg" + (kind ? " " + kind : ""); }

  // Which place does this guess belong to? -1 = nobody, -2 = too vague, index = place
  function match(raw) {
    const g = norm(raw);
    if (!g) return -3;
    if ((list.ambiguous || []).some((w) => norm(w) === g)) return -2;
    let best = -1;
    list.items.forEach((it, i) => {
      const names = [it.name, ...(it.alt || [])].map(norm).filter(Boolean);
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
    if (i === -2) return say("Too vague. Be more specific.");
    if (i >= 0) {
      if (found[i]) return say(`${list.items[i].name} is already in.`);
      found[i] = true; list.items[i].hint = "";
      drawBoard(); say(`Yes! ${list.items[i].name} is number ${rankOf(i)}.`, "good");
      if (found.every(Boolean)) finish(true);
      return;
    }
    lives--; drawLives(); say("Not in the Top " + topN() + ".", "bad");
    const g = $("t5Game"); g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
    if (lives <= 0) finish(false);
  }

  function hint() {
    if (over) return;
    const i = found.findIndex((f) => !f);
    if (i < 0) return;
    const n = list.items[i];
    if (!n.hint) { n.hint = n.name[0] + " …"; hints++; drawBoard(); }
    say(`The highest hidden name starts with “${n.name[0]}”.`);
  }

  function showNote() {
    $("t5Note").innerHTML = (list.note ? list.note + " " : "") + (list.source ? `<a href="${list.source}" target="_blank" rel="noopener">Source</a>` : "");
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
        say(`List ${round + 1} done! 🎉 Next list coming up…`, "good");
        timer = setTimeout(() => { round++; start(LISTS[run[round]]); }, NEXT_DELAY);
      } else {
        timer = setTimeout(() => modal(true), 900);
      }
    } else {
      say(gaveUp ? "Here are the answers." : "Out of lives. Here are the answers.", "bad");
      timer = setTimeout(() => modal(false), 700);
    }
  }

  function modal(won) {
    $("t5ModalTitle").textContent = won ? `You won! ${ROUNDS} tops in a row 🏆` : "Game over";
    $("t5ModalText").textContent = won
      ? (hints ? `You used ${hints} letter hint${hints === 1 ? "" : "s"}.` : "")
      : `You completed ${done} of ${ROUNDS} lists.` + (hints ? ` You used ${hints} letter hint${hints === 1 ? "" : "s"}.` : "");
    $("t5Perfect").hidden = !(won && hints === 0);
    $("t5See").textContent = won ? "See the last list" : "See the answers";
    $("t5ShareNote").hidden = true;
    $("t5Modal").hidden = false;
    $("t5Again").focus();
  }

  async function share() {
    const won = done === ROUNDS;
    const url = location.origin + location.pathname + "?utm_source=share&utm_medium=social&utm_campaign=top5";
    const help = hints ? `${hints} letter hint${hints === 1 ? "" : "s"}` : "no help";
    const full = `⚽ Guess the Top 5\n${won ? "🏆" : "✅"} ${done}/${ROUNDS} tops in a row · ${help}\n${url}`;
    const note = $("t5ShareNote");
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text: full }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(full); note.textContent = "Copied! Paste it anywhere to share."; } catch (e) { note.textContent = full; }
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
