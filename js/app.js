const section = document.querySelector("#app");
const menuHTML = section.innerHTML;

// STICKERS
const stickers = [
  "🍎",
  "🍌",
  "🍇",
  "🍓",
  "🍒",
  "🍉",
  "🥝",
  "🍍",
  "🐶",
  "🐱",
  "🐼",
  "🦊",
  "🐸",
  "🐵",
  "🦁",
  "🐯",
  "⚽",
  "🏀",
  "🎮",
  "🎧",
  "🎸",
  "🎹",
  "🚗",
  "✈️",
];

// GAME STATE
let firstCard = null;
let secondCard = null;
let lock = false;

let players = 1;
let currentPlayer = 0;
let scores = [];

let gridSize = 4;
let matchedPairs = 0;
let totalPairs = 0;

let time = 0;
let timerInterval;

let theme = "Numbers";

// SOUNDS
const flipSound = document.getElementById("flipSound");
const matchSound = document.getElementById("matchSound");
const winSound = document.getElementById("winSound");

// BUTTON CLICK HANDLER
document.addEventListener("click", (e) => {
  // THEME SELECT
  if (e.target.parentElement.classList.contains("theme")) {
    e.target.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
  }

  // PLAYER SELECT
  if (e.target.parentElement.classList.contains("players")) {
    e.target.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
  }

  // GRID SELECT
  if (e.target.parentElement.classList.contains("grid")) {
    e.target.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
  }

  // START GAME
  if (e.target.classList.contains("start")) {
    startGame();
  }
});

// READ SETTINGS
function readSettings() {
  // Players
  players = parseInt(document.querySelector(".players .active").innerText);

  // Grid size
  gridSize =
    document.querySelector(".grid .active").innerText === "6x6" ? 6 : 4;

  // Theme
  theme = document.querySelector(".theme .active").innerText;
}

// START GAME
function startGame() {
  readSettings();

  scores = new Array(players).fill(0);
  currentPlayer = 0;
  matchedPairs = 0;
  totalPairs = (gridSize * gridSize) / 2;

  section.innerHTML = `
    <h1>Memory</h1>

    <div class="controls">
      <button class="restart">Restart</button>
      <button class="newgame">New Game</button>
      <div class="timer">Time: 0s</div>
    </div>

    <div class="scores"></div>
    <div class="game"></div>
  `;

  updateScores();
  startTimer();

  const game = document.querySelector(".game");
  game.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  // Generate cards
  let cardsArray = [];
  if (theme === "Numbers") {
    let numbers = [];
    while (numbers.length < totalPairs) {
      let rand = Math.floor(Math.random() * 500) + 1;
      if (!numbers.includes(rand)) numbers.push(rand);
    }
    cardsArray = [...numbers, ...numbers];
  } else {
    let chosen = stickers.slice(0, totalPairs);
    cardsArray = [...chosen, ...chosen];
  }

  // Shuffle
  cardsArray.sort(() => Math.random() - 0.5);

  // Create cards
  cardsArray.forEach((val) => {
    const card = document.createElement("div");
    card.className = "box";
    card.innerText = "❓";
    card.dataset.value = val;
    card.onclick = () => handleCard(card);
    game.appendChild(card);
  });

  // Restart
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("restart")) {
      clearInterval(timerInterval);
      startGame();
    }
  });

  // New Game (back to menu)
  document.querySelector(".newgame").onclick = () => {
    clearInterval(timerInterval);
    section.innerHTML = menuHTML;
  };
}

// CARD CLICK
function handleCard(card) {
  if (lock) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;

  flipSound?.play();
  card.innerText = card.dataset.value;
  card.classList.add("open");

  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    checkMatch();
  }
}

// CHECK MATCH
function checkMatch() {
  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchSound?.play();

    // Topilgan kartalar doim ochiq qoladi
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    firstCard.innerText = firstCard.dataset.value;
    secondCard.innerText = secondCard.dataset.value;

    // Ball shu playerga qo‘shiladi
    scores[currentPlayer]++;
    matchedPairs++;

    resetCards();
    updateScores();

    if (matchedPairs === totalPairs) {
      endGame();
    }
  } else {
    // Noto‘g‘ri topilgan
    lock = true;
    setTimeout(() => {
      firstCard.innerText = "❓";
      secondCard.innerText = "❓";
      firstCard.classList.remove("open");
      secondCard.classList.remove("open");

      resetCards();

      // Player almashadi
      currentPlayer = (currentPlayer + 1) % players;
      updateScores();

      lock = false;
    }, 800);
  }
}

// RESET CARDS
function resetCards() {
  firstCard = null;
  secondCard = null;
}

// SCORES
function updateScores() {
  const scoresDiv = document.querySelector(".scores");
  scoresDiv.innerHTML = scores
    .map(
      (s, i) => `
    <p ${i === currentPlayer ? "class='active-player'" : ""}>
      Player ${i + 1}: ${s}
    </p>
  `
    )
    .join("");
}

// TIMER
function startTimer() {
  time = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    time++;
    document.querySelector(".timer").innerText = `Time: ${time}s`;
  }, 1000);
}

// END GAME
function endGame() {
  clearInterval(timerInterval);
  winSound?.play();

  const max = Math.max(...scores);
  const winners = scores
    .map((s, i) => (s === max ? `Player ${i + 1}` : null))
    .filter(Boolean);

  setTimeout(() => {
    alert(
      winners.length > 1
        ? `Draw! ${winners.join(" & ")} 🏆`
        : `${winners[0]} won 🏆`
    );
  }, 300);
}
