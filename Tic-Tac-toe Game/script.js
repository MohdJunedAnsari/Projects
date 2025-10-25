
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
let currentPlayer = 'X';
let board = Array(9).fill('');
const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

function createBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.addEventListener('click', () => handleClick(index));
        cellElement.textContent = cell;
        boardElement.appendChild(cellElement);
    });
}

function handleClick(index) {
    if (board[index] === '') {
        board[index] = currentPlayer;
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateBoard();
        checkWinner();
    }
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        if (board[index] !== '') {
            cell.classList.add('taken');
        }
    });
    statusElement.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWinner() {
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            statusElement.textContent = `Player ${board[a]} wins!`;
            disableBoard();
            return;
        }
    }
    if (!board.includes('')) {
        statusElement.textContent = "It's a draw!";
    }
}

function disableBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.add('taken');
    });
}

function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    statusElement.textContent = "Player X's turn";
    createBoard();
}

createBoard();
