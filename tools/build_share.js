// Builds the SEO + sharing parts of the site from crosswords.js:
//   - share.png (1200x630) for the Crosswords home pages and every crossword (the All pages' images come from build_game_share.js)
//   - <head> tags on every page: title, description, canonical link, Open Graph + Twitter preview tags
//   - sitemap.xml and robots.txt
// Run from the site folder:  node tools/build_share.js
//   Only redraw the images:   node tools/build_share.js --images-only
//   Only one language:        node tools/build_share.js --lang ka   (or --lang en)
// Georgian crosswords (lang: "ka" in crosswords.js) get Georgian texts and stay hidden from Google
// (noindex, not in the sitemap) while KA_PUBLIC below is false.
// The two home pages point to each other (hreflang) and have a language switch link.
// When the site moves to its own domain, change SITE below and run it again.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SITE = "https://kickoffpuzzles.com/";
const BRAND = "Kickoff Puzzles";
const KA_PUBLIC = true; // true = Georgian pages may appear on Google (live since Nov 2026)
const ONLY = (process.argv.indexOf("--lang") > -1) ? process.argv[process.argv.indexOf("--lang") + 1] : null;
const IMAGES_ONLY = process.argv.includes("--images-only"); // only redraw share.png files, leave pages/sitemap alone
const write = (...a) => { if (!IMAGES_ONLY) fs.writeFileSync(...a); };
const langOf = (c) => c.lang || "en";
// Twin crosswords: a Georgian entry says twin: "english-folder" in crosswords.js. The pairing works both ways.
const twinOf = (c) => c.twin ? LIST.find((x) => x.folder === c.twin) : LIST.find((x) => x.twin === c.folder);
// hreflang links (both pages list both languages, as Google requires) + data-alt, which makes the language switch jump to the twin
function twinTags(c) {
  const t = twinOf(c);
  if (!t || !KA_PUBLIC) return { alternates: [], dataAlt: "" };
  const en = langOf(c) === "en" ? c : t, ka = langOf(c) === "ka" ? c : t;
  return { alternates: [["en", SITE + en.folder + "/"], ["ka", SITE + ka.folder + "/"], ["x-default", SITE + en.folder + "/"]], dataAlt: ` data-alt="${t.folder}/"` };
}
// Georgian texts (approved by Saba)
const KA = {
  brand: "Kickoff Puzzles",
  title: (c) => `${c.name} | საფეხბურთო კროსვორდი`,
  description: (c, level) => `${c.about} საფეხბურთო კროსვორდი, სირთულე: ${level}. შეგიძლია ითამაშო ტელეფონზეც და კომპიუტერზეც.`,
  level: { "Easy": "მარტივი", "Medium": "საშუალო", "Hard": "რთული", "Very hard": "ძალიან რთული" },
  homeTitle: "საფეხბურთო კროსვორდები",
  homeIntro: "კროსვორდები მსოფლიო ჩემპიონატზე, ჩემპიონთა ლიგაზე, პრემიერლიგაზე და სხვა საფეხბურთო თემებზე.",
  back: "← ყველა კროსვორდი", across: "ჰორიზონტალურად", down: "ვერტიკალურად",
};
// Cloudflare Web Analytics (cookie-free visit counting). The token is public by design.
const ANALYTICS = `<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3b650f1df19b43698cc1d110b8a5c6dc"}'></script><!-- End Cloudflare Web Analytics -->`;
const ROOT = path.resolve(__dirname, "..");

// ---- read the crossword list (crosswords.js sets window.CROSSWORDS) ----
const window = {};
eval(fs.readFileSync(path.join(ROOT, "crosswords.js"), "utf8"));
const LIST = window.CROSSWORDS;

function readPuzzle(folder) {
  const window = {};
  eval(fs.readFileSync(path.join(ROOT, folder, "puzzle.js"), "utf8"));
  return window.PUZZLE;
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- the <head> tags, shared by every page ----
// The two home pages are translations of each other: tell Google with hreflang links
const HOME_ALTERNATES = [["en", SITE + "crosswords/"], ["ka", SITE + "ka/crosswords/"], ["x-default", SITE + "crosswords/"]]; // the crosswords home pages (the front pages / and /ka/ are the hand-made "All" pages, not generated here)
function headTags({ title, description, url, image, brand = BRAND, locale = "en_US", noindex = false, alternates = [] }) {
  return `  <title>${esc(title)}</title>${noindex ? `
  <meta name="robots" content="noindex">` : ""}${alternates.map(([l, u]) => `
  <link rel="alternate" hreflang="${l}" href="${u}">`).join("")}
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${brand}">
  <meta property="og:locale" content="${locale}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="theme-color" content="#006aff">`;
}
const FONT_LINKS = `  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

// ---- a puzzle page: head tags + plain text Google can read before the game loads ----
function puzzlePage(c, p) {
  if (langOf(c) === "ka") return puzzlePageKa(c, p);
  const url = SITE + c.folder + "/";
  const title = `${c.name} Crossword | ${BRAND}`;
  const description = `${c.about} A free ${c.difficulty.toLowerCase()} football crossword with ${c.answers} answers. Play on your phone or computer.`;
  const clues = p.words.map((w) => `        <li>${w.clue} (${w.answer.length})</li>`).join("\n");
  const tw = twinTags(c);
  return `<!doctype html>
<html lang="en"${tw.dataAlt}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headTags({ title, description, url, image: url + "share.png", alternates: tw.alternates })}
${FONT_LINKS}
  <link rel="preload" href="/fonts/FiraGO-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/FiraGO-Medium.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../nav.css?v=7">
  <link rel="stylesheet" href="../crossword.css?v=28">
  ${ANALYTICS}
</head>
<body>
  <script>try{if(matchMedia("(pointer:coarse)").matches&&matchMedia("(max-width:760px)").matches){var b=document.body.classList;b.add("phone-play");if(localStorage.getItem("crossword:kb")!=="native")b.add("own-kb")}}catch(e){}</script>
  <script src="../nav.js?v=20"></script>
  <!-- Generated by tools/build_share.js. The game replaces the content below when it loads;
       until then (and for Google) it shows the title, intro and clues as plain text. -->
  <div id="crossword">
    <main>
      <a class="back" href="../crosswords/">← All crosswords</a>
      <h1>${p.title}</h1>
      <p class="intro">${p.intro}</p>
      <section class="clues"><section><h3>Clues</h3>
      <ol>
${clues}
      </ol>
      </section></section>
    </main>
  </div>
  <script src="puzzle.js"></script>
  <script src="../crossword.js?v=23"></script>
</body>
</html>
`;
}

// ---- a Georgian puzzle page: same idea, Georgian texts, clues split into across and down ----
function puzzlePageKa(c, p) {
  const url = SITE + c.folder + "/";
  const level = KA.level[c.difficulty];
  const list = (dir) => p.words.filter((w) => w.dir === dir).map((w) => `        <li>${w.clue} (${w.answer.length})</li>`).join("\n");
  const tw = twinTags(c);
  return `<!doctype html>
<html lang="ka"${tw.dataAlt}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headTags({ title: KA.title(c), description: KA.description(c, level), url, image: url + "share.png", brand: KA.brand, locale: "ka_GE", noindex: !KA_PUBLIC, alternates: tw.alternates })}
${FONT_LINKS}
  <link rel="preload" href="/fonts/FiraGO-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/FiraGO-Medium.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../nav.css?v=7">
  <link rel="stylesheet" href="../crossword.css?v=28">
  ${ANALYTICS}
</head>
<body>
  <script>try{if(matchMedia("(pointer:coarse)").matches&&matchMedia("(max-width:760px)").matches){var b=document.body.classList;b.add("phone-play");if(localStorage.getItem("crossword:kb")!=="native")b.add("own-kb")}}catch(e){}</script>
  <script src="../nav.js?v=20"></script>
  <!-- Generated by tools/build_share.js. The game replaces the content below when it loads;
       until then (and for Google) it shows the title, intro and clues as plain text. -->
  <div id="crossword">
    <main>
      <a class="back" href="../ka/crosswords/">${KA.back}</a>
      <h1>${p.title}</h1>
      <p class="intro">${p.intro}</p>
      <section class="clues"><section><h3>${KA.across}</h3>
      <ol>
${list("A")}
      </ol>
      </section><section><h3>${KA.down}</h3>
      <ol>
${list("D")}
      </ol>
      </section></section>
    </main>
  </div>
  <script src="puzzle.js"></script>
  <script src="../crossword.js?v=23"></script>
</body>
</html>
`;
}

// ---- the Georgian crosswords home page (ka/crosswords/): cards are drawn by home.js, which sees <html lang="ka"> ----
function kaHomePage() {
  const url = SITE + "ka/crosswords/";
  return `<!doctype html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headTags({ title: KA.homeTitle, description: KA.homeIntro, url, image: SITE + "ka/crosswords/share.png", brand: KA.brand, locale: "ka_GE", noindex: !KA_PUBLIC, alternates: KA_PUBLIC ? HOME_ALTERNATES : [] })}
${FONT_LINKS.replace(/\.\.\//g, "")}
  <link rel="preload" href="/fonts/FiraGO-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/FiraGO-Medium.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/nav.css?v=7">
  <link rel="stylesheet" href="/crossword.css?v=26">
  ${ANALYTICS}
</head>
<body>
  <script src="/nav.js?v=20"></script>
  <!-- Generated by tools/build_share.js. Edit the texts in KA (top of that file), not here. -->
  <main class="narrow">
    <h1>საფეხბურთო <em>კროსვორდი</em></h1>
    <p class="intro">${KA.homeIntro}</p>

    <div class="filters">
      <div class="filter-group">
        <span class="filter-label">სირთულე</span>
        <div class="chips" id="filter-difficulty"></div>
      </div>
      <div class="filter-group">
        <span class="filter-label">თემა</span>
        <div class="chips" id="filter-topic"></div>
      </div>
    </div>

    <p class="shown" id="shown"></p>
    <!-- The cards are drawn by home.js from the list in crosswords.js (only lang: "ka") -->
    <ul class="list" id="list"></ul>
    <p class="empty" id="empty" hidden>ასეთი კროსვორდი ჯერ არ გვაქვს. სცადე სხვა სირთულე ან თემა.</p>
  </main>
  <script src="/crosswords.js"></script>
  <script src="/home.js?v=5"></script>
</body>
</html>
`;
}

// ---- the share image ----
// Every image is drawn by tools/share_style.js (newspaper style: paper, black ink, Ranchers title, hand-drawn picture).
// Nothing about colours or fonts is decided in this file, so the old coloured look cannot come back from here.
const S = require("./share_style");
const OUT_ARG = process.argv.indexOf("--out") > -1 ? process.argv[process.argv.indexOf("--out") + 1] : null; // write the images into another folder (to check them)
const img = (...p) => { const f = path.join(OUT_ARG || ROOT, ...p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; };
const plain = (t) => t.replace(/<[^>]*>/g, ""); // titles may contain <em>; the image uses plain text
const twoLines = (t) => { const w = t.split(" "); return w.length > 1 ? [w[0], w.slice(1).join(" ")] : [t]; };
const gapNote = (what, gap) => { if (gap < 24) console.log("  !! title is close to the picture (" + gap + "px):", what); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const site = await S.siteArt(browser); // the crossword + ball + pencil drawing comes from paper.js on the real site

  // Home page image (skipped with --lang ka) + tags (always, so the hreflang links stay in step)
  if (ONLY !== "ka") gapNote("crosswords home", await S.render(browser, { title: ["Football", "Crosswords"], art: S.heroArt(site.hero) }, img("crosswords", "share.png")));
  {
  let home = fs.readFileSync(path.join(ROOT, "crosswords", "index.html"), "utf8");
  home = home.replace(/  <title>[\s\S]*?(?=  <link rel="icon")/, headTags({
    title: `Free Football Crosswords to Play Online | ${BRAND}`,
    description: `Football crosswords on the World Cup, the Champions League, the Premier League and other football topics.`,
    url: SITE + "crosswords/", image: SITE + "crosswords/share.png", alternates: KA_PUBLIC ? HOME_ALTERNATES : [],
  }) + "\n");
  if (!home.includes("cloudflareinsights")) home = home.replace("</head>", `  ${ANALYTICS}\n</head>`);
  write(path.join(ROOT, "crosswords", "index.html"), home);
  }

  // One image + page per crossword
  // Georgian home page image + page
  if (ONLY !== "en") {
    fs.mkdirSync(path.join(ROOT, "ka"), { recursive: true });
    gapNote("ka crosswords home", await S.render(browser, { title: ["საფეხბურთო", "კროსვორდები"], art: S.heroArt(site.hero) }, img("ka", "crosswords", "share.png")));
    fs.mkdirSync(path.join(ROOT, "ka", "crosswords"), { recursive: true });
    write(path.join(ROOT, "ka", "crosswords", "index.html"), kaHomePage());
  }

  const todo = LIST.filter((c) => !ONLY || langOf(c) === ONLY);
  for (const c of todo) {
    const p = readPuzzle(c.folder);
    const ka = langOf(c) === "ka";
    const cells = new Set();
    p.words.forEach((w) => { for (let i = 0; i < w.answer.length; i++) cells.add((w.row + (w.dir === "D" ? i : 0)) + "," + (w.col + (w.dir === "A" ? i : 0))); });
    // clue numbers as on the site: left to right, top to bottom, one number per square where a word starts
    const nums = {}; let n = 0;
    [...p.words].sort((a, b) => a.row - b.row || a.col - b.col).forEach((w) => { const k = w.row + "," + w.col; if (!nums[k]) nums[k] = ++n; });
    const w1 = p.words.find((w) => nums[w.row + "," + w.col] === 1) || p.words[0]; // the first word is shaded, like the site's selected word
    const first = []; for (let i = 0; i < w1.answer.length; i++) first.push((w1.row + (w1.dir === "D" ? i : 0)) + "," + (w1.col + (w1.dir === "A" ? i : 0)));
    gapNote(c.folder, await S.render(browser, { title: twoLines(plain(p.title)), words: plain(p.title).split(" "), art: S.gridArt({ rows: p.rows, cols: p.cols, cells: [...cells].map((k) => k.split(",").map(Number)), nums, first }) }, img(c.folder, "share.png")));
    write(path.join(ROOT, c.folder, "index.html"), puzzlePage(c, p));
  }

  // Sitemap + robots.txt (Georgian pages only once KA_PUBLIC is true)
  {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [SITE, SITE + "en/", SITE + "crosswords/", SITE + "daily/", SITE + "scramble/", SITE + "top5/", SITE + "wordsearch/", ...(KA_PUBLIC ? [SITE + "ka/crosswords/", SITE + "gamoicani-pekhburtelebis-gvarebi/", SITE + "gamoicani-top5/", SITE + "skauti/"] : []), ...LIST.filter((c) => langOf(c) === "en" || KA_PUBLIC).map((c) => SITE + c.folder + "/")]; // daily/ is hand-made
  write(path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") + `\n</urlset>\n`);
  write(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
  }

  await browser.close();
  console.log(ONLY === "ka" ? `Done: ${todo.length} Georgian pages + share images, home tags, sitemap.xml` : `Done: ${todo.length + 1} share images, ${todo.length + 1} pages tagged, sitemap.xml, robots.txt`);
})();
