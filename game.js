/*globals Crafty */

//setup the Crafty game with an FPS of 50 and stage width
//and height
Crafty.init(50, 1000, 800);
Crafty.canvas();

Crafty.c('SpaceFlight', {
    init: function() {
        this._vector = { x: 0, y: 0 };

        this.bind('enterframe', function() {
            this.x += this._vector.x;
            this.y += this._vector.y;
        });
    },
    accelerate: function(vec) {
        this._vector.x += vec.x;
        this._vector.y += vec.y;
    }
});

Crafty.c('thrusters', {
    _accel: 0.01,
    thrusters: function(accel) {
        if (!this.has('SpaceFlight')) {
            this.addComponent('SpaceFlight');
        }
        if (!this.has('controls')) {
            this.addComponent('controls');
        }

        this._accel = accel || this._accel;
        this._controls = { up: false, down: false, right: false, left: false };

        this.bind('enterframe', function() {
            var c = this._controls;

            this.accelerate({
                x: (c.left ? 0 - this._accel : 0) + (c.right ? this._accel : 0),
                y: (c.up ? 0 - this._accel : 0) + (c.down ? this._accel : 0)
            });
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
            if (this.x < 0 - this.w || this.x > Crafty.viewport.width || this.y < 0 - this.h || this.y > Crafty.viewport.height) {
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
        return this;
    }
});

Crafty.c('massive', {
    mass: function(mass) {
        var rock = this;

        function distance(other) {
            var x = rock.x - other.x,
                y = rock.y - other.y;
            return Math.sqrt(x * x + y * y);
        }

        function vecMult(scalar, vec) {
            return {
                x: vec.x * scalar,
                y: vec.y * scalar
            };
        }

        function unit(other) {
            var dist = distance(other);
            return {
                x: (other.x - rock.x) / dist,
                y: (other.y - rock.y) / dist
            };
        }

        this.bind('enterframe', function() {
            Crafty('SpaceFlight').each(function() {
                var guy = this,
                    dist = distance(guy),
                    u = unit(guy),
                    accel = vecMult(0 - mass / (dist * dist), u);

                guy.accelerate(accel);
            });
        });
    }
});

Crafty.sprite(25, 'ship.gif', {
    ship: [0,0]
});

function makeGuy() {
    var guy = Crafty.e('2D, canvas, guy, ship, collision, thrusters, Losable')
        .attr({ x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, w: 25, h: 25 })
        .thrusters(0.01);
    return guy;
}

function makeRock() {
    var rock = Crafty.e('2D, canvas, color, rock, collision, Deadly, massive')
        .attr({ x: Crafty.viewport.width / 4, y: Crafty.viewport.height / 4, w: 50, h: 50 })
        .color('#fff')
        .mass(100);
    return rock;
}

function makeFood() {
    var food = Crafty.e('2D, canvas, color, collision, Edible, SpaceFlight')
        .attr({
            x: Crafty.randRange(10, Crafty.viewport.width - 10),
            y: Crafty.randRange(10, Crafty.viewport.height -10),
            w: 5, h: 5
        })
        .color('#f00')
        .onEaten(makeFood)
        .accelerate({
            x: 0.5 - (Math.random() * 1.0),
            y: 0.5 - (Math.random() * 1.0)
        });
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
