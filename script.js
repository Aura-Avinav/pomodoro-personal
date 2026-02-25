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

// Music toggle logic (Snowfall)
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('music-audio');
bgMusic.playbackRate = 1.35; // Faster version

let musicEnabled = false;

musicBtn.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    if (musicEnabled) {
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
        musicBtn.classList.add('active');
    } else {
        bgMusic.pause();
        musicBtn.classList.remove('active');
    }
});

// Todo List Logic
const tasksBtn = document.getElementById('tasks-btn');
const todoModal = document.getElementById('todo-modal');
const closeTodoBtn = document.getElementById('close-todo-btn');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

let tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];

function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function renderTasks() {
    todoList.innerHTML = '';
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

// Initialize display
updateDisplay();

