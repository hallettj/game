/*globals Crafty */

//setup the Crafty game with an FPS of 50 and stage width
//and height
Crafty.init(50, 580, 225);
Crafty.canvas();

Crafty.c('SpaceFlight', {
    _vector: { x: 0, y: 0 },
    _controls: { up: false, down: false, right: false, left: false },
    _accel: 0.01,
    SpaceFlight: function(accel) {
        this._accel = accel || this._accel;

        this.bind('enterframe', function() {
            var c = this._controls;

            this.x += this._vector.x;
            this.y += this._vector.y;

            if (c.up) { this._vector.y -= this._accel; }
            if (c.down) { this._vector.y += this._accel; }
            if (c.left) { this._vector.x -= this._accel; }
            if (c.right) { this._vector.x += this._accel; }
        }).bind('keydown', function(e) {
            if (e.keyCode == Crafty.keys.UA) { this._controls.up = true; }
            if (e.keyCode == Crafty.keys.DA) { this._controls.down = true; }
            if (e.keyCode == Crafty.keys.LA) { this._controls.left = true; }
            if (e.keyCode == Crafty.keys.RA) { this._controls.right = true; }

            this.preventTypeaheadFind(e);
        }).bind('keyup', function(e) {
            if (e.keyCode == Crafty.keys.UA) { this._controls.up = false; }
            if (e.keyCode == Crafty.keys.DA) { this._controls.down = false; }
            if (e.keyCode == Crafty.keys.LA) { this._controls.left = false; }
            if (e.keyCode == Crafty.keys.RA) { this._controls.right = false; }

            this.preventTypeaheadFind(e);
        });

        return this;
    }
});

Crafty.c('Losable', {
    init: function() {
        this.bind('enterframe', function() {
            if (this.x < 0 || this.x > Crafty.viewport.width || this.y < 0 || this.y > Crafty.viewport.height) {
                Crafty.scene('gameover');
            }
        });
    }
});

Crafty.c('Deadly', {
    init: function() {
        this.onhit('guy', function() {
            Crafty.scene('gameover');
        });
    }
});

Crafty.c('Edible', {
    init: function() {
        this._promise = jQuery.Deferred();

        this.onhit('guy', function() {
            this.destroy();
            this._promise.resolve();
        }).onhit('Deadly', function() {
            this.destroy();
            this._promise.resolve();
        });
    },
    onEaten: function(callback) {
        this._promise.done(callback);
    }
});

Crafty.sprite(25, 'ship.gif', {
    ship: [0,0]
});

function makeGuy() {
    var guy = Crafty.e('2D, canvas, guy, ship, collision, controls, SpaceFlight, Losable')
        .attr({ x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, w: 25, h: 25 })
        .SpaceFlight(0.01);
    return guy;
}

function makeRock() {
    var rock = Crafty.e('2D, canvas, color, rock, collision, Deadly')
        .attr({ x: Crafty.viewport.width / 4, y: Crafty.viewport.height / 4, w: 50, h: 50 })
        .color('#fff');
    return rock;
}

function makeFood() {
    var food = Crafty.e('2D, canvas, color, collision, Edible')
        .attr({
            x: Crafty.randRange(10, Crafty.viewport.width - 10),
            y: Crafty.randRange(10, Crafty.viewport.height -10),
            w: 5, h: 5
        })
        .color('#f00')
        .onEaten(makeFood);
    return food;
}

Crafty.scene("loading", function() {
    Crafty.load(['ship.gif'], function() {
        Crafty.scene('main');
    });

    Crafty.background('#000');
    Crafty.e('2D, DOM, text').attr({w: 100, h: 20, x: 150, y: 120})
        .text('Loading...')
        .css({ 'text-align': 'center' });
});

Crafty.scene('gameover', function() {
    Crafty.e('2D, DOM, text').attr({ w: 100, h: 20, x: 150, y: 120 })
        .text('GAME OVER')
        .css({ 'text-align': 'center' });
});

Crafty.scene('main', function() {
    makeGuy();
    makeRock();
    makeFood();
});

Crafty.scene('loading');
