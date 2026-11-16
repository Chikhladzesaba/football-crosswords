// Game switcher: a bar at the bottom on a phone, tabs at the top on a computer.
// Every page loads it with <script src="…/nav.js"></script> right after <body>. It works out three things by itself:
// the language (<html lang>), which game this page belongs to (first folder in the address), and where the site root is.
(function () {
  const KA = document.documentElement.lang === "ka";
  const root = new URL(".", document.currentScript.src).href; // folder that holds nav.js = the site root
  const first = location.pathname.split("/").filter(Boolean)[0] || "";
  const GAME_OF = { top5: "top5", "gamoicani-top5": "top5", scramble: "scramble", "gamoicani-pekhburtelebis-gvarebi": "scramble",
    wordsearch: "wordsearch", "skauti": "wordsearch" };
  const cur = GAME_OF[first] || "crosswords"; // every other folder is a crossword (or a home page)
  document.documentElement.dataset.game = cur; // nav.css gives each game its own accent color from this
  const S = (d, w) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.6) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const ICON = {
    crosswords: S('<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>'),
    top5: S('<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5zM7 5.5H3.5v1.5a3.5 3.5 0 0 0 3.5 3.5M17 5.5h3.5v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M7.5 20.5h9M9.5 18h5"/>'),
    scramble: S('<rect x="3.5" y="8.5" width="6.5" height="7" rx="1.5"/><rect x="14" y="8.5" width="6.5" height="7" rx="1.5"/><path d="M7 5h10l-2-2M17 19H7l2 2"/>'),
    wordsearch: S([3.5, 9.7, 15.9].map((y) => [3.5, 9.7, 15.9].map((x) => '<rect x="' + x + '" y="' + y + '" width="4.6" height="4.6" rx="1"' + (y === 9.7 ? ' fill="currentColor" fill-opacity=".3"' : "") + "/>").join("")).join(""), 1.5),
  };
  const ITEMS = KA
    ? [["crosswords", "კროსვორდი", "ka/"], ["top5", "Top 5", "gamoicani-top5/"], ["scramble", "დალაგობანა", "gamoicani-pekhburtelebis-gvarebi/"], ["wordsearch", "სკაუტი", "skauti/"]]
    : [["crosswords", "Crosswords", ""], ["top5", "Top 5", "top5/"], ["scramble", "Scramble", "scramble/"], ["wordsearch", "Word Search", "wordsearch/"]];
  const nav = document.createElement("nav");
  nav.className = "games-nav"; nav.setAttribute("aria-label", KA ? "თამაშები" : "Games");
  ITEMS.forEach(([id, name, path]) => {
    const a = document.createElement("a"); a.href = root + path; a.dataset.game = id;
    a.innerHTML = '<span class="ico">' + ICON[id] + "</span><span>" + name + "</span>";
    if (id === cur) a.setAttribute("aria-current", "page");
    nav.appendChild(a);
  });
  document.body.insertBefore(nav, document.body.firstChild);
  // On a phone the on-screen keyboard would sit on top of the bar, so hide the bar while the keyboard is open.
  // A keyboard is open when a text field has focus AND the visible part of the page has become clearly shorter
  // (a field that was focused by the page itself on load does not open a keyboard, so the bar stays).
  const vv = window.visualViewport;
  const baseH = Math.max(window.innerHeight, vv ? vv.height : 0);
  const field = () => { const e = document.activeElement; return !!e && /^(INPUT|TEXTAREA)$/.test(e.tagName) && !/^(button|checkbox|radio|submit)$/.test(e.type); };
  const sync = () => {
    const shrunk = Math.min(window.innerHeight, vv ? vv.height : window.innerHeight) < baseH - 120;
    document.body.classList.toggle("kb-open", field() && shrunk);
  };
  document.addEventListener("focusin", sync); document.addEventListener("focusout", () => setTimeout(sync, 50));
  if (vv) vv.addEventListener("resize", sync); window.addEventListener("resize", sync);
})();
