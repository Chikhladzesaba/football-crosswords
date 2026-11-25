// Ball Control Test: tap the ball to keep it in the air. One file for both languages (reads <html lang>). Texts are in NAME and T below.
(() => {
  // ---- Texts. Change the game name here (one line per language). ----
  const NAME = { en: "Ball Control Test", ka: "ბურთის ფლობის ტესტი" };
  const T = {
    en: { start: "Tap the ball to start", hint: "Tap the ball to keep it in the air. Tap its left side to send it right.", over: "Ball dropped :(", score: "touches", best: "Best", again: "Play again", pops: ["Nice!", "Great!", "Wow!", "Legend!"] },
    ka: { start: "", hint: "დაკლიკე ბურთს და დაიწყე. მთავარია, ბურთი არ დაგივარდეს! რაც უფრო შორს წახვალ, თამაში უფრო გართულდება. აბა, შენ იცი!", over: "ბურთი დაგივარდა :(", score: "შეხება", best: "რეკორდი", again: "ითამაშე თავიდან", pops: ["კარგია!", "შესანიშნავია!", "ყოჩაღ!", "უჰ!"] }
  };
  const MILESTONES = [10, 25, 50, 100];
  const lang = document.documentElement.lang === "ka" ? "ka" : "en"; let best = 0;
  try { best = +localStorage.getItem("kp-ball-best") || 0; } catch (e) {}

  const $ = (id) => document.getElementById(id);
  const bgc = $("bt-bg"), bctx = bgc.getContext("2d"), cv = $("bt-c"), ctx = cv.getContext("2d");
  const COL = { ink: "", soft: "", paper: "" }; // colours are read once, not on every frame
  const readColors = () => { const cs = getComputedStyle(document.documentElement); for (const k in COL) COL[k] = cs.getPropertyValue("--" + k).trim(); };
  readColors();
  let W = 0, H = 0, r = 24;
  const ball = { x: 0, y: 0, vx: 0, vy: 0, rot: 0 };
  let state = "ready", score = 0, last = 0, sparks = [], pops = [];

  function ui() {
    const t = T[lang];
    document.documentElement.lang = lang;
    $("bt-name").textContent = NAME[lang];
    $("bt-hint").textContent = state === "ready" ? (t.start ? t.start + ". " : "") + t.hint : "";
    $("bt-best").textContent = best ? t.best + ": " + best : "";
    $("bt-score").innerHTML = state === "ready" ? "" : score + "<small>" + t.score + "</small>";
    $("bt-intro").hidden = state !== "ready";
    $("bt-card").hidden = state !== "over";
    if (state === "over") { $("bt-overTitle").textContent = t.over; $("bt-overScore").textContent = score; $("bt-overBest").textContent = t.score + " · " + t.best + ": " + best; $("bt-again").textContent = t.again; }
  }

  // ---- Ground: striped pitch strip in the site's ink style ----
  let groundY = 0;
  function star(c, x, y, s, fill) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, -9); c.lineTo(2.2, -2.2); c.lineTo(9, 0); c.lineTo(2.2, 2.2); c.lineTo(0, 9); c.lineTo(-2.2, 2.2); c.lineTo(-9, 0); c.lineTo(-2.2, -2.2); c.closePath(); c.fillStyle = fill; c.fill(); c.restore(); }
  function drawField() {
    const ink = COL.ink, soft = COL.soft, c = bctx;
    c.clearRect(0, 0, W, H); c.lineWidth = 2; c.strokeStyle = ink; c.lineCap = c.lineJoin = "round";
    c.fillStyle = COL.paper; c.fillRect(0, groundY, W, H - groundY);
    const n = 4, bh = (H - groundY) / n; c.fillStyle = soft; for (let i = 1; i < n; i += 2) c.fillRect(0, groundY + i * bh, W, bh + 1); // mown stripes run across the pitch
    // hand-drawn look without a screen filter (a filter on a full-screen canvas can slow phones down)
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
    const wob = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => c[i ? "lineTo" : "moveTo"](x + rnd() * 1.6, y + rnd() * 1.6)); c.stroke(); };
    const line = (x1, y1, x2, y2) => { const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 16)); wob(Array.from({ length: n + 1 }, (_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n])); };
    line(-4, groundY, W + 4, groundY);
    // the goal: if you drop the ball, you concede
    const gw = Math.min(W * .56, 260), gh = Math.min(H * .13, 96), gx = (W - gw) / 2, gy = groundY - gh;
    c.save(); c.globalAlpha = .35; c.lineWidth = 1;
    for (let i = 1; i < 12; i++) line(gx + gw * i / 12, gy, gx + gw * i / 12, groundY);
    for (let i = 1; i < 5; i++) line(gx, gy + gh * i / 5, gx + gw, gy + gh * i / 5);
    c.restore();
    c.lineWidth = 3; line(gx, groundY, gx, gy); line(gx, gy, gx + gw, gy); line(gx + gw, gy, gx + gw, groundY); c.lineWidth = 2;
    // penalty area and six-yard box, seen in perspective in front of the goal
    const sh = H - groundY - 12, pxL = gx - gw * .2, pxR = gx + gw * 1.2, sl = gw * .06;
    line(pxL, groundY, pxL - sl, groundY + sh); line(pxR, groundY, pxR + sl, groundY + sh); line(pxL - sl, groundY + sh, pxR + sl, groundY + sh);
    const sd = sh * .38; line(gx, groundY, gx, groundY + sd); line(gx + gw, groundY, gx + gw, groundY + sd); line(gx, groundY + sd, gx + gw, groundY + sd);
    c.fillStyle = ink; c.beginPath(); c.arc(W / 2, groundY + sh * .66, 2.5, 0, 7); c.fill();
    star(c, W * .16, groundY - 150, 1.3, soft); star(c, W * .84, groundY - 260, 1, soft); star(c, W * .7, 130, 1.1, soft); star(c, W * .12, 150, .9, soft);
  }
  function size() {
    for (const k of [bgc, cv]) {
      const b = k.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 3);
      W = b.width; H = b.height; k.width = Math.round(W * dpr); k.height = Math.round(H * dpr); k.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    groundY = H - Math.max(70, H * .12); r = Math.max(20, Math.min(W * .075, 34));
    drawField();
    if (state === "ready") reset(); else { ball.x = Math.min(Math.max(ball.x, r), W - r); ball.y = Math.min(ball.y, groundY - r); }
  }
  function reset() { state = "ready"; score = 0; ball.x = W / 2; ball.y = H * .5; ball.vx = ball.vy = 0; ball.rot = 0; sparks = []; pops = []; ui(); }
  const gravity = () => H * 1.7 * (1 + Math.min(score, 40) * .0315); // slow and forgiving at the start, noticeably faster by ~40 touches

  function kick(px, py) {
    ball.vy = -Math.sqrt(2 * gravity() * H * .4); // fly about 42% of the screen height up
    ball.vx = Math.max(-W * .9, Math.min(W * .9, (ball.x - px) / r * W * .28)); // tap the left side: it flies right
    sparks.push({ x: px, y: py, t: 0 }); score++;
    const m = MILESTONES.indexOf(score); if (m > -1) pops.push({ text: T[lang].pops[m], t: 0 });
  }
  function end() { state = "over"; if (score > best) { best = score; try { localStorage.setItem("kp-ball-best", best); } catch (e) {} } ui(); }

  cv.addEventListener("pointerdown", (e) => {
    e.preventDefault(); if (state === "over") return;
    const b = cv.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top;
    const reach = r * (3.8 - Math.min(score, 40) * .05); // big tap area at the start, shrinks as you score
    if (Math.hypot(px - ball.x, py - ball.y) <= reach) { if (state === "ready") state = "play"; kick(px, py); ui(); }
  });
  $("bt-again").addEventListener("click", reset);
  window.addEventListener("resize", size);

  function step(dt) {
    if (state === "ready") { ball.y = H * .5 + Math.sin(performance.now() / 450) * 6; return; }
    if (state !== "play") return;
    ball.vy += gravity() * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.rot += ball.vx * dt / r;
    if (ball.x < r) { ball.x = r; ball.vx = Math.abs(ball.vx) * .8; }
    if (ball.x > W - r) { ball.x = W - r; ball.vx = -Math.abs(ball.vx) * .8; }
    if (ball.y < 76 + r) { ball.y = 76 + r; ball.vy = Math.abs(ball.vy) * .4; } // stay below the score band
    if (ball.y + r >= groundY) { ball.y = groundY - r; end(); }
  }

  // The site's ball: paper circle, ink outline, pentagon in the middle, five spokes
  function drawBall(c, x, y, rad, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); const u = rad / 17;
    c.beginPath(); c.arc(0, 0, rad, 0, 7); c.fillStyle = COL.paper; c.fill(); c.lineWidth = 2; c.strokeStyle = COL.ink; c.stroke();
    c.fillStyle = COL.ink; c.lineWidth = 1.8; c.beginPath();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; c[i ? "lineTo" : "moveTo"](Math.cos(a) * 7 * u, Math.sin(a) * 7 * u); } c.closePath(); c.fill();
    c.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; c.moveTo(Math.cos(a) * 7 * u, Math.sin(a) * 7 * u); c.lineTo(Math.cos(a) * 17 * u, Math.sin(a) * 17 * u); } c.stroke();
    c.restore();
  }
  function draw(dt) {
    ctx.clearRect(0, 0, W, H); const ink = COL.ink, soft = COL.soft, hf = Math.max(0, Math.min(1, (groundY - ball.y) / (H * .6)));
    ctx.fillStyle = ink; ctx.globalAlpha = .28 - hf * .15; ctx.beginPath(); ctx.ellipse(ball.x, groundY + (H - groundY) * .28, r * (1.1 - hf * .45), r * .3 * (1.1 - hf * .45), 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    drawBall(ctx, ball.x, ball.y, r, ball.rot);
    sparks = sparks.filter((o) => (o.t += dt * 2.6) < 1);
    sparks.forEach((o) => { ctx.globalAlpha = 1 - o.t; star(ctx, o.x, o.y, 1.2 + o.t * 1.8, ink); star(ctx, o.x + 16, o.y - 14, .8 + o.t, soft); ctx.globalAlpha = 1; });
    pops = pops.filter((o) => (o.t += dt * .9) < 1);
    pops.forEach((o) => { ctx.globalAlpha = 1 - o.t; ctx.fillStyle = ink; ctx.font = "900 34px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(o.text, W / 2, H * .3 - o.t * 40); ctx.globalAlpha = 1; });
  }
  function frame(now) { const dt = Math.min((now - last) / 1000 || 0, 1 / 20); last = now; step(dt); draw(dt); requestAnimationFrame(frame); }

  window.__ballTest = () => { return { state, score, x: ball.x, y: ball.y, vy: ball.vy, r, W, H }; }; // used for testing
  size(); ui(); requestAnimationFrame(frame);
})();
