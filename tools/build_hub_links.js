// Puts a plain list of links to every crossword into /crosswords/ and /ka/crosswords/ (inside <ul id="list">).
// Why: those pages draw their cards with JavaScript, so Google can see an empty page. These links are real content for Google.
// home.js replaces the whole <ul id="list"> when the page loads, so visitors never see this plain list.
// Run it after you add or rename a crossword in crosswords.js:  node tools/build_hub_links.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const win = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "crosswords.js"), "utf8"), { window: win });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pages = [{ file: "crosswords/index.html", lang: "en" }, { file: "ka/crosswords/index.html", lang: "ka" }];
for (const p of pages) {
  const items = win.CROSSWORDS.filter((c) => (c.lang || "en") === p.lang)
    .map((c) => `<li><a href="/${c.folder}/">${esc(c.name)}</a>${c.about ? " - " + esc(c.about) : ""}</li>`).join("\n      ");
  const f = path.join(ROOT, p.file);
  const html = fs.readFileSync(f, "utf8");
  const re = /<ul class="list" id="list">[\s\S]*?<\/ul>/;
  if (!re.test(html)) { console.error("No <ul id=list> in " + p.file); process.exit(1); }
  fs.writeFileSync(f, html.replace(re, `<ul class="list" id="list">\n      ${items}\n    </ul>`));
  console.log(p.file + ": " + win.CROSSWORDS.filter((c) => (c.lang || "en") === p.lang).length + " links");
}
