// Moves
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const MOVES = [LEFT, UP, RIGHT, DOWN];
const R = 82;

// Random element from array

function randomElement(myArray) {
    return myArray[Math.floor(Math.random() * myArray.length)];
}

// Compare two 4x4 arrays

function sthChanged(a, b) {
    for (let row = 0; row <4; row ++) {
        for (let col = 0; col < 4; col ++) {
            if (a[row][col] != b[row][col]) {
                return true
            }
        }
    }
    return false
}