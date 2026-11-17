// Makes one small page per Top 5 list, so every list has its own link AND its own title when shared.
// Why: WhatsApp, Facebook and Telegram read the <title> and og:title from the page's HTML and do not run JavaScript,
// so "?list=..." can never give a different preview. A separate folder per list can.
// Example: gamoicani-top5/vis-aqvs-la-liga-yvelaze-metjer-mogebuli/index.html
// Each page is a copy of the game page with its own title, link and file paths. It opens that list first; the other 2 rounds stay random.
// The preview picture stays the same for all lists (share.png).
// Run from the site folder after you add or rename a list:   node tools/build_top5_pages.js
// Generated pages: never edit them by hand, change the lists files and run this again.
const fs = require("fs");
const path = require("path");

const SITE = "https://kickoffpuzzles.com";
const GAMES = [
  { folder: "top5", lists: "top5-lists.js", ka: false },
  { folder: "gamoicani-top5", lists: "top5-lists-ka.js", ka: true },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function swap(html, from, to) {
  if (!html.includes(from)) throw new Error("Template changed, cannot find: " + from);
  return html.replace(from, () => to);
}

for (const g of GAMES) {
  global.window = {};
  const file = path.resolve(g.lists);
  delete require.cache[file];
  require(file);
  const LISTS = window.TOP5_LISTS;
  const template = fs.readFileSync(path.join(g.folder, "index.html"), "utf8");

  for (const list of LISTS) {
    const url = `${SITE}/${g.folder}/${list.id}/`;
    const title = esc(list.title);
    let h = template;
    h = swap(h, g.ka ? "<title>გამოიცანი ტოპ 5</title>" : "<title>Guess the Top 5 | Football puzzle</title>",
                g.ka ? `<title>${title} | გამოიცანი ტოპ 5</title>` : `<title>${title} | Guess the Top 5</title>`);
    h = swap(h, `<link rel="canonical" href="${SITE}/${g.folder}/">`, `<link rel="canonical" href="${url}">`);
    h = swap(h, `<meta property="og:url" content="${SITE}/${g.folder}/">`, `<meta property="og:url" content="${url}">`);
    h = h.replace(/(<meta property="og:title" content=")[^"]*(">)/, (_, a, b) => a + title + b);
    h = h.replace(/ *<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n/g, ""); // the language links point to the game start pages, not to this list
    h = h.replace(/(href|src)="\.\.\//g, '$1="../../'); // the page sits one folder deeper
    h = swap(h, `<script src="../../${g.lists}`, `<script>window.TOP5_LIST = ${JSON.stringify(list.id)};</script>\n  <script src="../../${g.lists}`);
    const dir = path.join(g.folder, list.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), h);
  }
  console.log(g.folder + ": " + LISTS.length + " pages");
}
