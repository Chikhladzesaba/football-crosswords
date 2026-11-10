"""Builds a crossword's puzzle.js from a simple words.txt file.

Usage:  python3 layout.py world-cup-winners
Reads   world-cup-winners/words.txt
Writes  world-cup-winners/puzzle.js   (generated: never edit it by hand, edit words.txt and run again)

words.txt looks like this:
    title: World Cup <em>Winners</em>     (words in <em> get the italic serif, like "Guess <em>the Player</em>")
    intro: Every nation that has ever won the men's World Cup. 8 answers.
    note: Unofficial fan game. Covers every World Cup from 1930 to 2026.
    maxcols: 12     (optional: widest the grid may be, so squares stay big enough on phones; default 12)
    maxrows: 15     (optional: tallest the grid may be; default 15)
    BRAZIL | The only nation with five titles...
    ITALY | Four-time champions...
    *MESSI | ...    (a * in front = must include: placed first, never left out if it can fit at all)
Answers: letters only, no spaces (write "REALMADRID", not "Real Madrid").
"""
import json, random, sys
from pathlib import Path

folder = Path(sys.argv[1])
meta, clues, MUST = {}, {}, set()
for line in (folder / "words.txt").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    if "|" in line:
        answer, clue = [x.strip() for x in line.split("|", 1)]
        answer = answer.upper() if answer.isascii() else answer   # Georgian stays as typed (no Mtavruli)
        if answer.startswith("*"):
            answer = answer[1:].strip(); MUST.add(answer)
        if not answer.isalpha():
            sys.exit(f"Answer must be letters only: {answer!r}")
        clues[answer] = clue
    elif ":" in line:
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip()
WORDS = list(clues)
MAXCOLS = int(meta.get("maxcols", 12))
MAXROWS = int(meta.get("maxrows", 15))


def fits(grid, w, r, c, d):
    dr, dc = (0, 1) if d == "A" else (1, 0)
    if (r - dr, c - dc) in grid or (r + dr * len(w), c + dc * len(w)) in grid:
        return -1                      # the squares just before and after must be empty
    cross = 0
    for i, ch in enumerate(w):
        p = (r + dr * i, c + dc * i)
        if p in grid:
            if grid[p][0] != ch or grid[p][1] == d:
                return -1
            cross += 1
        elif (p[0] + dc, p[1] + dr) in grid or (p[0] - dc, p[1] - dr) in grid:
            return -1                  # touching side by side would make fake words
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
            continue                   # this word doesn't fit this time; try the rest
        x, _, rr, cc, d = max(opts)
        place(grid, w, rr, cc, d); placed.append((w, rr, cc, d))
    rs = [p[0] for p in grid]; cs = [p[1] for p in grid]
    h, wd = max(rs) - min(rs) + 1, max(cs) - min(cs) + 1
    if wd > MAXCOLS or h > MAXROWS:
        return None                    # too big for a phone screen
    crosses = sum(1 for v in grid.values() if v[1] == "X")
    musts = sum(1 for p in placed if p[0] in MUST)
    # prefer: all must-haves placed, then more words, then more crossings, then a smaller grid
    return (musts, len(placed), crosses, -(h * wd)), placed, min(rs), min(cs), h, wd


best, rng = None, random.Random(1)     # fixed seed: same words.txt always gives the same grid
for _ in range(20000):
    must = [w for w in WORDS if w in MUST]; rest = [w for w in WORDS if w not in MUST]
    rng.shuffle(must); rng.shuffle(rest)
    order = must + rest                # must-haves go into the grid first
    res = build(order, rng)
    if res and (best is None or res[0] > best[0]):
        best = res
if not best:
    sys.exit("Couldn't fit every word into one connected grid within maxcols x maxrows. Try removing or swapping a word.")

_, placed, r0, c0, h, wd = best
left_out = [w for w in WORDS if w not in {p[0] for p in placed}]
words = [{"answer": w, "row": r - r0, "col": c - c0, "dir": d, "clue": clues[w]} for w, r, c, d in placed]
words.sort(key=lambda x: (x["row"], x["col"]))
puzzle = {"id": folder.name, "title": meta.get("title", folder.name),
          "intro": meta.get("intro", ""), "note": meta.get("note", ""),
          "rows": h, "cols": wd, "words": words}
if meta.get("lang"):
    puzzle["lang"] = meta["lang"]   # e.g. lang: ka → Georgian labels and font in crossword.js

out = "// Generated by layout.py from words.txt. Don't edit by hand: change words.txt and run layout.py again.\n"
out += "window.PUZZLE = " + json.dumps(puzzle, ensure_ascii=False, indent=2) + ";\n"
(folder / "puzzle.js").write_text(out, encoding="utf-8")

g = [["·"] * wd for _ in range(h)]
for w in words:
    for i, ch in enumerate(w["answer"]):
        g[w["row"] + (i if w["dir"] == "D" else 0)][w["col"] + (i if w["dir"] == "A" else 0)] = ch
print("\n".join(" ".join(row) for row in g))
print(f"\n{len(words)} words, grid {h} rows x {wd} columns -> {folder / 'puzzle.js'}")
if left_out:
    print("LEFT OUT (didn't fit):", ", ".join(left_out))
missing = [w for w in left_out if w in MUST]
if missing:
    print("WARNING: must-have answers left out:", ", ".join(missing))
