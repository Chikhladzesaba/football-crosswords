// Share images (1200x630) for the non-crossword games, in each game's color and the site font (FiraGO).
// Run from the repo root:  node tools/build_game_share.js
// Writes: top5/share.png, gamoicani-top5/share.png, scramble/share.png,
//         gamoicani-pekhburtelebis-gvarebi/share.png, skauti/share.png
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const FONT = (n) => "file://" + path.join(ROOT, "fonts", n);

const ICON = {
  top5: `<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5zM7 5.5H3.5v1.5a3.5 3.5 0 0 0 3.5 3.5M17 5.5h3.5v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M7.5 20.5h9M9.5 18h5"/>`,
  scramble: `<rect x="3.5" y="8.5" width="6.5" height="7" rx="1.5"/><rect x="14" y="8.5" width="6.5" height="7" rx="1.5"/><path d="M7 5h10l-2-2M17 19H7l2 2"/>`,
  scout: `<rect x="3.5" y="3.5" width="4.6" height="4.6" rx="1"/><rect x="9.7" y="3.5" width="4.6" height="4.6" rx="1"/><rect x="15.9" y="3.5" width="4.6" height="4.6" rx="1"/><rect x="3.5" y="9.7" width="4.6" height="4.6" rx="1"/><rect x="9.7" y="9.7" width="4.6" height="4.6" rx="1"/><rect x="15.9" y="9.7" width="4.6" height="4.6" rx="1"/><rect x="3.5" y="15.9" width="4.6" height="4.6" rx="1"/><rect x="9.7" y="15.9" width="4.6" height="4.6" rx="1"/><rect x="15.9" y="15.9" width="4.6" height="4.6" rx="1"/>`,
};

// right-hand pictures
function barsArt() {
  const w = [100, 82, 68, 52, 40];
  return `<div class="bars">${w.map((x, i) => `<div class="bar"><span>${i + 1}</span><i style="width:${x}%"></i></div>`).join("")}</div>`;
}
function tilesArt(letters) {
  const rot = [-6, 5, -3, 7, -5, 4];
  return `<div class="tiles"><div class="row">${[...letters].map((c, i) => `<b style="transform:rotate(${rot[i % 6]}deg)">${c}</b>`).join("")}</div>` +
    `<div class="row">${[...letters].map(() => `<u></u>`).join("")}</div></div>`;
}
function gridArt(rows = ["მესიბკ", "რალოზდ", "უგოტნა", "ბენფიკ", "ლკლოპი", "ასტროხ"]) {
  const hit = new Set(["0,0", "0,1", "0,2", "0,3", "4,1", "4,2", "4,3", "4,4", "4,5"]);
  return `<div class="grid">${rows.map((r, ri) => [...r].map((c, ci) => `<b class="${hit.has(ri + "," + ci) ? "hit" : ""}">${c}</b>`).join("")).join("")}</div>`;
}

const GAMES = [
  { out: "top5/share.png", lang: "en", key: "top5", bg: "#c2540a", soft: "#ffeadb", ink: "#7a3300", title: "Guess the Top 5", sub: "Guess the record holders, top scorers and leaders.", cta: "Play", art: barsArt() },
  { out: "gamoicani-top5/share.png", lang: "ka", key: "top5", bg: "#c2540a", soft: "#ffeadb", ink: "#7a3300", title: "გამოიცანი ტოპ 5", sub: "გამოიცანი რეკორდსმენები, ბომბარდირები და ლიდერები.", cta: "ითამაშე", art: barsArt() },
  { out: "scramble/share.png", lang: "en", key: "scramble", bg: "#7a4fd6", soft: "#ece5fb", ink: "#43257f", title: "Name Scramble", sub: "Rearrange the letters and guess the footballers' names", cta: "Play", art: tilesArt("ISEM") },
  { out: "gamoicani-pekhburtelebis-gvarebi/share.png", lang: "ka", key: "scramble", bg: "#7a4fd6", soft: "#ece5fb", ink: "#43257f", title: "დალაგობანა", sub: "დაალაგე ასოები და გამოიცანი ფეხბურთელების გვარები", cta: "ითამაშე", art: tilesArt("ესიმ") },
  { out: "wordsearch/share.png", lang: "en", key: "scout", bg: "#0f7d4a", soft: "#dcf4e7", ink: "#0b5230", title: "Word Search", sub: "Find the footballers, coaches, clubs and other words hidden in the grid", cta: "Play", art: gridArt(["MESIBK", "RALOZD", "UGOTNA", "BENFIC", "LKLOPP", "ASTROH"]) },
  { out: "skauti/share.png", lang: "ka", key: "scout", bg: "#0f7d4a", soft: "#dcf4e7", ink: "#0b5230", title: "სკაუტი", sub: "იპოვე ცხრილში დამალული ფეხბურთელები, მწვრთნელები, გუნდები და სხვა სიტყვები", cta: "ითამაშე", art: gridArt() },
];

function html(g) {
  return `<!doctype html><html lang="${g.lang}"><head><style>
@font-face{font-family:FiraGO;font-weight:400;src:url(${FONT("FiraGO-Regular.woff2")})}
@font-face{font-family:FiraGO;font-weight:500;src:url(${FONT("FiraGO-Medium.woff2")})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:${g.bg};color:#fff;font-family:FiraGO,sans-serif;font-weight:400;display:flex;align-items:center;justify-content:space-between;padding:64px 80px;overflow:hidden}
.text{display:flex;flex-direction:column;gap:26px;max-width:600px}
.brand{display:flex;align-items:center;gap:14px;font-size:26px;font-weight:500;opacity:.9}
.brand span{width:52px;height:52px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center}
.brand svg{width:32px;height:32px;stroke:${g.bg};fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
h1{font-weight:500;font-size:${g.lang === "ka" ? 70 : 82}px;line-height:1.12}
p.sub{font-size:28px;line-height:1.4;opacity:.92}
.cta{align-self:flex-start;font-size:28px;font-weight:500;padding:12px 30px;border-radius:14px;background:#fff;color:${g.ink}}
.bars{width:380px;display:flex;flex-direction:column;gap:16px}
.bar{display:flex;align-items:center;gap:14px}.bar span{width:34px;font-size:28px;font-weight:500}
.bar i{display:block;height:40px;border-radius:10px;background:#fff;opacity:.92}
.tiles{display:flex;flex-direction:column;gap:18px}.tiles .row{display:flex;gap:14px}
.tiles b,.tiles u{width:92px;height:92px;border-radius:18px}
.tiles b{background:#fff;color:${g.bg};font-size:52px;font-weight:500;display:flex;align-items:center;justify-content:center}
.tiles u{background:rgba(255,255,255,.2)}
.grid{display:grid;grid-template-columns:repeat(6,64px);gap:6px}
.grid b{width:64px;height:64px;border-radius:12px;background:rgba(255,255,255,.2);color:#fff;font-size:30px;font-weight:400;display:flex;align-items:center;justify-content:center}
.grid b.hit{background:#fff;color:${g.bg};font-weight:500}
</style></head><body>
<div class="text"><div class="brand"><span><svg viewBox="0 0 24 24">${ICON[g.key]}</svg></span>Kickoff Puzzles</div>
<h1>${g.title}</h1><p class="sub">${g.sub}</p><div class="cta">${g.cta}</div></div>
${g.art}
</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const g of GAMES) {
    const tmp = path.join(ROOT, "fonts", "_game_share.html");
    fs.writeFileSync(tmp, html(g));
    await page.goto("file://" + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, g.out) });
    console.log("wrote", g.out);
  }
  fs.unlinkSync(path.join(ROOT, "fonts", "_game_share.html"));
  await browser.close();
})();
