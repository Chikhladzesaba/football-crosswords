// Home page: draws one card per crossword from crosswords.js, plus the Difficulty and Topic filters.
// You never need to edit this file to add a crossword — only crosswords.js.
(function () {
  // One script for both home pages: index.html (English) and ka/index.html (<html lang="ka">, Georgian)
  const KA = document.documentElement.lang === "ka";
  const list = (window.CROSSWORDS || []).filter((c) => (c.lang || "en") === (KA ? "ka" : "en"));
  const BASE = "/"; // links start from the site root (this page is /crosswords/ or /ka/crosswords/)
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
    reset.type = "button"; reset.className = "reset";
    const lbl = document.createElement("span"); lbl.textContent = T.reset;
    reset.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5h16M9.5 6.5V4.2h5v2.3M6.3 6.5l.9 13.3h9.6l.9-13.3M10 10.5v6M14 10.5v6"/></svg>';
    reset.appendChild(lbl);
    reset.addEventListener("click", () => {
      if (!reset.classList.contains("confirm")) {
        reset.classList.add("confirm");
        lbl.textContent = T.resetAgain;
        setTimeout(() => { reset.classList.remove("confirm"); lbl.textContent = T.reset; }, 4000);
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
  if (mainEl) { mainEl.classList.remove("narrow"); mainEl.classList.add("home"); const intro = mainEl.querySelector(".intro"); if (intro) { const txt = intro.textContent.trim(); intro.textContent = ""; const track = document.createElement("span"); track.className = "marquee"; for (let i = 0; i < 2; i++) { const part = document.createElement("span"); part.textContent = txt; if (i) part.setAttribute("aria-hidden", "true"); track.appendChild(part); } intro.appendChild(track); } } // the home page uses the full width for the grid
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
      const sec = document.createElement("section"); sec.className = "topic-group"; sec.dataset.topic = t;
      const h = document.createElement("h2"); h.textContent = say(t); if (window.KPArt) h.prepend(window.KPArt.spotFor(t));
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
      // The newest crossword of the topic (the last one added to crosswords.js) is the big highlighted card
      const newest = list.filter((c) => c.topic === t).pop();
      if (window.KPArt && window.KPArt.feature && inTopic.length > 1 && inTopic.includes(newest)) {
        const li = ul.children[inTopic.indexOf(newest)];
        li.classList.add("feature"); li.firstElementChild.appendChild(window.KPArt.feature(t));
        ul.dataset.n = inTopic.length;
        const rest = [...ul.children].filter((x) => !x.classList.contains("feature")); // on a phone the small boxes sit two under each other; an odd last one stands tall
        if (rest.length % 2) { const tl = rest[rest.length - 1]; tl.classList.add("tall"); tl.firstElementChild.appendChild(window.KPArt.feature(inTopic[[...ul.children].indexOf(tl)].art || t)); } // the stretched box gets a drawing too, so it is not empty
      }
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
  // ---- Each filter row becomes a dropdown button (the chips stay as the menu, so the filtering code is unchanged) ----
  document.querySelectorAll(".filters .filter-group").forEach((g) => {
    const label = g.querySelector(".filter-label"), chips = g.querySelector(".chips");
    const trigger = document.createElement("button");
    trigger.type = "button"; trigger.className = "dd-trigger"; trigger.setAttribute("aria-haspopup", "true"); trigger.setAttribute("aria-expanded", "false");
    const value = document.createElement("span"); value.className = "dd-value";
    const caret = document.createElement("span"); caret.className = "dd-caret"; caret.setAttribute("aria-hidden", "true");
    trigger.append(label, value, caret);
    g.classList.add("dd"); g.insertBefore(trigger, chips);
    const sync = () => { const on = chips.querySelector('[aria-pressed="true"]'); value.textContent = on ? on.textContent : ""; };
    const setOpen = (open) => { g.classList.toggle("open", open); trigger.setAttribute("aria-expanded", open ? "true" : "false"); };
    sync();
    trigger.addEventListener("click", (e) => { e.stopPropagation(); const open = !g.classList.contains("open"); document.querySelectorAll(".filter-group.open").forEach((x) => x.classList.remove("open")); setOpen(open); });
    chips.addEventListener("click", () => { sync(); setOpen(false); });
  });
  document.addEventListener("click", () => document.querySelectorAll(".filter-group.open").forEach((x) => { x.classList.remove("open"); const t = x.querySelector(".dd-trigger"); if (t) t.setAttribute("aria-expanded", "false"); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".filter-group.open").forEach((x) => x.classList.remove("open")); });
  // ---- Today's Daily crossword (daily/), shown above everything else ----
  function dailyCard() {
    const d = new Date(), iso = d.toLocaleDateString("en-CA"), id = (KA ? "ka-daily-" : "daily-") + iso;
    if (KA && iso > "2027-02-28") return; // the Georgian Daily is generated up to this date (tools/build_daily.py ka)
    const level = ["Very hard", "Easy", "Easy", "Medium", "Medium", "Hard", "Hard"][d.getDay()]; // same rule as tools/build_daily.py
    const a = document.createElement("a");
    a.className = "daily-card"; a.href = KA ? "/dgis-krosvordi/" : "/daily/";
    const kicker = document.createElement("span"); kicker.className = "kicker";
    kicker.textContent = KA ? d.getDate() + " " + ["იანვრის", "თებერვლის", "მარტის", "აპრილის", "მაისის", "ივნისის", "ივლისის", "აგვისტოს", "სექტემბრის", "ოქტომბრის", "ნოემბრის", "დეკემბრის"][d.getMonth()] + " კროსვორდი"
      : "Daily crossword · " + d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const name = document.createElement("span"); name.className = "name"; name.append(...(KA ? ["დღის კროსვორდი", "ყველა თემიდან"] : ["Today's mix", "of every topic"]).flatMap((l, i) => i ? [document.createElement("br"), l] : [l]));
    const lv = document.createElement("span"); lv.className = "level level-" + level.toLowerCase().replace(" ", "-"); lv.textContent = say(level);
    const meta = document.createElement("span"); meta.className = "meta-line"; meta.appendChild(lv);
    const st = document.createElement("span"); st.className = "status";
    if (solved[id]) { st.textContent = (KA ? T.solvedTag : "✓ Solved · ") + fmt(solved[id].time) + (solved[id].perfect ? " ⭐" : ""); a.classList.add("is-solved"); }
    else if (inProgress(id)) { st.classList.add("progress"); st.textContent = KA ? T.inProgress : "In progress"; }
    else { st.classList.add("cta"); st.textContent = KA ? "ითამაშე →" : "Play →"; } // as in the design: level chip + "Play →"
    meta.appendChild(st);
    a.append(kicker, name, meta);
    if (window.KPArt) a.appendChild(window.KPArt.hero()); // the big crossword + ball + pencil drawing
    const filters = document.querySelector(".filters");
    filters.parentNode.insertBefore(a, filters);
  }

  // ---- The Scramble game (scramble/ and gamoicani-pekhburtelebis-gvarebi/), a card above the crosswords ----
  function gameCard() {
    if (KA) return; // Georgian home: the game bar at the top already links to the games
    const a = document.createElement("a");
    a.className = "daily-card"; a.href = KA ? "/gamoicani-pekhburtelebis-gvarebi/" : "/scramble/";
    const kicker = document.createElement("span"); kicker.className = "kicker"; kicker.textContent = KA ? "ახალი თამაში" : "New game";
    const name = document.createElement("span"); name.className = "name"; name.textContent = KA ? "დალაგობანა" : "Name Scramble";
    const st = document.createElement("span"); st.className = "status cta";
    st.textContent = KA ? "დაალაგე არეული ასოები და გამოიცანი ფეხბურთელების გვარები · ითამაშე →" : "Guess the player from mixed-up letters · Play →";
    a.append(kicker, name, st);
    const filters = document.querySelector(".filters");
    filters.parentNode.insertBefore(a, filters);
  }

  dailyCard(); // English: daily/, Georgian: dgis-krosvordi/
  // (no Scramble card: the game tabs in the nav link to every game, as in the design)
  stats();
  draw();
  // ?topic=Legends (used by the All page) opens the home page with that topic already chosen
  const wanted = new URLSearchParams(location.search).get("topic");
  if (wanted) { const chip = [...document.querySelectorAll("#filter-topic .chip")].find((b) => b.textContent === say(wanted)); if (chip) chip.click(); }
})();
