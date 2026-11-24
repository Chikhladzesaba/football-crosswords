// "All" page: one section per game (Crosswords, Top 5, Scramble, Word Search).
// Each section = a big card with a drawing + "See more", and 3 small preview cards. Everything is read from the same lists the games use,
// so you never need to edit this file when you add a crossword or a Top 5 list.
(function () {
  const KA = document.documentElement.lang === "ka";
  const BASE = "/"; // links start from the site root, so this page can live anywhere
  const PATH = KA
    ? { crosswords: "ka/crosswords/", top5: "gamoicani-top5/", scramble: "gamoicani-pekhburtelebis-gvarebi/", wordsearch: "skauti/" }
    : { crosswords: "crosswords/", top5: "top5/", scramble: "scramble/", wordsearch: "wordsearch/" };
  const T = KA ? {
    names: { crosswords: "კროსვორდი", top5: "Top 5", scramble: "დალაგობანა", wordsearch: "სკაუტი" },
    topics: { International: "ნაკრებები", "Champions League": "ჩემპიონთა ლიგა", "Club football": "საკლუბო ფეხბურთი", Legends: "ლეგენდები" },
    t5: { ucl: "ჩემპიონთა ლიგა", pl: "პრემიერლიგა", laliga: "ლა ლიგა", seriea: "სერია A", bundesliga: "ბუნდესლიგა", wc: "მსოფლიო ჩემპიონატი" },
    sc: { legends: "ლეგენდები", active: "მოქმედი ფეხბურთელები" }, players: (n) => n + " ფეხბურთელი", lists: (n) => n + " სია", xw: (n) => n + " კროსვორდი",
    about: {
      crosswords: "კროსვორდები მსოფლიო ჩემპიონატზე, ჩემპიონთა ლიგაზე, კლუბებსა და ლეგენდებზე.",
      top5: "გამოიცანი საფეხბურთო რეკორდები და დაალაგე საუკეთესოები.",
      scramble: "ასოები არეულია, შენ კი ცნობილი ფეხბურთელის გვარი უნდა ააწყო.",
      wordsearch: "იპოვე დამალული სიტყვები ფეხბურთის ისტორიიდან.",
    },
    count: { crosswords: (n) => n + " კროსვორდი", top5: (n) => n + " სია", scramble: (n) => n + " ფეხბურთელი", wordsearch: (n) => n + " თემა" },
    more: "მეტის ნახვა →", level: { Easy: "მარტივი", Medium: "საშუალო", Hard: "რთული", "Very hard": "ძალიან რთული" },
    answers: () => "", letters: (n) => n + " ასო", unscramble: "გამოიცანი ფეხბურთელის გვარი", words: (n) => n + " სიტყვა",
    cats: { players: "ფეხბურთელები", coaches: "მწვრთნელები", stadiums: "სტადიონები", teams: "გუნდები" },
    solved: "✓ ამოხსნილი",
  } : {
    names: { crosswords: "Crosswords", top5: "Top 5", scramble: "Scramble", wordsearch: "Word Search" },
    topics: { International: "International", "Champions League": "Champions League", "Club football": "Club football", Legends: "Legends" },
    t5: { ucl: "Champions League", pl: "Premier League", laliga: "La Liga", seriea: "Serie A", bundesliga: "Bundesliga", wc: "World Cup" },
    sc: { legends: "Legends", active: "Active players" }, players: (n) => n + " players", lists: (n) => n + (n === 1 ? " list" : " lists"), xw: (n) => n + (n === 1 ? " crossword" : " crosswords"),
    about: {
      crosswords: "From Easy to Very hard: the World Cup, the Champions League, clubs and legends.",
      top5: "Guess the record holders, top scorers and leaders in a football Top 5.",
      scramble: "Mixed-up letters, one footballer. Put them back in order.",
      wordsearch: "Find the footballers, coaches, clubs and other words hidden in the grid.",
    },
    count: { crosswords: (n) => n + " crosswords", top5: (n) => n + " lists", scramble: (n) => n + " footballers", wordsearch: (n) => n + " themes" },
    more: "See more →", level: {},
    answers: (n) => n + " answers", letters: (n) => n + " letters", unscramble: "Unscramble the footballer", words: (n) => n + " words",
    cats: { players: "Players", coaches: "Coaches", stadiums: "Stadiums", teams: "Teams" },
    solved: "✓ Solved",
  };
  const ORDER = ["crosswords", "top5", "scramble", "wordsearch"];
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const solved = read("crossword:solved");

  // A random-looking but fixed pick for the day, so the Scramble previews change daily and don't jump around on reload
  const day = Math.floor(Date.now() / 864e5);
  const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rand = rng(day);
  const mixWord = (w) => { const l = [...w]; for (let k = 0; k < 12; k++) { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } if (l.join("") !== w) break; } return l; };

  // ---- Categories of each game: [{ name, tag, about, href, art }], the first one is the big highlighted box ----
  const crosswords = (window.CROSSWORDS || []).filter((c) => (c.lang || "en") === (KA ? "ka" : "en"));
  const top5 = window.TOP5_LISTS || [];
  const scr = window.SCRAMBLE_NAMES || [];
  const pool = window.WORDSEARCH_WORDS || [];
  const wsCats = ((window.WORDSEARCH_TEXT || {}).cats) || T.cats;
  const TOPICS = ["International", "Champions League", "Club football", "Legends"];
  const highlightFirst = (arr, i) => (i > 0 ? [arr[i]].concat(arr.slice(0, i), arr.slice(i + 1)) : arr);
  const list2 = (a) => a.slice(0, 2).join(" · ");

  const xw = TOPICS.map((t) => ({ t, items: crosswords.filter((c) => c.topic === t) })).filter((x) => x.items.length);
  const newestTopic = crosswords.length ? crosswords[crosswords.length - 1].topic : "";
  const xwCats = highlightFirst(xw, Math.max(0, xw.findIndex((x) => x.t === newestTopic))).map((x) => ({
    name: T.topics[x.t], tag: T.xw(x.items.length), about: list2(x.items.slice().reverse().map((c) => c.name)), art: x.t,
    href: BASE + PATH.crosswords + "?topic=" + encodeURIComponent(x.t) }));

  const T5 = [["ucl", /Champions League|ჩემპიონთა ლიგ|ჩემპიონთა ლიგ/], ["pl", /Premier League|პრემიერლიგ/], ["laliga", /La Liga|ლა ლიგ/], ["seriea", /Serie A|სერია/], ["bundesliga", /Bundesliga|ბუნდესლიგ/], ["wc", /World Cup|მსოფლიო ჩემპიონატ/]];
  const t5 = T5.map(([k, re]) => ({ k, items: top5.filter((l) => re.test(l.title)) })).filter((x) => x.items.length).sort((a, b) => b.items.length - a.items.length);
  const t5Cats = t5.map((x, i) => ({ name: T.t5[x.k], tag: T.lists(x.items.length), about: list2(x.items.map((l) => l.title)), art: i === 0 ? "Champions League" : "", href: BASE + PATH.top5 + x.items[0].id + "/" }));

  const nm = (n) => (KA ? n.ka : n.en);
  const legends = scr.filter((n) => !n.a), active = scr.filter((n) => n.a);
  const scCats = [{ name: T.sc.legends, tag: T.players(legends.length), about: list2(legends.slice(0, 2).map(nm)), art: "Legends", href: BASE + PATH.scramble },
                  { name: T.sc.active, tag: T.players(active.length), about: list2(active.slice(0, 2).map(nm)), art: "hub:scramble", href: BASE + PATH.scramble }].filter((c) => !c.tag.startsWith("0"));

  const wsCatsList = ["players", "coaches", "stadiums", "teams"].map((cat) => {
    const inCat = pool.filter((p) => p.cat === cat);
    return { name: wsCats[cat] || T.cats[cat], tag: T.words(inCat.length), n: inCat.length, about: inCat.filter((p) => p.lvl === "easy").slice(0, 3).map((p) => p.w).join(" · "), art: cat === "players" ? "hub:wordsearch" : "", href: BASE + PATH.wordsearch };
  }).filter((c) => c.n);

  const DATA = {
    crosswords: { count: crosswords.length, cats: xwCats },
    top5: { count: top5.length, cats: t5Cats },
    scramble: { count: scr.length, cats: scCats },
    wordsearch: { count: 4, cats: wsCatsList },
  };

  // One box. big = the highlighted one (has the drawing and the "See more" text button)
  function box(c, big, showTag) {
    const li = document.createElement("li"), a = document.createElement("a"); a.href = c.href;
    const name = document.createElement("span"); name.className = "name"; name.textContent = c.name;
    const about = document.createElement("span"); about.className = "about"; about.textContent = c.about;
    if (showTag) { // only the crossword boxes carry a tag (the count)
      const meta = document.createElement("span"); meta.className = "meta-line";
      const tag = document.createElement("span"); tag.className = "level"; tag.textContent = c.tag; meta.appendChild(tag);
      a.append(name, meta, about);
    } else a.append(name, about);
    if (big) {
      li.className = "feature";
      if (window.KPArt && window.KPArt.feature && c.art) a.appendChild(window.KPArt.feature(c.art));
    }
    li.appendChild(a);
    return li;
  }

  const groups = document.getElementById("groups");
  const mainEl = document.querySelector("main.narrow");
  if (mainEl) { mainEl.classList.remove("narrow"); mainEl.classList.add("home", "hub"); }
  groups.classList.add("one-topic"); // a normal stacked list on phones (no sideways swipe)

  // ---- 1. The four games as boxes with a drawing each ----
  const gamesSec = document.createElement("section"); gamesSec.className = "topic-group hub-games";
  const gul = document.createElement("ul"); gul.className = "list";
  ORDER.forEach((id) => {
    const d = DATA[id];
    const li = document.createElement("li"), a = document.createElement("a"); a.href = BASE + PATH[id]; li.className = "feature";
    const name = document.createElement("span"); name.className = "name"; name.textContent = T.names[id];
    a.append(name);
    if (window.KPArt && window.KPArt.feature) a.appendChild(window.KPArt.feature("hub:" + id));
    li.appendChild(a); gul.appendChild(li);
  });
  gamesSec.appendChild(gul); groups.appendChild(gamesSec);

  // ---- 2. One section per game: a box per category, the first one highlighted with a drawing ----
  ORDER.forEach((id) => {
    const d = DATA[id]; if (!d || !d.cats.length) return;
    const sec = document.createElement("section"); sec.className = "topic-group"; sec.dataset.game = id;
    const h = document.createElement("h2");
    const ico = document.createElement("span"); ico.className = "kp-spot hub-ico"; ico.innerHTML = (window.KPNav && window.KPNav.ICON[id]) || "";
    const link = document.createElement("em"); link.className = "hub-name"; link.textContent = T.names[id];
    const all = document.createElement("a"); all.className = "hub-all"; all.href = BASE + PATH[id]; all.textContent = T.more;
    h.append(ico, link, all);
    const ul = document.createElement("ul"); ul.className = "list";
    const pair = d.cats.length === 2; // two categories: two big boxes side by side
    d.cats.forEach((c, i) => ul.appendChild(box(c, pair || i === 0, id === "crosswords")));
    if (pair) ul.classList.add("pair");
    const others = d.cats.length - 1;
    ul.style.setProperty("--rows", Math.max(1, Math.ceil(others / 2)));
    if (!pair && others % 2 === 1) ul.lastElementChild.classList.add("wide"); // an odd box out fills the row
    sec.append(h, ul); groups.appendChild(sec);
  });
})();
