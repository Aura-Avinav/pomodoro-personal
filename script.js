const timeDisplay = document.getElementById('time-display');
const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const cycleCountEl = document.getElementById('cycle-count');
const tomatoes = document.querySelectorAll('.tomato');

const MODES = {
    'pomodoro': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
};

let currentMode = 'pomodoro';
let timeLeft = MODES[currentMode];
let timerId = null;
let isRunning = false;
let cycleCount = 1;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTomatoes() {
    const cyclesCompleted = cycleCount - 1;
    const currentPhaseIndex = cyclesCompleted % 4;

    tomatoes.forEach((tomato, index) => {
        if (index < currentPhaseIndex) {
            tomato.classList.add('active');
        } else {
            tomato.classList.remove('active');
        }
    });

    if (currentPhaseIndex === 0 && cyclesCompleted > 0) {
        tomatoes.forEach(tomato => tomato.classList.remove('active'));
    }
}

function switchMode(mode) {
    if (isRunning) stopTimer();

    currentMode = mode;
    timeLeft = MODES[currentMode];

    // Update button states
    modeBtns.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updateDisplay();
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    isRunning = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function startTimer() {
    if (isRunning) {
        stopTimer();
        return;
    }

    isRunning = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            stopTimer();
            handleTimerComplete();
        }
    }, 1000);
}

function handleTimerComplete() {
    if (currentMode === 'pomodoro') {
        cycleCount++;
        cycleCountEl.textContent = cycleCount;
        updateTomatoes();

        if (cycleCount % 4 === 1 && cycleCount > 1) { // 1, 5, 9... technically means 4 complete
            switchMode('long-break');
        } else {
            switchMode('short-break');
        }
    } else {
        switchMode('pomodoro');
    }
}

function resetTimer() {
    stopTimer();
    timeLeft = MODES[currentMode];
    updateDisplay();
}

// Event Listeners
playBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (currentMode !== e.target.dataset.mode) {
            switchMode(e.target.dataset.mode);
        }
    });
});

// Fullscreen logic
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Sound toggle logic placeholder
let soundEnabled = true;
const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
});

// Initialize display
updateDisplay();
