class Env {
  constructor() {

    this.mode = 'play_yourself';
    this.empty_cells = [];
    this.playInBackground = false;
    this.reset();
    this.flatten();
  }

  reset() {
    this.reward = 0;
    this.done = false;
    this.grid = [[0,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,0]];
    this.updateEmptyCells();
    this.addNumber();
    this.addNumber();
    this.updateGrid();
  }

  isInEmpty(cell_obj) {
    for (let i = 0; i < this.empty_cells.length; i++) {
      if (this.empty_cells[i].row == cell_obj.row && this.empty_cells[i].col == cell_obj.col) {
        return {'exist': true, 'index' : i}
      }
    }
    return false
}

  updateEmptyCells() {
    for (let row = 0; row <4; row ++) {
      for (let col = 0; col < 4; col ++) {
        let cell_obj = {'row': row , 'col': col};
        let included = this.isInEmpty(cell_obj);
        if (this.grid[row][col] == 0 && included == false) {
          this.empty_cells.push(cell_obj);
        } else if (this.grid[row][col] != 0 && included != false) {
          let index = included.index;
          this.empty_cells.splice(index, 1);
        }
      }
    }
  }

  addNumber() {
    let chosen_cell = randomElement(this.empty_cells);
    let r = Math.random(1);
    this.grid[chosen_cell.row][chosen_cell.col] = r < 0.9 ? 2 : 4;
    this.updateEmptyCells();
  }

  flatten() {
    this.flat_grid = [];
    for (let row = 0; row <4; row ++) {
      for (let col = 0; col < 4; col ++) {
        this.flat_grid.push(this.grid[row][col]);
      }
    }
  }

  updateGrid() {
    $("#score").text("Score: " + this.reward);
    this.flatten();
    let var_self = this;
    $('.cell-value').each(function(cell, obj) {
      let cell_value = var_self.flat_grid[cell];
      if (cell_value == 0) {
        $(this).text("");
        $(this).parent().css({'background-color': '#e6f0ff'});
      } else {
        $(this).text(var_self.flat_grid[cell]);
        let color_lightness = 50 / (Math.log2(var_self.flat_grid[cell]) + 1) + 50;
        let hsl_color = 'hsl(255, 100%, ' + color_lightness.toString() + '%)';
        $(this).parent().css({'background-color': hsl_color});
      }
    })
  }

  slide(row) {
    let non_empty = row.filter(Number);
    let missing = row.length - non_empty.length;
    let zeros = Array(missing).fill(0);
    let new_row = zeros.concat(non_empty);

    return new_row
  }

  move(row) {
    row = this.slide(row);
    for (let col = 3; col > 0; col--) {
      if (row[col] == row[col - 1]) {
        this.reward = this.reward + row[col];
        row[col] = 2*row[col];
        row[col - 1] = 0;
      }
    }
    row = this.slide(row);
    return row
  }

  canMoveRight() {
    let gridCopy = this.grid.slice();
    for (let row = 0; row < 4; row++) {
      gridCopy[row] = this.move(this.grid[row]);
    }
    if (sthChanged(gridCopy, this.grid) == true) {
      return true
    }
  }

  moveRight() {
    if (this.canMoveRight() === true) {
      for (let row = 0; row < 4; row++) {
        this.grid[row] = this.move(this.grid[row]);
      }
    }
  }

  moveLeft() {
    this.reflectionRightLeft();
    this.moveRight();
    this.reflectionRightLeft();
  }

  reflectionRightLeft() {
    for (let row = 0; row < 4; row++) {
      this.grid[row].reverse();
    }
  }

  moveDown() {
    this.transposeGrid();
    this.moveRight();
    this.transposeGrid();
  }

  moveUp() {
    this.transposeGrid();
    this.reflectionRightLeft();
    this.moveRight();
    this.reflectionRightLeft();
    this.transposeGrid();
  }

  transposeGrid() {
    let tempGrid = this.grid.slice();
    this.grid = [[0,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,0]];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.grid[row][col] = tempGrid[col][row];
      }
    }
  }

  tryToMove(keyNo) {
    let past_grid = this.grid.slice();
	switch(keyNo) {
		case RIGHT:
			this.moveRight();
			break;
		case LEFT:
			this.moveLeft();
			break;
		case DOWN:
			this.moveDown();
			break;
		case UP:
			this.moveUp();
			break;
		default:
			console.warn("wrong direction");
			break;
	}

	const hasStateChanged = sthChanged(past_grid, this.grid);

    if (hasStateChanged === true) {
      this.updateEmptyCells();
      this.addNumber();
    }
  }

  isGameOver() {
    if (this.empty_cells.length == 0) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col ++) {
          if (col != 3 && this.grid[row][col] === this.grid[row][col + 1]) {
            return
          }
          if (row != 3 && this.grid[row][col] === this.grid[row + 1][col]) {
            return
          }
        }
      }
      this.done = true
    }
  }
}

function randomMove(env) {
  let keyNo = randomElement(MOVES);
  env.tryToMove(keyNo);
  env.updateEmptyCells();
  env.updateGrid();
  env.isGameOver();
}

function dlruMove(env) {
  let past_grid = env.grid.slice();
  env.tryToMove(DOWN);
  env.updateEmptyCells();
  env.updateGrid();
  if (sthChanged(past_grid, env.grid) === false) {
    past_grid = env.grid.slice();
    env.tryToMove(LEFT);
    env.updateEmptyCells();
    env.updateGrid();
    if (sthChanged(past_grid, env.grid) === false) {
      past_grid = env.grid.slice();
      env.tryToMove(RIGHT);
      env.updateEmptyCells();
      env.updateGrid();
      if (sthChanged(past_grid, env.grid) === false) {
        past_grid = env.grid.slice();
        env.tryToMove(UP);
        env.updateEmptyCells();
        env.updateGrid();
      }
    }
  }
  env.isGameOver();
}

$(document).ready(function() {

  let intervalId = false;
  let env = new Env();
  play_yourself();

  $('#play_yourself').click(() => {
    env.mode = 'play_yourself';
    play_yourself()
  });

  $('#random_play').click(() => {
    env.mode = 'random_play';
    random_play()
  });

  $('#dlru').click(() => {
    env.mode = 'dlru';
    dlru()
  });

  $('body').keydown(function(key) {
      if (env.mode == 'play_yourself') {
        let keyNo = key.which;
        if (keyNo == R) {
          env.reset();
        } else if (env.done != true && MOVES.includes(keyNo)) {
          env.tryToMove(keyNo);
        }
        env.updateEmptyCells();
        env.updateGrid();
        env.isGameOver();
        if (env.done) {
          $("#status").text("Game Over");
        }
      }
    });

  function play_yourself() {
    env.reset();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = false;
    }
    $("#mode").text("Mode: you play the game");
    $("#status").text("The game is on");
  }

  function random_play() {
    env.reset();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = false;
    }
    $("#mode").text("Mode: random play");
    $("#status").text("The game is on");

  	intervalId = setInterval(function(){
  		if (env.done) {
  			clearInterval(intervalId);
        intervalId = false;
  			$("#status").text("Game Over");
  			return;
  		}
  		randomMove(env);
	  }, 100);
  }

  function dlru() {
     env.reset();
     if (intervalId) {
       clearInterval(intervalId);
       intervalId = false;
     }
     $("#mode").text("Mode: Down, left, right, up");
     $("#status").text("The game is on");

     intervalId = setInterval(function(){
       if (env.done) {
         clearInterval(intervalId);
         intervalId = false;
         $("#status").text("Game Over");
         return;
       }
       dlruMove(env);
     }, 100);
   }

});
