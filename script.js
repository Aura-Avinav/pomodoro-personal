const videoSources = [
    'assets/anime-school-girl-broken-heart-pixel-moewalls-com.mp4',
    'assets/orion-spur-pixel-moewalls-com.mp4',
    'assets/cherry-blossom-house-japan-pixel-wallpaperwaifu-com.mp4',
    'assets/japan-rainy-day-wallpaperwaifu-com.mp4',
    'assets/pixel-forest-waterfall-wallpaperwaifu-com.mp4',
    'assets/sunset-on-the-lake-pixel-wallpaperwaifu-com.mp4'
];
const randomVideo = videoSources[Math.floor(Math.random() * videoSources.length)];
document.getElementById('bg-video').src = randomVideo;

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

let savedSettings = null;
try {
    savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
} catch(e) { console.error('Error parsing settings', e); }

if (savedSettings) {
    MODES['pomodoro'] = (savedSettings.pomodoro || 25) * 60;
    MODES['short-break'] = (savedSettings.shortBreak || 5) * 60;
    MODES['long-break'] = (savedSettings.longBreak || 15) * 60;
}

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

// Music toggle logic (Seamless Crossfade)
const musicBtn = document.getElementById('music-btn');

const audio1 = new Audio('assets/snowfall.mp3');
const audio2 = new Audio('assets/snowfall.mp3');
audio1.playbackRate = 1.35;
audio2.playbackRate = 1.35;

let currentAudio = audio1;
let nextAudio = audio2;
const CROSSFADE_DURATION = 3; // Start fading 3 seconds before end
let musicEnabled = false;
let isFading = false;

function onTimeUpdate() {
    if (!musicEnabled || isFading) return;
    if (isNaN(currentAudio.duration)) return;

    const timeRemaining = (currentAudio.duration - currentAudio.currentTime) / currentAudio.playbackRate;
    if (timeRemaining <= CROSSFADE_DURATION && timeRemaining > 0.1) {
        isFading = true;

        nextAudio.currentTime = 0;
        nextAudio.volume = 0;
        nextAudio.play().catch(e => console.log(e));

        const steps = 30;
        const stepTime = (CROSSFADE_DURATION * 1000) / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            const ratio = currentStep / steps;

            currentAudio.volume = Math.max(0, 1 - ratio);
            nextAudio.volume = Math.min(1, ratio);

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                currentAudio.pause();
                currentAudio.volume = 1;

                [currentAudio, nextAudio] = [nextAudio, currentAudio];
                isFading = false;
            }
        }, stepTime);
    }
}

audio1.addEventListener('timeupdate', onTimeUpdate);
audio2.addEventListener('timeupdate', onTimeUpdate);

musicBtn.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    if (musicEnabled) {
        currentAudio.volume = 1;
        currentAudio.play().catch(e => console.log(e));
        musicBtn.classList.add('active');
    } else {
        currentAudio.pause();
        nextAudio.pause();
        musicBtn.classList.remove('active');
        isFading = false;
    }
});

// Todo List Logic
const tasksBtn = document.getElementById('tasks-btn');
const todoModal = document.getElementById('todo-modal');
const closeTodoBtn = document.getElementById('close-todo-btn');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

let tasks = [];
try {
    tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];
} catch(e) { console.error('Error parsing tasks', e); }

function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function renderTasks() {
    todoList.innerHTML = '';
    const displayList = document.getElementById('todo-display-list');
    if (displayList) displayList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <span class="todo-item-text" onclick="toggleTask(${index})">${task.text}</span>
            <div class="todo-actions">
                <button onclick="deleteTask(${index})" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        todoList.appendChild(li);

        if (displayList) {
            const dLi = document.createElement('li');
            dLi.className = `todo-display-item ${task.completed ? 'completed' : ''}`;
            dLi.textContent = task.text;
            displayList.appendChild(dLi);
        }
    });
}

function addTask() {
    const text = todoInput.value.trim();
    if (text) {
        tasks.push({ text, completed: false });
        todoInput.value = '';
        saveTasks();
        renderTasks();
    }
}

window.toggleTask = function (index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
};

window.deleteTask = function (index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
};

tasksBtn.addEventListener('click', () => {
    todoModal.classList.add('show');
    renderTasks();
    setTimeout(() => todoInput.focus(), 100);
});

closeTodoBtn.addEventListener('click', () => {
    todoModal.classList.remove('show');
});

// Close modal when clicking outside content
todoModal.addEventListener('click', (e) => {
    if (e.target === todoModal) {
        todoModal.classList.remove('show');
    }
});

addTodoBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Settings Logic
const settingsBtn = document.getElementById('settings-btn');
const settingsModalWrapper = document.getElementById('settings-modal-wrapper');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const settingsModal = document.getElementById('settings-modal');

const settingPomodoro = document.getElementById('setting-pomodoro');
const settingShortBreak = document.getElementById('setting-short-break');
const settingLongBreak = document.getElementById('setting-long-break');

function loadSettingsToInputs() {
    settingPomodoro.value = MODES['pomodoro'] / 60;
    settingShortBreak.value = MODES['short-break'] / 60;
    settingLongBreak.value = MODES['long-break'] / 60;
}

settingsBtn.addEventListener('click', () => {
    loadSettingsToInputs();
    settingsModalWrapper.classList.add('show');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModalWrapper.classList.remove('show');
});

settingsModalWrapper.addEventListener('click', (e) => {
    if (e.target === settingsModalWrapper) {
        settingsModalWrapper.classList.remove('show');
    }
});

saveSettingsBtn.addEventListener('click', () => {
    const p = Math.max(1, parseInt(settingPomodoro.value) || 25);
    const s = Math.max(1, parseInt(settingShortBreak.value) || 5);
    const l = Math.max(1, parseInt(settingLongBreak.value) || 15);

    MODES['pomodoro'] = p * 60;
    MODES['short-break'] = s * 60;
    MODES['long-break'] = l * 60;

    localStorage.setItem('pomodoroSettings', JSON.stringify({
        pomodoro: p,
        shortBreak: s,
        longBreak: l
    }));

    settingsModalWrapper.classList.remove('show');

    // Reset timer to new settings if not currently running
    if (!isRunning) {
        timeLeft = MODES[currentMode];
        updateDisplay();
    }
});

// Initialize display
updateDisplay();
renderTasks();

