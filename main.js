var canvas = document.getElementById("gameArea");
var ctx = canvas.getContext("2d");

var Player;
var playerMaxSpeed = 4;
var hitBoxSize = 0.60;
var friction = 0.01;
var fuel = 100;
var fuelStations = [];

var gameArea = {
    start: function() {
        canvas.width = window.innerWidth;
        canvas.height = 700;
        this.interval = setInterval(updateGameArea, 1);
        // setInterval(updateFuel, 5000);
    },
    clear: function() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function startGame() {
    gameArea.start();
    Player = new Entity(canvas.width / 2, canvas.height / 2, 25, 45, "player");

    for(var i = 0; i < 3; i++) {
        fuelStations.push(new Entity(Math.random() * (canvas.width - 100) + 50, Math.random() * (canvas.height - 100) + 50, 10, 10, "fuel"));
    }
}

function Entity(x, y, width, height, type) {
    this.type = type;

    this.x = x;
    this.y = y;
    
    this.width = width;
    this.height = height;

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
    

    this.show = function() {
        var playerImage = document.getElementById("playerImage");

        // Draw boundary points
        ctx.beginPath();
        ctx.arc(this.leftMostPointX, this.centerY, 2, 0, Math.PI * 2);
        ctx.arc(this.rightMostPointX, this.centerY, 2, 0, Math.PI * 2);
        ctx.arc(this.centerX, this.bottomMostPointY, 2, 0, Math.PI * 2);
        ctx.arc(this.centerX, this.topMostPointY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        ctx.save();

        // Translate to center of player and rotate coordinates
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.angle);

        if(this.type == "player") {
            ctx.fillStyle = "white";
            ctx.drawImage(playerImage, -this.width / 2 / hitBoxSize, -this.height / 2 / hitBoxSize, this.width / hitBoxSize, this.height / hitBoxSize);
            if(this.type == "player") ctx.strokeStyle = "red";
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        if(this.type == "fuel") {
            ctx.fillStyle = "brown";
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width, this.height, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            ctx.strokeStyle = "green";
            ctx.strokeRect(-this.width / 2 , -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    };

    this.updatePosition = function() {
        if(this.type == "player") {
            this.speedX -= Math.sign(this.speedX) * friction;
            this.speedY -= Math.sign(this.speedY) * friction;
        }
        this.x += this.speedX;
        this.y += this.speedY;

        if(this.x + this.width <= 0) this.x = canvas.width;
        if(this.x > canvas.width) this.x = this.x % canvas.width - this.width;
        if(this.y + this.height <= 0) this.y = canvas.height;
        if(this.y > canvas.height) this.y = this.y % canvas.height - this.height;

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

    this.detectCollisions = function(entity) {
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

                this.x = -5000;
                this.y = -5000;
                this.updatePosition();
                
                setTimeout(() => {
                    this.x = Math.random() * (canvas.width - 100) + 50;
                    this.y = Math.random() * (canvas.height - 100) + 50;

                    this.updatePosition();
                }, 10000);
            }
        }
    }
}

function checkFuelStation() {
    var randX = (canvas.width - 50) * Math.random();
    var randY = (canvas.height - 50) * Math.random();

    // fuelEntities.push({x: randX, y: randY, isActive: true});
}

function updateGameArea() {
    gameArea.clear();
    executeKeyboardMoves();

    Player.updatePosition();

    for(var i = 0; i < 3; i++) {
        fuelStations[i].detectCollisions(Player);
        fuelStations[i].show();
    }

    ctx.fillStyle = `rgb(${(255 / 100) * (100 - fuel)}, ${(255 / 100) * fuel}, ${Math.floor(fuel)})`;
    ctx.fillRect(15, canvas.height - 50, fuel * 2, 35);

    ctx.strokeStyle = "white";
    ctx.strokeRect(15, canvas.height - 50, 200, 35);

    // for(var i = 0; i < fuelEntities.length; i++) {
    //     if(fuelEntities[i].isActive) {
    //         ctx.fillStyle = "brown";
    //         ctx.beginPath();
    //         ctx.arc(fuelEntities[i].x, fuelEntities[i].y, 10, 0, Math.PI * 2);
    //         ctx.fill();
    //         ctx.closePath();
    //     } 
    //     else {
    //         delete fuelEntities[i];
    //     }
    // }

    Player.show();
}

function addThrust() {
    if(fuel > 0) {
        if(Math.abs(Player.speedX) < playerMaxSpeed) Player.speedX += 0.05 * Math.cos(Player.angle - Math.PI / 2);
        if(Math.abs(Player.speedY) < playerMaxSpeed) Player.speedY += 0.05 * Math.sin(Player.angle - Math.PI / 2);
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