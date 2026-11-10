// Home page: draws one card per crossword from crosswords.js, plus the Difficulty and Topic filters.
// You never need to edit this file to add a crossword — only crosswords.js.
(function () {
  const list = window.CROSSWORDS || [];
  const LEVELS = ["Easy", "Medium", "Hard", "Very hard"];
  const TOPICS = ["International", "Champions League", "Club football", "Legends"];
  const chosen = { difficulty: "All", topic: "All" };

  // Only show filter buttons for values that at least one crossword has
  const used = (key, order) => order.filter((v) => list.some((c) => c[key] === v));

  function buttons(key, values) {
    const row = document.getElementById("filter-" + key);
    ["All", ...values].forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = v;
      b.setAttribute("aria-pressed", v === "All" ? "true" : "false");
      b.addEventListener("click", () => {
        chosen[key] = v;
        row.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
        draw();
      });
      row.appendChild(b);
    });
  }

  function card(c) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = c.folder + "/";
    const name = document.createElement("span"); name.className = "name"; name.textContent = c.name;
    const size = document.createElement("span"); size.className = "size"; size.textContent = c.answers + " answers";
    const level = document.createElement("span"); level.className = "level level-" + c.difficulty.toLowerCase().replace(" ", "-"); level.textContent = c.difficulty;
    const about = document.createElement("span"); about.className = "about"; about.textContent = c.about;
    const meta = document.createElement("span"); meta.className = "meta-line"; meta.append(level, size);
    a.append(name, meta, about);
    li.appendChild(a);
    return li;
  }

  function draw() {
    const ul = document.getElementById("list");
    ul.innerHTML = "";
    const shown = list.filter((c) =>
      (chosen.difficulty === "All" || c.difficulty === chosen.difficulty) &&
      (chosen.topic === "All" || c.topic === chosen.topic));
    shown.forEach((c) => ul.appendChild(card(c)));
    document.getElementById("empty").hidden = shown.length > 0;
    document.getElementById("shown").textContent =
      shown.length === list.length ? `${list.length} crosswords` : `${shown.length} of ${list.length} crosswords`;
  }

  buttons("difficulty", used("difficulty", LEVELS));
  buttons("topic", used("topic", TOPICS));
  draw();
})();
