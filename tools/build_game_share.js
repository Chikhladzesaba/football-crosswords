// Share images (1200x630) for the All pages and the three other games (Top 5, Scramble, Word Search), EN + KA.
// They all use the newspaper style defined in tools/share_style.js (the only place that decides how an image looks).
// Run from the repo root:  node tools/build_game_share.js
// Writes: share.png, ka/share.png                                     (the All pages)
//         top5/share.png, gamoicani-top5/share.png
//         scramble/share.png, gamoicani-pekhburtelebis-gvarebi/share.png
//         wordsearch/share.png, skauti/share.png
// The Crosswords home images and all crossword puzzle images are made by tools/build_share.js.
const path = require("path");
const { chromium } = require("playwright");
const S = require("./share_style");

const HITS_EN = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [4, 1], [4, 2], [4, 3], [4, 4]]; // MESSI and another word
const HITS_KA = [[0, 0], [0, 1], [0, 2], [0, 3], [4, 1], [4, 2], [4, 3], [4, 4]];       // მესი and another word
const ROWS_EN = ["MESSIK", "RALOZD", "UGOTNA", "BENFIC", "LKLOPP", "ASTROH"];
const ROWS_KA = ["მესიბკ", "რალოზდ", "უგოტნა", "ბენფიკ", "ლკლოპი", "ასტროხ"];

(async () => {
  const browser = await chromium.launch();
  const site = await S.siteArt(browser);
  const GAMES = [
    { out: "share.png", title: ["Kickoff", "Puzzles"], art: S.allArt(site.all.en) },
    { out: "ka/share.png", title: ["Kickoff", "Puzzles"], art: S.allArt(site.all.ka) },
    { out: "top5/share.png", title: ["Guess the", "Top 5"], art: S.top5Art() },
    { out: "gamoicani-top5/share.png", title: ["გამოიცანი", "ტოპ 5"], art: S.top5Art() },
    { out: "scramble/share.png", title: ["Name", "Scramble"], art: S.scrambleArt("SEMIS") },
    { out: "gamoicani-pekhburtelebis-gvarebi/share.png", title: ["დალაგობანა"], art: S.scrambleArt("ესიმ") },
    { out: "wordsearch/share.png", title: ["Word", "Search"], art: S.wordsearchArt(ROWS_EN, HITS_EN) },
    { out: "skauti/share.png", title: ["სკაუტი"], art: S.wordsearchArt(ROWS_KA, HITS_KA) },
  ];
  const only = process.argv[2] === "--out" ? process.argv[3] : null; // optional: write the files into another folder (for checking)
  for (const g of GAMES) {
    const out = path.join(only || S.ROOT, g.out);
    require("fs").mkdirSync(path.dirname(out), { recursive: true });
    const gap = await S.render(browser, g, out);
    console.log("wrote", g.out, gap < 24 ? "  !! title is close to the picture (" + gap + "px)" : "");
  }
  await browser.close();
})();
