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
  window.KPArt = {
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
  const home = new URL(".", document.currentScript.src).href + (KA ? "ka/" : "");
  const now = new Date();
  const KA_MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
  const date = KA ? now.getFullYear() + " წლის " + now.getDate() + " " + KA_MONTHS[now.getMonth()]
    : now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const mast = document.createElement("header");
  mast.className = "kp-mast";
  mast.innerHTML = '<div class="kp-mast-top"><span>Est. 2026</span><span class="kp-date">' + date + '</span></div>' +
    '<a class="kp-name" href="' + home + '"><span class="kp-flank l">' + ART.ball + '</span>' +
    '<span class="kp-title">Kickoff Puzzles</span>' +
    '<span class="kp-flank r">' + ART.pencil + "</span></a>";
  document.body.insertBefore(mast, document.body.firstChild);

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
})();
