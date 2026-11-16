// Word pool for the Word Search game (test version, English).
// One word per line. w = the word in capitals, no spaces and no accents (Bernabéu -> BERNABEU, Maracanã -> MARACANA).
// cat = players | coaches | stadiums | teams.  lvl = easy | medium | hard.
// Easy = known by almost everyone. Medium = known by a regular fan. Hard = longer, harder to spell or less famous.
// The game picks 10 words each round: 4 easy, 3 medium, 3 hard. So keep at least 4 easy, 3 medium and 3 hard words here.
// Keep every word 14 letters or fewer (the grid is 14 x 14).
window.WORDSEARCH_WORDS = [
  // Players
  { w: "MESSI", cat: "players", lvl: "easy" },
  { w: "RONALDO", cat: "players", lvl: "easy" },
  { w: "MARADONA", cat: "players", lvl: "easy" },
  { w: "MODRIC", cat: "players", lvl: "medium" },
  { w: "SALAH", cat: "players", lvl: "medium" },
  { w: "LEWANDOWSKI", cat: "players", lvl: "hard" },
  { w: "KVARATSKHELIA", cat: "players", lvl: "hard" },
  // Coaches
  { w: "FERGUSON", cat: "coaches", lvl: "easy" },
  { w: "MOURINHO", cat: "coaches", lvl: "easy" },
  { w: "KLOPP", cat: "coaches", lvl: "medium" },
  { w: "WENGER", cat: "coaches", lvl: "medium" },
  { w: "ANCELOTTI", cat: "coaches", lvl: "medium" },
  { w: "SHANKLY", cat: "coaches", lvl: "hard" },
  // Stadiums
  { w: "WEMBLEY", cat: "stadiums", lvl: "easy" },
  { w: "ANFIELD", cat: "stadiums", lvl: "easy" },
  { w: "CAMPNOU", cat: "stadiums", lvl: "easy" },
  { w: "BERNABEU", cat: "stadiums", lvl: "medium" },
  { w: "MARACANA", cat: "stadiums", lvl: "medium" },
  { w: "MESTALLA", cat: "stadiums", lvl: "hard" },
  // Teams
  { w: "LIVERPOOL", cat: "teams", lvl: "easy" },
  { w: "BARCELONA", cat: "teams", lvl: "easy" },
  { w: "JUVENTUS", cat: "teams", lvl: "medium" },
  { w: "BENFICA", cat: "teams", lvl: "medium" },
  { w: "FEYENOORD", cat: "teams", lvl: "hard" },
  { w: "GALATASARAY", cat: "teams", lvl: "hard" },
];
