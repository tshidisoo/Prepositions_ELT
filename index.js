// Game state
let gameState = {
    score: 0,
    lives: 3,
    currentGame: null,
    wordSearchData: [],
    matchingPairs: [],
    selectedMatches: [],
    unscrambleWords: [],
    currentUnscrambleIndex: 0,
    trueFalseQuestions: [],
    currentTFIndex: 0
};

// Prepositions data
const prepositions = [
    'ABOVE', 'BEHIND', 'BETWEEN', 'IN', 'UNDER', 'NEAR', 
    'INTO', 'ON', 'AROUND', 'NEXT TO', 'IN FRONT OF', 'OUT OF'
];

const scrambledWords = [
    { scrambled: 'BOVEA', answer: 'ABOVE' },
    { scrambled: 'DNEHIB', answer: 'BEHIND' },
    { scrambled: 'WEETBEN', answer: 'BETWEEN' },
    { scrambled: 'REDNU', answer: 'UNDER' },
    { scrambled: 'RAEN', answer: 'NEAR' },
    { scrambled: 'OTNI', answer: 'INTO' },
    { scrambled: 'DNUORA', answer: 'AROUND' },
    { scrambled: 'TXEN OT', answer: 'NEXT TO' }
];

const trueFalseData = [
    {
        statement: "The cat is on the box.",
        catPosition: { left: '45%', top: '30%' },
        objectPosition: { left: '45%', top: '60%' },
        answer: true
    },
    {
        statement: "The cat is under the table.",
        catPosition: { left: '45%', top: '70%' },
        objectPosition: { left: '45%', top: '20%' },
        object: '🪑',
        answer: true
    },
    {
        statement: "The cat is behind the sofa.",
        catPosition: { left: '60%', top: '50%' },
        objectPosition: { left: '40%', top: '50%' },
        object: '🛋️',
        answer: false
    },
    {
        statement: "The cat is near the box.",
        catPosition: { left: '35%', top: '50%' },
        objectPosition: { left: '55%', top: '50%' },
        answer: true
    }
];

// Initialize game
function initGame() {
    updateScore();
    updateLives();
    showGame('wordsearch');
}

// Show specific game
function showGame(gameName) {
    // Hide all games
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected game
    document.getElementById(gameName + '-game').classList.add('active');
    gameState.currentGame = gameName;
    
    // Initialize specific game
    switch(gameName) {
        case 'wordsearch':
            initWordSearch();
            break;
        case 'matching':
            initMatching();
            break;
        case 'unscramble':
            initUnscramble();
            break;
        case 'truefalse':
            initTrueFalse();
            break;
    }
}

// Word Search Game
function initWordSearch() {
    const grid = document.getElementById('word-grid');
    const wordsToFind = ['ABOVE', 'BEHIND', 'BETWEEN', 'UNDER', 'NEAR', 'INTO'];
    
    // Create 15x15 grid
    const gridSize = 15;
    const gridData = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    
    // Place words randomly
    wordsToFind.forEach(word => {
        placeWordInGrid(gridData, word);
    });
    
    // Fill empty spaces with random letters
    for(let i = 0; i < gridSize; i++) {
        for(let j = 0; j < gridSize; j++) {
            if(gridData[i][j] === '') {
                gridData[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
    
    // Render grid
    grid.innerHTML = '';
    gridData.forEach((row, i) => {
        row.forEach((letter, j) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = letter;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => selectGridCell(cell));
            grid.appendChild(cell);
        });
    });
    
    gameState.wordSearchData = { grid: gridData, words: wordsToFind, found: [] };
}

function placeWordInGrid(grid, word) {
    const directions = [[0,1], [1,0], [1,1]]; // horizontal, vertical, diagonal
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const [dx, dy] = direction;
    
    let placed = false;
    let attempts = 0;
    
    while(!placed && attempts < 100) {
        const startRow = Math.floor(Math.random() * (15 - word.length * Math.abs(dx)));
        const startCol = Math.floor(Math.random() * (15 - word.length * Math.abs(dy)));
        
        let canPlace = true;
        for(let i = 0; i < word.length; i++) {
            const row = startRow + i * dx;
            const col = startCol + i * dy;
            if(grid[row][col] !== '' && grid[row][col] !== word[i]) {
                canPlace = false;
                break;
            }
        }
        
        if(canPlace) {
            for(let i = 0; i < word.length; i++) {
                const row = startRow + i * dx;
                const col = startCol + i * dy;
                grid[row][col] = word[i];
            }
            placed = true;
        }
        attempts++;
    }
}

function selectGridCell(cell) {
    cell.classList.toggle('selected');
    // Simple word finding logic - in a full implementation, 
    // you'd track selected sequences and check for words
}

function resetWordSearch() {
    initWordSearch();
}

// Matching Game
function initMatching() {
    const prepositionsCol = document.getElementById('prepositions-column');
    const imagesCol = document.getElementById('images-column');
    
    const matchingData = [
        { prep: 'ABOVE', symbol: '⬆️📦' },
        { prep: 'UNDER', symbol: '⬇️📦' },
        { prep: 'NEAR', symbol: '👥📦' },
        { prep: 'BEHIND', symbol: '📦👤' },
        { prep: 'IN FRONT OF', symbol: '👤📦' },
        { prep: 'ON', symbol: '🐱📦' }
    ];
    
    // Shuffle arrays
    const shuffledPreps = [...matchingData].sort(() => Math.random() - 0.5);
    const shuffledSymbols = [...matchingData].sort(() => Math.random() - 0.5);
    
    prepositionsCol.innerHTML = '';
    imagesCol.innerHTML = '';
    
    shuffledPreps.forEach((item, index) => {
        const prepElement = document.createElement('div');
        prepElement.className = 'match-item';
        prepElement.textContent = item.prep;
        prepElement.dataset.id = item.prep;
        prepElement.addEventListener('click', () => selectMatchItem(prepElement, 'prep'));
        prepositionsCol.appendChild(prepElement);
    });
    
    shuffledSymbols.forEach((item, index) => {
        const symbolElement = document.createElement('div');
        symbolElement.className = 'match-item';
        symbolElement.textContent = item.symbol;
        symbolElement.dataset.id = item.prep;
        symbolElement.addEventListener('click', () => selectMatchItem(symbolElement, 'symbol'));
        imagesCol.appendChild(symbolElement);
    });
    
    gameState.selectedMatches = [];
}

function selectMatchItem(element, type) {
    // Remove previous selections of same type
    document.querySelectorAll(`.match-item.selected`).forEach(item => {
        if((type === 'prep' && item.parentElement.id === 'prepositions-column') ||
           (type === 'symbol' && item.parentElement.id === 'images-column')) {
            item.classList.remove('selected');
        }
    });
    
    element.classList.add('selected');
    
    gameState.selectedMatches = gameState.selectedMatches.filter(match => match.type !== type);
    gameState.selectedMatches.push({ element, type, id: element.dataset.id });
    
    if(gameState.selectedMatches.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [match1, match2] = gameState.selectedMatches;
    
    if(match1.id === match2.id) {
        // Correct match
        match1.element.classList.add('matched');
        match2.element.classList.add('matched');
        match1.element.classList.remove('selected');
        match2.element.classList.remove('selected');
        updateScore(10);
    } else {
        // Incorrect match
        setTimeout(() => {
            match1.element.classList.remove('selected');
            match2.element.classList.remove('selected');
        }, 1000);
        updateLives(-1);
    }
    
    gameState.selectedMatches = [];
}

function resetMatching() {
    initMatching();
}

// Unscramble Game
function initUnscramble() {
    gameState.unscrambleWords = [...scrambledWords];
    gameState.currentUnscrambleIndex = 0;
    displayUnscrambleWord();
}

function displayUnscrambleWord() {
    if(gameState.currentUnscrambleIndex >= gameState.unscrambleWords.length) {
        document.getElementById('scrambled-word').textContent = "Great job! All words completed!";
        return;
    }
    
    const currentWord = gameState.unscrambleWords[gameState.currentUnscrambleIndex];
    document.getElementById('scrambled-word').textContent = currentWord.scrambled;
    document.getElementById('unscramble-input').value = '';
    document.getElementById('unscramble-feedback').textContent = '';
}

function checkUnscramble() {
    const input = document.getElementById('unscramble-input').value.toUpperCase().trim();
    const currentWord = gameState.unscrambleWords[gameState.currentUnscrambleIndex];
    const feedback = document.getElementById('unscramble-feedback');
    
    if(input === currentWord.answer) {
        feedback.textContent = "Correct! Well done! 🎉";
        feedback.className = 'feedback correct';
        updateScore(15);
    } else {
        feedback.textContent = "Try again! The answer is: " + currentWord.answer;
        feedback.className = 'feedback incorrect';
        updateLives(-1);
    }
}

function nextUnscramble() {
    gameState.currentUnscrambleIndex++;
    displayUnscrambleWord();
}

// True/False Game
function initTrueFalse() {
    gameState.trueFalseQuestions = [...trueFalseData];
    gameState.currentTFIndex = 0;
    displayTrueFalseQuestion();
}

function displayTrueFalseQuestion() {
    if(gameState.currentTFIndex >= gameState.trueFalseQuestions.length) {
        document.getElementById('statement').textContent = "Excellent work! All questions completed!";
        return;
    }
    
    const question = gameState.trueFalseQuestions[gameState.currentTFIndex];
    const cat = document.querySelector('.cat');
    const object = document.querySelector('.object');
    
    // Position elements
    cat.style.left = question.catPosition.left;
    cat.style.top = question.catPosition.top;
    object.style.left = question.objectPosition.left;
    object.style.top = question.objectPosition.top;
    
    if(question.object) {
        object.textContent = question.object;
    } else {
        object.textContent = '📦';
    }
    
    document.getElementById('statement').textContent = question.statement;
    document.getElementById('tf-feedback').textContent = '';
}

function answerTrueFalse(userAnswer) {
    const question = gameState.trueFalseQuestions[gameState.currentTFIndex];
    const feedback = document.getElementById('tf-feedback');
    
    if(userAnswer === question.answer) {
        feedback.textContent = "Correct! 🎉";
        feedback.className = 'feedback correct';
        updateScore(10);
    } else {
        feedback.textContent = "Incorrect. The correct answer is " + (question.answer ? "TRUE" : "FALSE");
        feedback.className = 'feedback incorrect';
        updateLives(-1);
    }
}

function nextTrueFalse() {
    gameState.currentTFIndex++;
    displayTrueFalseQuestion();
}

// Score and lives management
function updateScore(points = 0) {
    gameState.score += points;
    document.getElementById('score').textContent = gameState.score;
}

function updateLives(change = 0) {
    gameState.lives += change;
    document.getElementById('lives').textContent = gameState.lives;
    
    if(gameState.lives <= 0) {
        alert("Game Over! Your final score: " + gameState.score);
        resetGame();
    }
}

function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    updateScore();
    updateLives();
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);