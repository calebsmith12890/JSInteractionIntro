// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.attackers = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;

    this.b1X = 290;
    this.b1Y = 500;
    this.b2X = 290;
    this.b2Y = 550;
    this.b3X = 290;
    this.b3Y = 600;
    this.b4X = 290;
    this.b4Y = 650;

    this.bV = {x: 0, y: 200};
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.setAttackers();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        //console.log(getXandY(e));
        that.mouse = getXandY(e);
        var angle = Math.atan2(e.pageX - 300, - (e.pageY - 700) )*(180/Math.PI);

        var vX = 650*Math.sin(angle*(Math.PI/180));
        var vY = 650*Math.cos(angle*(Math.PI/180));

        that.bV = {x: vX, y: -vY};

        $('#rotateme').css({ "-webkit-transform": 'rotate(' + angle + 'deg)'});    
        $('#rotateme').css({ '-moz-transform': 'rotate(' + angle + 'deg)'});
        
        that.b1X = $('#center1').offset().left - 20;
        that.b1Y = $('#center1').offset().top - 20
        that.b2X = $('#center2').offset().left - 20;
        that.b2Y = $('#center2').offset().top - 20
        that.b3X = $('#center3').offset().left - 20;
        that.b3Y = $('#center3').offset().top - 20
        that.b4X = $('#center4').offset().left - 20;
        that.b4Y = $('#center4').offset().top - 20;

    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
        that.fireAttacker();
    }, false);

    this.ctx.canvas.addEventListener("wheel", function (e) {
        that.wheel = e;
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        that.rightclick = getXandY(e);
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.setAttackers = function () {

    this.attackers[0].x = this.b1X;
    this.attackers[0].y = this.b1Y;
    this.attackers[1].x = this.b2X;
    this.attackers[1].y = this.b2Y;
    this.attackers[2].x = this.b3X;
    this.attackers[2].y = this.b3Y;
    this.attackers[3].x = this.b4X;
    this.attackers[3].y = this.b4Y;
}

GameEngine.prototype.fireAttacker = function () {
    console.log('fired attacker');
    atk = this.attackers[0];
    atk.velocity = this.bV;
    this.entities.push(atk);
    this.attackers.shift();
    this.reloadAttacker();
    this.setAttackers();
}

GameEngine.prototype.reloadAttacker = function () {
    console.log('reload attackers');
    atk = new Attacker(this);
    this.attackers.push(atk);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }

    for (var i = 0; i < this.attackers.length; i++) {
        this.attackers[i].draw(this.ctx);
    }

    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    if (this.attackers.length > 0) {
        this.setAttackers();
    }

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
