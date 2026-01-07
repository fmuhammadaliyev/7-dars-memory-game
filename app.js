var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var section = document.querySelector("#app");
if (!section)
    throw new Error("#app topilmadi");
var menuHTML = section.innerHTML;
var stickers = [
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
var firstCard = null;
var secondCard = null;
var lock = false;
var players = 1;
var currentPlayer = 0;
var scores = [];
var gridSize = 4;
var matchedPairs = 0;
var totalPairs = 0;
var time = 0;
var timerInterval;
var theme = "Numbers";
var flipSound = document.getElementById("flipSound");
var matchSound = document.getElementById("matchSound");
var winSound = document.getElementById("winSound");
/* ===== MENU EVENTS ===== */
document.addEventListener("click", function (e) {
    var target = e.target;
    if (!target || !target.parentElement)
        return;
    if (target.parentElement.classList.contains("theme") ||
        target.parentElement.classList.contains("players") ||
        target.parentElement.classList.contains("grid")) {
        target.parentElement
            .querySelectorAll("button")
            .forEach(function (b) { return b.classList.remove("active"); });
        target.classList.add("active");
    }
    if (target.classList.contains("start"))
        startGame();
});
function readSettings() {
    players = parseInt(document.querySelector(".players .active").innerText);
    gridSize =
        document.querySelector(".grid .active").innerText === "6x6"
            ? 6
            : 4;
    theme = document.querySelector(".theme .active").innerText;
}
/* ===== GAME START ===== */
function startGame() {
    readSettings();
    scores = new Array(players).fill(0);
    currentPlayer = 0;
    matchedPairs = 0;
    totalPairs = (gridSize * gridSize) / 2;
    section.innerHTML = "\n    <h1>Memory</h1>\n    <div class=\"controls\">\n      <button class=\"restart\">Restart</button>\n      <button class=\"newgame\">New Game</button>\n      <div class=\"timer\">Time: 0s</div>\n    </div>\n    <div class=\"scores\"></div>\n    <div class=\"game\"></div>\n  ";
    updateScores();
    startTimer();
    var game = document.querySelector(".game");
    game.style.gridTemplateColumns = "repeat(".concat(gridSize, ", 1fr)");
    var cardsArray = [];
    if (theme === "Numbers") {
        var nums = [];
        while (nums.length < totalPairs) {
            var r = Math.floor(Math.random() * 500) + 1;
            if (!nums.includes(r))
                nums.push(r);
        }
        cardsArray = __spreadArray(__spreadArray([], nums, true), nums, true);
    }
    else {
        var chosen = stickers.slice(0, totalPairs);
        cardsArray = __spreadArray(__spreadArray([], chosen, true), chosen, true);
    }
    cardsArray.sort(function () { return Math.random() - 0.5; });
    cardsArray.forEach(function (val) {
        var card = document.createElement("div");
        card.className = "box";
        card.innerText = "❓";
        card.dataset.value = String(val);
        card.onclick = function () { return handleCard(card); };
        game.appendChild(card);
    });
    document.querySelector(".restart").onclick = function () {
        clearInterval(timerInterval);
        startGame();
    };
    document.querySelector(".newgame").onclick = function () {
        clearInterval(timerInterval);
        section.innerHTML = menuHTML;
    };
}
/* ===== CARD LOGIC ===== */
function handleCard(card) {
    if (lock || card === firstCard || card.classList.contains("matched"))
        return;
    flipSound === null || flipSound === void 0 ? void 0 : flipSound.play();
    card.innerText = card.dataset.value;
    card.classList.add("open");
    if (!firstCard)
        firstCard = card;
    else {
        secondCard = card;
        checkMatch();
    }
}
function checkMatch() {
    if (!firstCard || !secondCard)
        return;
    if (firstCard.dataset.value === secondCard.dataset.value) {
        matchSound === null || matchSound === void 0 ? void 0 : matchSound.play();
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        scores[currentPlayer]++;
        matchedPairs++;
        resetCards();
        updateScores();
        if (matchedPairs === totalPairs)
            endGame();
    }
    else {
        lock = true;
        setTimeout(function () {
            firstCard.innerText = "❓";
            secondCard.innerText = "❓";
            firstCard.classList.remove("open");
            secondCard.classList.remove("open");
            resetCards();
            currentPlayer = (currentPlayer + 1) % players;
            updateScores();
            lock = false;
        }, 800);
    }
}
function resetCards() {
    firstCard = null;
    secondCard = null;
}
/* ===== UI ===== */
function updateScores() {
    var scoresDiv = document.querySelector(".scores");
    scoresDiv.innerHTML = scores
        .map(function (s, i) {
        return "<p ".concat(i === currentPlayer ? "class='active-player'" : "", ">\n          Player ").concat(i + 1, ": ").concat(s, "\n        </p>");
    })
        .join("");
}
function startTimer() {
    time = 0;
    clearInterval(timerInterval);
    timerInterval = window.setInterval(function () {
        time++;
        var timer = document.querySelector(".timer");
        if (timer)
            timer.innerText = "Time: ".concat(time, "s");
    }, 1000);
}
function endGame() {
    clearInterval(timerInterval);
    winSound === null || winSound === void 0 ? void 0 : winSound.play();
    var max = Math.max.apply(Math, scores);
    var winners = scores
        .map(function (s, i) { return (s === max ? "Player ".concat(i + 1) : null); })
        .filter(Boolean);
    setTimeout(function () {
        alert(winners.length > 1
            ? "Draw! ".concat(winners.join(" & "), " \uD83C\uDFC6")
            : "".concat(winners[0], " won \uD83C\uDFC6"));
    }, 300);
}
