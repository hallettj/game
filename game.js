var REPULSION = function(x) { return x; }
var ATTRACTION = function(x) { return x; }
var SPEED_LIMIT = 0.4;

//setup the Crafty game with an FPS of 50 and stage width
//and height
Crafty.init(50, 580, 225);
Crafty.canvas();

function makeGuy() {
    var guy = Crafty.e('2D, canvas, color, guy, collision, SpaceFlight, Losable')
        .attr({ x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2, w: 10, h: 10 })
        .color('#fff')
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
        .color('#f00');
    return food;
}

function dist(a, b) {
    var x = Math.abs(a.x - b.x);
    var y = Math.abs(a.x - b.x);
    return Math.sqrt(x * x + y * y);
}

function vector(origin, target) {
    return {
        x: target.x - origin.x,
        y: target.y - origin.y
    };
}

function toward(origin, velocity, target) {
    var targV = vector(origin, target);
    return {
        x: targV.x - velocity.x,
        y: targV.y - velocity.y
    };
}

Crafty.scene("loading", function() {
    Crafty.background('#000');
    Crafty.e('2D, DOM, text').attr({w: 100, h: 20, x: 150, y: 120})
        .text('Loading...')
        .css({ 'text-align': 'center' });

    Crafty.scene('main');
});

Crafty.scene('gameover', function() {
    Crafty.e('2D, DOM, text').attr({ w: 100, h: 20, x: 150, y: 120 })
        .text('GAME OVER')
        .css({ 'text-align': 'center' });
});

Crafty.scene('main', function() {
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
                
                var food = goals[0];
                var to;
                if (food) {
                    console.log(food);
                    to = toward(this, this._vector, { x: food._x, y: food._y });
                    this._controls.up = to.y < 0;
                    this._controls.down = to.y > 0;
                    this._controls.left = to.x < 0;
                    this._controls.right = to.x > 0;
                }
                
                if (dist({ x: 0, y: 0 }, this._vector) > SPEED_LIMIT) {
                    this.controls = {
                        up: this._vector.y < 0,
                        down: this._vector.y > 0,
                        left: this._vector.x < 0,
                        right: this._vector.x > 0
                    };
                }
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
            hazards.push(this);
            
            this.onhit('guy', function() {
                Crafty.scene('gameover');
            });
        }
    });
    
    Crafty.c('Edible', {
        init: function() {
            goals.push(this);
            
            this.onhit('guy', function() {
                this._gobble();
            }).onhit('Deadly', function() {
                this._gobble();
            });
        },
        _gobble: function() {
            this.destroy();
            goals = [];
            makeFood();
        }
    });
    
    var hazards = [];
    var goals = [];
    
    var guys = [makeGuy()];
    makeRock();
    makeFood();
});

Crafty.scene('loading');