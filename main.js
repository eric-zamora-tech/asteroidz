var canvas = document.getElementById("gameArea");
var ctx = canvas.getContext("2d");

var Player;
var playerSize;
var playerRatio = 3.0 / 4.0;
var playerMaxSpeed = 1;
var friction = 0.01;
var fuel = 100;
var fuelStations = [];
var playerScore = 0;

var gameArea = {
    updateSize: function() {
        var canvasWidthCalculated = Math.min(800, 0.75 * window.innerWidth);
        var canvasHeightCalculated = (3.0 / 5.0) * canvasWidthCalculated;

        canvas.width = canvasWidthCalculated;
        canvas.height = canvasHeightCalculated;
    },
    start: function() {
        var elementsToHide = document.getElementsByClassName("toggle-hidden");
        elementsToHide[0].style.display = 'none';
        elementsToHide[1].style.display = 'none';

        this.updateSize();
        this.interval = window.requestAnimationFrame(updateGameArea);
        setInterval(() => {
            playerScore++;
        }, 5000);
    },
    clear: function() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function startGame() {
    gameArea.start();

    playerSize = 0.06 * canvas.width;
    Player = new Entity(50, 50, playerRatio * playerSize, playerSize / playerRatio, "player");

    fuelStations.push(new Entity(-500, -500, 15, 25, "fuel"));
    setTimeout(() => {
        fuelStations[0].percentDisplacementFromLeft = Math.random() * (80) + 10;
        fuelStations[0].percentDisplacementFromTop = Math.random() * (80) + 10;

        fuelStations[0].updatePosition();
    }, 20000);
}

class Entity {
    constructor(pDL, pDT, width, height, type) {
        this.type = type;

        this.percentDisplacementFromLeft = pDL;
        this.percentDisplacementFromTop = pDT;

        this.width = width;
        this.height = height;
        
        this.x = (pDL / 100) * canvas.width - this.width / 2;
        this.y = (pDT / 100) * canvas.height - this.height / 2;

        this.centerX = this.x + this.width / 2;
        this.centerY = this.y + this.height / 2;

        this.angle = 0;
        
        this.leftMostPointX = this.centerX - (this.width / 2) * Math.abs(Math.cos(this.angle)) - (this.height / 2) * Math.abs(Math.sin(this.angle));
        this.rightMostPointX = this.centerX + (this.width / 2) * Math.abs(Math.cos(this.angle)) + (this.height / 2) * Math.abs(Math.sin(this.angle));
        this.bottomMostPointY = this.centerY + (this.height / 2) * Math.abs(Math.cos(this.angle)) + (this.width / 2) * Math.abs(Math.sin(this.angle));
        this.topMostPointY = this.centerY - (this.height / 2) * Math.abs(Math.cos(this.angle)) - (this.width / 2) * Math.abs(Math.sin(this.angle));
        
        this.speedX = 0;
        this.speedY = 0;
        this.isCollided = false;
    }
    
    updateSize() {
        playerSize = 0.06 * canvas.width;

        this.width = playerRatio * playerSize;
        this.height = playerSize / playerRatio;
    }

    updatePosition() {
        this.percentDisplacementFromLeft += this.speedX;
        this.percentDisplacementFromTop += this.speedY;

        if(this.type == "player") {
            this.speedX -= this.speedX * friction;
            this.speedY -= this.speedY * friction;

            if(this.percentDisplacementFromLeft <= 0) this.percentDisplacementFromLeft = 100;
            if(this.percentDisplacementFromLeft > 100) this.percentDisplacementFromLeft %= 100;
            if(this.percentDisplacementFromTop <= 0) this.percentDisplacementFromTop = 100;
            if(this.percentDisplacementFromTop > 100) this.percentDisplacementFromTop %= 100;
        }
        
        

        this.x = (this.percentDisplacementFromLeft / 100) * canvas.width - this.width / 2;
        this.y = (this.percentDisplacementFromTop / 100 ) * canvas.height - this.height / 2;
        
        this.centerX = this.x + this.width / 2;
        this.centerY = this.y + this.height / 2;
        
        this.leftMostPointX = this.centerX - (this.width / 2) * Math.abs(Math.cos(this.angle)) - (this.height / 2) * Math.abs(Math.sin(this.angle));
        this.rightMostPointX = this.centerX + (this.width / 2) * Math.abs(Math.cos(this.angle)) + (this.height / 2) * Math.abs(Math.sin(this.angle));
        this.bottomMostPointY = this.centerY + (this.height / 2) * Math.abs(Math.cos(this.angle)) + (this.width / 2) * Math.abs(Math.sin(this.angle));
        this.topMostPointY = this.centerY - (this.height / 2) * Math.abs(Math.cos(this.angle)) - (this.width / 2) * Math.abs(Math.sin(this.angle));

        // if(this.isCollided) {
        //     if(this.bottomMostPointY >= canvas.height || this.topMostPointY <= 0) {
        //         this.y -= this.speedY;
        //         this.speedY = -0.75 * this.speedY;
        //     }
        // }

        // this.isCollided = false;
        // if(this.x + Math.cos(this.angle - Math.PI / 2) < 0 || this.x >= canvas.width - this.width) {
        //     this.x -= this.speedX;
        //     this.speedX *= -0.5;
        // }
        // if(this.y + Math.sin(this.angle - Math.PI / 2) > canvas.height - this.height || this.y + Math.sin(this.angle - Math.PI / 2) < 0) {
        //     this.y -= this.speedY;
        //     this.speedY *= -0.5;
        // }
    }

    show() {
        var playerImage = document.getElementById("playerImage");
        var gasImage = document.getElementById("gasImage");

        // Draw boundary points
        // ctx.beginPath();
        // ctx.arc(this.leftMostPointX, this.centerY, 2, 0, Math.PI * 2);
        // ctx.arc(this.rightMostPointX, this.centerY, 2, 0, Math.PI * 2);
        // ctx.arc(this.centerX, this.bottomMostPointY, 2, 0, Math.PI * 2);
        // ctx.arc(this.centerX, this.topMostPointY, 2, 0, Math.PI * 2);
        // ctx.fillStyle = 'red';
        // ctx.fill();
        // ctx.closePath();

        ctx.save();

        // Translate to center of player and rotate coordinates
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.angle);

        if(this.type == "player") {
            ctx.fillStyle = "white";
            ctx.drawImage(playerImage, -this.width / 2, -this.height / 2, this.width, this.height);
            // if(this.type == "player") ctx.strokeStyle = "red";
            // ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        if(this.type == "fuel") {
            ctx.drawImage(gasImage, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    }

    

    detectCollisions(entity) {
        // if((this.rightMostPointX > entity.leftMostPointX && this.leftMostPointX < entity.leftMostPointX && this.topMostPointY < entity.centerY && this.bottomMostPointY > entity.centerY) || (this.leftMostPointX > entity.rightMostPointX && this.rightMostPointX < entity.rightMostPointX && this.topMostPointY < entity.centerY && this.bottomMostPointY > entity.centerY) || (this.bottomMostPointY > entity.topMostPointY && this.topMostPointY < entity.topMostPointY && this.leftMostPointX < entity.centerX && this.rightMostPointX > entity.centerX) || (this.topMostPointY > entity.bottomMostPointY && this.bottomMostPointY < entity.bottomMostPointY && this.leftMostPointX < entity.centerY && this.rightMostPointX > entity.centerY)) {
        //     if(this.type = "fuel") {
        //         this.x = Math.random() * (canvas.width - 100) + 50;
        //         this.y = Math.random() * (canvas.height - 100) + 50;

        //         this.updatePosition();
        //     }
        // }
        if(entity.topMostPointY < this.topMostPointY && entity.bottomMostPointY > this.bottomMostPointY && entity.leftMostPointX < this.leftMostPointX && entity.rightMostPointX > this.rightMostPointX) {
            if(this.type = "fuel") {
                fuel += 25;
                if(fuel > 100) fuel = 100;

                this.percentDisplacementFromLeft = -500;
                this.percentDisplacementFromTop = -500;
                this.updatePosition();
                
                setTimeout(() => {
                    this.percentDisplacementFromLeft = Math.random() * (80) + 10;
                    this.percentDisplacementFromTop = Math.random() * (80) + 10;

                    this.updatePosition();
                }, 20000);
            }
        }
    }
}

function updateGameArea() {
    gameArea.clear();
    executeKeyboardMoves();

    Player.updatePosition();
    for(var i = 0; i < fuelStations.length; i++) {
        fuelStations[i].detectCollisions(Player);
        fuelStations[i].show();
    }
    Player.show();

    ctx.fillStyle = `rgb(${(255 / 100) * (100 - fuel)}, ${(255 / 100) * fuel}, ${Math.floor(fuel)})`;
    ctx.fillRect(canvas.width / 30, 0.88 * canvas.height, (fuel / 100) * canvas.width / 4, Math.min(canvas.height / 15, 35));

    ctx.strokeStyle = "white";
    ctx.strokeRect(canvas.width / 30, 0.88 * canvas.height, canvas.width / 4, Math.min(canvas.height / 15, 35));

    ctx.fillStyle="white";
    ctx.font = "36px sans-serif";
    ctx.fillText(`Score: ${playerScore}`, 10, 50);

    window.requestAnimationFrame(updateGameArea);
}

function addThrust() {
    if(fuel > 0) {
        Player.speedX += 0.01 * Math.cos(Player.angle - Math.PI / 2);
        Player.speedY += 0.01 * Math.sin(Player.angle - Math.PI / 2);
        // if(Math.abs(Player.speedX) < playerMaxSpeed) Player.speedX += 0.5 * Math.cos(Player.angle - Math.PI / 2);
        // if(Math.abs(Player.speedY) < playerMaxSpeed) Player.speedY += 0.5 * Math.sin(Player.angle - Math.PI / 2);
    }
    fuel -= 0.05;

    if(fuel < 0) {
        fuel = 0;
    }
}
function rotateLeft() {
    Player.angle -= 2 * Math.PI / 180;
}
function rotateRight() {
    Player.angle += 2 * Math.PI / 180;
}

const controller = {
    "ArrowUp": {pressed: false, func: addThrust},
    "ArrowLeft": {pressed: false, func: rotateLeft},
    "ArrowRight": {pressed: false, func: rotateRight}
}

function executeKeyboardMoves() {
    Object.keys(controller).forEach(key => {
        controller[key].pressed && controller[key].func()
    });
}

document.addEventListener('keydown', function(event) {
    if(controller[event.key]) {
        controller[event.key].pressed = true;
    }
});
document.addEventListener('keyup', function(event) {
    if(controller[event.key]) {
        controller[event.key].pressed = false;
    }
});
// document.addEventListener('touchstart', function(event) {
//     console.log(event);
//     // if(controller[event.key]) {
//     //     controller[event.key].pressed = true;
//     // }
// });
// document.addEventListener('touchend', function(event) {
//     console.log(event);
//     // if(controller[event.key]) {
//     //     controller[event.key].pressed = false;
//     // }
// });
window.addEventListener('resize', function(event) {
    gameArea.updateSize();

    Player.updateSize();
    Player.updatePosition();
});