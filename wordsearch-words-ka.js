// Georgian version of the Word Search game (test). Same game code as English (wordsearch.js).
// WORDSEARCH_TEXT = every word the player sees (wordsearch.js has the English default).
// WORDSEARCH_WORDS = the word pool. One word per line, Georgian letters, no spaces.
// cat = players | coaches | stadiums | teams.  lvl = easy | medium | hard.
// The game picks 10 words each round: 4 easy, 3 medium, 3 hard. So keep at least 4 easy, 3 medium and 3 hard words here.
// Keep every word 11 letters or fewer. The grid is 11 x 11 on a computer and 10 x 10 on a phone, and longer words are left out of the game.
// All words are spellings that already appear on the site (crosswords or Scramble).
window.WORDSEARCH_TEXT = {
  backHref: "../ka/", back: "← სხვა თამაშები",
  h1: "სკაუტი",
  intro: "იპოვე დამალული სიტყვები: ფეხბურთელების გვარები, სტადიონის სახელები, ცნობილი მწვრთნელები.",
  cats: { players: "ფეხბურთელები", coaches: "მწვრთნელები", stadiums: "სტადიონები", teams: "გუნდები" },
  found: (f, t) => `${f} / ${t}`,
  hint: "მინიშნება", give: "დანებება", newGame: "ახალი თამაში",
  rulesTitle: "თამაშის წესები",
  rules: [
    "ცხრილში 10 ფეხბურთის სიტყვაა დამალული: ფეხბურთელები, მწვრთნელები, სტადიონები და გუნდები.",
    "დააკლიკე სიტყვის პირველ ასოს, მერე ბოლო ასოს. კომპიუტერზე მაუსის გადატარებითაც შეგიძლია მონიშვნა.",
    "სიტყვები სწორ ხაზზეა: გვერდზე, ქვემოთ ან დიაგონალზე. რთული სიტყვები უკუღმაც შეიძლება იყოს.",
    "გაიჭედე? „მინიშნება“ ერთი სიტყვის პირველ ასოს მონიშნავს. საბოლოო შედეგში ეს დახმარებად ჩაითვლება.",
  ],
  hintMsg: "ერთი პირველი ასო მონიშნულია.",
  wrong: "ასეთი სიტყვა სიაში არ არის.",
  foundMsg: (w) => `ნაპოვნია: ${w}!`,
  wonTitle: "გილოცავ! 🏆",
  wonText: (t, h, n) => `${n}-ვე სიტყვა ${t}-ში იპოვე` + (h ? `, ${h} მინიშნებით.` : "!"),
  lostTitle: "ამჯერად არ გამოგივიდა",
  lostText: (f, t) => (f ? `${t} სიტყვიდან ${f} იპოვე. დანარჩენები ცხრილში ჩანს.` : "ამჯერად ერთიც ვერ იპოვე. სიტყვები ცხრილში ჩანს."),
  perfect: "⭐ დახმარების გარეშე!",
  share: "გააზიარე", againWon: "ითამაშე თავიდან", againLost: "კიდევ სცადე", seeGrid: "ცხრილის ნახვა",
  copied: "დაკოპირდა! ჩასვი სადმე და გაუზიარე.",
  shareTitle: "⚽ სკაუტი",
  shareLine: (f, t, time, help) => `${f === t ? "🏆" : "✅"} ${f}/${t} · ${time} წუთი · ${help}`,
  shareHelp: (h) => (h ? `${h} მინიშნება` : "დახმარების გარეშე"),
  ariaGrid: "ასოების ცხრილი", ariaTime: "დრო",
};

window.WORDSEARCH_WORDS = [
  // Players
  { w: "მესი", cat: "players", lvl: "easy" },
  { w: "რონალდუ", cat: "players", lvl: "easy" },
  { w: "მარადონა", cat: "players", lvl: "easy" },
  { w: "ზიდანი", cat: "players", lvl: "easy" },
  { w: "ნეიმარი", cat: "players", lvl: "easy" },
  { w: "მოდრიჩი", cat: "players", lvl: "medium" },
  { w: "სალაჰი", cat: "players", lvl: "medium" },
  { w: "მბაპე", cat: "players", lvl: "medium" },
  { w: "ინიესტა", cat: "players", lvl: "medium" },
  { w: "ლევანდოვსკი", cat: "players", lvl: "hard" },
  { w: "კვარაცხელია", cat: "players", lvl: "hard" },
  { w: "ბეკენბაუერი", cat: "players", lvl: "hard" },
  { w: "ბერგკამპი", cat: "players", lvl: "hard" },
  { w: "შევჩენკო", cat: "players", lvl: "hard" },
  // Coaches
  { w: "ფერგიუსონი", cat: "coaches", lvl: "easy" },
  { w: "მოურინიო", cat: "coaches", lvl: "easy" },
  { w: "გვარდიოლა", cat: "coaches", lvl: "easy" },
  { w: "კლოპი", cat: "coaches", lvl: "medium" },
  { w: "ვენგერი", cat: "coaches", lvl: "medium" },
  { w: "ანჩელოტი", cat: "coaches", lvl: "medium" },
  { w: "სიმეონე", cat: "coaches", lvl: "medium" },
  { w: "ფლიკი", cat: "coaches", lvl: "hard" },
  // Stadiums
  { w: "უემბლი", cat: "stadiums", lvl: "easy" },
  { w: "ენფილდი", cat: "stadiums", lvl: "easy" },
  { w: "კამპნოუ", cat: "stadiums", lvl: "easy" },
  { w: "ბერნაბეუ", cat: "stadiums", lvl: "medium" },
  { w: "მარაკანა", cat: "stadiums", lvl: "medium" },
  { w: "სანსირო", cat: "stadiums", lvl: "medium" },
  { w: "მესტალია", cat: "stadiums", lvl: "hard" },
  { w: "ბომბონერა", cat: "stadiums", lvl: "hard" },
  // Teams
  { w: "ლივერპული", cat: "teams", lvl: "easy" },
  { w: "ბარსელონა", cat: "teams", lvl: "easy" },
  { w: "არსენალი", cat: "teams", lvl: "easy" },
  { w: "ჩელსი", cat: "teams", lvl: "easy" },
  { w: "იუვენტუსი", cat: "teams", lvl: "medium" },
  { w: "ბენფიკა", cat: "teams", lvl: "medium" },
  { w: "აიაქსი", cat: "teams", lvl: "medium" },
  { w: "გალატასარაი", cat: "teams", lvl: "hard" },
  { w: "დორტმუნდი", cat: "teams", lvl: "hard" },
  { w: "სელტიკი", cat: "teams", lvl: "hard" },
];
