// Georgian version of the Top 5 game (test). Same lists and numbers as top5-lists.js, so update both files together.
// The list ids here are Georgian words in Latin letters (?list=seria-as-bombardirebi opens one list for testing). The English file keeps English ids.
// TOP5_TEXT = every word the player sees (top5.js has the English default). TOP5_LISTS = the lists.
// name = what we show. alt = other ways to type it (Georgian spellings, surnames, English names). Case and spaces do not matter.
// A Georgian name ending in -ი also works without it (კეინ = კეინი), top5.js does that by itself.
const ORD = ["პირველ", "მეორე", "მესამე", "მეოთხე", "მეხუთე"];
window.TOP5_TEXT = {
  backHref: "../ka/", back: "← სხვა თამაშები",
  h1: "გამოიცანი ტოპ 5",
  intro: "შეგიძლია გაიხსენო რეკორდსმენები, ბომბარდირები და ჩემპიონები? სამი ტოპ 5-ის გამოცნობა გამარჯვებაა.",
  kicker: (r, total, n) => `რაუნდი ${r}/${total} · ტოპ ${n}`,
  asOf: (d) => `მონაცემები: ${d}`,
  found: (f, t) => `გამოცნობილია: ${f}/${t}`,
  lives: "სიცოცხლე", ariaRound: "რაუნდი", ariaLives: "სიცოცხლე", ariaGuess: "შენი პასუხი",
  placeholder: "ჩაწერე სახელი", guess: "გამოცნობა", give: "დანებება",
  hintTip: "ვერ იხსენებ? დააკლიკე ნათურის აიქონს და სახელის პირველ ასოს ნახავ.", hintAria: "ამ სახელის პირველი ასოს ჩვენება",
  rulesTitle: "თამაშის წესები",
  rules: [
    "თამაში 3 სიისგან შედგება. ერთს დაასრულებ და შემდეგი თავისით დაიწყება. 3-ვე სია რომ დაასრულო, გაიმარჯვებ.",
    "ეკრანზე სიაა, მაგალითად, ჩემპიონატის საუკეთესო ბომბარდირების. სახელები დამალულია.",
    "ჩაწერე სახელი და დააკლიკე „გამოცნობას“. თუ ის სიაშია, თავის ადგილზე გამოჩნდება და რიცხვსაც ნახავ. სახელებს ნებისმიერი თანმიმდევრობით გამოიცნობ.",
    "არასწორ სახელზე ერთ სიცოცხლეს კარგავ. თითო სიაზე 3 სიცოცხლე გაქვს. თუ სამივე დაკარგე ან დანებდი, თამაში მთავრდება.",
    "ვერ იხსენებ? დააკლიკე ნათურის აიქონს ნებისმიერ ცარიელ ველზე და მისი სახელის პირველ ასოს ნახავ. ამას რამდენჯერაც გინდა, იმდენჯერ გააკეთებ. საბოლოო შედეგში ეს დახმარებად ჩაითვლება.",
    "საკმარისია გვარის ჩაწერაც. პატარა შეცდომა არაუშავს.",
  ],
  vague: "ძალიან ზოგადია. დააკონკრეტე.",
  already: (name) => `${name} უკვე გამოცნობილია.`,
  yes: (name, rank) => `სწორია! ${name} ${ORD[rank - 1]} ადგილზეა.`,
  notIn: (n) => `ტოპ ${n}-ში არ არის.`,
  hintMsg: (letter) => `ამ ველის სახელი იწყება ასოთი „${letter}“.`,
  source: "წყარო",
  listDone: () => "სია გამოიცანი! 🎉 შემდეგი მალე დაიწყება…",
  gaveUp: "აი, სწორი პასუხები.", outOfLives: "სამივე სიცოცხლე დაკარგე. აი, სწორი პასუხები.",
  wonTitle: () => "გილოცავ! 🏆", wonText: (total) => `${total} სია ზედიზედ გამოიცანი!`, lostTitle: "ამჯერად არ გამოგივიდა",
  hintsUsed: (h) => `ასოს ჩვენება ${h}-ჯერ გამოიყენე.`,
  lostText: (done, total) => (done ? `${total}-დან ${done} გამოიცანი.` : "ამჯერად ვერცერთი ვერ გამოიცანი."),
  perfect: "⭐ დახმარების გამოყენების გარეშე!",
  share: "გააზიარე", againWon: "ახალი თამაში", againLost: "კიდევ სცადე", seeLast: "ბოლო სიის ნახვა", seeAnswers: "პასუხების ნახვა",
  copied: "დაკოპირდა! ჩასვი სადმე და გაუზიარე.",
  shareTitle: "⚽ გამოიცანი ტოპ 5",
  shareScore: (won, done, total, help) => `${won ? "🏆" : "✅"} ${done}/${total} სია ზედიზედ · ${help}`,
  shareHelp: (h) => (h ? `დახმარება: ${h}-ჯერ` : "დახმარების გარეშე"),
};

const MESSI = { name: "ლიონელ მესი", alt: ["მესი", "მესსი", "ლეო მესი", "ლეო", "ლიონელი", "messi", "leo messi", "lionel messi"] };
const CR7 = { name: "კრიშტიანუ რონალდუ", alt: ["კრისტიანო", "კრიშტიანო", "კრიშტიანო რონალდო", "რონალდუ", "კრიშტიანუ", "კრისტიანუ რონალდუ", "კრისტიანო რონალდო", "ronaldo", "cristiano", "cr7", "cristiano ronaldo"] };
const LEWA = { name: "რობერტ ლევანდოვსკი", alt: ["ლევანდოვსკი", "ლევა", "რობერტი", "lewandowski", "lewy", "robert"] };
const BENZEMA = { name: "კარიმ ბენზემა", alt: ["ბენზემა", "კარიმი", "benzema", "karim"] };
const MBAPPE = { name: "კილიან მბაპე", alt: ["მბაპე", "ემბაპე", "კილიანი", "mbappe", "kylian"] };
const GMULLER = { name: "გერდ მიულერი", alt: ["მიულერი", "მულერი", "გერდ მულერი", "გერდი", "muller", "mueller", "gerd", "gerd muller", "gerd mueller", "der bomber"] };
const KANE = { name: "ჰარი კეინი", alt: ["კეინი", "ჰარი", "kane", "harry"] };

window.TOP5_LISTS = [
  {
    id: "chempionta-ligis-bombardirebi",
    title: "ჩემპიონთა ლიგის ყველა დროის საუკეთესო ბომბარდირები",
    unit: "გოლი",
    asOf: "2026 წლის 4 ნოემბრის მდგომარეობით",
    note: "მბაპე ისევ თამაშობს, ამიტომ მისი გოლების რაოდენობა გაიზრდება.",
    source: "https://www.si.com/soccer/kylian-mbappe-falls-agonizingly-short-famous-lionel-messi-champions-league-record",
    items: [
      { ...CR7, value: "140" },
      { ...MESSI, value: "129" },
      { ...LEWA, value: "109" },
      { ...BENZEMA, value: "90" },
      { ...MBAPPE, value: "74+" },
    ],
  },
  {
    id: "premierligis-titulebi",
    title: "პრემიერლიგის ტიტულები კლუბების მიხედვით",
    unit: "ტიტული",
    asOf: "2025-26 სეზონის დასასრულის მდგომარეობით",
    note: "მხოლოდ პრემიერლიგის ეპოქა (1992-93-დან).",
    source: "https://www.nbcchicago.com/news/sports/soccer/teams-most-premier-league-titles/3731421/?amp=1",
    ambiguous: ["მანჩესტერი", "მანჩესტერ", "მან", "manchester", "man"],
    items: [
      { name: "მანჩესტერ იუნაიტედი", alt: ["იუნაიტედი", "მიუ", "man united", "man utd", "united", "manchester united", "manchester utd", "mufc"], value: "13" },
      { name: "მანჩესტერ სიტი", alt: ["სიტი", "man city", "city", "manchester city", "mcfc"], value: "8" },
      { name: "ჩელსი", alt: ["chelsea", "chelsea fc"], value: "5" },
      { name: "არსენალი", alt: ["არსენალ", "arsenal", "arsenal fc", "gunners"], value: "4" },
      { name: "ლივერპული", alt: ["ლივერპულ", "liverpool", "liverpool fc", "lfc"], value: "2" },
    ],
  },
  {
    id: "la-ligis-bombardirebi",
    title: "ლა ლიგის ყველა დროის საუკეთესო ბომბარდირები",
    unit: "გოლი",
    asOf: "2026 წლის ნოემბრის მდგომარეობით",
    note: "მხოლოდ ლიგის გოლები. ხუთივე უკვე აღარ თამაშობს ლა ლიგაში.",
    source: "https://en.wikipedia.org/wiki/List_of_La_Liga_top_scorers",
    items: [
      { ...MESSI, value: "474" },
      { ...CR7, value: "311" },
      { name: "ტელმო ზარა", alt: ["ზარა", "ტელმო", "თელმო ზარა", "თელმო", "ზარრა", "ტელმო ზარრა", "zarra", "telmo", "telmo zarra"], value: "251" },
      { ...BENZEMA, value: "238" },
      { name: "უგო სანჩესი", alt: ["სანჩესი", "ჰუგო სანჩესი", "ჰუგო", "უგო", "hugo sanchez", "sanchez", "hugo"], value: "234" },
    ],
  },
  {
    id: "premierligis-bombardirebi",
    title: "პრემიერლიგის ყველა დროის საუკეთესო ბომბარდირები",
    unit: "გოლი",
    asOf: "2026 წლის ნოემბრის მდგომარეობით",
    note: "მხოლოდ პრემიერლიგის გოლები (1992-93-დან). ხუთიდან არცერთი აღარ თამაშობს პრემიერლიგაში.",
    source: "https://www.nbcsports.com/soccer/news/premier-league-all-time-goals-leaders-scoring-records-stats-100-goals-top-50",
    items: [
      { name: "ალან შირერი", alt: ["შირერი", "ალან", "shearer", "alan"], value: "260" },
      { ...KANE, value: "213" },
      { name: "ვეინ რუნი", alt: ["რუნი", "ვეინი", "ვეინ", "rooney", "wayne"], value: "208" },
      { name: "მოჰამედ სალაჰი", alt: ["სალაჰი", "მოჰამედ", "მუჰამედ სალაჰი", "მო სალაჰი", "მო", "salah", "mo salah", "mohamed"], value: "193" },
      { name: "ენდი კოული", alt: ["კოული", "კოლი", "ენდი", "ენდრიუ კოული", "ენდრიუ", "cole", "andy cole", "andrew cole", "andy", "andrew"], value: "187" },
    ],
  },
  {
    id: "bundesligis-bombardirebi",
    title: "ბუნდესლიგის ყველა დროის საუკეთესო ბომბარდირები",
    unit: "გოლი",
    asOf: "2026 წლის 18 ოქტომბრის მდგომარეობით",
    note: "მხოლოდ ლიგის გოლები. ძალიან რთულია!",
    source: "https://en.wikipedia.org/wiki/List_of_Bundesliga_top_scorers",
    items: [
      { ...GMULLER, value: "365" },
      { ...LEWA, value: "312" },
      { name: "კლაუს ფიშერი", alt: ["ფიშერი", "კლაუს", "fischer", "klaus"], value: "268" },
      { name: "იუპ ჰაინკესი", alt: ["ჰაინკესი", "ჰეინკესი", "იუპი", "იუპ", "იოზეფ ჰაინკესი", "heynckes", "josef heynckes", "jupp"], value: "220" },
      { name: "მანფრედ ბურგსმიულერი", alt: ["ბურგსმიულერი", "ბურგსმულერი", "მანი ბურგსმიულერი", "მანფრედ", "burgsmuller", "burgsmueller", "manni burgsmuller", "manfred"], value: "213" },
    ],
  },
  {
    id: "msoflio-chempionatis-bombardirebi",
    title: "მსოფლიო ჩემპიონატის ყველა დროის საუკეთესო ბომბარდირები",
    unit: "გოლი",
    asOf: "2026 წლის ფინალის შემდეგ",
    note: "მიულერსა და კეინს 14-14 გოლი აქვთ და მეხუთე ადგილს იზიარებენ. რონალდო ბრაზილიელია.",
    source: "https://www.thestar.com.my/sport/football/2026/07/19/factbox-soccer-list-of-all-time-top-scorers-at-world-cup",
    items: [
      { ...MBAPPE, value: "22" },
      { ...MESSI, value: "21" },
      { name: "მიროსლავ კლოზე", alt: ["კლოზე", "კლოსე", "მიროსლავ", "მირო კლოზე", "klose", "miro klose", "miroslav"], value: "16" },
      { name: "რონალდო (ბრაზილია)", alt: ["რონალდო", "რონალდუ", "ნაზარიო", "რონალდო ნაზარიო", "ბრაზილიელი რონალდო", "ronaldo", "ronaldo nazario", "nazario", "r9", "ronaldo brazil", "brazilian ronaldo"], value: "15" },
      { ...GMULLER, rank: 5, value: "14" },
      { ...KANE, rank: 5, value: "14" },
    ],
  },
  {
    id: "seria-as-bombardirebi",
    title: "სერია A-ს ყველა დროის საუკეთესო ბომბარდირები",
    unit: "გოლი",
    top: 5,
    asOf: "2025-26 სეზონის დასასრულის მდგომარეობით",
    note: "მხოლოდ ლიგის გოლები. მეაცა და ალტაფინი 216-216 გოლით მეოთხე ადგილს იზიარებენ.",
    source: "https://rsssf.org/tablesi/italtops-allt.html",
    items: [
      { name: "სილვიო პიოლა", alt: ["პიოლა", "სილვიო", "piola", "silvio"], value: "274" },
      { name: "ფრანჩესკო ტოტი", alt: ["ტოტი", "ფრანჩესკო", "totti", "francesco"], value: "250" },
      { name: "გუნარ ნორდალი", alt: ["ნორდალი", "გუნარ", "გუნარი", "nordahl", "gunnar"], value: "225" },
      { name: "ჯუზეპე მეაცა", rank: 4, alt: ["მეაცა", "ჯუზეპე", "meazza", "giuseppe"], value: "216" },
      { name: "ჟოზე ალტაფინი", rank: 4, alt: ["ალტაფინი", "ჟოზე", "ხოზე", "altafini", "jose altafini", "jose", "mazola"], value: "216" },
    ],
  },
  {
    id: "yvelaze-meti-matchi-chempionta-ligaze",
    title: "ყველაზე მეტი მატჩი ჩემპიონთა ლიგაზე",
    unit: "მატჩი",
    top: 5,
    asOf: "2026 წლის 4 ნოემბრის მდგომარეობით",
    note: "მესიმ და მიულერმა 163-163 მატჩი ითამაშეს და მეოთხე ადგილს იზიარებენ. ნოიერი ისევ თამაშობს, ამიტომ მისი მატჩების რაოდენობა გაიზრდება.",
    source: "https://www.uefa.com/uefachampionsleague/news/0257-0e9a10f58015-92c648e6303d-1000--who-has-played-100-games/",
    items: [
      { ...CR7, value: "183" },
      { name: "იკერ კასილასი", alt: ["კასილასი", "კასიასი", "კასილიასი", "იკერი", "იკერ", "casillas", "iker"], value: "177" },
      { name: "მანუელ ნოიერი", alt: ["ნოიერი", "მანუელი", "მანუელ", "neuer", "manuel"], value: "164+" },
      { ...MESSI, rank: 4, value: "163" },
      { name: "თომას მიულერი", rank: 4, alt: ["მიულერი", "მულერი", "თომასი", "თომას", "muller", "mueller", "thomas", "thomas muller", "thomas mueller"], value: "163" },
    ],
  },
];
