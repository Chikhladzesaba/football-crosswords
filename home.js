// Home page: draws one card per crossword from crosswords.js, plus the Difficulty and Topic filters.
// You never need to edit this file to add a crossword — only crosswords.js.
(function () {
  // English home page: only English crosswords (Georgian ones have lang: "ka")
  const list = (window.CROSSWORDS || []).filter((c) => (c.lang || "en") === "en");
  const LEVELS = ["Easy", "Medium", "Hard", "Very hard"];
  const TOPICS = ["International", "Champions League", "Club football", "Legends"];
  const chosen = { difficulty: "All", topic: "All", status: "All" };

  // ---- What this player has done (saved in the browser by crossword.js) ----
  function readJSON(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch (e) { return fallback; } }
  const solved = readJSON("crossword:solved", {});
  const inProgress = (id) => !solved[id] && Object.keys(readJSON("crossword:" + id, {}).letters || {}).length > 0;
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const mySolved = list.filter((c) => solved[c.folder]);

  function streak() {
    const days = new Set(readJSON("crossword:days", []));
    const d = new Date();
    const iso = () => d.toLocaleDateString("en-CA");
    if (!days.has(iso())) d.setDate(d.getDate() - 1); // a streak is still alive until today ends
    let n = 0;
    while (days.has(iso())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function stats() {
    if (!mySolved.length) return; // new visitors see no empty stats
    const fastest = mySolved.reduce((a, c) => (solved[c.folder].time < solved[a.folder].time ? c : a));
    const box = document.createElement("div");
    box.className = "stats-bar";
    [[`${mySolved.length}/${list.length}`, "solved"],
     ["⭐ " + mySolved.filter((c) => solved[c.folder].perfect).length, "with no help"],
     ["🔥 " + streak(), "day streak"],
     ["⚡ " + fmt(solved[fastest.folder].time), "fastest"]]
      .forEach(([value, label]) => {
        const s = document.createElement("span"); s.className = "stat"; s.title = value === undefined ? "" : (label === "fastest" ? fastest.name : "");
        const b = document.createElement("b"); b.textContent = value;
        const l = document.createElement("span"); l.textContent = label;
        s.append(b, l); box.appendChild(s);
      });
    // Reset: first tap asks, second tap deletes every saved puzzle, tick and stat on this device
    const reset = document.createElement("button");
    reset.type = "button"; reset.className = "reset"; reset.textContent = "Reset";
    reset.addEventListener("click", () => {
      if (!reset.classList.contains("confirm")) {
        reset.classList.add("confirm");
        reset.textContent = "Tap again to delete all";
        setTimeout(() => { reset.classList.remove("confirm"); reset.textContent = "Reset"; }, 4000);
        return;
      }
      try { Object.keys(localStorage).filter((k) => k.startsWith("crossword:")).forEach((k) => localStorage.removeItem(k)); } catch (e) {}
      location.reload();
    });
    const filters = document.querySelector(".filters");
    box.appendChild(reset);
    filters.parentNode.insertBefore(box, filters);
  }

  // Only show filter buttons for values that at least one crossword has
  const used = (key, order) => order.filter((v) => list.some((c) => c[key] === v));

  function buttons(key, values) {
    const row = document.getElementById("filter-" + key);
    ["All", ...values].forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = v;
      b.setAttribute("aria-pressed", v === "All" ? "true" : "false");
      b.addEventListener("click", () => {
        chosen[key] = v;
        row.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
        draw();
      });
      row.appendChild(b);
    });
  }

  function card(c) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = c.folder + "/";
    const name = document.createElement("span"); name.className = "name"; name.textContent = c.name;
    const size = document.createElement("span"); size.className = "size"; size.textContent = c.answers + " answers";
    const level = document.createElement("span"); level.className = "level level-" + c.difficulty.toLowerCase().replace(" ", "-"); level.textContent = c.difficulty;
    const about = document.createElement("span"); about.className = "about"; about.textContent = c.about;
    const meta = document.createElement("span"); meta.className = "meta-line"; meta.append(level, size);
    if (solved[c.folder]) {
      const st = document.createElement("span"); st.className = "status";
      st.textContent = "✓ Solved · " + fmt(solved[c.folder].time) + (solved[c.folder].perfect ? " ⭐" : "");
      meta.appendChild(st); a.classList.add("is-solved");
    } else if (inProgress(c.folder)) {
      const st = document.createElement("span"); st.className = "status progress"; st.textContent = "In progress";
      meta.appendChild(st);
    }
    a.append(name, meta, about);
    li.appendChild(a);
    return li;
  }

  // The list is drawn as one section per topic: a grid on computers, a sideways-swipe row on phones
  const mainEl = document.querySelector("main.narrow");
  if (mainEl) mainEl.classList.remove("narrow"); // the home page uses the full width for the grid
  const groups = document.createElement("div");
  groups.id = "groups";
  document.getElementById("list").replaceWith(groups);

  function draw() {
    groups.innerHTML = "";
    groups.classList.toggle("one-topic", chosen.topic !== "All"); // one topic: a normal list on phones too
    const shown = list.filter((c) =>
      (chosen.difficulty === "All" || c.difficulty === chosen.difficulty) &&
      (chosen.topic === "All" || c.topic === chosen.topic) &&
      (chosen.status === "All" || (chosen.status === "Solved") === !!solved[c.folder]));
    TOPICS.forEach((t) => {
      const inTopic = shown.filter((c) => c.topic === t);
      if (!inTopic.length) return;
      const sec = document.createElement("section"); sec.className = "topic-group";
      const h = document.createElement("h2"); h.textContent = t;
      const n = document.createElement("span"); n.textContent = inTopic.length; h.appendChild(n);
      if (chosen.topic === "All" && inTopic.length > 1) { // "See all" opens the topic as a full list
        const all = document.createElement("button");
        all.type = "button"; all.className = "see-all"; all.textContent = "See all →";
        all.addEventListener("click", () => {
          [...document.querySelectorAll("#filter-topic .chip")].find((b) => b.textContent === t).click();
          window.scrollTo({ top: groups.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" });
        });
        h.appendChild(all);
      }
      const ul = document.createElement("ul"); ul.className = "list";
      inTopic.forEach((c) => ul.appendChild(card(c)));
      sec.append(h, ul); groups.appendChild(sec);
    });
    document.getElementById("empty").hidden = shown.length > 0;
    document.getElementById("shown").textContent =
      shown.length === list.length ? `${list.length} crosswords` : `${shown.length} of ${list.length} crosswords`;
  }

  buttons("difficulty", used("difficulty", LEVELS));
  buttons("topic", used("topic", TOPICS));
  if (mySolved.length) { // the Status filter only appears once something is solved
    const g = document.createElement("div"); g.className = "filter-group";
    g.innerHTML = '<span class="filter-label">Status</span><div class="chips" id="filter-status"></div>';
    document.querySelector(".filters").appendChild(g);
    buttons("status", ["Not solved", "Solved"]);
  }
  // ---- Today's Daily crossword (daily/), shown above everything else ----
  function dailyCard() {
    const d = new Date(), id = "daily-" + d.toLocaleDateString("en-CA");
    const level = ["Very hard", "Easy", "Easy", "Medium", "Medium", "Hard", "Hard"][d.getDay()]; // same rule as tools/build_daily.py
    const a = document.createElement("a");
    a.className = "daily-card"; a.href = "daily/";
    const kicker = document.createElement("span"); kicker.className = "kicker";
    kicker.textContent = "Daily crossword · " + d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const name = document.createElement("span"); name.className = "name"; name.textContent = "Today's mix of every topic";
    const lv = document.createElement("span"); lv.className = "level level-" + level.toLowerCase().replace(" ", "-"); lv.textContent = level;
    const meta = document.createElement("span"); meta.className = "meta-line"; meta.appendChild(lv);
    const st = document.createElement("span"); st.className = "status";
    if (solved[id]) { st.textContent = "✓ Solved · " + fmt(solved[id].time) + (solved[id].perfect ? " ⭐" : ""); a.classList.add("is-solved"); }
    else if (inProgress(id)) { st.classList.add("progress"); st.textContent = "In progress"; }
    else { st.classList.add("cta"); st.textContent = "New every day · Play →"; }
    meta.appendChild(st);
    a.append(kicker, name, meta);
    const filters = document.querySelector(".filters");
    filters.parentNode.insertBefore(a, filters);
  }

  dailyCard();
  stats();
  draw();
})();
