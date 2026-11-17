// Word pool for the Word Search game (test version, English).
// One word per line. w = the word in capitals, no spaces and no accents (Bernabéu -> BERNABEU, Maracanã -> MARACANA).
// cat = players | coaches | stadiums | teams.  lvl = easy | medium | hard.
// Easy = known by almost everyone. Medium = known by a regular fan. Hard = longer, harder to spell or less famous.
// The game picks 10 words each round: 4 easy, 3 medium, 3 hard. So keep at least 4 easy, 3 medium and 3 hard words here.
// Keep every word 11 letters or fewer. The grid is 11 x 11 on a computer and 10 x 10 on a phone, and longer words are left out of the game.
window.WORDSEARCH_WORDS = [
  // Players
  { w: "MESSI", cat: "players", lvl: "easy" },
  { w: "RONALDO", cat: "players", lvl: "easy" },
  { w: "MARADONA", cat: "players", lvl: "easy" },
  { w: "ZIDANE", cat: "players", lvl: "easy" },
  { w: "NEYMAR", cat: "players", lvl: "easy" },
  { w: "MODRIC", cat: "players", lvl: "medium" },
  { w: "SALAH", cat: "players", lvl: "medium" },
  { w: "MBAPPE", cat: "players", lvl: "medium" },
  { w: "INIESTA", cat: "players", lvl: "medium" },
  { w: "LEWANDOWSKI", cat: "players", lvl: "hard" },
  { w: "KVARATSKHELIA", cat: "players", lvl: "hard" },
  { w: "BECKENBAUER", cat: "players", lvl: "hard" },
  { w: "BERGKAMP", cat: "players", lvl: "hard" },
  { w: "SHEVCHENKO", cat: "players", lvl: "hard" },
  // Coaches
  { w: "FERGUSON", cat: "coaches", lvl: "easy" },
  { w: "MOURINHO", cat: "coaches", lvl: "easy" },
  { w: "GUARDIOLA", cat: "coaches", lvl: "easy" },
  { w: "KLOPP", cat: "coaches", lvl: "medium" },
  { w: "WENGER", cat: "coaches", lvl: "medium" },
  { w: "ANCELOTTI", cat: "coaches", lvl: "medium" },
  { w: "SIMEONE", cat: "coaches", lvl: "medium" },
  { w: "FLICK", cat: "coaches", lvl: "hard" },
  // Stadiums
  { w: "WEMBLEY", cat: "stadiums", lvl: "easy" },
  { w: "ANFIELD", cat: "stadiums", lvl: "easy" },
  { w: "CAMPNOU", cat: "stadiums", lvl: "easy" },
  { w: "BERNABEU", cat: "stadiums", lvl: "medium" },
  { w: "MARACANA", cat: "stadiums", lvl: "medium" },
  { w: "SANSIRO", cat: "stadiums", lvl: "medium" },
  { w: "MESTALLA", cat: "stadiums", lvl: "hard" },
  { w: "BOMBONERA", cat: "stadiums", lvl: "hard" },
  // Teams
  { w: "LIVERPOOL", cat: "teams", lvl: "easy" },
  { w: "BARCELONA", cat: "teams", lvl: "easy" },
  { w: "ARSENAL", cat: "teams", lvl: "easy" },
  { w: "CHELSEA", cat: "teams", lvl: "easy" },
  { w: "JUVENTUS", cat: "teams", lvl: "medium" },
  { w: "BENFICA", cat: "teams", lvl: "medium" },
  { w: "AJAX", cat: "teams", lvl: "medium" },
  { w: "GALATASARAY", cat: "teams", lvl: "hard" },
  { w: "DORTMUND", cat: "teams", lvl: "hard" },
  { w: "CELTIC", cat: "teams", lvl: "hard" },
];
