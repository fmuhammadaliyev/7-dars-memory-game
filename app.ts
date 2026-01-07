const section = document.querySelector("#app") as HTMLElement | null;
if (!section) throw new Error("#app topilmadi");

const menuHTML: string = section.innerHTML;

const stickers: string[] = [
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

let firstCard: HTMLDivElement | null = null;
let secondCard: HTMLDivElement | null = null;
let lock = false;

let players = 1;
let currentPlayer = 0;
let scores: number[] = [];

let gridSize = 4;
let matchedPairs = 0;
let totalPairs = 0;

let time = 0;
let timerInterval: number;

let theme = "Numbers";

const flipSound = document.getElementById(
  "flipSound"
) as HTMLAudioElement | null;
const matchSound = document.getElementById(
  "matchSound"
) as HTMLAudioElement | null;
const winSound = document.getElementById("winSound") as HTMLAudioElement | null;

/* ===== MENU EVENTS ===== */

document.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target || !target.parentElement) return;

  if (
    target.parentElement.classList.contains("theme") ||
    target.parentElement.classList.contains("players") ||
    target.parentElement.classList.contains("grid")
  ) {
    target.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    target.classList.add("active");
  }

  if (target.classList.contains("start")) startGame();
});

function readSettings(): void {
  players = parseInt(
    (document.querySelector(".players .active") as HTMLElement).innerText
  );

  gridSize =
    (document.querySelector(".grid .active") as HTMLElement).innerText === "6x6"
      ? 6
      : 4;

  theme = (document.querySelector(".theme .active") as HTMLElement).innerText;
}

/* ===== GAME START ===== */

function startGame(): void {
  readSettings();

  scores = new Array(players).fill(0);
  currentPlayer = 0;
  matchedPairs = 0;
  totalPairs = (gridSize * gridSize) / 2;

  section!.innerHTML = `
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

  const game = document.querySelector(".game") as HTMLDivElement;
  game.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  let cardsArray: (string | number)[] = [];

  if (theme === "Numbers") {
    const nums: number[] = [];
    while (nums.length < totalPairs) {
      const r = Math.floor(Math.random() * 500) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    cardsArray = [...nums, ...nums];
  } else {
    const chosen = stickers.slice(0, totalPairs);
    cardsArray = [...chosen, ...chosen];
  }

  cardsArray.sort(() => Math.random() - 0.5);

  cardsArray.forEach((val) => {
    const card = document.createElement("div");
    card.className = "box";
    card.innerText = "❓";
    card.dataset.value = String(val);
    card.onclick = () => handleCard(card);
    game.appendChild(card);
  });

  (document.querySelector(".restart") as HTMLButtonElement).onclick = () => {
    clearInterval(timerInterval);
    startGame();
  };

  (document.querySelector(".newgame") as HTMLButtonElement).onclick = () => {
    clearInterval(timerInterval);
    section!.innerHTML = menuHTML;
  };
}

/* ===== CARD LOGIC ===== */

function handleCard(card: HTMLDivElement): void {
  if (lock || card === firstCard || card.classList.contains("matched")) return;

  flipSound?.play();
  card.innerText = card.dataset.value!;
  card.classList.add("open");

  if (!firstCard) firstCard = card;
  else {
    secondCard = card;
    checkMatch();
  }
}

function checkMatch(): void {
  if (!firstCard || !secondCard) return;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchSound?.play();
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    scores[currentPlayer]++;
    matchedPairs++;
    resetCards();
    updateScores();

    if (matchedPairs === totalPairs) endGame();
  } else {
    lock = true;
    setTimeout(() => {
      firstCard!.innerText = "❓";
      secondCard!.innerText = "❓";
      firstCard!.classList.remove("open");
      secondCard!.classList.remove("open");
      resetCards();
      currentPlayer = (currentPlayer + 1) % players;
      updateScores();
      lock = false;
    }, 800);
  }
}

function resetCards(): void {
  firstCard = null;
  secondCard = null;
}

/* ===== UI ===== */

function updateScores(): void {
  const scoresDiv = document.querySelector(".scores") as HTMLDivElement;
  scoresDiv.innerHTML = scores
    .map(
      (s, i) =>
        `<p ${i === currentPlayer ? "class='active-player'" : ""}>
          Player ${i + 1}: ${s}
        </p>`
    )
    .join("");
}

function startTimer(): void {
  time = 0;
  clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    time++;
    const timer = document.querySelector(".timer") as HTMLDivElement | null;
    if (timer) timer.innerText = `Time: ${time}s`;
  }, 1000);
}

function endGame(): void {
  clearInterval(timerInterval);
  winSound?.play();

  const max = Math.max(...scores);
  const winners = scores
    .map((s, i) => (s === max ? `Player ${i + 1}` : null))
    .filter(Boolean) as string[];

  setTimeout(() => {
    alert(
      winners.length > 1
        ? `Draw! ${winners.join(" & ")} 🏆`
        : `${winners[0]} won 🏆`
    );
  }, 300);
}
