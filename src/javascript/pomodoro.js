const timer = document.getElementById("timer");
const mode = document.getElementById("mode");
const progress = document.getElementById("progress");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const workInput = document.getElementById("workTime");
const breakInput = document.getElementById("breakTime");

const sessionCount = document.getElementById("sessionCount");
const alarm = document.getElementById("alarm");

let isWork = true;
let isRunning = false;
let interval;

let workLength = Number(workInput.value) * 60;
let breakLength = Number(breakInput.value) * 60;

let totalTime = workLength;
let timeLeft = totalTime;

let completedSessions = Number(localStorage.getItem("pomodoroSessions")) || 0;
sessionCount.textContent = completedSessions;

const radius = 120;
const circumference = 2 * Math.PI * radius;

progress.style.strokeDasharray = circumference;
progress.style.strokeDashoffset = 0;

updateDisplay();

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

workInput.addEventListener("change", resetTimer);
breakInput.addEventListener("change", resetTimer);

function startTimer() {

    if (isRunning) return;

    isRunning = true;

    interval = setInterval(() => {

        timeLeft--;

        updateDisplay();
        updateProgress();

        if (timeLeft <= 0) {

            clearInterval(interval);
            isRunning = false;

            if (alarm) {
                alarm.play().catch(() => {});
            }

            if (isWork) {

                completedSessions++;
                sessionCount.textContent = completedSessions;
                localStorage.setItem("pomodoroSessions", completedSessions);

                isWork = false;
                mode.textContent = "Break Session";

                totalTime = Number(breakInput.value) * 60;
                timeLeft = totalTime;

                progress.style.stroke = "#4CAF50";

            } else {

                isWork = true;
                mode.textContent = "Work Session";

                totalTime = Number(workInput.value) * 60;
                timeLeft = totalTime;

                progress.style.stroke = "#ff4d4d";

            }

            updateDisplay();
            updateProgress();

            startTimer();

        }

    }, 1000);

}

function pauseTimer() {

    clearInterval(interval);
    isRunning = false;

}

function resetTimer() {

    clearInterval(interval);
    isRunning = false;

    workLength = Number(workInput.value) * 60;
    breakLength = Number(breakInput.value) * 60;

    isWork = true;

    mode.textContent = "Work Session";

    totalTime = workLength;
    timeLeft = totalTime;

    progress.style.stroke = "#ff4d4d";

    updateDisplay();
    updateProgress();

}

function updateDisplay() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}

function updateProgress() {

    const offset = circumference - (timeLeft / totalTime) * circumference;

    progress.style.strokeDashoffset = offset;

}