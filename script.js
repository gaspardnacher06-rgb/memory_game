const game = {
    level: 1,
    score: 0,
    best: 0,
    sequence: [],
    playerSequence: [],
    gridSize: 3,
    isPlaying: false,
    isWatching: false,
    cells: [],
    
    init() {
        this.loadBestScore();
        this.updateDisplay();
        this.createGrid();
        this.setupEventListeners();
    },

    loadBestScore() {
        const saved = localStorage.getItem('memoryGameBest');
        if (saved) {
            this.best = parseInt(saved);
        }
    },

    saveBestScore() {
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('memoryGameBest', this.best.toString());
        }
    },

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
        });
    },

    createGrid() {
        const container = document.getElementById('grid-container');
        container.innerHTML = '';
        
        const totalCells = this.gridSize * this.gridSize;
        container.className = `grid-container grid-${this.gridSize}x${this.gridSize}`;
        
        this.cells = [];
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell disabled';
            cell.dataset.index = i;
            
            cell.addEventListener('click', () => {
                if (!this.isPlaying || this.isWatching) return;
                this.handleCellClick(i);
            });
            
            container.appendChild(cell);
            this.cells.push(cell);
        }
    },

    updateDisplay() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('best').textContent = this.best;
    },

    showMessage(text, type = '') {
        const msg = document.getElementById('message');
        msg.textContent = text;
        msg.className = `message ${type}`;
    },

    startGame() {
        this.isPlaying = true;
        this.level = 1;
        this.score = 0;
        this.gridSize = 3;
        this.sequence = [];
        this.playerSequence = [];
        
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'inline-block';
        
        this.createGrid();
        this.updateDisplay();
        this.nextRound();
    },

    nextRound() {
        this.playerSequence = [];
        this.addToSequence();
        
        setTimeout(() => {
            this.showSequence();
        }, 1000);
    },

    addToSequence() {
        const totalCells = this.gridSize * this.gridSize;
        const randomIndex = Math.floor(Math.random() * totalCells);
        this.sequence.push(randomIndex);
    },

    async showSequence() {
        this.isWatching = true;
        this.showMessage('Mémorisez la séquence...', 'watching');
        this.disableCells();
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.sleep(500);
            const cellIndex = this.sequence[i];
            this.highlightCell(cellIndex);
            await this.sleep(600);
            this.unhighlightCell(cellIndex);
        }
        
        await this.sleep(500);
        this.isWatching = false;
        this.enableCells();
        this.showMessage('À vous de jouer !', '');
    },

    highlightCell(index) {
        this.cells[index].classList.add('active');
    },

    unhighlightCell(index) {
        this.cells[index].classList.remove('active');
    },

    handleCellClick(index) {
        this.playerSequence.push(index);
        
        this.cells[index].classList.add('active');
        setTimeout(() => {
            this.cells[index].classList.remove('active');
        }, 300);
        
        const currentStep = this.playerSequence.length - 1;
        
        if (this.playerSequence[currentStep] !== this.sequence[currentStep]) {
            this.gameOver();
            return;
        }
        
        if (this.playerSequence.length === this.sequence.length) {
            this.roundComplete();
        }
    },

    roundComplete() {
        this.score += this.level * 10;
        this.level++;
        
        if (this.level % 5 === 0) {
            this.gridSize = Math.min(this.gridSize + 1, 6);
            this.createGrid();
        }
        
        this.showMessage('Bravo ! Niveau suivant...', 'success');
        this.updateDisplay();
        
        setTimeout(() => {
            this.nextRound();
        }, 1500);
    },

    gameOver() {
        this.isPlaying = false;
        this.saveBestScore();
        this.showMessage(`Game Over ! Score final : ${this.score}`, 'error');
        this.disableCells();
        
        document.getElementById('start-btn').style.display = 'inline-block';
        document.getElementById('start-btn').textContent = 'Rejouer';
    },

    resetGame() {
        this.startGame();
    },

    enableCells() {
        this.cells.forEach(cell => {
            cell.classList.remove('disabled');
        });
    },

    disableCells() {
        this.cells.forEach(cell => {
            cell.classList.add('disabled');
        });
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    game.init();
});