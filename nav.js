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
  const info = document.documentElement.dataset.page === "info"; // About, Contact, Privacy and the 404 page set <html data-page="info">
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
    if (id === cur && !info) a.setAttribute("aria-current", "page"); // About / Contact / Privacy pages are not a game: no tab is highlighted
    nav.appendChild(a);
  });
  document.body.insertBefore(nav, document.body.firstChild);

  // Language switch + (on phones) the small top bar with the brand name. The switch goes to the same game in the other language.
  const ALT = KA ? { crosswords: "", top5: "top5/", scramble: "scramble/", wordsearch: "wordsearch/" }
                 : { crosswords: "ka/", top5: "gamoicani-top5/", scramble: "gamoicani-pekhburtelebis-gvarebi/", wordsearch: "skauti/" };
  const alt = root + (document.documentElement.dataset.alt != null ? document.documentElement.dataset.alt : ALT[cur]); // info pages say where their other-language version is (data-alt)
  const LANG = KA ? '<a href="' + alt + '" hreflang="en" lang="en" title="English">ინგ</a><span class="sep">|</span><span aria-current="true">ქა</span>'
                  : '<span aria-current="true">Eng</span><span class="sep">|</span><a href="' + alt + '" hreflang="ka" lang="ka" title="ქართული">Geo</a>';
  const top = document.createElement("div");
  top.className = "topbar";
  top.innerHTML = '<a class="brand" href="' + root + (KA ? "ka/" : "") + '">Kickoff Puzzles</a><span class="top-right"><span class="pill-slot"></span><nav class="lang-switch" aria-label="' + (KA ? "ენა" : "Language") + '">' + LANG + "</nav></span>";
  document.body.insertBefore(top, document.body.firstChild);
  document.documentElement.classList.add("with-top");

  // Footer with the About / Contact / Privacy links, added to every page. Hidden while playing a crossword on a phone (the page is a fixed-size app there).
  const FT = KA ? { about: "ჩვენ შესახებ", contact: "კონტაქტი", privacy: "კონფიდენციალურობა", note: "არაოფიციალური თამაში." }
                : { about: "About", contact: "Contact", privacy: "Privacy", note: "Unofficial fan game." };
  const fbase = root + (KA ? "ka/" : "");
  const addFooter = () => {
    const f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = '<nav aria-label="' + (KA ? "საიტის ბმულები" : "Site links") + '"><a href="' + fbase + 'about/">' + FT.about + '</a><a href="' + fbase + 'contact/">' + FT.contact +
      '</a><a href="' + fbase + 'privacy/">' + FT.privacy + "</a></nav><p>© 2026 Kickoff Puzzles · " + FT.note + "</p>";
    document.body.appendChild(f);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addFooter); else addFooter();

  // On a phone the round / progress pill sits in the top bar (as in the design); on a computer it stays beside the heading.
  const mq = window.matchMedia("(max-width: 640px)");
  let pillHome = null;
  const placePill = () => {
    const pill = document.querySelector("[data-pill]");
    if (!pill) return;
    const slot = top.querySelector(".pill-slot");
    if (mq.matches) {
      if (pill.parentNode !== slot) { pillHome = { parent: pill.parentNode, next: pill.nextSibling }; slot.appendChild(pill); }
    } else if (pillHome && pill.parentNode === slot) { pillHome.parent.insertBefore(pill, pillHome.next); }
  };
  document.addEventListener("DOMContentLoaded", placePill);
  (mq.addEventListener ? mq.addEventListener("change", placePill) : mq.addListener(placePill));
  if (document.readyState !== "loading") placePill();
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

// Share panel for computers (phones open their own share menu instead). Each game calls KPShare.open({ anchor, text, url, note })
// from its share button: a small row appears under the button with WhatsApp, Facebook, X and Copy.
// Facebook can only take a link, so it gets the url alone; WhatsApp, X and Copy get the full result text plus the link.
window.KPShare = (function () {
  const KA = document.documentElement.lang === "ka";
  const L = KA ? { label: "გაზიარება", copy: "კოპირება", copied: "დაკოპირდა ✓" } : { label: "Share via", copy: "Copy", copied: "Copied ✓" };
  const enc = encodeURIComponent;
  function open(o) {
    const a = o.anchor;
    if (!a) return;
    if (a._kpRow) { a._kpRow.hidden = !a._kpRow.hidden; return; } // second click on the share button closes the row
    const full = o.text + "\n" + o.url;
    const row = document.createElement("div");
    row.className = "kp-share";
    row.setAttribute("role", "group"); row.setAttribute("aria-label", L.label);
    row.style.order = a.style.order; // inside the end-of-game cards the buttons are re-ordered; the row stays right under the share button
    const link = (name, href) => {
      const el = document.createElement("a");
      el.textContent = name; el.href = href; el.target = "_blank"; el.rel = "noopener noreferrer";
      return el;
    };
    row.appendChild(link("WhatsApp", "https://wa.me/?text=" + enc(full)));
    row.appendChild(link("Facebook", "https://www.facebook.com/sharer/sharer.php?u=" + enc(o.url)));
    row.appendChild(link("X", "https://twitter.com/intent/tweet?text=" + enc(o.text) + "&url=" + enc(o.url)));
    const copy = document.createElement("button");
    copy.type = "button"; copy.textContent = L.copy;
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(full);
        copy.textContent = L.copied;
        clearTimeout(copy._t); copy._t = setTimeout(() => (copy.textContent = L.copy), 2500);
      } catch (e) {
        if (o.note) { o.note.textContent = full; o.note.hidden = false; } // clipboard blocked: show the text so it can be copied by hand
      }
    });
    row.appendChild(copy);
    a.insertAdjacentElement("afterend", row);
    a._kpRow = row;
  }
  return { open };
})();
