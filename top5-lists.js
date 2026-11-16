// Lists for the Top 5 game (test version, English).
// Rules for a list: the numbers must all be different (no ties), and the last place must be clearly ahead of the one just outside the list.
// name = what we show. alt = other ways a player can type it (surnames, nicknames), lowercase, no accents needed.
// ambiguous = words that are too vague to count as a guess (no life lost).
// asOf = when the numbers were checked. For lists with active players, update the numbers now and then.
window.TOP5_LISTS = [
  {
    id: "ucl-scorers",
    title: "Champions League all-time top scorers",
    unit: "goals",
    asOf: "21 Oct 2026",
    note: "Mbappé is still scoring, so his total will grow.",
    source: "https://worldsoccertalk.com/news/kylian-mbappe-enters-champions-league-all-time-top-5-goalscorers-closing-in-on-cristiano-ronaldo-and-lionel-messi",
    items: [
      { name: "Cristiano Ronaldo", alt: ["ronaldo", "cristiano", "cr7"], value: "140" },
      { name: "Lionel Messi", alt: ["messi", "leo messi"], value: "129" },
      { name: "Robert Lewandowski", alt: ["lewandowski", "lewy", "robert"], value: "109" },
      { name: "Karim Benzema", alt: ["benzema"], value: "90" },
      { name: "Kylian Mbappé", alt: ["mbappe", "kylian"], value: "73+" },
    ],
  },
  {
    id: "pl-titles",
    title: "Premier League titles by club",
    unit: "titles",
    asOf: "end of 2025-26",
    note: "Premier League era only (since 1992-93).",
    source: "https://www.nbcchicago.com/news/sports/soccer/teams-most-premier-league-titles/3731421/?amp=1",
    ambiguous: ["manchester", "man"],
    items: [
      { name: "Manchester United", alt: ["man united", "man utd", "united", "manchester utd", "mufc"], value: "13" },
      { name: "Manchester City", alt: ["man city", "city", "mcfc"], value: "8" },
      { name: "Chelsea", alt: ["chelsea fc"], value: "5" },
      { name: "Arsenal", alt: ["arsenal fc", "gunners"], value: "4" },
      { name: "Liverpool", alt: ["liverpool fc", "lfc"], value: "2" },
    ],
  },
  {
    id: "laliga-scorers",
    title: "La Liga all-time top scorers",
    unit: "goals",
    asOf: "Nov 2026",
    note: "League goals only. All five have left La Liga.",
    source: "https://en.wikipedia.org/wiki/List_of_La_Liga_top_scorers",
    items: [
      { name: "Lionel Messi", alt: ["messi", "leo messi"], value: "474" },
      { name: "Cristiano Ronaldo", alt: ["ronaldo", "cristiano", "cr7"], value: "311" },
      { name: "Telmo Zarra", alt: ["zarra", "telmo"], value: "251" },
      { name: "Karim Benzema", alt: ["benzema"], value: "238" },
      { name: "Hugo Sánchez", alt: ["hugo sanchez", "sanchez", "hugo"], value: "234" },
    ],
  },
  {
    id: "wc-scorers",
    title: "World Cup all-time top scorers",
    unit: "goals",
    asOf: "after the 2026 final",
    note: "Only four names, because the next place is a tie.",
    source: "https://www.thestar.com.my/sport/football/2026/07/19/factbox-soccer-list-of-all-time-top-scorers-at-world-cup",
    items: [
      { name: "Kylian Mbappé", alt: ["mbappe", "kylian"], value: "22" },
      { name: "Lionel Messi", alt: ["messi", "leo messi"], value: "21" },
      { name: "Miroslav Klose", alt: ["klose", "miro klose"], value: "16" },
      { name: "Ronaldo (Brazil)", alt: ["ronaldo", "ronaldo nazario", "nazario", "r9", "ronaldo brazil", "brazilian ronaldo"], value: "15" },
    ],
  },
];
