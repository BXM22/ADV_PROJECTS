const body = document.body;
const root = document.documentElement;
const moodBtn = document.querySelector(".mood-toggle");
const shuffleBtn = document.querySelector(".shuffle");
const spotlightFrame = document.querySelector(".spotlight-frame");
const yearSpan = document.querySelector("#year");

const accentCombos = [
  { accent: "#ffe66d", alt: "#59f3c8" },
  { accent: "#ff9ff3", alt: "#93f0ff" },
  { accent: "#ff8ba7", alt: "#f5ff7d" },
  { accent: "#ffb677", alt: "#9af7ff" },
];

const gradientCombos = [
  "radial-gradient(circle at top left, #ff7bbf, #6b5cff 40%, #1c1b33)",
  "radial-gradient(circle at top, #92f7ff, #ff8fe3 45%, #2a1c4f)",
  "radial-gradient(circle at bottom right, #ffd07f, #ff6ad5 55%, #221a3f)",
  "radial-gradient(circle at center, #9df9ff, #7f7fff 50%, #1c1640)",
];

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

if (moodBtn) {
  moodBtn.addEventListener("click", () => {
    body.classList.toggle("alt-mood");
    const gradientIndex = Math.floor(Math.random() * gradientCombos.length);
    body.style.background = body.classList.contains("alt-mood")
      ? gradientCombos[gradientIndex]
      : "";
  });
}

if (shuffleBtn && spotlightFrame) {
  shuffleBtn.addEventListener("click", () => {
    const { accent, alt } =
      accentCombos[Math.floor(Math.random() * accentCombos.length)];
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-alt", alt);

    spotlightFrame.classList.remove("active");
    // Trigger reflow for animation replay
    void spotlightFrame.offsetWidth;
    spotlightFrame.classList.add("active");
  });
}



