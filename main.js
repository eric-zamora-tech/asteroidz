const FPS = 30;
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = complete friction)
const GAME_LIVES = 3;
const SAVE_KEY_SCORE = "highscore";

const LASER_DIST = 0.6;
const LASER_MAX = 10;
const LASER_EXPLODE_DUR = 0.1;
const LASER_SPEED = 500;

const ROIDS_JAG = 0.4;
const ROIDS_NUM = 3; // starting number of asteroids
const ROIDS_SIZE = 100;
const ROIDS_SPEED = 50;
const ROIDS_VERT = 10;
const ROIDS_PTS_LG = 20;
const ROIDS_PTS_MD = 50;
const ROIDS_PTS_SM = 100;

const SHIP_BLINK_DUR = 0.2;
const SHIP_EXPLODE_DUR = 0.3;
const SHIP_INV_DUR = 3;
const SHIP_SIZE = 30;
const SHIP_THRUST = 5;
const SHIP_TURN_SPEED = 360; // degrees per second

const SHOW_BOUNDING = false;

const TEXT_FADE_TIME = 2.5;
const TEXT_SIZE = 40;

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// set up the game parameters
var level, lives, roids, ship, score, scoreHigh, text, textAlpha;
newGame();

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    roids = [];
    var x, y;
    for (var i = 0; i < ROIDS_NUM + level; i++) {
        // random asteroid location (not touching spaceship)
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function destroyAsteroid(index) {
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;

    // split the asteroid in two if necessary
    if (r == Math.ceil(ROIDS_SIZE / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
        score += ROIDS_PTS_LG;
    } else if (r == Math.ceil(ROIDS_SIZE / 4)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        score += ROIDS_PTS_MD;
    } else {
        score += ROIDS_PTS_SM;
    }

    // check high score
    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    // destroy the asteroid
    roids.splice(index, 1);

    // new level when no more asteroids 
    if (roids.length == 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, color = "white") {
    ctx.strokeStyle = color;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // top
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo( // rear left
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( // rear right
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}

function keyDown(e) {
    if (ship.dead) {
        return;
    }
    switch (e.keyCode) {
        case 32: // space bar (shoot laser)
            shootLaser();
            break;
        case 37: // left arrow (rotate left)
            ship.rs = SHIP_TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (thrust forward)
            ship.thrusting = true;
            break;
        case 39: // right arrow (rotate right)
            ship.rs = -SHIP_TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(e) {
    if (ship.dead) {
        return;
    }

    switch (e.keyCode) {
        case 32: // space bar (allow shooting)
            ship.canShoot = true;
            break;
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

function newAsteroid(x, y, r) {
    var lvlMult = 1 + 0.1 * level;

    var roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: []
    };

    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
}

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    ship = newShip();

    // get local high score from local storage
    var scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr);
    }
    newLevel();
}

function newLevel() {
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // facing north
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        canShoot: true,
        dead: false,
        lasers: [],
        explodeTime: 0,
        rs: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    // create laser
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ // from nose of ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPEED * Math.cos(ship.a) / FPS,
            yv: -LASER_SPEED * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    // prevent further shooting
    ship.canShoot = false;
}

function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;

    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw asteroids
    var x, y, r, a, vert, offs;

    for (var i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;

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

        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    // thrust ship
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        if (!exploding && blinkOn) {
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
        }
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    //draw ship
    if (!exploding) {
        if (blinkOn && !ship.dead) {
            drawShip(ship.x, ship.y, ship.a);

            if (SHOW_BOUNDING) {
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
        }

        if (ship.blinkNum > 0) {
            ship.blinkTime--;
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }

    } else {
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // draw the game text
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead) {
        newGame();
    }

    // draw the lives
    for (var i = 0; i < lives; i++) {
        lifeColor = exploding && i == lives - 1 ? "red" : "white";
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor);
    }

    // draw score
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(score, canvas.width - SHIP_SIZE / 2, SHIP_SIZE);

    // draw high score
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = (TEXT_SIZE * 0.75) + "px dejavu sans mono";
    ctx.fillText("BEST " + scoreHigh, canvas.width / 2, SHIP_SIZE);

    // detect laser hits on asteroids
    var ax, ay, ar, lx, ly;
    for (var i = roids.length - 1; i >= 0; i--) {
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;

        for (var j = ship.lasers.length - 1; j >= 0; j--) {
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // detect hits
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
                // destroy asteroid
                destroyAsteroid(i);

                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR / FPS);
                break;
            }
        }
    }

    //check for asteroid collisions (when not exploding)
    if (!exploding) {
        if (ship.blinkNum == 0 && !ship.dead) {
            // check for asteroid collisions
            for (var i = 0; i < roids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }

        // rotate ship
        ship.a += ship.rs;

        // move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;
        if (ship.explodeTime == 0) {
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

    // draw the lasers
    for (var i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 10, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // draw explosion
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

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

    // move the lasers
    for (var i = ship.lasers.length - 1; i >= 0; i--) {
        // check distance travelled
        if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // handle explosion
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // destroy the laser after the duration is up
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            // move laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            // calculate the distance travelled
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        // handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }

        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        } else if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
    }


    // move asteroid
    for (var i = 0; i < roids.length; i++) {
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;

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
}