const FPS = 30;
const SHIP_SIZE = 30;
const ROTATION_SPEED = 360; // degrees per second
const SHIP_THRUST = 5;
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = complete friction)
const ROIDS_NUM = 3; // starting number of asteroids
const ROIDS_SIZE = 100;
const ROIDS_SPEED = 50;
const ROIDS_VERT = 10;
const ROIDS_JAG = 0.4;

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // facing north
    rs: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// set up asteroids
var roids = [];
createAsteroidBelt();

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    roids = [];
    var x, y;
    for (var i = 0; i < ROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
        roids.push(newAsteroid(x, y));
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function keyDown(e) {
    switch (e.keyCode) {
        case 37: // left arrow (rotate left)
            ship.rs = ROTATION_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (thrust forward)
            ship.thrusting = true;
            break;
        case 39: // right arrow (rotate right)
            ship.rs = -ROTATION_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(e) {
    switch (e.keyCode) {
        case 37: // left arrow (stop rotating left)
            ship.rs = 0;
            break;
        case 38: // up arrow (stop thrust forward)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotating right)
            ship.rs = 0;
            break;
    }
}

function newAsteroid(x, y) {
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: ROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: []
    };

    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
}

function update() {
    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // thrust ship
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        ctx.strokeStyle = "yellow";
        ctx.fillStyle = "red";
        ctx.lineWidth = SHIP_SIZE / 10;
        ctx.beginPath();
        ctx.moveTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo( // rear center
            ship.x - ship.r * (5 / 3 * Math.cos(ship.a)),
            ship.y + ship.r * (5 / 3 * Math.sin(ship.a))
        );
        ctx.lineTo( // rear right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    //draw ship
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // top
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // rear left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // rear right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // draw ship
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = SHIP_SIZE / 20;
    var x, y, r, a, vert, offs;

    for (var i = 0; i < roids.length; i++) {
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offs = roids[i].offs;

        // draw path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );
        // draw polygon
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert),
            );
        }
        ctx.closePath();
        ctx.stroke();

        // move asteroid
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;
        // roids[i].y += roids[i].yv;

        // handle edge of screen
        if (roids[i].x < 0 - roids[i].r) {
            roids[i].x = canvas.width + roids[i].r;
        } else if (roids[i].x > canvas.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r;
        }

        if (roids[i].y < 0 - roids[i].r) {
            roids[i].y = canvas.height + roids[i].r;
        } else if (roids[i].y > canvas.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r;
        }
    }

    // rotate ship
    ship.a += ship.rs;

    // move ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r;
    }

    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    }
}