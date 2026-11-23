// Game switcher: a bar at the bottom on a phone, tabs at the top on a computer.
// Every page loads it with <script src="…/nav.js"></script> right after <body>. It works out three things by itself:
// the language (<html lang>), which game this page belongs to (first folder in the address), and where the site root is.
// VISUAL TEST (local only): newspaper skin. Remove these two lines to go back to the normal look.
document.write('<link rel="stylesheet" href="/paper.css?v=44">');
(function () {
  const KA = document.documentElement.lang === "ka";
  const root = new URL(".", document.currentScript.src).href; // folder that holds nav.js = the site root
  const first = location.pathname.split("/").filter(Boolean)[0] || "";
  const GAME_OF = { top5: "top5", "gamoicani-top5": "top5", scramble: "scramble", "gamoicani-pekhburtelebis-gvarebi": "scramble",
    wordsearch: "wordsearch", "skauti": "wordsearch" };
  const seg = location.pathname.split("/").filter(Boolean);
  const isAllPage = seg.length === 0 || (seg.length === 1 && first === "ka"); // the front pages: / and /ka/
  const cur = isAllPage ? "all" : (GAME_OF[first] || "crosswords"); // every other folder is a crossword (or the crosswords home pages /crosswords/ and /ka/crosswords/)
  const info = document.documentElement.dataset.page === "info"; // About, Contact, Privacy and the 404 page set <html data-page="info">
  document.documentElement.dataset.game = cur; // nav.css gives each game its own accent color from this
  const S = (d, w) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.6) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const ICON = {
    all: S('<path d="M3.6 3.9l7-.3.2 6.7-7 .2zM13.5 3.7l7 .2-.2 6.6-6.9-.1zM3.7 13.6l6.9-.2.1 7-7 .1zM13.4 13.5l7-.1.1 6.9-7 .2z"/><path d="M6 6.7h2.2M16 6.6h2.2" stroke-width="1"/>'),
    crosswords: S('<path d="M3.6 4.2L20.3 3.6 20.6 20.3 3.8 20.6z"/><path d="M9.3 3.8L9 20.4M14.9 3.7L15.1 20.4M3.8 9.5l16.6-.4M3.7 15l16.8.3"/><path d="M9.3 9.5h5.6V15H9.3z" fill="currentColor"/><path d="M4.6 5.6h2" stroke-width="1"/>'),
    top5: S('<path d="M7 3.6l10-.2.2 5.4a5 5 0 0 1-10.2.3zM7 5.5l-3.5.1.1 1.4a3.5 3.5 0 0 0 3.6 3.4M17 5.4l3.5.2v1.4a3.5 3.5 0 0 1-3.5 3.4M12 14l.1 4M7.5 20.6l9-.2M9.5 18.2l5-.1"/><path d="M12 6.4l.8 1.7 1.8.2-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.2z" fill="currentColor" stroke-width="0.6"/>'),
    scramble: S('<path d="M3.6 8.7l6.2-.3.2 7-6.3.2z"/><path d="M14 8.5l6.5.2-.2 7-6.4-.1z"/><path d="M6.4 12.2h.1M17 12h.1" stroke-width="2.4"/><path d="M7 4.8c3-1.4 7-1.2 10 .1l-2-2M17 19.2c-3 1.4-7 1.2-10-.1l2 2"/>'),
    wordsearch: S('<path d="M3.6 3.8l11.4-.3.1 11.6-11.5.2z"/><path d="M7.4 3.7v11.5M11.2 3.6v11.6M3.7 7.6h11.4M3.7 11.4h11.4"/><circle cx="15.2" cy="15.2" r="4.6" fill="var(--card, #fff)" fill-opacity=".85"/><path d="M18.6 18.6l3 3.2"/>', 1.6),
  };
  const ITEMS = KA
    ? [["all", "ყველა", "ka/"], ["crosswords", "კროსვორდი", "ka/crosswords/"], ["top5", "Top 5", "gamoicani-top5/"], ["scramble", "დალაგობანა", "gamoicani-pekhburtelebis-gvarebi/"], ["wordsearch", "სკაუტი", "skauti/"]]
    : [["all", "All", ""], ["crosswords", "Crosswords", "crosswords/"], ["top5", "Top 5", "top5/"], ["scramble", "Scramble", "scramble/"], ["wordsearch", "Word Search", "wordsearch/"]];
  window.KPNav = { ICON: ICON }; // hub.js draws the same icons beside each section title
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
  const ALT = KA ? { all: "", crosswords: "crosswords/", top5: "top5/", scramble: "scramble/", wordsearch: "wordsearch/" }
                 : { all: "ka/", crosswords: "ka/crosswords/", top5: "gamoicani-top5/", scramble: "gamoicani-pekhburtelebis-gvarebi/", wordsearch: "skauti/" };
  const alt = root + (document.documentElement.dataset.alt != null ? document.documentElement.dataset.alt : ALT[cur]); // info pages say where their other-language version is (data-alt)
  const LANG = KA ? '<a href="' + alt + '" hreflang="en" lang="en" title="English">ENG</a><span class="sep">|</span><span aria-current="true">ქა</span>'
                  : '<span aria-current="true">Eng</span><span class="sep">|</span><a href="' + alt + '" hreflang="ka" lang="ka" title="ქართული">Geo</a>';
  const top = document.createElement("div");
  top.className = "topbar";
  top.innerHTML = '<a class="brand" href="' + root + (KA ? "ka/" : "") + '">Kickoff Puzzles</a><span class="top-right"><span class="pill-slot"></span><nav class="lang-switch" aria-label="' + (KA ? "ენა" : "Language") + '">' + LANG + "</nav></span>";
  document.body.insertBefore(top, document.body.firstChild);
  document.documentElement.classList.add("with-top");
  document.write('<script src="/paper.js?v=8"><\/script>'); // VISUAL TEST

  // Footer with the About / Contact / Privacy links, added to every page. Hidden while playing a crossword on a phone (the page is a fixed-size app there).
  const FT = KA ? { about: "ჩვენ შესახებ", contact: "კონტაქტი", privacy: "კონფიდენციალურობა" }
                : { about: "About", contact: "Contact", privacy: "Privacy" };
  const fbase = root + (KA ? "ka/" : "");
  const addFooter = () => {
    const f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = '<nav aria-label="' + (KA ? "საიტის ბმულები" : "Site links") + '"><a href="' + fbase + 'about/">' + FT.about + '</a><a href="' + fbase + 'contact/">' + FT.contact +
      '</a><a href="' + fbase + 'privacy/">' + FT.privacy + "</a></nav><p>© 2026 Kickoff Puzzles</p>";
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
    if (false) { // phones: the pill stays under the title so the logo fits in the header
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

  // Open game pages on a computer: under the game tabs there is a second strip with the Back link and the progress / time / score.
  // The games build these bits themselves, so this only moves them up (the games keep finding them by id).
  const sub = document.createElement("div");
  sub.className = "kp-subbar";
  const subRight = document.createElement("span"); subRight.className = "kp-sub-r";
  sub.appendChild(subRight);
  nav.insertAdjacentElement("afterend", sub);
  const DESK = window.matchMedia("(min-width: 641px)");
  const gameRoot = () => document.querySelector("#crossword, #top5, #scramble, #wordsearch");
  const idsOf = (el) => [el.id, ...[...el.querySelectorAll("[id]")].map((x) => x.id)].filter(Boolean);
  let moved = false;
  function adopt() {
    const r = gameRoot();
    if (!r || !DESK.matches || document.body.classList.contains("phone-play")) return;
    const title = r.id === "crossword" ? r.querySelector("main > h1") : null; // crosswords: the puzzle name goes in the middle of the strip
    if (title) { sub.querySelectorAll("h1").forEach((o) => { if (o !== title) o.remove(); }); sub.insertBefore(title, subRight); moved = true; }
    [[".back", sub], ["[data-pill]", subRight], [".meta", subRight]].forEach(([q, to]) => {
      r.querySelectorAll(q).forEach((el) => {
        idsOf(el).forEach((id) => sub.querySelectorAll("#" + CSS.escape(id)).forEach((old) => { if (old !== el) (old.closest(".back, [data-pill], .meta") || old).remove(); })); // the game drew a new copy: drop the old one
        if (to === sub) { sub.querySelectorAll(".back").forEach((o) => { if (o !== el) o.remove(); }); sub.insertBefore(el, sub.firstChild); } else subRight.appendChild(el);
        moved = true;
      });
    });
  }
  const start = () => { adopt(); const r = gameRoot(); if (r) new MutationObserver(adopt).observe(r, { childList: true, subtree: true }); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  // a window dragged from wide to phone width: the moved bits have no place on the phone layout, so load the page again (crossword progress is saved)
  DESK.addEventListener("change", () => { if (moved && !DESK.matches) location.reload(); });
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
