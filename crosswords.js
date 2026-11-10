// The list of crosswords shown on the home page.
// To add a crossword: copy one { ... } block, change it, and keep the comma between blocks.
//   folder     = the puzzle's folder name
//   difficulty = "Easy", "Medium", "Hard" or "Very hard"
//   topic      = "International", "Champions League", "Club football" or "Legends"
//   answers    = how many answers the puzzle has (layout.py prints this)
window.CROSSWORDS = [
  { folder: "world-cup-winners",      name: "World Cup Winners",      difficulty: "Easy",      topic: "International",    answers: 8,  about: "Every nation that has won the men's World Cup." },
  { folder: "euro-winners",           name: "Euro Winners",           difficulty: "Medium",    topic: "International",    answers: 17, about: "Champions and heroes of the European Championship." },
  { folder: "world-cup-final-heroes", name: "World Cup Final Heroes", difficulty: "Hard",      topic: "International",    answers: 19, about: "Scorers, keepers and moments from World Cup finals." },
  { folder: "champions-league-2000s", name: "Champions League 2000s", difficulty: "Hard",      topic: "Champions League", answers: 16, about: "Finals, heroes and heartbreak from 2000 to 2009." },
  { folder: "champions-league-2010s", name: "Champions League 2010s", difficulty: "Very hard", topic: "Champions League", answers: 21, about: "Finals, comebacks and collapses from 2010 to 2019." },
  { folder: "champions-league-2020s", name: "Champions League 2020s", difficulty: "Hard",      topic: "Champions League", answers: 18, about: "Finals and big European nights from 2020 to 2026." },
  { folder: "premier-league-era",     name: "Premier League Era",     difficulty: "Hard",      topic: "Club football",    answers: 18, about: "Records, title races and famous moments since 1992." },
  { folder: "iconic-stadiums",        name: "Iconic Stadiums",        difficulty: "Medium",    topic: "Club football",    answers: 16, about: "Famous grounds and the nights that made them." },
  { folder: "ballon-dor-winners",     name: "Ballon d'Or Winners",    difficulty: "Medium",    topic: "Legends",          answers: 20, about: "Every winner from 1956 to 2025." },
  { folder: "legendary-managers",     name: "Legendary Managers",     difficulty: "Medium",    topic: "Legends",          answers: 17, about: "The coaches behind football's greatest teams." },
  { folder: "ac-milan-history",       name: "AC Milan History",       difficulty: "Very hard", topic: "Club football",    answers: 19, about: "Founders, European nights and legends, from 1899 to the 2022 title." },
];
