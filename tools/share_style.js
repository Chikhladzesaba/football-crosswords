// ONE place that defines how every share image (1200x630) looks: the newspaper style of the site.
// Both build_game_share.js (All pages + Top 5 / Scramble / Word Search) and build_share.js (Crosswords home + every puzzle)
// draw their images with this file, so the old coloured look cannot come back by re-running a script.
//
// Style: paper background with a light grain, black ink only (grey #DAD8D3 for soft fills), hand-drawn outlines (rough filter),
// small ball logo + "Kickoff Puzzles" top left, a big two-line title on the left, one illustration on the right. Nothing else.
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const FONT = (n) => "file://" + path.join(ROOT, "fonts", "paper", n);

const PAPER = "#F0EFEC", INK = "#1c1a17", GREY = "#DAD8D3";
const isKa = (s) => /[Ⴀ-ჿᲐ-Ჿ]/.test(s);

// the paper grain, copied from paper.css (body::before)
const GRAIN = "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27240%27%20height%3D%27240%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%27.75%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27/%3E%3CfeColorMatrix%20values%3D%270%200%200%200%20.3%20%200%200%200%200%20.3%20%200%200%200%200%20.3%20%200%200%200%20.5%20-.12%27/%3E%3C/filter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url%28%23n%29%27/%3E%3C/svg%3E\")";

// the wobble filter from paper.js
const ROUGH = '<svg width="0" height="0" style="position:absolute"><filter id="kp-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>' +
  '<filter id="kp-rough-s" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3"/></filter></svg>';

const BALL_LOGO = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"/><path d="M24 17l6 4.4-2.3 7h-7.4l-2.3-7z" fill="' + INK + '"/><path d="M24 17V5M30 21.4L41 18M27.7 28.4L34 38M20.3 28.4L14 38M18 21.4L7 18"/></svg>';

// ---------- The page around every image ----------
// title: array of lines (two lines; a single word stays on one line). art: html string for the right side.
function page({ title, art, artWidth }) {
  const ka = title.some(isKa);
  const size = ka ? 76 : 112;
  const family = ka ? '"Georgian Caps","FiraGO Title","Ranchers",sans-serif' : '"Ranchers","Georgian Caps","FiraGO Title",sans-serif';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Ranchers";src:url(${FONT("ranchers.woff2")})}
@font-face{font-family:"Georgian Caps";src:url(${FONT("noto-sans-georgian-bold.woff2")})}
@font-face{font-family:"FiraGO Title";src:url(${FONT("firago-bold.woff2")})}
@font-face{font-family:"Poppins";font-weight:500;src:url(${FONT("poppins-500.woff2")})}
*{margin:0;box-sizing:border-box}
:root{--ink:${INK};--card:${PAPER};--sk-a:${GREY};--sk-b:${GREY};--display:"Ranchers","Georgian Caps","FiraGO Title",sans-serif}
body{width:1200px;height:630px;background:${PAPER};color:${INK};position:relative;overflow:hidden}
body::after{content:"";position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;opacity:.16;background-image:${GRAIN}}
.brand{position:absolute;left:64px;top:44px;display:flex;align-items:center;gap:14px;font:400 34px/1 "Ranchers"}
.brand svg{width:36px;height:36px;fill:none;stroke:${INK};stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
h1{position:absolute;left:64px;top:50%;transform:translateY(-50%);font:400 ${size}px/${ka ? 1.12 : 0.98} ${family};letter-spacing:${ka ? 0 : "-.01em"};white-space:nowrap}
.art{position:absolute;right:64px;top:50%;transform:translateY(-50%);${artWidth ? "width:" + artWidth + "px;" : ""}}
.art svg{display:block;overflow:visible;fill:none;stroke:${INK};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:url(#kp-rough)}
</style></head><body>${ROUGH}
<div class="brand">${BALL_LOGO}Kickoff Puzzles</div>
<h1>${title.join("<br>")}</h1>
<div class="art">${art}</div>
</body></html>`;
}

// ---------- Illustrations (hand-drawn look: 3px ink outlines, wobble from the rough filter) ----------
const GEO_FONT = "'Georgian Caps','FiraGO Title','Ranchers',sans-serif";
const letterFont = (s) => (isKa(s) ? GEO_FONT : "'Ranchers',sans-serif");

// five numbered circles with hatched bars
function top5Art() {
  const w = [350, 340, 290, 220, 150];
  let o = '<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V7" stroke="' + INK + '" stroke-width="1.6"/></pattern></defs>';
  w.forEach((x, i) => {
    const y = 8 + i * 62;
    o += `<circle cx="24" cy="${y + 24}" r="23" fill="${PAPER}"/><text x="24" y="${y + 34}" text-anchor="middle" font-size="28" stroke="none" fill="${INK}" style="font-family:'Ranchers'">${i + 1}</text>`;
    o += `<rect x="64" y="${y + 4}" width="${x}" height="40" rx="5" fill="url(#hatch)" stroke-width="3"/>`;
  });
  return `<svg width="440" height="322" viewBox="0 0 440 322">${o}</svg>`;
}

// four tilted letter tiles with a hard shadow, four dashed empty slots under them
function scrambleArt(letters) {
  const rot = [-4, 3, -2, 4];
  const f = letterFont(letters);
  let o = "";
  [...letters].forEach((ch, i) => {
    const x = 10 + i * 108;
    o += `<g transform="rotate(${rot[i]} ${x + 46} 52)"><rect x="${x + 5}" y="9" width="92" height="98" rx="9" fill="${INK}" stroke="none"/><rect x="${x}" y="4" width="92" height="98" rx="9" fill="${PAPER}"/>` +
      `<text x="${x + 46}" y="${ch.match(/[Ⴀ-ჿ]/) ? 78 : 80}" text-anchor="middle" font-size="62" stroke="none" fill="${INK}" style="font-family:${f}">${ch}</text></g>`;
    o += `<rect x="${x}" y="142" width="92" height="98" rx="9" stroke-dasharray="7 6" stroke-width="2.6"/>`;
  });
  return `<svg width="440" height="248" viewBox="0 0 440 248">${o}</svg>`;
}

// 6x6 letter grid with a few grey highlighted cells
function wordsearchArt(rows, hits) {
  const c = 62, n = 6, p = 10, size = n * c + 2 * p;
  const f = letterFont(rows.join(""));
  const hit = new Set(hits.map((h) => h.join(",")));
  let o = `<rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="8" fill="${PAPER}"/><rect x="${p - 2}" y="${p - 2}" width="${n * c + 4}" height="${n * c + 4}" rx="4" stroke-width="1.8" fill="none"/>`;
  rows.forEach((r, ri) => [...r].forEach((ch, ci) => {
    const x = p + ci * c, y = p + ri * c;
    o += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${hit.has(ri + "," + ci) ? GREY : "none"}" stroke-width="1.6" opacity="1"/>`;
    o += `<text x="${x + c / 2}" y="${y + 43}" text-anchor="middle" font-size="31" stroke="none" fill="${INK}" style="font-family:${f}">${ch}</text>`;
  }));
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${o}</svg>`;
}

// the real grid of one crossword as outlined cells
function gridArt(grid) {
  const maxW = 440, maxH = 470;
  const cell = Math.floor(Math.min(maxW / grid.cols, maxH / grid.rows));
  const cells = grid.cells.map(([r, c]) => `<rect x="${c * cell + 2}" y="${r * cell + 2}" width="${cell - 4}" height="${cell - 4}" rx="${Math.max(2, cell * 0.12)}" fill="${PAPER}" stroke-width="2.6"/>`);
  return `<svg width="${grid.cols * cell}" height="${grid.rows * cell}" viewBox="0 0 ${grid.cols * cell} ${grid.rows * cell}">${cells.join("")}</svg>`;
}

// ---------- Drawings that live in paper.js (read from the real site so they can never drift) ----------
function serve() {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml" };
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split("?")[0]);
    let f = path.join(ROOT, u);
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok(srv)));
}

// returns { hero, all: {en:[4 svgs], ka:[4 svgs]} } drawn by the site's own paper.js
async function siteArt(browser) {
  const srv = await serve();
  const base = "http://127.0.0.1:" + srv.address().port;
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const out = { all: {} };
  for (const [lang, url] of [["en", "/"], ["ka", "/ka/"]]) {
    await page.goto(base + url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.KPArt);
    out.all[lang] = await page.evaluate(() => ["hub:crosswords", "hub:top5", "hub:scramble", "hub:wordsearch"].map((t) => window.KPArt.feature(t).innerHTML));
    if (lang === "en") out.hero = await page.evaluate(() => window.KPArt.hero().innerHTML);
  }
  await page.close(); srv.close();
  return out;
}

// the four game drawings in a 2x2 grid (All pages)
function allArt(svgs) {
  const cell = (s) => s.replace("<svg", '<svg width="250" height="175"');
  return `<div style="display:grid;grid-template-columns:repeat(2,250px);gap:14px 18px;width:518px">${svgs.map(cell).join("")}</div>`;
}
// the crossword + ball + pencil drawing (Crosswords home)
function heroArt(svg) { return svg.replace("<svg", '<svg width="420" height="340"'); }

// ---------- Drawing the png ----------
async function render(browser, spec, out) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const tmp = path.join(os.tmpdir(), "kp_share_" + process.pid + ".html");
  fs.writeFileSync(tmp, page_(spec));
  await page.goto("file://" + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  // gap in pixels between the title and the picture (negative = they overlap)
  const measure = () => page.evaluate(() => { const h = document.querySelector("h1").getBoundingClientRect(), a = document.querySelector(".art").getBoundingClientRect(); return Math.round(a.left - h.right); });
  let gap = await measure();
  // a puzzle title (spec.words) breaks after the first word; if that runs into the picture, try the other places to break it and keep the best
  if (spec.words && spec.words.length > 2 && gap < 24) {
    let best = { gap, html: null };
    for (let k = 2; k < spec.words.length; k++) {
      const html = [spec.words.slice(0, k).join(" "), spec.words.slice(k).join(" ")].join("<br>");
      await page.evaluate((h) => { document.querySelector("h1").innerHTML = h; }, html);
      const g = await measure();
      if (g > best.gap) best = { gap: g, html };
    }
    await page.evaluate((h) => { if (h) document.querySelector("h1").innerHTML = h; }, best.html);
    gap = best.gap;
  }
  // last resort for very long Georgian words: one word per line (three lines) instead of a smaller title
  if (spec.words && spec.words.length >= 3 && spec.words.length <= 4 && gap < 24) {
    const before = await page.evaluate(() => document.querySelector("h1").innerHTML);
    await page.evaluate((h) => { document.querySelector("h1").innerHTML = h; }, spec.words.join("<br>"));
    const g = await measure();
    if (g > gap) gap = g; else await page.evaluate((h) => { document.querySelector("h1").innerHTML = h; }, before);
  }
  // the title keeps its size; if it still runs into the picture, the picture gets smaller (not below 55%)
  if (gap < 24) {
    await page.evaluate(() => { const a = document.querySelector(".art"); a.style.transformOrigin = "right center"; });
    const w = await page.evaluate(() => document.querySelector(".art").getBoundingClientRect().width);
    const f = Math.max(0.55, (w + gap - 24) / w);
    await page.evaluate((f) => { document.querySelector(".art").style.transform = "translateY(-50%) scale(" + f + ")"; }, f);
    gap = await measure();
  }
  await page.screenshot({ path: out });
  await page.close(); fs.unlinkSync(tmp);
  return gap; // pixels between title and picture (negative = overlap)
}
const page_ = page;

module.exports = { ROOT, PAPER, INK, GREY, isKa, page, render, siteArt, top5Art, scrambleArt, wordsearchArt, gridArt, allArt, heroArt };
