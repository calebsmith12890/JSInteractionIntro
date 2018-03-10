// GameBoard code below

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "Yellow", "OrangeRed", "Purple"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (600 - this.radius * 2), this.radius + Math.random() * (200 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = this.colors[getRandomInt(6)];
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 600;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 200;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 600 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 200 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
        }
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 25;//  shadow Blur
    ctx.shadowColor = this.color; // shadow color
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

};


function Attacker(game) {
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Blue", "Yellow"];
    this.setNotIt();
    Entity.call(this, game, 0, 0);

    this.velocity = { x: 0, y: 0 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Attacker.prototype = new Entity();
Attacker.prototype.constructor = Attacker;

Attacker.prototype.setNotIt = function () {
    this.it = false;
    this.color = this.colors[getRandomInt(3)];
    this.visualRadius = 200;
};

Attacker.prototype.collide = function (other) {
    return distance(this, other) - 2 < this.radius + other.radius;
};

Attacker.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Attacker.prototype.collideRight = function () {
    return (this.x + this.radius) > 600;
};

Attacker.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Attacker.prototype.collideBottom = function () {
    return (this.y) > 700;
};

Attacker.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 600 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.removeFromWorld = true;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;

            if (this.color === 'Red') {
                switch(ent.color) {
                    case 'Blue': ent.color = 'Purple'; break;
                    case 'Purple': ent.color = 'Blue'; break;
                    case 'OrangeRed': ent.color = 'Yellow'; break;
                    case 'Yellow': ent.color = 'OrangeRed'; break;
                    case 'Red': ent.removeFromWorld = true; break;
                    // case 'Green': ent.removeFromWorld = true; break;
                }
            }

            else if (this.color === 'Blue') {
                switch(ent.color) {
                    case 'Red': ent.color = 'Purple'; break;
                    case 'Purple': ent.color = 'Red'; break;
                    case 'Green': ent.color = 'Yellow'; break;
                    case 'Yellow': ent.color = 'Green'; break;
                    case 'Blue': ent.removeFromWorld = true; break;
                    // case 'OrangeRed': ent.removeFromWorld = true; break;
                }
            }

            else if (this.color === 'Yellow') {
                switch(ent.color) {
                    case 'Blue': ent.color = 'Green'; break;
                    case 'Green': ent.color = 'Blue'; break;
                    case 'OrangeRed': ent.color = 'Red'; break;
                    case 'Red': ent.color = 'OrangeRed'; break;
                    // case 'Purple': ent.removeFromWorld = true; break;
                    case 'Yellow': ent.removeFromWorld = true; break;
                }
            }

            this.removeFromWorld = true;
        }
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Attacker.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.shadowBlur = 25;//  shadow Blur
    ctx.shadowColor = this.color; // shadow color
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.globalAlpha=1;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
};

// the "main" code begins here
var friction = .98;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();

    for (var i = 0; i < 16; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }

    for (var i = 0; i < 4; i++) {
        atk = new Attacker(gameEngine);
        gameEngine.attackers.push(atk);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});
