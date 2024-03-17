var canvas = document.getElementById("gameArea");

var Player;
var playerSpeed = 10;

var gameArea = {
    start: function() {
        canvas.width = window.innerWidth;
        canvas.height = 700;
        this.context = canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 1);
    },
    clear: function() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function startGame() {
    gameArea.start();
    Player = new Entity(canvas.width / 2, canvas.height / 2, 50, 80);
}

function Entity(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.angle = 0;

    this.show = function() {
        var ctx = gameArea.context;
        var playerImage = document.getElementById("playerImage");

        ctx.fillStyle = "white";

        ctx.save();

        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(playerImage, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    };

    this.updatePosition = function() {
        
        this.y += this.speedY * Math.sin(Player.angle - Math.PI / 2);
    }
}

function updateGameArea() {
    gameArea.clear();
    Player.updatePosition();
    Player.show();
}

function moveForward() {
    Player.speedX += 1;
    Player.speedY += 1;
}
function rotateLeft() {
    Player.angle -= 3 * Math.PI / 180;
}
function rotateRight() {
    Player.angle += 3 * Math.PI / 180;
}

document.addEventListener('keydown', function(event) {
    if (event.key == "ArrowUp") {
        moveForward();
    }
    else if (event.key == "ArrowLeft") {
        rotateLeft();
    }
    else if (event.key == "ArrowRight") {
        rotateRight();
    }
});


