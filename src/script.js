const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const sRules = [2, 3]; 
const bRules = [3];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const cellSize = 10;
const gridWidth = Math.floor(canvas.width / cellSize);
const gridHeight = Math.floor(canvas.height / cellSize);
const grid = createGrid(gridWidth, gridHeight);
let isGameRunning = false;
let intervalId;

function createGrid(width, height) {
    const grid = new Array(width);
    for (let x = 0; x < width; x++) {
        grid[x] = new Array(height).fill(false);
    }
    return grid;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            if (grid[x][y]) {
                ctx.fillStyle = "white";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
            else {
                ctx.fillStyle = "black";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function updateGrid() {
    const newGrid = createGrid(gridWidth, gridHeight);

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const neighbors = countNeighbors(x, y);

            if (grid[x][y]) {
                let survives = false;
                for (let k = 0; k < sRules.length; k++) {
                    if (neighbors === sRules[k]) {
                        survives = true;
                        break;
                    }
                }
                newGrid[x][y] = survives;
            } else {
                let reproduces = false;
                for (let k = 0; k < bRules.length; k++) {
                    if (neighbors === bRules[k]) {
                        reproduces = true;
                        break;
                    }
                }
                newGrid[x][y] = reproduces;
            }
        }
    }

    grid.splice(0, grid.length, ...newGrid);
    drawGrid();
}

function countNeighbors(x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                count += grid[nx][ny] ? 1 : 0;
            }
        }
    }
    return count;
}

function startGame() {
    if (!isGameRunning) {
        intervalId = setInterval(() => {
            updateGrid();
            drawGrid();
        }, 100); 
        isGameRunning = true;
    }
}

function stopGame() {
    if (isGameRunning) {
        clearInterval(intervalId);
        isGameRunning = false;
    }
}

function clearGrid() {
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            grid[x][y] = false;
        }
    }
    drawGrid();
}

function randomizeGrid() {
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            grid[x][y] = Math.random() < 0.5;
        }
    }
    drawGrid();
}

let isMouseDown = false;
let isTouchActive = false;

canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

// Mouse event listeners
canvas.addEventListener("mousemove", (event) => {
    if (isMouseDown) {
        handleMouseDrag(event);
    }
});

canvas.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    handleMouseDrag(event);
});

canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
    previousMousePos = null;
});

// Touch event listeners
canvas.addEventListener("touchmove", (event) => {
    handleMouseDrag(event);
});

canvas.addEventListener("touchstart", (event) => {
    isTouchActive = true;
    handleMouseDrag(event);
});

canvas.addEventListener("touchend", () => {
    isTouchActive = false;
    previousMousePos = null;
});

let previousMousePos = null;

function handleMouseDrag(event) {
    event.preventDefault();

    let mouseX, mouseY;

    // Handle touch events
    if (event.type.startsWith('touch')) {
        if (event.touches.length === 0) return;
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
    } else {
        // Handle mouse events
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    const x = Math.floor(mouseX / cellSize);
    const y = Math.floor(mouseY / cellSize);

    if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) {
        return;
    }

    // Draw line for mouse drag
    if (previousMousePos && !event.type.startsWith('touch')) {
        drawLine(previousMousePos.x, previousMousePos.y, x, y, event);
    }

    // Toggle grid cell for touch events
    if (event.type.startsWith('touch')) {
        grid[x][y] = !grid[x][y];
    } else {
        // Set grid cell based on mouse buttons for mouse events
        if (event.buttons === 1) {
            grid[x][y] = true;
        } else if (event.buttons === 2) {
            grid[x][y] = false;
        }
    }

    drawGrid();
    previousMousePos = { x, y };
}

function drawLine(x1, y1, x2, y2, event) { 
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        if (x1 === x2 && y1 === y2) {
            break;
        }

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }

        if (previousMousePos) {
            if (event.buttons === 1) {
                grid[x1][y1] = true;
            } else if (event.buttons === 2) {
                grid[x1][y1] = false;
            }
        }
    }
}

const rulesPanel = document.getElementById("rulesPanel");
const surviveRulesInput = document.getElementById("surviveRulesInput");
const birthRulesInput = document.getElementById("birthRulesInput");

document.getElementById("rulesButton").addEventListener("click", toggleRulesPanel);

function toggleRulesPanel() {
    if (rulesPanel.style.display === "none") {
        rulesPanel.style.display = "block";
        surviveRulesInput.value = sRules.join(", ");
        birthRulesInput.value = bRules.join(", ");
    } else {
        rulesPanel.style.display = "none";
    }
}

surviveRulesInput.addEventListener("input", updateSurviveRules);
birthRulesInput.addEventListener("input", updateBirthRules);

function updateSurviveRules() {
    sRules.length = 0;
    sRules.push(...surviveRulesInput.value.split(",").map(rule => parseInt(rule.trim(), 10)));
}

function updateBirthRules() {
    bRules.length = 0;
    bRules.push(...birthRulesInput.value.split(",").map(rule => parseInt(rule.trim(), 10)));
}

rulesPanel.style.display = "block";
surviveRulesInput.value = sRules.join(", ");
birthRulesInput.value = bRules.join(", ");

const speedSlider = document.getElementById("speedSlider");
const speedValueDisplay = document.getElementById("speedValue");

function startGame() {
    const speed = parseInt(speedSlider.max, 10) - parseInt(speedSlider.value, 10);
    if (!isGameRunning) {
        intervalId = setInterval(() => {
            updateGrid();
            drawGrid();
        }, speed);
        isGameRunning = true;
    }
}

function updateSpeed() {
    const speed = parseInt(speedSlider.max, 10) - parseInt(speedSlider.value, 10);
    if (isGameRunning) {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            updateGrid();
            drawGrid();
        }, speed);
    }
}

speedSlider.addEventListener("input", () => {
    speedValueDisplay.textContent = speedSlider.value;
    updateSpeed();
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        toggleGame();
    }
});

function toggleGame() {
    if (isGameRunning) {
        stopGame();
    } else {
        startGame();
    }
}

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("pauseButton").addEventListener("click", stopGame);
document.getElementById("clearButton").addEventListener("click", clearGrid);
document.getElementById("randomizeButton").addEventListener("click", randomizeGrid);

drawGrid();