let board = document.querySelector("#board");
let statusText = document.querySelector("#statusText");
let fireCountText = document.querySelector("#fireCountText");
let shipsRemainingText = document.querySelector("#shipsRemainingText");
let winText = document.querySelector("#winText");

// Creates the gameboard grid based on the boardState array
let createBoard = (boardData) => {
        
    let y = 0;
    boardData.forEach((rowData) => {
        let x = 0;
        let row = document.createElement('div');
        row.setAttribute('class', 'd-flex flex-row justify-content-center');
        
        rowData.forEach((cellData) => {
            let cell = document.createElement('div');
            cell.setAttribute('class', 'bg-light border square');
            // Add position attributes to match game state coordinates to board coordinates
            cell.setAttribute('row', y);
            cell.setAttribute('col', x);
            x++;
            row.appendChild(cell);
        });
        y++;
        board.appendChild(row);
    });
};

// Generates a grid array of a given size
let initializeGrid = (size) => {
    let grid = [[]];
    
    for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {
            grid[i].push(0);
        }
        grid.push([]);
    }
    
    grid.pop();
    return grid;
};

// Places a ship in a random unfilled location
let placeShip = (shipLength) => {
    let arrayString = [];
    let arrayStringVertical = [];
    // +1 to take into account newline characters
    let rowLength = boardState.length + 1;
    // Regex for a series of 0s that is equal to or longer than the size of a ship
    let spaceCheck = new RegExp("0{" + shipLength + ",}", 'g');
    
    // Convert nested array to string
    // Rows are separated with newlines so regex matches can be found for sufficiently empty spaces
    boardState.forEach((rowData, index) => {
        arrayString += rowData.join("");
        arrayString += "\n";
    });
    
    
    // Convert nested array to string again
    // This time it needs to be mapped with rows and columns switched for finding vertical space
    for (let i=0; i<boardState.length; i++) {
        for (let j=0; j<boardState.length; j++) {
            arrayStringVertical += boardState[j][i];
        }
        arrayStringVertical += "\n";
    }
    
    // Combine horizontal and vertical strings into one big string to search
    let fullString = arrayString + arrayStringVertical;
    
    let match;
    let matchArray = [];
    
    // Avoid infinite loop by checking null matches
    while ((match = spaceCheck.exec(fullString)) !== null) {
        if (match.index === spaceCheck.lastIndex) {
            spaceCheck.lastIndex++;
        }
        // No need to repeatedly store the original input
        delete match.input;
        // Replace match with length of match
        match[0] = match[0].length;
        matchArray.push(match);
    }
    
    if (matchArray) {
        shipsRemaining += shipLength;
    }
    
    // Select a random match from the possible matches
    let selectedMatch = matchArray[Math.floor(Math.random() * matchArray.length)];
    // Select a random sufficient spot within the match space
    // This arrangement of spot-within-spots provides an equal probability for selecting differently sized spots for slightly-predictable ship clustering tendencies
    let matchIndex = Math.floor(Math.random() * (selectedMatch[0] - shipLength + 1)) + selectedMatch.index;
    
    // Set row and column depending on whether the match is in the first or last half of the combined array string
    let row = 0;
    let column = 0;

    if (matchIndex < arrayString.length) {
        row = Math.floor(matchIndex / rowLength);
        column = (matchIndex % rowLength);
        for (let i=column; i<shipLength + column; i++) {
            boardState[row][i] = 1;
        }
    } else {
        row = Math.floor((matchIndex - arrayString.length) / rowLength);
        column = ((matchIndex - arrayString.length) % rowLength);
        for (let i=column; i<shipLength + column; i++) {
            boardState[i][row] = 1;
        }
    }
    

};

let fire = (row, col) => {
    // Remove the light background in every case
    board.children[row].children[col].classList.remove('bg-light');
    // Modify board and the game state depending on whether there is a ship (1) or not (0)
    // 2 flags the spot as already attacked
    switch(boardState[row][col]) {
        case 0:
            fireCount++;
            board.children[row].children[col].classList.add('bg-primary');
            boardState[row][col] = 2;
            statusText.innerHTML = "Miss";
            break;
        case 1:
            fireCount++;
            board.children[row].children[col].classList.add('bg-danger');
            boardState[row][col] = 2;
            statusText.innerHTML = "Hit!";
            shipsRemaining--;
            if (shipsRemaining === 0) {
                win();
            }
            break;
        default:
            statusText.innerHTML = "Target a new location";
            break;
    }
};

let win = () => {
    winText.innerHTML = "You've managed to destroy all enemy ships, firing only " + fireCount + " salvos.";
    $('#winModal').modal('show');
    $('#winModal').on('hidden.bs.modal', () => {
        startGame();
    });
};


let fireCount = 0;
let shipsRemaining = 0;
let boardState;
let startGame = () => {
    fireCount = 0;
    shipsRemaining = 0;
    // Sets the boardState to be generated using the grid initialization function
    boardState = initializeGrid(10);
    // Remove old board
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
    // Creates the visual board structure based on the board state
    createBoard(boardState);
    // Places ships and sets ship remaining counter
    let shipPlacementArray = [5,4,3,3,2];
    shipsRemaining = 0;
    shipPlacementArray.forEach((size) => {
        placeShip(size);
    });
    
    fireCountText.innerHTML = fireCount;
    shipsRemainingText.innerHTML = shipsRemaining;
    statusText.innerHTML = "Fire when ready!"
};



startGame();

board.addEventListener('click', (event) => {
    let row = event.target.getAttribute('row');
    let col = event.target.getAttribute('col');

    fire(row, col);
    // Update text
    fireCountText.innerHTML = fireCount;
    shipsRemainingText.innerHTML = shipsRemaining;
});