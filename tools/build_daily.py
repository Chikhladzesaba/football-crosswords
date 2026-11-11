"""Builds the Daily crossword: one small mixed crossword per day, the same for everyone.

Usage:  python3 tools/build_daily.py            (from the repo folder)
Reads   crosswords.js (English puzzles only) and every <folder>/words.txt
Writes  daily/YYYY-MM.js  (one file per month; daily/index.html loads the month it needs)

How a day is picked:
  - Difficulty follows the weekday: Mon/Tue Easy, Wed/Thu Medium, Fri/Sat Hard, Sun Very hard.
  - Clues come from every crossword of that difficulty, least recently used first.
  - Each clue starts with the crossword it comes from ("Lionel Messi: ..."), so "he" and "the club" make sense.
  - No answer twice in one day, and no clue may contain another answer of the same day.
Days that already exist up to tomorrow are never changed, so a player's saved progress stays valid.
Run it again after adding a crossword: only future days are rebuilt, with the new clues in the mix.
"""
import json, random, re, unicodedata
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "daily"
FIRST, LAST = date(2026, 11, 11), date(2027, 12, 31)
LEVEL = {0: "Easy", 1: "Easy", 2: "Medium", 3: "Medium", 4: "Hard", 5: "Hard", 6: "Very hard"}  # Monday = 0
SIZE = {"Easy": 8, "Medium": 9, "Hard": 10, "Very hard": 10}
MAXCOLS, MAXROWS = 11, 13

# ---- the pool: every clue of every English crossword ----
blocks = re.findall(r"\{[^{}]*folder:[^{}]*\}", (ROOT / "crosswords.js").read_text(encoding="utf-8"))
field = lambda b, k: (re.search(k + r':\s*"([^"]*)"', b) or [None, None])[1]
POOL = []
for b in blocks:
    if field(b, "lang") not in (None, "en"):
        continue
    folder, name, level = field(b, "folder"), field(b, "name"), field(b, "difficulty")
    for line in (ROOT / folder / "words.txt").read_text(encoding="utf-8").splitlines():
        if "|" not in line or line.strip().startswith("#"):
            continue
        a, clue = [x.strip() for x in line.split("|", 1)]
        a = a.lstrip("*").strip().upper()
        if a.isascii() and a.isalpha():
            POOL.append({"answer": a, "clue": f"{name}: {clue}", "level": level, "key": f"{folder}/{a}"})


def plain(s):  # "Götze" -> "GOTZE", for comparing answers with clue text
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().upper()


def gives_away(answer, text):
    t = plain(text)
    if re.search(r"\b" + answer + r"\b", t):
        return True
    return len(answer) >= 7 and answer in re.sub(r"[^A-Z]", "", t)  # "Real Madrid" -> REALMADRID


POOL = [c for c in POOL if not gives_away(c["answer"], c["clue"])]  # a clue that names its own answer
POOL = [c for c in POOL if len(c["answer"]) <= MAXCOLS]  # longer answers never fit the small daily grid

# ---- grid layout (same method as layout.py) ----
def fits(grid, w, r, c, d):
    dr, dc = (0, 1) if d == "A" else (1, 0)
    if (r - dr, c - dc) in grid or (r + dr * len(w), c + dc * len(w)) in grid:
        return -1
    cross = 0
    for i, ch in enumerate(w):
        p = (r + dr * i, c + dc * i)
        if p in grid:
            if grid[p][0] != ch or grid[p][1] == d:
                return -1
            cross += 1
        elif (p[0] + dc, p[1] + dr) in grid or (p[0] - dc, p[1] - dr) in grid:
            return -1
    return cross


def place(grid, w, r, c, d):
    dr, dc = (0, 1) if d == "A" else (1, 0)
    for i, ch in enumerate(w):
        p = (r + dr * i, c + dc * i)
        grid[p] = (ch, "X" if p in grid else d)


def too_big(grid, w, r, c, d):
    rs = [p[0] for p in grid] + [r, r + (len(w) - 1 if d == "D" else 0)]
    cs = [p[1] for p in grid] + [c, c + (len(w) - 1 if d == "A" else 0)]
    return max(cs) - min(cs) + 1 > MAXCOLS or max(rs) - min(rs) + 1 > MAXROWS


def build(order, rng):
    grid, placed = {}, []
    place(grid, order[0], 0, 0, "A"); placed.append((order[0], 0, 0, "A"))
    for w in order[1:]:
        opts = []
        for (r, c), (ch, _) in list(grid.items()):
            for i, wc in enumerate(w):
                if wc != ch:
                    continue
                for d in "AD":
                    rr, cc = (r, c - i) if d == "A" else (r - i, c)
                    x = fits(grid, w, rr, cc, d)
                    if x > 0 and not too_big(grid, w, rr, cc, d):
                        opts.append((x, rng.random(), rr, cc, d))
        if not opts:
            return None                # every chosen word must fit
        x, _, rr, cc, d = max(opts)
        place(grid, w, rr, cc, d); placed.append((w, rr, cc, d))
    rs = [p[0] for p in grid]; cs = [p[1] for p in grid]
    h, wd = max(rs) - min(rs) + 1, max(cs) - min(cs) + 1
    crosses = sum(1 for v in grid.values() if v[1] == "X")
    return (crosses, -(h * wd)), placed, min(rs), min(cs), h, wd


def layout(answers, rng, tries=300):
    best = None
    for _ in range(tries):
        order = answers[:]; rng.shuffle(order)
        order.sort(key=len, reverse=True) if rng.random() < .3 else None
        res = build(order, rng)
        if res and (best is None or res[0] > best[0]):
            best = res
    return best


# ---- keep days that already exist up to tomorrow ----
keep_until = date.today() + timedelta(days=1)
days, last_used = {}, {}
for f in sorted(OUT.glob("20*.js")) if OUT.exists() else []:
    old = json.loads(f.read_text(encoding="utf-8").split("=", 1)[1].rstrip().rstrip(";"))
    for iso, p in old.items():
        if date.fromisoformat(iso) <= keep_until:
            days[iso] = p
            for w in p["words"]:
                last_used[w["key"]] = iso


def make_day(d):
    level = LEVEL[d.weekday()]
    rng = random.Random("daily-" + d.isoformat())
    pool = [c for c in POOL if c["level"] == level]
    for attempt in range(400):
        # least recently used first, a little shuffled so days don't repeat the same pattern
        pool.sort(key=lambda c: (last_used.get(c["key"], "0000"), rng.random()))
        pick, seen = [], set()
        for c in pool[: max(40, SIZE[level] * 4) + attempt]:  # widen the search if a day is hard to fill
            if len(pick) == SIZE[level]:
                break
            if rng.random() < .35 or c["answer"] in seen:
                continue
            if any(gives_away(c["answer"], p["clue"]) or gives_away(p["answer"], c["clue"]) for p in pick):
                continue
            pick.append(c); seen.add(c["answer"])
        if len(pick) < SIZE[level]:
            continue
        res = layout([c["answer"] for c in pick], rng)
        if not res:
            continue
        _, placed, r0, c0, h, wd = res
        by = {c["answer"]: c for c in pick}
        words = [{"answer": w, "row": r - r0, "col": c - c0, "dir": dd, "clue": by[w]["clue"], "key": by[w]["key"]}
                 for w, r, c, dd in placed]
        words.sort(key=lambda x: (x["row"], x["col"]))
        for w in words:
            last_used[w["key"]] = d.isoformat()
        return {"level": level, "rows": h, "cols": wd, "words": words}
    raise SystemExit(f"Couldn't build {d}")


d = FIRST
while d <= LAST:
    if d.isoformat() not in days:
        days[d.isoformat()] = make_day(d)
    d += timedelta(days=1)

OUT.mkdir(parents=True, exist_ok=True)
months = {}
for iso in sorted(days):
    months.setdefault(iso[:7], {})[iso] = days[iso]
for m, ds in months.items():
    (OUT / f"{m}.js").write_text(
        "// Generated by tools/build_daily.py. Don't edit by hand.\nwindow.DAILY = "
        + json.dumps(ds, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"{len(POOL)} clues in the pool, {len(days)} days written to {OUT}")
