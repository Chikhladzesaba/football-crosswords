(function(){var r=document.documentElement,d=function(){var q=window.devicePixelRatio||1,c=2;[2,4].some(function(s){if(Math.abs(s*q-Math.round(s*q))<1e-6){c=s;return true}});r.style.setProperty("--cs",c+"px")};d();window.addEventListener("resize",d);})(); /* crossword squares: whole device pixels where the screen scale allows, so lines stay even */
// Visual test: "newspaper" art direction with two skins (ink = black & white, color = retro).
// Loaded from nav.js on every page. Local test only, not pushed. To remove: delete the two lines at the top of nav.js.
(function () {
  const KA = document.documentElement.lang === "ka";
  const root = document.documentElement;
  let ink = "black";
  try { const v = localStorage.getItem("kp:ink"); if (v === "red" || v === "blue") ink = v; } catch (e) {}
  root.setAttribute("data-skin", "bw"); root.setAttribute("data-ink", ink);

  // ---------- Drawings (all original, simple ink line art; colours come from CSS variables) ----------
  const SP = (d, vb) => '<svg class="kp-art" viewBox="' + (vb || "0 0 48 48") + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const STAR4 = (x, y, s, f) => '<path transform="translate(' + x + " " + y + ") scale(" + s + ')" d="M0-9L2.2-2.2 9 0 2.2 2.2 0 9-2.2 2.2-9 0-2.2-2.2z" fill="' + (f || "var(--sk-a)") + '"/>';
  const BALL = (cx, cy, r) => {
    const k = r / 17;
    return '<g transform="translate(' + cx + " " + cy + ") scale(" + k + ')"><circle r="17" fill="var(--card)"/><path d="M0-7l6 4.4-2.3 7h-7.4l-2.3-7z" fill="currentColor"/><path d="M0-7V-17M6-2.6L15-6M3.7 4.4L9 12M-3.7 4.4L-9 12M-6-2.6L-15-6"/></g>';
  };
  const ART = {
    ball: SP(BALL(24, 24, 17)),
    trophy: SP('<path d="M14 7h20v11a10 10 0 0 1-20 0z" fill="var(--sk-a)"/><path d="M14 10H7.5v3.5A6.5 6.5 0 0 0 14 20M34 10h6.5v3.5A6.5 6.5 0 0 1 34 20M24 28v7M18 35h12l1.5 6h-15z M13 42h22"/>' + STAR4(24, 16, .6, "var(--card)")),
    globe: SP('<circle cx="24" cy="24" r="16" fill="var(--sk-a)"/><path d="M8 24h32M24 8c-8 7-8 25 0 32M24 8c8 7 8 25 0 32M10 15.5q14 5 28 0M10 32.5q14-5 28 0"/>'),
    shirt: SP('<path d="M17 6.5L5.5 12.5l4.5 9 5-2.3V41h18V19.2l5 2.3 4.5-9L31 6.5q-1.8 5-7 5t-7-5z" fill="var(--sk-a)"/><path d="M21 21v20M27 21v20"/>'),
    medal: SP('<path d="M15 4l9 15 9-15M19 4l5 8.5L29 4"/><circle cx="24" cy="30" r="11.5" fill="var(--sk-a)"/><path d="M24 23.5l2 4.2 4.6.6-3.3 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6-3.3-3.2 4.6-.6z" fill="var(--card)"/>'),
    smiley: SP('<circle cx="24" cy="24" r="18" fill="var(--sk-a)"/><path d="M17 19v4.5M31 19v4.5M14.5 28.5q9.5 10 19 0"/>'),
    sparkle: SP(STAR4(24, 24, 2.1)),
    pencil: SP('<g transform="rotate(40 24 24)"><path d="M19 6h10v26H19zM19 32l5 10 5-10M21.8 37.5h4.4"/><path d="M19 12h10" /><path d="M19 6V3.5h10V6" fill="var(--sk-a)"/></g>'),
    starman: SP('<path d="M24 4l5.4 11.5 12.3 1.6-9 8.6 2.3 12.4L24 32l-11 6.1 2.3-12.4-9-8.6 12.3-1.6z" fill="var(--sk-a)"/><path d="M14 20h8v4h-8zM26 20h8v4h-8zM22 21h4M18 29q6 4 12 0"/><path d="M18 38l-3 6h5M30 38l3 6h-5"/>', "0 0 48 48"),
  };
  const HERO = SP(
    // crossword grid
    '<g transform="translate(14 44)"><rect width="112" height="112" fill="var(--card)"/>' +
    [1, 2, 3, 4].map((i) => '<path d="M' + i * 22.4 + ' 0V112M0 ' + i * 22.4 + 'H112"/>').join("") +
    '<path d="M22.4 22.4h22.4v22.4H22.4zM67.2 0h22.4v22.4H67.2zM44.8 67.2h22.4v22.4H44.8zM89.6 44.8H112v22.4H89.6zM0 89.6h22.4V112H0z" fill="currentColor"/>' +
    '<path d="M3 4.5h3M25 4.5h3M47 27h3M69 49.5h3M3 71.5h3" stroke-width="1.4"/><rect width="112" height="112"/></g>' +
    // ball resting on the grid
    '<g transform="translate(150 118)"><circle r="42" fill="var(--card)"/><path d="M0-17.5l14.5 10.8-5.6 17.2H-8.9L-14.5-6.7z" fill="currentColor"/><path d="M0-17.5V-42M14.5-6.7L37-15M8.9 10.5L22 29M-8.9 10.5L-22 29M-14.5-6.7L-37-15"/>' +
    '<path d="M-37-15q-3 14 4 26M37-15q3 14-4 26M-22 29q12 9 25 9" stroke-width="1.4"/></g>' +
    // pencil
    '<g transform="translate(222 26) rotate(32)"><rect x="0" y="0" width="15" height="92" fill="var(--sk-a)"/><path d="M5 0V92M10 6V92" stroke-width="1.2"/><path d="M0 92l7.5 20 7.5-20M4.5 104h6" /><path d="M0 0v-14h15V0" fill="var(--sk-b)"/><path d="M0-5h15"/></g>' +
    // motion + sparkles
    '<path d="M92 170q-18 5-34 1M96 182q-14 8-30 8M84 158q-16 0-28-6" stroke-width="1.8"/>' + STAR4(206, 150, 1.1) + STAR4(30, 24, 1.5, "var(--sk-b)") + STAR4(236, 172, .8, "var(--sk-b)") +
    '<path d="M70 18l6 8-9 1M150 14l-3 10" stroke-width="1.6"/>',
    "0 0 260 210"
  );
  const SPOT = { International: "globe", "Champions League": "trophy", "Club football": "shirt", Legends: "medal" };
  // Big drawings for the highlighted card of each section (one per topic), built from the small icons above
  const inner = (n) => ART[n].replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const BIG = (n, x, y, s) => '<g transform="translate(' + x + " " + y + ") scale(" + s + ')" stroke-width="' + (3.2 / s).toFixed(2) + '">' + inner(n) + "</g>";
  const SQ = (x, y, fill) => '<rect x="' + x + '" y="' + y + '" width="22" height="22" fill="' + (fill ? "currentColor" : "var(--card)") + '" stroke-width="2.6"/>';
  const ROW = (x, y) => SQ(x, y, 0) + SQ(x + 22, y, 1) + SQ(x + 44, y, 0) + SQ(x + 66, y - 22, 0) + SQ(x + 66, y, 0);
  const FEAT = {
    International: BIG("globe", 82, 14, 3.3) + '<ellipse cx="150" cy="104" rx="128" ry="34" transform="rotate(-18 150 104)" stroke-width="2" stroke-dasharray="3 9"/>' + BALL(244, 150, 22) + STAR4(40, 36, 1.4) + STAR4(262, 52, 1, "var(--sk-b)") + ROW(14, 176),
    "Champions League": BIG("trophy", 78, 8, 3.7) + BALL(244, 164, 22) + STAR4(40, 40, 1.5) + STAR4(258, 48, 1.1, "var(--sk-b)") + STAR4(50, 120, .8, "var(--sk-b)") + ROW(14, 176),
    "Club football": BIG("shirt", 80, 10, 3.5) + BALL(244, 160, 22) + STAR4(40, 44, 1.4) + STAR4(262, 60, 1, "var(--sk-b)") + '<path d="M232 128q14-4 28 2M228 140q16 0 30 6" stroke-width="2"/>' + ROW(14, 176),
    Legends: BIG("medal", 80, 10, 3.6) + STAR4(40, 40, 1.5) + STAR4(258, 44, 1.2, "var(--sk-b)") + STAR4(250, 150, .9) + STAR4(46, 130, .8, "var(--sk-b)") + BALL(236, 176, 18) + ROW(14, 176),
  };
  // Zidane card: the "roulette" spin (ball with two curved arrows around it), a number 10 and a small crossword row
  FEAT.zidane = BALL(150, 98, 48) +
    '<path d="M99 56A68 68 0 0 0 99 140" stroke-width="3.2"/><path d="M84 133L99 141L92 155" stroke-width="3.2"/>' +
    '<path d="M201 140A68 68 0 0 0 201 56" stroke-width="3.2"/><path d="M216 63L201 55L208 41" stroke-width="3.2"/>' +
    '<ellipse cx="150" cy="166" rx="50" ry="7" stroke-width="2" stroke-dasharray="3 7"/>' +
    '<circle cx="250" cy="40" r="22" stroke-width="3"/>' + '<text x="250" y="48" text-anchor="middle" font-size="22" stroke="none" fill="currentColor" style="font-family:var(--display);font-weight:400">10</text>' +
    STAR4(40, 40, 1.5) + STAR4(264, 138, 1, "var(--sk-b)") + STAR4(40, 130, .8, "var(--sk-b)") + ROW(14, 186);
  // Manchester United card: the Red Devils' pitchfork, a ball, sparkles and a small crossword row
  FEAT.united = '<path d="M114 78V46M186 78V46M150 90V34" stroke-width="3.4"/>' +
    '<path d="M106 48l8-16 8 16zM178 48l8-16 8 16zM142 36l8-16 8 16z" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M114 78q0 16 36 16q36 0 36-16" stroke-width="3.4"/>' +
    '<path d="M150 94V182" stroke-width="3.6"/><path d="M138 182h24" stroke-width="3.6"/>' +
    BALL(240, 150, 22) + STAR4(40, 40, 1.5) + STAR4(262, 48, 1.1, "var(--sk-b)") + STAR4(52, 120, .8, "var(--sk-b)") + ROW(14, 186);
  // Champions League 2010s card: a ball inside a ring of stars (the competition's "starball" idea) and a "2010s" tag
  FEAT.ucl2010s = BALL(150, 82, 36) + '<ellipse cx="150" cy="82" rx="84" ry="56" stroke-width="2" stroke-dasharray="3 9"/>' + STAR4(150, 26, 1.2, "var(--sk-a)") + STAR4(209, 42, 0.85, "var(--sk-b)") + STAR4(234, 82, 1.2, "var(--sk-a)") + STAR4(209, 122, 0.85, "var(--sk-b)") + STAR4(150, 138, 1.2, "var(--sk-a)") + STAR4(91, 122, 0.85, "var(--sk-b)") + STAR4(66, 82, 1.2, "var(--sk-a)") + STAR4(91, 42, 0.85, "var(--sk-b)") +
    '<rect x="116" y="164" width="86" height="28" rx="14" stroke-width="3"/><text x="159" y="184" text-anchor="middle" font-size="19" stroke="none" fill="currentColor" style="font-family:var(--display);font-weight:400">2010s</text>' + ROW(14, 190);
  // Big drawings for the "All" page: one per game
  const TXT = (x, y, t, size, extra) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + size + '" stroke="none" fill="currentColor" style="font-family:var(--display);font-weight:700"' + (extra || "") + ">" + t + "</text>";
  const GRID4 = () => {
    let o = '<g transform="translate(46 30) scale(1.55)">';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o += SQ(c * 22, r * 22, ["0,3", "1,1", "2,2", "3,0"].includes(r + "," + c));
    return o + '<path d="M3 4h3M25 26.5h3M47 48.5h3M69 4.5h3" stroke-width="1.3"/></g>';
  };
  const STAIRS = () => {
    let o = "";
    [112, 94, 78, 64, 52].forEach((h, i) => { const x = 40 + i * 42; o += '<rect x="' + x + '" y="' + (190 - h) + '" width="38" height="' + h + '" fill="' + (i ? "var(--card)" : "var(--sk-a)") + '"/>' + TXT(x + 19, 190 - h + 30, i + 1, 26); });
    return o + '<path d="M26 190h232" stroke-width="2.6"/>';
  };
  const TILES = () => {
    const L = KA ? ["ს", "ი", "მ", "ე"] : ["S", "E", "M", "I", "S"], rot = [-9, 6, -4, 8, -7], dy = [6, -8, 4, -6, 8];
    const w = 46, gap = 8, x0 = 150 - (L.length * (w + gap) - gap) / 2;
    return L.map((ch, i) => { const x = x0 + i * (w + gap) + w / 2, y = 112 + dy[i]; return '<g transform="translate(' + x + " " + y + ") rotate(" + rot[i] + ')"><rect x="-23" y="-27" width="46" height="54" fill="' + (i === 2 ? "var(--sk-a)" : "var(--card)") + '"/>' + TXT(0, 12, ch, 34) + "</g>"; }).join("") +
      '<path d="M58 54q92-42 184 0l-15-14M242 174q-92 42-184 0l15 14" stroke-width="2.4"/>';
  };
  const SEARCH = () => {
    const rows = KA ? ["ბგდვზ", "თკლნო", "მესიპ", "ჟრსტუ", "ფქღყშ"] : ["KDPUO", "ZRQAT", "MESSI", "BXHLV", "WYCJF"], hit = KA ? 4 : 5, c = 30, x0 = 38, y0 = 28;
    let o = '<rect x="' + x0 + '" y="' + y0 + '" width="' + 5 * c + '" height="' + 5 * c + '" fill="var(--card)"/>';
    for (let i = 1; i < 5; i++) o += '<path d="M' + (x0 + i * c) + " " + y0 + "v" + 5 * c + "M" + x0 + " " + (y0 + i * c) + "h" + 5 * c + '" stroke-width="1" opacity=".45"/>';
    rows.forEach((r, ri) => [...r].forEach((ch, ci) => { o += TXT(x0 + ci * c + c / 2, y0 + ri * c + 21, ch, 19); }));
    o += '<rect x="' + (x0 + 3) + '" y="' + (y0 + 2 * c + 3) + '" width="' + (hit * c - 6) + '" height="' + (c - 6) + '" rx="12" fill="var(--sk-a)" fill-opacity=".55" stroke-width="2.6"/>';
    return o + '<circle cx="222" cy="150" r="30" fill="var(--card)" fill-opacity=".8" stroke-width="3"/><path d="M244 172l32 32" stroke-width="7"/>' + STAR4(262, 42, 1.2, "var(--sk-b)") + STAR4(30, 190, .9, "var(--sk-b)");
  };
  Object.assign(FEAT, {
    "hub:crosswords": GRID4() + BIG("pencil", 176, 52, 2.9) + BALL(244, 166, 22) + STAR4(272, 40, 1.2, "var(--sk-b)") + STAR4(28, 20, 1.2) + '<path d="M214 130q14-5 30 0" stroke-width="2"/>',
    "hub:top5": STAIRS() + BIG("trophy", 36, 6, 1.45) + BALL(276, 172, 17) + STAR4(268, 40, 1.4) + STAR4(150, 40, .9, "var(--sk-b)"),
    "hub:scramble": TILES() + STAR4(36, 120, 1, "var(--sk-b)") + STAR4(268, 110, 1.2),
    "hub:wordsearch": SEARCH(),
  });
  window.KPArt = {
    feature: (topic) => { const d = document.createElement("span"); d.className = "kp-feat-art"; d.innerHTML = SP(FEAT[topic] || "", "0 0 300 210"); return d; },
    spot: (n) => { const s = document.createElement("span"); s.className = "kp-spot"; s.innerHTML = ART[n] || ""; return s; },
    spotFor: (topic) => window.KPArt.spot(SPOT[topic]),
    hero: () => { const d = document.createElement("div"); d.className = "kp-hero"; d.innerHTML = HERO; return d; },
    art: ART,
  };

  // ---------- Rough-pencil filters (make straight SVG strokes wobble a little) ----------
  const defs = document.createElement("div");
  defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  defs.setAttribute("aria-hidden", "true");
  defs.innerHTML = '<svg width="0" height="0"><filter id="kp-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>' +
    '<filter id="kp-rough-s" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3"/></filter></svg>';
  document.body.insertBefore(defs, document.body.firstChild);

  // ---------- Masthead (newspaper nameplate), hidden by CSS on crossword puzzle pages and on phones ----------
  const home = new URL(".", document.currentScript.src).href + (KA ? "" : "en/");
  const now = new Date();
  const KA_MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
  const date = KA ? now.getFullYear() + " წლის " + now.getDate() + " " + KA_MONTHS[now.getMonth()]
    : now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const mast = document.createElement("header");
  mast.className = "kp-mast";
  mast.innerHTML = '<div class="kp-mast-strip"></div>' + // the colour and language switches sit in this strip (placed by CSS)
    '<div class="kp-mast-grid"><div class="kp-cell kp-cell-l"><span class="kp-date kp-tag">' + (KA ? "საფეხბურთო თამაშები" : "Football games") + '</span><span class="kp-ballwrap">' + ART.ball + "</span></div>" +
    '<a class="kp-name" href="' + home + '"><span class="kp-title">Kickoff Puzzles</span></a>' +
    '<div class="kp-cell kp-cell-r"><span class="kp-date">' + date + '</span><span class="kp-row"><span class="kp-pen">' + ART.pencil + '</span><span class="kp-est">Est. 2026</span></span></div></div>';
  // BALL-START
  // The ball in the masthead: click it and it drops, bounces slowly around the window; click (catch) it and it flies back to its place.
  const SITE = new URL(".", document.currentScript.src).href; // site root, for the link to the ball game
  const BALL_TEXT = KA_LANG() ? { q: "გინდა „ბურთის კონტროლი“ ითამაშო?", yes: "კი", no: "არა", url: SITE + "burtis-kontroli/" }
                              : { q: "Want to try the Ball Control Test?", yes: "Yes", no: "No", url: SITE + "ball-test/" };
  function KA_LANG() { return document.documentElement.lang === "ka"; }
  // After the ball's first fall, ask once whether the person wants to play the ball game. "No" is remembered until the tab is closed.
  function kpBallAsk() {
    let said = false; try { said = sessionStorage.getItem("kp-ball-no") === "1"; } catch (e) {}
    if (said || document.querySelector(".kp-ballask")) return;
    const box = document.createElement("div"); box.className = "kp-ballask"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", BALL_TEXT.q);
    box.innerHTML = "<p></p><div><a class=\"yes\" href=\"" + BALL_TEXT.url + "\">" + BALL_TEXT.yes + "</a><button type=\"button\" class=\"no\">" + BALL_TEXT.no + "</button></div>";
    box.querySelector("p").textContent = BALL_TEXT.q;
    const close = () => { box.remove(); document.removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    const track = (answer) => { if (window.kpTrack) kpTrack("ball_prompt", { answer: answer, language: KA_LANG() ? "ka" : "en", transport_type: "beacon" }); }; // "beacon" so the event still gets sent when the page changes
    box.querySelector(".yes").addEventListener("click", () => track("yes"));
    box.querySelector(".no").addEventListener("click", () => { track("no"); try { sessionStorage.setItem("kp-ball-no", "1"); } catch (e) {} close(); });
    document.addEventListener("keydown", esc);
    document.body.appendChild(box);
  }
  function kpBall(mast, KA) {
    const cell = mast.querySelector(".kp-cell-l"), svg = cell && cell.querySelector("svg");
    if (!svg || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    cell.setAttribute("role", "button"); cell.tabIndex = 0; cell.style.cursor = "pointer";
    cell.setAttribute("aria-label", KA ? "ბურთის ჩამოგდება" : "Drop the ball");
    let ball = null, raf = 0, asked = false;
    const G = 900, BOUNCE = 0.8; // gravity (px/s2) and how much speed is kept after each bounce: low numbers = slow, soft bounces
    function drop() {
      if (ball) return;
      const r = svg.getBoundingClientRect(), size = r.width;
      ball = svg.cloneNode(true);
      ball.removeAttribute("class"); ball.setAttribute("class", "kp-art kp-ball-fly");
      ball.style.cssText = "position:fixed;left:0;top:0;width:" + size + "px;height:" + size + "px;z-index:99999;cursor:grab;color:" + getComputedStyle(svg).color + ";filter:url(#kp-rough);touch-action:none;will-change:transform";
      document.body.appendChild(ball); svg.style.visibility = "hidden";
      let x = r.left, y = r.top, vx = (Math.random() < .5 ? -1 : 1) * (50 + Math.random() * 70), vy = -380, rot = 0, last = performance.now();
      const draw = () => { ball.style.transform = "translate(" + x + "px," + y + "px) rotate(" + rot + "deg)"; };
      draw();
      const tick = (t) => {
        const dt = Math.min(0.034, (t - last) / 1000); last = t;
        const floor = window.innerHeight - size - 4, right = window.innerWidth - size;
        vy += G * dt; y += vy * dt; x += vx * dt; rot += vx * dt * 1.4;
        if (y >= floor) { if (!asked) { asked = true; kpBallAsk(); } y = floor; vy = -vy * BOUNCE; vx *= 0.92; if (Math.abs(vy) < 90) vy = 0; }
        if (x <= 0) { x = 0; vx = Math.abs(vx) * 0.8; } else if (x >= right) { x = right; vx = -Math.abs(vx) * 0.8; }
        draw();
        if (y >= floor && vy === 0 && Math.abs(vx) < 8) return; // resting on the bottom of the window until it is caught
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const caught = (e) => {
        e.preventDefault(); e.stopPropagation(); cancelAnimationFrame(raf);
        const home = svg.getBoundingClientRect(), b = ball; ball = null;
        b.style.cursor = "default";
        b.style.transition = "transform .55s cubic-bezier(.2,.8,.25,1)";
        b.style.transform = "translate(" + home.left + "px," + home.top + "px) rotate(" + (Math.round(rot / 360) * 360) + "deg)";
        setTimeout(() => { b.remove(); svg.style.visibility = ""; }, 580);
      };
      ball.addEventListener("pointerdown", caught);
    }
    cell.addEventListener("click", drop);
    cell.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); drop(); } });
  }
  // BALL-END

  // MENU-START
  // Phone header: the ball (bounces on click) and a burger button. The burger opens a full-screen menu with the game tabs, colour dots and language switch.
  function kpMenu(KA) {
    const top = document.querySelector(".topbar"); if (!top) return;
    const root = document.documentElement;
    let btn = top.querySelector(".kp-burger"), ov = document.querySelector(".kp-menu"), pb = top.querySelector(".kp-pball");
    if (!btn) {
      const grp = document.createElement("span"); grp.className = "kp-phone-actions";
      pb = document.createElement("span"); pb.className = "kp-pball"; pb.innerHTML = '<span class="kp-cell kp-cell-l"><span class="kp-ballwrap">' + ART.ball + "</span></span>";
      btn = document.createElement("button"); btn.type = "button"; btn.className = "kp-burger"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", KA ? "მენიუ" : "Menu");
      const SV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
      btn.innerHTML = SV.replace("<svg ", '<svg class="kp-bg-open" ') + '<path d="M3.4 6.6l17.1-.3M3.6 12.2l16.8.2M3.4 17.8l17-.3"/></svg>' + SV.replace("<svg ", '<svg class="kp-bg-close" ') + '<path d="M5.3 5.5l13.4 13.1M18.6 5.3L5.4 18.7"/></svg>';
      grp.append(pb, btn); top.appendChild(grp);
      ov = document.createElement("div"); ov.className = "kp-menu"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", KA ? "მენიუ" : "Menu");
      const nav = document.createElement("nav"); nav.className = "kp-menu-nav";
      document.querySelectorAll(".games-nav a").forEach((a) => nav.appendChild(a.cloneNode(true)));
      const tools = document.createElement("div"); tools.className = "kp-menu-tools";
      ov.append(nav, tools); document.body.appendChild(ov);
    }
    const tools = ov.querySelector(".kp-menu-tools");
    const mq = window.matchMedia("(max-width: 640px)");
    const place = () => {
      const skin = document.querySelector(".kp-skin"), lang = document.querySelector(".lang-switch"), tr = top.querySelector(".top-right");
      if (mq.matches) { if (skin && skin.parentNode !== tools) tools.appendChild(skin); if (lang && lang.parentNode !== tools) tools.appendChild(lang); }
      else if (tr) { if (skin && skin.parentNode !== tr) tr.insertBefore(skin, tr.firstChild); if (lang && lang.parentNode !== tr) tr.appendChild(lang); }
    };
    const set = (open) => { root.classList.toggle("kp-menu-open", open); btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? (KA ? "დახურვა" : "Close") : (KA ? "მენიუ" : "Menu")); };
    btn.addEventListener("click", () => set(!root.classList.contains("kp-menu-open")));
    ov.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    mq.addEventListener("change", () => { place(); set(false); });
    place();
    kpBall(top, KA);
  }
  // MENU-END
  document.body.insertBefore(mast, document.body.firstChild);
  kpBall(mast, KA);

  // ---------- Skin toggle, in the top-right corner next to the language switch ----------
  const L = KA ? { black: "შავი", red: "წითელი", blue: "ლურჯი", label: "ფერი" } : { black: "Black", red: "Red", blue: "Blue", label: "Ink color" };
  const tg = document.createElement("div");
  tg.className = "kp-skin"; tg.setAttribute("role", "group"); tg.setAttribute("aria-label", L.label);
  tg.innerHTML = ["black", "red", "blue"].map((c) => '<button type="button" data-s="' + c + '" title="' + L[c] + '" aria-label="' + L[c] + '"><span class="dot"></span></button>').join("");
  const sync = () => tg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === root.getAttribute("data-ink"))));
  tg.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    root.setAttribute("data-ink", b.dataset.s);
    try { localStorage.setItem("kp:ink", b.dataset.s); } catch (err) {}
    sync();
  });
  sync();
  const tr = document.querySelector(".top-right");
  if (tr) tr.insertBefore(tg, tr.firstChild); else document.body.appendChild(tg);
  kpMenu(KA);
})();
