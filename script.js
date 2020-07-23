let speed = 300
function crtEl(el) {
    return document.createElement(el);
}
function getRandom (min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}
function getCell (x, y) {
    return document.querySelectorAll('[data-pos="' + Math.floor(x) + '-' + Math.floor(y) + '"]')[0]
}
function Game() {
    this.FIELD_SIZE_X = 5;
    this.FIELD_SIZE_Y = 5;
    this.SNAKE_SIZE = 3;
    this.snake_speed = 300;
    this.WALLS_SPEED = 3000;
    this.LEFT = 37;
    this.UP = 38;
    this.RIGHT = 39;
    this.DOWN = 40;
    this.foodCell = undefined;
    this.gameTimer = null;
    this.walls = [];
    this.wallsTimer = null;
    this.scoreInc = function () {
        document.getElementById('gameScore').innerText = +document.getElementById('gameScore').innerText + 1;
    }

    this.snake = function (game) {
        this.currentDirection = 38;

        this.body = [];

        this.go = function () {
            var nextCell = null;
            var pos = this.body[0].dataset.pos.split('-');
            var x = +pos[0];
            var y = +pos[1];

            switch (this.currentDirection) {
                case game.LEFT:
                    nextCell = this.goLeft(x, y);
                    break;
                case game.RIGHT:
                    nextCell = this.goRight(x, y);
                    break;
                case game.UP:
                    nextCell = this.goUp(x, y);
                    break;
                case game.DOWN:
                    nextCell = this.goDown(x, y);
                    break;
            }

            if (this.isSnakeCell(nextCell) || nextCell === undefined || game.walls.includes(nextCell)) {
                clearInterval(game.gameTimer);
                clearInterval(game.wallsTimer);
                alert('GAME OVER');
            } else {
                this.body.unshift(nextCell);
                nextCell.classlist.add('head');
                nextCell.classList.add('snake-cell');
                this.endOfTail();
            }
        };

        this.goRight = function (x, y) {
            if (x >= game.FIELD_SIZE_X - 1) {
                x = -1;
            }
            var nextCell = getCell(x + 1, y);
            if (this.body[1] === nextCell) {
                nextCell = getCell(x - 1, y);
            }
            return nextCell;
        };

        this.goLeft = function (x, y) {
            if (x <= 0) {
                x = game.FIELD_SIZE_X;
            }
            var nextCell = getCell(x - 1, y);
            if (this.body[1] === nextCell) {
                nextCell = getCell(x + 1, y);
            }
            return nextCell;
        };

        this.goUp = function (x, y) {
            if (y <= 0) {
                y = game.FIELD_SIZE_Y;
            }
            var nextCell = getCell(x, y - 1);
            if (this.body[1] === nextCell) {
                nextCell = getCell(x, y + 1);
            }
            return nextCell;
        };

        this.goDown = function (x, y) {
            if (y >= game.FIELD_SIZE_Y - 1) {
                y = -1;
            }
            var nextCell = getCell(x, y + 1);
            if (this.body[1] === nextCell) {
                nextCell = getCell(x, y - 1);
            }
            return nextCell;
        };

        this.endOfTail = function () {
            if (game.foodCell !== this.body[0]) {
                var tail = this.body.pop();
                tail.classList.remove('snake-cell');
                tail.classList.remove('head');
            } else {
                game.foodCell.classList.remove('food-cell');
                game._foodCreator();
                game.scoreInc();
                speed -= 300
                console.log (game.snake_speed)
            }
        };

        this.isSnakeCell = function (el) {
            return this.body.includes(el);
        }
    };

    this.run = function () {
        this._createGameField();
        this._createSnake();
        this.gameTimer = setInterval(function () {
            game.snake.go();
            game.wallDestroyer();
        },
        speed);
        this._foodCreator();
        //this.wallsTimer = setInterval (this._wallCreator, this.WALLS_SPEED)
    };

    this._createGameField = function () {
        var table = crtEl('table');
        table.classList.add('game-table');
        for (var i = 0; i < this.FIELD_SIZE_X; i++) {
            var tr = crtEl('tr');
            for (var j = 0; j < this.FIELD_SIZE_Y; j++) {
                var td = crtEl('td');
                td.classList.add('game-table-cell');
                td.dataset.pos = j + '-' + i;

                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        document.getElementsByClassName('game')[0].insertBefore(table, document.getElementsByClassName('game')[0].firstChild);
    };

    this._createSnake = function () {
        this.snake = new this.snake(this);
        var startX = this.FIELD_SIZE_X / 2;
        var startY = this.FIELD_SIZE_Y / 2;

        for (var i = 0; i < this.SNAKE_SIZE && startY + i < this.FIELD_SIZE_Y; i++) {
            var snakeCell = getCell(startX, startY + i);
            this.snake.body.push(snakeCell);
            if(i == 0) {
                snakeCell.classList.add("head")
            }
                snakeCell.classList.add('snake-cell');
        }
    };
    this._foodCreator = function () {
        var x = getRandom(0, this.FIELD_SIZE_X - 1);
        var y = getRandom(0, this.FIELD_SIZE_Y - 1);
        var foodCell = getCell(x, y);
        if (!this.snake.isSnakeCell(foodCell) && !this.walls.includes(foodCell)) {
            this.foodCell = foodCell;
            this.foodCell.classList.add('food-cell');
        } 
        else {
            this._foodCreator();
        }
    };
    this._wallCreator = function () {
        var x = getRandom(0, game.FIELD_SIZE_X - 1);
        var y = getRandom(0, game.FIELD_SIZE_Y - 1);
        var wallCell = getCell(x, y);
        if (!game.snake.isSnakeCell(wallCell) && wallCell !== game.foodCell) {
            wallCell.classList.add('wall-cell');
            wallCell.dataset.liveTime = getRandom (game.snake_speed * 4, game.FIELD_SIZE_X * game.snake_speed)
            game.walls.push(wallCell)
        } 
        else {
            game._wallCreator();
        }
    };
    this.wallDestroyer = function () {
        for (let i = 0; i < game.walls.length; i++) {
            game.walls[i].dataset.liveTime = +game.walls[i].dataset.liveTime - game.snake_speed
        }
        let g = game.walls.length
        while (g--) {
            if (+game.walls[g].dataset.liveTime <= 0) {
                game.walls[g].classList.remove('wall-cell');
                game.walls.splice(g, 1)
            }
        }
    }
}
game = new Game ()
function controller (k) {
    if (k.keyCode == 37||k.keyCode == 38||k.keyCode == 39||k.keyCode == 40) {
        game.snake.currentDirection = k.keyCode
    }
}
function init () {
    window.addEventListener("keydown", controller)
    game.run()
}
function reSTART () {
    window.location.reload()
}
