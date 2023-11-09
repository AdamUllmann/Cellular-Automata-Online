const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rulesPanel = document.getElementById("rulesPanel");
const surviveRulesContainer = document.getElementById("surviveRules");
const birthRulesContainer = document.getElementById("birthRules");
const addSurviveRuleButton = document.getElementById("addSurviveRule");
const addBirthRuleButton = document.getElementById("addBirthRule");

const sRules = [2, 3, 4]; 
const bRules = [3, 0];
let isEditingSurviveRules = false;
let isEditingBirthRules = false;

function addSurviveRule() {
    sRules.push(0); 
    updateRulesPanelContent(); 
}

function addBirthRule() {
    bRules.push(0); 
    updateRulesPanelContent(); 
}

function removeSurviveRule(index) {
    sRules.splice(index, 1);
    updateRulesPanelContent();
}

function removeBirthRule(index) {
    bRules.splice(index, 1);
    updateRulesPanelContent(); 
}

function updateRulesPanelContent() {
    const rulesPanel = document.getElementById("rulesPanel");
    rulesPanel.innerHTML = "";

    const headerSurvive = document.createElement("h2");
    headerSurvive.textContent = "Survive Rules:";
    rulesPanel.appendChild(headerSurvive);

    for (let i = 0; i < sRules.length; i++) {
        const ruleDiv = document.createElement("div");
        ruleDiv.textContent = `S${i}: ${sRules[i]}`;

        if (isEditingSurviveRules) {
            const increaseButton = document.createElement("button");
            increaseButton.textContent = "+";
            increaseButton.addEventListener("click", () => {
                sRules[i] = (sRules[i] + 1) % 9;
                updateRulesPanelContent();
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "-";
            deleteButton.addEventListener("click", () => {
                sRules.splice(i, 1);
                updateRulesPanelContent();
            });

            ruleDiv.appendChild(increaseButton);
            ruleDiv.appendChild(deleteButton);
        }

        rulesPanel.appendChild(ruleDiv);
    }

    if (isEditingSurviveRules) {
        const addRuleButton = document.createElement("button");
        addRuleButton.textContent = "+ Add Rule";
        addRuleButton.addEventListener("click", addSurviveRule);
        rulesPanel.appendChild(addRuleButton);
    }

    if (isEditingBirthRules) {
        const addRuleButton = document.createElement("button");
        addRuleButton.textContent = "+ Add Rule";
        addRuleButton.addEventListener("click", addBirthRule);
        rulesPanel.appendChild(addRuleButton);
    }

    const headerBirth = document.createElement("h2");
    headerBirth.textContent = "Birth Rules:";
    rulesPanel.appendChild(headerBirth);

    for (let i = 0; i < bRules.length; i++) {
        const ruleDiv = document.createElement("div");
        ruleDiv.textContent = `B${i}: ${bRules[i]}`;

        if (isEditingBirthRules) {
            const increaseButton = document.createElement("button");
            increaseButton.textContent = "+";
            increaseButton.addEventListener("click", () => {
                bRules[i] = (bRules[i] + 1) % 9;
                updateRulesPanelContent();
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "-";
            deleteButton.addEventListener("click", () => {
                bRules.splice(i, 1);
                updateRulesPanelContent();
            });

            ruleDiv.appendChild(increaseButton);
            ruleDiv.appendChild(deleteButton);
        }

        rulesPanel.appendChild(ruleDiv);
    }

    if (isEditingBirthRules) {
        const addRuleButton = document.createElement("button");
        addRuleButton.textContent = "+ Add Rule";
        addRuleButton.addEventListener("click", () => {
            bRules.push(0);
            updateRulesPanelContent();
        });

        rulesPanel.appendChild(addRuleButton);
    }
}

updateRulesPanelContent();

const rulesButton = document.getElementById("rulesButton");
rulesButton.addEventListener("click", () => {
    isEditingSurviveRules = !isEditingSurviveRules;
    isEditingBirthRules = !isEditingBirthRules;
    updateRulesPanelContent();
});

function toggleRulesPanel() {
    if (rulesPanel.style.display === "none") {
        rulesPanel.style.display = "block";
    } else {
        rulesPanel.style.display = "none";
    }
}

rulesButton.addEventListener("click", toggleRulesPanel);


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

canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

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

let previousMousePos = null;

function handleMouseDrag(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const x = Math.floor(mouseX / cellSize);
    const y = Math.floor(mouseY / cellSize);

    if (previousMousePos) {
        drawLine(previousMousePos.x, previousMousePos.y, x, y);
    }

    if (event.buttons === 1) {
        grid[x][y] = true;
    } else if (event.buttons === 2) {
        grid[x][y] = false;
    }

    drawGrid();
    previousMousePos = { x, y };
}

function drawLine(x1, y1, x2, y2) {
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

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("pauseButton").addEventListener("click", stopGame);
document.getElementById("clearButton").addEventListener("click", clearGrid);
document.getElementById("randomizeButton").addEventListener("click", randomizeGrid);

drawGrid();