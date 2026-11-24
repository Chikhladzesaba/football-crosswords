// Raises a file's cache number (the ?v=N in its address) on every page that loads it.
//
// Why: browsers keep copies of files. When you change a file, e.g. nav.js, the number in
// "nav.js?v=11" must go up (to 12), so every visitor downloads the new file instead of the old copy.
//
// How to run it (one time: install Node from nodejs.org; then in the Terminal, from the site folder):
//   node tools/bump_version.js nav.js            raises nav.js?v=11 to nav.js?v=12 everywhere
//   node tools/bump_version.js nav.js --dry      only shows what WOULD change (nothing is saved)
//   node tools/bump_version.js nav.js --to 20    sets the number to 20 instead of "+1"
// Use only the file's name (nav.js, paper.css, top5.js, hub.js ...). Several files at once:
//   node tools/bump_version.js nav.js paper.css
// It looks in every .html and .js file of the site, and prints how many places it changed.
// If the same file has different numbers in different pages, it uses the highest one plus 1.
// Remember: change a file first, then bump it. Do not bump files that did not change.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const toIdx = args.indexOf("--to");
const forced = toIdx > -1 ? parseInt(args[toIdx + 1], 10) : null;
const names = args.filter((a, i) => !a.startsWith("--") && !(toIdx > -1 && i === toIdx + 1));
if (!names.length || (toIdx > -1 && !Number.isInteger(forced))) {
  console.log("Usage: node tools/bump_version.js <file name> [more file names] [--dry] [--to N]");
  process.exit(1);
}

// every .html and .js file of the site (not .git or node_modules)
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|js)$/.test(e.name) && p !== __filename) out.push(p); // skip this file itself: its examples above must stay as written
  }
  return out;
}
const files = walk(ROOT);

for (const name of names) {
  const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\?v=(\\d+)", "g");
  const found = []; // [file, number]
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    for (const m of text.matchAll(re)) found.push([f, m[1]]);
  }
  if (!found.length) { console.log(`${name}: no "${name}?v=N" found, nothing to do.`); continue; }
  const nums = [...new Set(found.map((x) => Number(x[1])))].sort((a, b) => a - b);
  const next = forced != null ? forced : nums[nums.length - 1] + 1;
  const pages = new Set(found.map((x) => x[0]));
  if (nums.length > 1) console.log(`  note: ${name} had different numbers (${nums.join(", ")}); all become ${next}.`);
  if (!dry) {
    for (const f of pages) {
      const text = fs.readFileSync(f, "utf8");
      fs.writeFileSync(f, text.replace(re, `${name}?v=${next}`));
    }
  }
  console.log(`${name}: ?v=${nums[nums.length - 1]} -> ?v=${next} in ${found.length} place(s) on ${pages.size} file(s)${dry ? "  (dry run: nothing saved)" : ""}`);
}
