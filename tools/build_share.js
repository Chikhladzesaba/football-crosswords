// Builds the SEO + sharing parts of the site from crosswords.js:
//   - share.png (1200x630) for the home page and every crossword
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
const BRAND = "Football Crosswords";
const KA_PUBLIC = true; // true = Georgian pages may appear on Google (live since Nov 2026)
const ONLY = (process.argv.indexOf("--lang") > -1) ? process.argv[process.argv.indexOf("--lang") + 1] : null;
const IMAGES_ONLY = process.argv.includes("--images-only"); // only redraw share.png files, leave pages/sitemap alone
const write = (...a) => { if (!IMAGES_ONLY) fs.writeFileSync(...a); };
const langOf = (c) => c.lang || "en";
// Georgian texts (approved by Saba)
const KA = {
  brand: "საფეხბურთო კროსვორდები",
  title: (c) => `${c.name} | საფეხბურთო კროსვორდი`,
  description: (c, level) => `${c.about} საფეხბურთო კროსვორდი, სირთულე: ${level}. შეგიძლია ითამაშო ტელეფონზეც და კომპიუტერზეც.`,
  level: { "Easy": "მარტივი", "Medium": "საშუალო", "Hard": "რთული", "Very hard": "ძალიან რთული" },
  homeTitle: "საფეხბურთო კროსვორდები",
  homeIntro: "აირჩიე თემა, სირთულე, ითამაშე და გაუზიარე მეგობრებს.",
  back: "← ყველა კროსვორდი", across: "ჰორიზონტალურად", down: "ვერტიკალურად",
};
// Cloudflare Web Analytics (cookie-free visit counting). The token is public by design.
const ANALYTICS = `<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3b650f1df19b43698cc1d110b8a5c6dc"}'></script><!-- End Cloudflare Web Analytics -->`;
const ROOT = path.resolve(__dirname, "..");
const FONTS = path.join(ROOT, "fonts"); // FiraGO (site font) used in the images

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
const HOME_ALTERNATES = [["en", SITE], ["ka", SITE + "ka/"], ["x-default", SITE]];
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
const FONT_LINKS = `  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='18' fill='%231f6feb'/><g fill='%23fff'><rect x='12' y='12' width='22' height='22' rx='3'/><rect x='39' y='12' width='22' height='22' rx='3'/><rect x='66' y='12' width='22' height='22' rx='3'/><rect x='12' y='39' width='22' height='22' rx='3'/><rect x='66' y='39' width='22' height='22' rx='3'/><rect x='12' y='66' width='22' height='22' rx='3'/><rect x='39' y='66' width='22' height='22' rx='3'/><rect x='66' y='66' width='22' height='22' rx='3'/></g><circle cx='50' cy='50' r='12' fill='%23fff'/><circle cx='50' cy='50' r='5' fill='%23111'/></svg>">`;

// ---- a puzzle page: head tags + plain text Google can read before the game loads ----
function puzzlePage(c, p) {
  if (langOf(c) === "ka") return puzzlePageKa(c, p);
  const url = SITE + c.folder + "/";
  const title = `${c.name} Crossword | ${BRAND}`;
  const description = `${c.about} A free ${c.difficulty.toLowerCase()} football crossword with ${c.answers} answers. Play on your phone or computer.`;
  const clues = p.words.map((w) => `        <li>${w.clue} (${w.answer.length})</li>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headTags({ title, description, url, image: url + "share.png" })}
${FONT_LINKS}
  <link rel="stylesheet" href="../nav.css?v=5">
  <link rel="stylesheet" href="../crossword.css?v=13">
  ${ANALYTICS}
</head>
<body>
  <script src="../nav.js?v=3"></script>
  <!-- Generated by tools/build_share.js. The game replaces the content below when it loads;
       until then (and for Google) it shows the title, intro and clues as plain text. -->
  <div id="crossword">
    <main>
      <a class="back" href="../">← All crosswords</a>
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
  <script src="../crossword.js?v=5"></script>
</body>
</html>
`;
}

// ---- a Georgian puzzle page: same idea, Georgian texts, clues split into across and down ----
function puzzlePageKa(c, p) {
  const url = SITE + c.folder + "/";
  const level = KA.level[c.difficulty];
  const list = (dir) => p.words.filter((w) => w.dir === dir).map((w) => `        <li>${w.clue} (${w.answer.length})</li>`).join("\n");
  return `<!doctype html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headTags({ title: KA.title(c), description: KA.description(c, level), url, image: url + "share.png", brand: KA.brand, locale: "ka_GE", noindex: !KA_PUBLIC })}
${FONT_LINKS}
  <link rel="stylesheet" href="../nav.css?v=5">
  <link rel="stylesheet" href="../crossword.css?v=13">
  ${ANALYTICS}
</head>
<body>
  <script src="../nav.js?v=3"></script>
  <!-- Generated by tools/build_share.js. The game replaces the content below when it loads;
       until then (and for Google) it shows the title, intro and clues as plain text. -->
  <div id="crossword">
    <main>
      <a class="back" href="../ka/">${KA.back}</a>
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
  <script src="../crossword.js?v=5"></script>
</body>
</html>
`;
}

// ---- the Georgian home page (ka/): cards are drawn by home.js, which sees <html lang="ka"> ----
function kaHomePage() {
  const url = SITE + "ka/";
  return `<!doctype html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headTags({ title: KA.homeTitle, description: KA.homeIntro, url, image: url + "share.png", brand: KA.brand, locale: "ka_GE", noindex: !KA_PUBLIC, alternates: KA_PUBLIC ? HOME_ALTERNATES : [] })}
${FONT_LINKS.replace(/\.\.\//g, "")}
  <link rel="stylesheet" href="../nav.css?v=5">
  <link rel="stylesheet" href="../crossword.css?v=13">
  ${ANALYTICS}
</head>
<body>
  <script src="../nav.js?v=3"></script>
  <!-- Generated by tools/build_share.js. Edit the texts in KA (top of that file), not here. -->
  <main class="narrow">
    <h1>ითამაშე <em>კროსვორდი</em></h1>
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
  <script src="../crosswords.js"></script>
  <script src="../home.js?v=3"></script>
</body>
</html>
`;
}

// grid picture of a real crossword (used on the two home images)
function gridOf(folder) {
  const p = readPuzzle(folder), cells = new Set();
  p.words.forEach((w) => { for (let i = 0; i < w.answer.length; i++) cells.add((w.row + (w.dir === "D" ? i : 0)) + "," + (w.col + (w.dir === "A" ? i : 0))); });
  return { rows: p.rows, cols: p.cols, cells: [...cells].map((k) => k.split(",").map(Number)) };
}

// ---- the share image ----
function imageHtml({ title, sub, cta, grid, lang = "en", filters }) {
  const f = (n) => "file://" + path.join(FONTS, n);
  let gridSvg = "";
  if (grid) {
    const maxW = 380, maxH = 470;
    const cell = Math.floor(Math.min(maxW / grid.cols, maxH / grid.rows));
    const cells = [];
    grid.cells.forEach(([r, c]) => cells.push(`<rect x="${c * cell + 1}" y="${r * cell + 1}" width="${cell - 3}" height="${cell - 3}" rx="${Math.max(2, cell * 0.14)}" />`));
    gridSvg = `<svg class="grid" width="${grid.cols * cell}" height="${grid.rows * cell}">${cells.join("")}</svg>`;
  }
  const icon = `<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>`;
  return `<!doctype html><html lang="${lang}"><head><style>
@font-face { font-family: "FiraGO"; font-weight: 400; src: url(${f("FiraGO-Regular.woff2")}); }
@font-face { font-family: "FiraGO"; font-weight: 500; src: url(${f("FiraGO-Medium.woff2")}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #006aff; color: #fff; font-family: "FiraGO", sans-serif; font-weight: 400;
  display: flex; align-items: center; justify-content: space-between; padding: 64px 80px; overflow: hidden; }
.text { display: flex; flex-direction: column; gap: 26px; max-width: 600px; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 500; opacity: .9; }
.brand span { width: 52px; height: 52px; border-radius: 14px; background: #fff; display: flex; align-items: center; justify-content: center; }
.brand svg { width: 32px; height: 32px; stroke: #006aff; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
h1 { font-weight: 500; font-size: ${lang === "ka" ? 64 : 76}px; line-height: 1.12; }
h1 em { font-style: normal; }
.filters { display: flex; flex-direction: column; gap: 14px; }
.frow { display: flex; flex-wrap: wrap; gap: 10px; }
.frow i { font-style: normal; font-size: 22px; font-weight: 500; padding: 8px 18px; border-radius: 14px; background: rgba(255,255,255,.18); }
p.sub { font-size: 28px; line-height: 1.4; opacity: .92; }
.cta { align-self: flex-start; font-size: 28px; font-weight: 500; padding: 12px 30px; border-radius: 14px; background: #fff; color: #0a3f8f; }
.grid rect { fill: #fff; opacity: .92; }
</style></head><body>
<div class="text"><div class="brand"><span><svg viewBox="0 0 24 24">${icon}</svg></span>Kickoff Puzzles</div>
<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}${filters ? `<div class="filters">${filters.map((r) => `<div class="frow">${r.map((t) => `<i>${t}</i>`).join("")}</div>`).join("")}</div>` : ""}${cta ? `<div class="cta">${cta}</div>` : ""}</div>
${gridSvg}
</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  async function shot(html, out) {
    const tmp = path.join(FONTS, "_share.html");
    fs.writeFileSync(tmp, html);
    await page.goto("file://" + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out });
  }

  // Home page image (skipped with --lang ka) + tags (always, so the hreflang links stay in step)
  if (ONLY !== "ka") await shot(imageHtml({
    title: "Football Crosswords", filters: [["International", "Champions League", "Club football", "Legends"]], grid: gridOf("ballon-dor-winners"),
  }), path.join(ROOT, "share.png"));
  {
  let home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  home = home.replace(/  <title>[\s\S]*?(?=  <link rel="icon")/, headTags({
    title: `${BRAND}: free football crosswords to play online`,
    description: `Free football crosswords on the World Cup, the Champions League, the Premier League, Ballon d'Or winners and more. Pick a difficulty and play on your phone or computer.`,
    url: SITE, image: SITE + "share.png", alternates: KA_PUBLIC ? HOME_ALTERNATES : [],
  }) + "\n");
  if (!home.includes("cloudflareinsights")) home = home.replace("</head>", `  ${ANALYTICS}\n</head>`);
  write(path.join(ROOT, "index.html"), home);
  }

  // One image + page per crossword
  // Georgian home page image + page
  if (ONLY !== "en") {
    fs.mkdirSync(path.join(ROOT, "ka"), { recursive: true });
    await shot(imageHtml({
      title: "საფეხბურთო კროსვორდები", filters: [["ნაკრებები", "ჩემპიონთა ლიგა", "საკლუბო ფეხბურთი", "ლეგენდები"]], lang: "ka", grid: gridOf("ka-euro-2024"),
    }), path.join(ROOT, "ka", "share.png"));
    write(path.join(ROOT, "ka", "index.html"), kaHomePage());
  }

  const todo = LIST.filter((c) => !ONLY || langOf(c) === ONLY);
  for (const c of todo) {
    const p = readPuzzle(c.folder);
    const ka = langOf(c) === "ka";
    const cells = new Set();
    p.words.forEach((w) => { for (let i = 0; i < w.answer.length; i++) cells.add((w.row + (w.dir === "D" ? i : 0)) + "," + (w.col + (w.dir === "A" ? i : 0))); });
    await shot(imageHtml({
      title: p.title, sub: c.about, cta: ka ? "ითამაშე" : "Play", lang: ka ? "ka" : "en",
      grid: { rows: p.rows, cols: p.cols, cells: [...cells].map((k) => k.split(",").map(Number)) },
    }), path.join(ROOT, c.folder, "share.png"));
    write(path.join(ROOT, c.folder, "index.html"), puzzlePage(c, p));
  }

  // Sitemap + robots.txt (Georgian pages only once KA_PUBLIC is true)
  {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [SITE, SITE + "daily/", SITE + "scramble/", ...(KA_PUBLIC ? [SITE + "ka/", SITE + "gamoicani-pekhburtelebis-gvarebi/"] : []), ...LIST.filter((c) => langOf(c) === "en" || KA_PUBLIC).map((c) => SITE + c.folder + "/")]; // daily/ is hand-made
  write(path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") + `\n</urlset>\n`);
  write(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
  }

  await browser.close();
  console.log(ONLY === "ka" ? `Done: ${todo.length} Georgian pages + share images, home tags, sitemap.xml` : `Done: ${todo.length + 1} share images, ${todo.length + 1} pages tagged, sitemap.xml, robots.txt`);
})();
