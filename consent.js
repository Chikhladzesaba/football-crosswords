// Cookie banner + Google Analytics (GA4), loaded on every page by nav.js.
//
// What it does:
//  1. Sets the DEFAULT consent for Google Analytics by country: Georgia (GE) = counting is on, every other country = off until the visitor says OK.
//     (Google's Consent Mode decides the country itself; see https://developers.google.com/tag-platform/security/guides/consent)
//  2. Shows a floating card at the bottom of the two home pages (/ and /en/) until the visitor picks agree / don't agree. The choice is kept in the browser (localStorage "kp-consent").
//  3. The Privacy pages have a "Cookie settings" link (data-cookie-settings) so the visitor can change the choice later.
//  4. Loads Google's tag (gtag.js) once GA_ID below has a value.
//
// If GA_ID is ever emptied, this file does nothing visible again: no banner, no Google script.
// To look at the banner, open a home page with ?consent=show at the end of the address.
// Texts are in TEXT below (English and Georgian). Look is in the CSS string at the bottom.
(function () {
  const GA_ID = "G-53QQD3NGCL"; // <- the GA4 Measurement ID, like "G-XXXXXXXXXX". It is public by design (every visitor can see it in the page).
  const PREVIEW = /[?&]consent=show\b/.test(location.search);
  if (!GA_ID && !PREVIEW) return;

  const KA = document.documentElement.lang === "ka";
  const KEY = "kp-consent"; // "granted" or "denied"
  const root = new URL(".", document.currentScript ? document.currentScript.src : location.href).href; // folder that holds consent.js = the site root
  const TEXT = KA
    ? { msg: "თამაშების დასახვეწად და თქვენი გამოცდილების გასაუმჯობესებლად, ჩვენ ვაგროვებთ cookie მონაცემებს.",
        yes: "ვეთანხმები", no: "არ ვეთანხმები", label: "ქუქი-ფაილები", settings: "ქუქი-პარამეტრები", privacy: root + "ka/privacy/" }
    : { msg: "To improve our games and your experience, we collect cookie data.",
        yes: "I agree", no: "I don't agree", label: "Cookies", settings: "Cookie settings", privacy: root + "privacy/" };
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
    // The games call kpTrack("event_name", { ...details }) to tell Google Analytics that something happened (a game was started, finished, shared).
    // It is sent the same way as page views, so it follows the same cookie choice. Nothing is sent when GA_ID is empty.
    window.kpTrack = (name, params) => { try { gtag("event", name, params || {}); } catch (e) {} };
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
    p.textContent = TEXT.msg;
    const icon = document.createElement("span");
    icon.className = "kp-consent-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = COOKIE_SVG;
    const row = document.createElement("div");
    row.className = "kp-consent-btns";
    const yes = document.createElement("button");
    yes.type = "button"; yes.textContent = TEXT.yes;
    yes.addEventListener("click", () => choose("granted"));
    const no = document.createElement("button");
    no.type = "button"; no.textContent = TEXT.no;
    no.addEventListener("click", () => choose("denied"));
    row.append(no, yes); // both buttons look the same: no answer is pushed harder than the other
    box.append(icon, p, row);
    document.body.appendChild(box);
  };

  const start = () => {
    if ((PREVIEW || !read()) && IS_HOME) show(); // asked only on the home pages; the Cookie settings link on the Privacy pages opens it
    // "Cookie settings": any link marked data-cookie-settings (it is on the Privacy pages) clears the saved answer and asks again.
    document.querySelectorAll("[data-cookie-settings]").forEach((a) => {
      a.addEventListener("click", (e) => { e.preventDefault(); clear(); show(); });
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 0)); else setTimeout(start, 0);

  // A floating card at the bottom of the screen (paper style: 2px ink border, small radius, offset shadow). Same look on every screen size; on phones the buttons go under the text.
  const COOKIE_SVG = '<svg width="38" height="38" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 3a15 15 0 1 0 15 15 6 6 0 0 1-6-6 6 6 0 0 1-6-6 6 6 0 0 1-3-3z"/><circle cx="12" cy="15" r="1.6" fill="currentColor"/><circle cx="19" cy="24" r="1.6" fill="currentColor"/><circle cx="11" cy="25" r="1.3" fill="currentColor"/><circle cx="24" cy="18" r="1.3" fill="currentColor"/></svg>';
  const CSS = `
.kp-consent { position: fixed; left: 12px; right: 12px; bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 9000; box-sizing: border-box; max-width: 720px; margin: 0 auto; padding: 14px;
  background: var(--paper, #F0EFEC); color: var(--ink, #1c1a17); border: 2px solid var(--ink, #1c1a17); border-radius: 6px; box-shadow: 5px 5px 0 var(--ink, #1c1a17);
  font-family: inherit; font-size: 15px; line-height: 1.45; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.kp-consent-icon { flex: none; display: flex; }
.kp-consent p { margin: 0; flex: 1 1 0; min-width: 0; }
.kp-consent-btns { display: flex; gap: 10px; flex: 1 1 100%; }
.kp-consent button { flex: 1; font: inherit; font-weight: 700; padding: 0 14px; min-height: 44px; cursor: pointer; color: var(--ink, #1c1a17); background: var(--paper, #F0EFEC);
  border: 2px solid var(--ink, #1c1a17); border-radius: 6px; }
.kp-consent button:focus-visible { outline: 3px solid var(--ink, #1c1a17); outline-offset: 2px; }
@media (min-width: 700px) { .kp-consent { left: 24px; right: 24px; bottom: 20px; flex-wrap: nowrap; padding: 14px 16px; } .kp-consent-btns { flex: none; } .kp-consent button { flex: none; } }
`;
})();
