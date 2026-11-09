import itertools, json, random

WORDS = ["ARGENTINA", "URUGUAY", "GERMANY", "ENGLAND", "BRAZIL", "FRANCE", "ITALY", "SPAIN"]

def fits(grid, w, r, c, d):
    dr, dc = (0, 1) if d == "A" else (1, 0)
    # cell before and after must be empty
    if (r - dr, c - dc) in grid or (r + dr * len(w), c + dc * len(w)) in grid:
        return -1
    cross = 0
    for i, ch in enumerate(w):
        p = (r + dr * i, c + dc * i)
        if p in grid:
            if grid[p][0] != ch or grid[p][1] == d:
                return -1
            cross += 1
        else:
            # side neighbours must be empty (no accidental words)
            s1 = (p[0] + dc, p[1] + dr); s2 = (p[0] - dc, p[1] - dr)
            if s1 in grid or s2 in grid:
                return -1
    return cross

def place(grid, w, r, c, d):
    dr, dc = (0, 1) if d == "A" else (1, 0)
    for i, ch in enumerate(w):
        p = (r + dr * i, c + dc * i)
        if p in grid: grid[p] = (ch, "X")
        else: grid[p] = (ch, d)

def build(order, rng):
    grid, placed = {}, []
    w0 = order[0]; place(grid, w0, 0, 0, "A"); placed.append((w0, 0, 0, "A"))
    for w in order[1:]:
        opts = []
        for (r, c), (ch, _) in list(grid.items()):
            for i, wc in enumerate(w):
                if wc != ch: continue
                for d in "AD":
                    rr, cc = (r, c - i) if d == "A" else (r - i, c)
                    x = fits(grid, w, rr, cc, d)
                    if x > 0: opts.append((x, rng.random(), rr, cc, d))
        if not opts: return None
        opts.sort(reverse=True)
        x, _, rr, cc, d = opts[0]
        place(grid, w, rr, cc, d); placed.append((w, rr, cc, d))
    rs = [p[0] for p in grid]; cs = [p[1] for p in grid]
    h, wdt = max(rs) - min(rs) + 1, max(cs) - min(cs) + 1
    crosses = sum(1 for v in grid.values() if v[1] == "X")
    return (crosses, -max(h, wdt), -(h * wdt)), placed, min(rs), min(cs), h, wdt

best = None
rng = random.Random(1)
for _ in range(20000):
    order = WORDS[:]; rng.shuffle(order)
    res = build(order, rng)
    if res and (best is None or res[0] > best[0]): best = res
score, placed, r0, c0, h, w = best
print("score", score, "size", h, "x", w)
out = [{"word": wd, "row": r - r0, "col": c - c0, "dir": d} for wd, r, c, d in placed]
g = [["#"] * w for _ in range(h)]
for o in out:
    for i, ch in enumerate(o["word"]):
        rr = o["row"] + (i if o["dir"] == "D" else 0); cc = o["col"] + (i if o["dir"] == "A" else 0)
        g[rr][cc] = ch
print("\n".join(" ".join(x) for x in g))
json.dump(out, open("layout.json", "w"))
print(json.dumps(out))
