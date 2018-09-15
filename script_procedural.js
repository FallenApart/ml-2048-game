let grid;
let flat_grid;
let empty_cells = [];
let game_over = false;
let score;

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const R = 82;

function randomElement(myArray) {
  return myArray[Math.floor(Math.random() * myArray.length)];
}

function isInEmpty(cell_obj) {
  for (let i = 0; i < empty_cells.length; i++) {
    if (empty_cells[i].row == cell_obj.row && empty_cells[i].col == cell_obj.col) {
      return {'exist': true, 'index' : i}
    }
  }
  return false
}

function setup() {
  $("#status").text("You paly the game")
  game_over = false;
  grid = [[0,0,0,0],
          [0,0,0,0],
          [0,0,0,0],
          [0,0,0,0]];
  score = 0;
  updateEmptyCells();
  addNumber();
  addNumber();
  updateGrid();
}

function updateEmptyCells() {
  for (let row = 0; row <4; row ++) {
    for (let col = 0; col < 4; col ++) {
      let cell_obj = {'row': row , 'col': col};
      let included = isInEmpty(cell_obj);
      if (grid[row][col] == 0 && included == false) {
        empty_cells.push(cell_obj);
      } else if (grid[row][col] != 0 && included != false) {
        let index = included.index;
        empty_cells.splice(index, 1);
      }
    }
  }
}

function addNumber() {
  let chosen_cell = randomElement(empty_cells);
  let r = Math.random(1);
  grid[chosen_cell.row][chosen_cell.col] = r < 0.9 ? 2 : 4;
  updateEmptyCells();
}

function slide(row) {
  let non_empty = row.filter(Number);
  let missing = row.length - non_empty.length;
  let zeros = Array(missing).fill(0);
  let new_row = zeros.concat(non_empty);

  return new_row
}

function move(row) {
  row = slide(row);
  for (let col = 3; col > 0; col--) {
    if (row[col] == row[col - 1]) {
      score = score + row[col];
      row[col] = 2*row[col];
      row[col - 1] = 0;
    }
  }
  row = slide(row);
  return row
}


function flatten() {
  flat_grid = [];
  for (let row = 0; row <4; row ++) {
    for (let col = 0; col < 4; col ++) {
      flat_grid.push(grid[row][col]);
    }
  }
}

function updateGrid() {
  $("#score").text("Score: " + score);
  flatten();
  $('.cell-value').each(function(cell, obj) {
    let cell_value = flat_grid[cell];
    if (cell_value == 0) {
      $(this).text("");
      $(this).parent().css({'background-color': '#e6f0ff'});
    } else {
      $(this).text(flat_grid[cell]);
      let color_lightness = 50 / (Math.log2(flat_grid[cell]) + 1) + 50;
      let hsl_color = 'hsl(255, 100%, ' + color_lightness.toString() + '%)';
      $(this).parent().css({'background-color': hsl_color});
    }
  })
}

function sthChanged(a, b) {
  for (let row = 0; row <4; row ++) {
    for (let col = 0; col < 4; col ++) {
      if (a[row][col] != b[row][col]) {
        return true
      }
    }
  }
}

function canMoveRight() {
  let gridCopy = grid.slice();
  for (let row = 0; row < 4; row++) {
    gridCopy[row] = move(grid[row]);
  }
  if (sthChanged(gridCopy, grid) == true) {
    return true
  }
}

function moveRight() {
  if (canMoveRight() === true) {
    for (let row = 0; row < 4; row++) {
      grid[row] = move(grid[row]);
    }
  }
}

function moveLeft() {
  reflectionRightLeft();
  moveRight();
  reflectionRightLeft();
}

function reflectionRightLeft() {
  for (let row = 0; row < 4; row++) {
    grid[row].reverse();
  }
}

function moveDown() {
  transposeGrid();
  moveRight();
  transposeGrid();
}

function moveUp() {
  transposeGrid();
  reflectionRightLeft();
  moveRight();
  reflectionRightLeft();
  transposeGrid();
}

function transposeGrid() {
  let tempGrid = grid.slice();
  grid = [[0,0,0,0],
          [0,0,0,0],
          [0,0,0,0],
          [0,0,0,0]];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      grid[row][col] = tempGrid[col][row];
    }
  }
}

function tryToMove(keyNo) {
  let past_grid = grid.slice();
  if (keyNo == RIGHT) {
    moveRight();
  } else if (keyNo == LEFT) {
    moveLeft();
  } else if (keyNo == DOWN) {
    moveDown();
  } else if (keyNo == UP) {
    moveUp();
  }
  if (sthChanged(past_grid, grid) == true) {
    updateEmptyCells();
    addNumber();
  }
}

function isGameOver() {
  if (empty_cells.length == 0) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col ++) {
        if (col != 3 && grid[row][col] === grid[row][col + 1]) {
          return false
        }
        if (row != 3 && grid[row][col] === grid[row + 1][col]) {
          return false
        }
      }
    }
    return true
  } else {
    return false
  }

}

$(document).ready(function() {

  $('body').keydown(function(key) {
    let keyNo = key.which;
    if (keyNo == R) {
      setup();
    } else if (game_over != true && [LEFT, UP, RIGHT, DOWN].includes(keyNo)) {
      tryToMove(keyNo);
    }
    updateEmptyCells();
    updateGrid();
    if (isGameOver() === true) {
      game_over = true;
      $("#status").text("Game Over");
    }
  });

  setup();
});
