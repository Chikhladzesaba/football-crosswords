// Makes a page address (slug) from Georgian text, and checks that the site's folder names follow the slug rules.
//
// Why: new Georgian pages get the Georgian words written in Latin letters (a fixed letter table), and it is easy to
// mistype a letter (kh or x, f or p). This script does it the same way every time. It never changes any file.
// The full rules are in the project document football-crosswords/slug-rules.md.
//
// How to run it (one time: install Node from nodejs.org; then in the Terminal, from the site folder):
//   node tools/slug.js "ყველა თამაში"     prints  yvela-tamashi  and says if that folder name is still free
//   node tools/slug.js "World Cup Hosts"   works for English too (lowercase, hyphens)  ->  world-cup-hosts
//   node tools/slug.js --check             looks at every page folder and lists names that break the rules
//
// The rules it uses: lowercase letters and digits only, words separated by one hyphen, no hyphen at the start or end.
// Reserved names (solved, days, kb, autocheck) are refused too. See RESERVED below.
// Old folder names are never renamed, so --check only reports; it does not touch anything.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Georgian letter -> Latin letters (agreed with Saba, 25 Nov 2026).
const TABLE = {
  "ა": "a", "ბ": "b", "გ": "g", "დ": "d", "ე": "e", "ვ": "v", "ზ": "z", "თ": "t", "ი": "i",
  "კ": "k", "ლ": "l", "მ": "m", "ნ": "n", "ო": "o", "პ": "p", "ჟ": "zh", "რ": "r", "ს": "s",
  "ტ": "t", "უ": "u", "ფ": "f", "ქ": "k", "ღ": "gh", "ყ": "y", "შ": "sh", "ჩ": "ch", "ც": "ts",
  "ძ": "dz", "წ": "ts", "ჭ": "ch", "ხ": "kh", "ჯ": "j", "ჰ": "h",
};

function makeSlug(text) {
  const unknown = new Set();
  let out = "";
  for (const ch of text.normalize("NFC")) {
    if (TABLE[ch]) out += TABLE[ch];
    else if (/[a-zA-Z0-9]/.test(ch)) out += ch.toLowerCase();
    else if (/[̀-ͯ]/.test(ch)) continue; // loose accent marks are dropped
    else {
      // an accented Latin letter (é, ü ...) becomes its plain letter; anything else counts as a word break
      const plain = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (plain !== ch && /^[a-zA-Z]$/.test(plain)) out += plain.toLowerCase();
      else {
        if (!/[\s\-_.,:;!?'"’“”()/&+|]/.test(ch)) unknown.add(ch);
        out += "-";
      }
    }
  }
  return { slug: out.replace(/-+/g, "-").replace(/^-|-$/g, ""), unknown: [...unknown] };
}

// Names a crossword folder must never have. A puzzle saves its progress under "crossword:<folder>", and the site
// keeps its own settings under "crossword:solved", "crossword:days", "crossword:kb" and "crossword:autocheck".
// A folder with one of these names would overwrite those settings in the visitor's browser.
const RESERVED = new Set(["solved", "days", "kb", "autocheck"]);

// Folders that are not pages (and so not slugs).
const NOT_PAGES = new Set(["fonts", "tools", "node_modules"]);
function pageFolders() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !NOT_PAGES.has(d.name))
    .map((d) => d.name);
}

const SLUG_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log('Usage:\n  node tools/slug.js "Georgian or English title"   makes a slug and checks it is free\n  node tools/slug.js --check                        lists folder names that break the rules');
  process.exit(0);
}

if (args[0] === "--check") {
  const folders = pageFolders();
  const bad = folders.filter((f) => !SLUG_OK.test(f) || RESERVED.has(f));
  console.log(folders.length + " page folders checked.");
  if (bad.length === 0) console.log("All names follow the rules (lowercase letters and digits, single hyphens).");
  else { console.log("These break the rules:"); bad.forEach((f) => console.log("  " + f)); process.exitCode = 1; }
} else {
  const text = args.join(" ");
  const { slug, unknown } = makeSlug(text);
  if (!slug) { console.log("Nothing left after converting. Is the text empty?"); process.exit(1); }
  console.log(slug);
  const taken = fs.existsSync(path.join(ROOT, slug));
  if (RESERVED.has(slug)) console.log("RESERVED: " + slug + " is used for saved settings in the browser. Choose another name.");
  if (!RESERVED.has(slug)) console.log(taken ? "TAKEN: a folder named " + slug + " already exists. Choose another name." : "Free: no folder with this name yet.");
  if (!SLUG_OK.test(slug)) console.log("Warning: this does not match the slug rules.");
  const words = slug.split("-").length;
  if (words > 5) console.log("Note: " + words + " words. The rule is 2 to 5 words, so consider a shorter name.");
  if (unknown.length) console.log("Note: these characters were treated as word breaks: " + unknown.join(" "));
}
