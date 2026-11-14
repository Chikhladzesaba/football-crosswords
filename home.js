// Home page: draws one card per crossword from crosswords.js, plus the Difficulty and Topic filters.
// You never need to edit this file to add a crossword — only crosswords.js.
(function () {
  // One script for both home pages: index.html (English) and ka/index.html (<html lang="ka">, Georgian)
  const KA = document.documentElement.lang === "ka";
  const list = (window.CROSSWORDS || []).filter((c) => (c.lang || "en") === (KA ? "ka" : "en"));
  const BASE = KA ? "../" : ""; // the Georgian home page sits one folder down, in ka/
  const T = KA ? {
    All: "ყველა", Easy: "მარტივი", Medium: "საშუალო", Hard: "რთული", "Very hard": "ძალიან რთული",
    "Not solved": "ამოუხსნელი", Solved: "ამოხსნილი", status: "სტატუსი",
    International: "ნაკრებები", "Champions League": "ჩემპიონთა ლიგა", "Club football": "საკლუბო ფეხბურთი", Legends: "ლეგენდები",
    seeAll: "ყველას ნახვა →",
    solvedTag: "✓ ამოხსნილი · ", inProgress: "დაწყებული", size: () => "",
    stats: ["ამოხსნილი", "დახმარების გარეშე:", "ზედიზედ თამაშის დღეები:", "საუკეთესო დრო:"],
    labelFirst: true, // Georgian reads "საუკეთესო დრო: 0:30", English "0:30 fastest"
    reset: "შედეგების წაშლა", resetAgain: "ყველაფრის წასაშლელად კიდევ ერთხელ დააკლიკე",
    count: (a, b) => (a === b ? `${b} კროსვორდი` : `${a} / ${b} კროსვორდი`),
  } : {
    status: "Status", seeAll: "See all →", solvedTag: "✓ Solved · ", inProgress: "In progress", size: (n) => n + " answers",
    stats: ["solved", "with no help", "day streak", "fastest"],
    reset: "Reset", resetAgain: "Tap again to delete all",
    count: (a, b) => (a === b ? `${b} crosswords` : `${a} of ${b} crosswords`),
  };
  const say = (v) => T[v] || v; // filter and level words in the page's language
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
    const days = streak();
    const best = fmt(solved[fastest.folder].time);
    // [icon, number, label, label goes first?]
    [["", `${mySolved.length}/${list.length}`, T.stats[0], false],
     ["⭐", mySolved.filter((c) => solved[c.folder].perfect).length, T.stats[1], !!T.labelFirst],
     days ? ["🔥", days, T.stats[2], !!T.labelFirst] : null, // hidden until there is a streak
     ["⚡", T.labelFirst ? best.replace(/^0(?=\d:)/, "") : best, T.stats[3], !!T.labelFirst]]
      .filter(Boolean)
      .forEach(([icon, value, label, labelFirst]) => {
        const s = document.createElement("span"); s.className = "stat"; s.title = label === T.stats[3] ? fastest.name : "";
        const b = document.createElement("b"); b.textContent = labelFirst ? String(value) : (icon ? icon + " " : "") + value;
        const l = document.createElement("span"); l.textContent = labelFirst ? (icon ? icon + " " : "") + label + " " : label;
        if (labelFirst) s.append(l, b); else s.append(b, l);
        box.appendChild(s);
      });
    // Reset: first tap asks, second tap deletes every saved puzzle, tick and stat on this device
    const reset = document.createElement("button");
    reset.type = "button"; reset.className = "reset"; reset.textContent = T.reset;
    reset.addEventListener("click", () => {
      if (!reset.classList.contains("confirm")) {
        reset.classList.add("confirm");
        reset.textContent = T.resetAgain;
        setTimeout(() => { reset.classList.remove("confirm"); reset.textContent = T.reset; }, 4000);
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
      b.textContent = say(v);
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
    a.href = BASE + c.folder + "/";
    const name = document.createElement("span"); name.className = "name"; name.textContent = c.name;
    const size = document.createElement("span"); size.className = "size"; size.textContent = T.size(c.answers);
    const level = document.createElement("span"); level.className = "level level-" + c.difficulty.toLowerCase().replace(" ", "-"); level.textContent = say(c.difficulty);
    const about = document.createElement("span"); about.className = "about"; about.textContent = c.about;
    const meta = document.createElement("span"); meta.className = "meta-line"; meta.append(level, size);
    if (solved[c.folder]) {
      const st = document.createElement("span"); st.className = "status";
      st.textContent = T.solvedTag + fmt(solved[c.folder].time) + (solved[c.folder].perfect ? " ⭐" : "");
      meta.appendChild(st); a.classList.add("is-solved");
    } else if (inProgress(c.folder)) {
      const st = document.createElement("span"); st.className = "status progress"; st.textContent = T.inProgress;
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
      const h = document.createElement("h2"); h.textContent = say(t);
      const n = document.createElement("span"); n.textContent = inTopic.length; h.appendChild(n);
      if (chosen.topic === "All" && inTopic.length > 1) { // "See all" opens the topic as a full list
        const all = document.createElement("button");
        all.type = "button"; all.className = "see-all"; all.textContent = T.seeAll;
        all.addEventListener("click", () => {
          [...document.querySelectorAll("#filter-topic .chip")].find((b) => b.textContent === say(t)).click();
          window.scrollTo({ top: groups.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" });
        });
        h.appendChild(all);
      }
      const ul = document.createElement("ul"); ul.className = "list";
      inTopic.forEach((c) => ul.appendChild(card(c)));
      sec.append(h, ul); groups.appendChild(sec);
    });
    document.getElementById("empty").hidden = shown.length > 0;
    document.getElementById("shown").textContent = T.count(shown.length, list.length);
  }

  buttons("difficulty", used("difficulty", LEVELS));
  buttons("topic", used("topic", TOPICS));
  if (mySolved.length) { // the Status filter only appears once something is solved
    const g = document.createElement("div"); g.className = "filter-group";
    g.innerHTML = '<span class="filter-label">' + T.status + '</span><div class="chips" id="filter-status"></div>';
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

  // ---- The Scramble game (scramble/ and ka/scramble/), a card above the crosswords ----
  function gameCard() {
    const a = document.createElement("a");
    a.className = "daily-card"; a.href = "scramble/";
    const kicker = document.createElement("span"); kicker.className = "kicker"; kicker.textContent = KA ? "ახალი თამაში" : "New game";
    const name = document.createElement("span"); name.className = "name"; name.textContent = KA ? "გვარების დალაგობანა" : "Name Scramble";
    const st = document.createElement("span"); st.className = "status cta";
    st.textContent = KA ? "გამოიცანი ფეხბურთელი არეული ასოებით · თამაში →" : "Guess the player from mixed-up letters · Play →";
    a.append(kicker, name, st);
    const filters = document.querySelector(".filters");
    filters.parentNode.insertBefore(a, filters);
  }

  if (!KA) dailyCard(); // the Daily crossword is English only
  gameCard();
  stats();
  draw();
})();
