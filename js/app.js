const startBtn = document.querySelector(".start");
const section = document.querySelector("section");

let firstCard = null;
let secondCard = null;
let lock = false;

startBtn.onclick = function () {
  startGame();
};

function startGame() {
  section.innerHTML = `<h1>Memory</h1><div class="game"></div>`;
  const game = document.querySelector(".game");

  let numbers = [];

  while (numbers.length < 16) {
    let rand = Math.floor(Math.random() * 100) + 1;

    let count = numbers.filter((n) => n === rand).length;

    if (count < 2) {
      numbers.push(rand);
    }
  }

  for (let i = 0; i < numbers.length; i++) {
    const card = document.createElement("div");
    card.className = "box";
    card.innerText = "😅";
    card.dataset.value = numbers[i];

    card.onclick = function () {
      if (lock) return;
      if (card === firstCard) return;

      card.innerText = card.dataset.value;

      if (!firstCard) {
        firstCard = card;
      } else {
        secondCard = card;
        checkMatch();
      }
    };

    game.appendChild(card);
  }
}

function checkMatch() {
  if (firstCard.dataset.value === secondCard.dataset.value) {
    firstCard = null;
    secondCard = null;
  } else {
    lock = true;
    setTimeout(() => {
      firstCard.innerText = "😅";
      secondCard.innerText = "😅";
      firstCard = null;
      secondCard = null;
      lock = false;
    }, 800);
  }
}
