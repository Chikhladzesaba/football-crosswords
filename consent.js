// Cookie banner + Google Analytics (GA4), loaded on every page by nav.js.
//
// What it does:
//  1. Sets the DEFAULT consent for Google Analytics by country: Georgia (GE) = counting is on, every other country = off until the visitor says OK.
//     (Google's Consent Mode decides the country itself; see https://developers.google.com/tag-platform/security/guides/consent)
//  2. Shows a thin one-line banner at the bottom of the two home pages (/ and /en/) until the visitor picks Yes / No. The choice is kept in the browser (localStorage "kp-consent").
//  3. Adds a "Cookie settings" link to the footer so the visitor can change the choice later.
//  4. Loads Google's tag (gtag.js) once GA_ID below has a value.
//
// Until GA_ID is filled in this file does nothing visible: no banner, no footer link, no Google script.
// To look at the banner before that, open any page with ?consent=show at the end of the address (it only previews; nothing is sent to Google).
// Texts are in TEXT below (English and Georgian). Look is in the CSS string at the bottom.
(function () {
  const GA_ID = ""; // <- the GA4 Measurement ID, like "G-XXXXXXXXXX". It is public by design (every visitor can see it in the page).
  const PREVIEW = /[?&]consent=show\b/.test(location.search);
  if (!GA_ID && !PREVIEW) return;

  const KA = document.documentElement.lang === "ka";
  const KEY = "kp-consent"; // "granted" or "denied"
  const root = new URL(".", document.currentScript ? document.currentScript.src : location.href).href; // folder that holds consent.js = the site root
  const TEXT = KA
    ? { msg: "ჩვენ ვიყენებთ cookie ფაილებს საიტის გასაუმჯობესებლად. ეთანხმები?",
        yes: "კი", no: "არა", more: "დეტალები", label: "ქუქი-ფაილები", settings: "ქუქი-პარამეტრები", privacy: root + "ka/privacy/" }
    : { msg: "We use cookies to improve the site. Is that OK?",
        yes: "Yes", no: "No", more: "Details", label: "Cookies", settings: "Cookie settings", privacy: root + "privacy/" };
  const seg = location.pathname.split("/").filter(Boolean);
  const IS_HOME = seg.length === 0 || (seg.length === 1 && (seg[0] === "en" || seg[0] === "ka")); // the front pages: / (Georgian), /en/ (English), /ka/ (forwards to /)

  const read = () => { try { const v = localStorage.getItem(KEY); return v === "granted" || v === "denied" ? v : null; } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  const clear = () => { try { localStorage.removeItem(KEY); } catch (e) {} };

  // ---- Google Analytics with Consent Mode (only when there is an ID) ----
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  const setConsent = (v) => gtag("consent", "update", { analytics_storage: v });
  if (GA_ID) {
    const NO = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }; // we show no ads, so these stay off for everyone
    gtag("consent", "default", Object.assign({ analytics_storage: "granted", region: ["GE"] }, NO)); // Georgia: on
    gtag("consent", "default", Object.assign({ analytics_storage: "denied" }, NO)); // everywhere else: off until OK
    const saved = read();
    if (saved) setConsent(saved);
    gtag("js", new Date());
    gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  // ---- the banner ----
  let box = null;
  const hide = () => { if (box) { box.remove(); box = null; } };
  const choose = (v) => { if (GA_ID) { save(v); setConsent(v); } hide(); }; // a preview (no ID yet) saves nothing
  const ensureCss = () => {
    if (document.getElementById("kp-consent-css")) return;
    const st = document.createElement("style");
    st.id = "kp-consent-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  };
  const show = () => {
    if (box) return;
    ensureCss();
    box = document.createElement("div");
    box.className = "kp-consent";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", TEXT.label);
    const p = document.createElement("p");
    p.textContent = TEXT.msg + " ";
    const more = document.createElement("a");
    more.href = TEXT.privacy;
    more.textContent = TEXT.more;
    p.appendChild(more);
    const row = document.createElement("div");
    row.className = "kp-consent-btns";
    const yes = document.createElement("button");
    yes.type = "button"; yes.textContent = TEXT.yes; yes.className = "kp-consent-yes";
    yes.addEventListener("click", () => choose("granted"));
    const no = document.createElement("button");
    no.type = "button"; no.textContent = TEXT.no;
    no.addEventListener("click", () => choose("denied"));
    row.append(yes, no);
    box.append(p, row);
    document.body.appendChild(box);
  };

  const start = () => {
    if ((PREVIEW || !read()) && IS_HOME) show(); // asked only on the home pages; the footer link below opens it anywhere
    // "Cookie settings" link under the footer (nav.js builds the footer when the page has loaded; this runs right after it).
    // It is its own line, not a link inside the footer: the footer row on the game pages has no room for a fourth link on a phone.
    const foot = document.querySelector(".site-footer");
    if (foot && !document.querySelector(".kp-cookie-line")) {
      ensureCss();
      const line = document.createElement("div");
      line.className = "kp-cookie-line";
      const a = document.createElement("a");
      a.href = "#cookies"; a.textContent = TEXT.settings;
      a.addEventListener("click", (e) => { e.preventDefault(); clear(); show(); });
      line.appendChild(a);
      foot.insertAdjacentElement("afterend", line);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 0)); else setTimeout(start, 0);

  // A thin strip at the bottom of the screen, small text, one line (wraps only on very narrow phones).
  const CSS = `
.kp-consent { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9000; box-sizing: border-box; padding: 6px 12px calc(6px + env(safe-area-inset-bottom));
  background: var(--paper, #F0EFEC); color: var(--ink, #1c1a17); border-top: 1px solid var(--ink, #1c1a17);
  font-family: inherit; font-size: 12px; line-height: 1.3; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 12px; }
.kp-consent p { margin: 0; }
.kp-consent a { color: inherit; text-decoration: underline; }
.kp-consent-btns { display: flex; gap: 8px; }
.kp-consent button { font: inherit; font-weight: 600; padding: 3px 14px; min-height: 28px; cursor: pointer; color: var(--ink, #1c1a17); background: transparent;
  border: 1px solid var(--ink, #1c1a17); border-radius: 4px; }
.kp-consent button.kp-consent-yes { background: var(--ink, #1c1a17); color: var(--paper, #F0EFEC); }
.kp-consent button:focus-visible, .kp-consent a:focus-visible { outline: 2px solid var(--ink, #1c1a17); outline-offset: 2px; }
.kp-cookie-line { max-width: 968px; margin: 0 auto; padding: 0 16px 18px; text-align: center; font-size: 12px; color: var(--muted, #5b5446); }
.kp-cookie-line a { color: inherit; text-decoration: underline; }
body.phone-play .kp-cookie-line { display: none; }
`;
})();
