var socket = io.connect("http://24.16.255.56:8888");

// GameBoard code below
function Background(game) {
    this.name = "background";
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    var forest = new Image();
    forest.src = "./img/forest.png";
    ctx.drawImage(forest, -(forest.width / 2), -(forest.height / 2),1200,1200);
    Entity.prototype.draw.call(this);
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.name = "circle";
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 800;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (700 - this.radius * 2));

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

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = 1;
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 700;
};
var count =0;
Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 700 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && ent.x !== undefined && this.collide(ent)) {
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
            var random = Math.random() *20;
            var colorRandom = Math.random()*3;
            if (this.it) {
                this.radius += 3;
                
                if(this.radius > 100){
                // var cir = new Circle(this.game);
                // cir.setNotIt();
                // this.game.addEntity(cir);
                    this.removeFromWorld = true;
                    ent.x = 0;
                    ent.y =0;
                    ent.setIt();
                }

            }
            else if (ent.it) {
                this.removeFromWorld = true;
                var cir = new Circle(this.game);
                cir.setNotIt();
                this.game.addEntity(cir);
                
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x-40, this.y+40);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, 20, 15);
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    

};
function SetPixel(canvas, x, y)
{
  canvas.beginPath();
  canvas.moveTo(x, y);
  canvas.lineTo(x+0.4, y+0.4);
  canvas.stroke();
}


// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var gameEngine = new GameEngine();
var socket = io.connect("http://24.16.255.56:8888");
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/forest.png");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    
    //var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var circle = new Circle(gameEngine);
    
    circle.setIt();
    gameEngine.addEntity(circle);
    gameEngine.addEntity(bg);
    for (var i = 0; i < 20; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    
    gameEngine.init(ctx);
    gameEngine.start();

    var STUDENT_NAME ="Saladin Adam";
    var STATE_NAME= "aState";

    //Saving Circles using Sockets
    document.getElementById("save").onclick = function (e) {
        e.preventDefault();
        var ents = gameEngine.entities;

        var stateToSave = {studentName: STUDENT_NAME, stateName:STATE_NAME, gameState: []};

        //Getting All Circles
        for(var i = 0; i< ents.length; i++){
            var ent = ents[i];
            if(ent instanceof Circle){
                stateToSave.gameState.push({name: ent.name, x: ent.x, y: ent.y, it: ent.it, 
                    radius: ent.radius, visualRadius: ent.visualRadius, 
                    color: ent.color, speed: ent.speed,velocity:{x:ent.velocity.x, y:ent.velocity.y}});
            }else{
                stateToSave.gameState.push({x: ent.x, y: ent.y});
            }
        }

        //Saving State
        socket.emit("save", stateToSave);
    };

    //Loading Circles with Sockets
    document.getElementById("load").onclick = function (e) {
        e.preventDefault();
        socket.emit("load", {studentName: STUDENT_NAME, stateName: STATE_NAME});
    };

    socket.on("load", function (data) {
        //console.log(data.gameState);
        gameEngine.entities = [];
        var ents = data.gameState;
        for(var i = 0; i<ents.length; i++){
            var ent = ents[i];
            if(ent.name==="circle"){
                var circle = new Circle(gameEngine);
                circle.x = ent.x;
                circle.y = ent.y;
                circle.it = ent.it;
                circle.radius = ent.radius;
                circle.visualRadius = ent.visualRadius;
                circle.color = ent.color;
                circle.speed = ent.speed;
                circle.velocity.x = ent.velocity.x;
                circle.velocity.y = ent.velocity.y;
                gameEngine.entities.push(circle);
            } else{
                var background = new Background(gameEngine);
                // background.x = ent.x;
                // background.y = ent.y;
                // background.forest.src = ent.forest;
                gameEngine.entities.push(background);
            }
            
        }
    });
});


// window.onload = function () {
    
//     var socket = io.connect("http://24.16.255.56:8888");
//     var allData =[];
//     socket.on("load", function (data) {
//         console.log(data);
//     });
  
//     var text = document.getElementById("text");
//     var saveButton = document.getElementById("save");
//     var loadButton = document.getElementById("load");
  
//     saveButton.onclick = function () {
//       console.log("save");
//       text.innerHTML = "Saved."
      
//       for (var i = 0; i < gameEngine.entities.length; i++) {
//         var ent = gameEngine.entities[i];
//         if(ent.name !=="Background"){
//             var data = { x: ent.x, y: ent.y, it: ent.it, 
//                 radius: ent.radius, visualRadius: ent.visualRadius, 
//                 colors: ent.colors, speed: ent.speed,velocity:{x:ent.velocity.x, y:ent.velocity.y}};
//                 allData.push(data);
//         }
//       }
//       socket.emit("save", { studentname: "Chris Marriott", statename: "aState", data: "Goodbye World" });
      
//     };
  
//     loadButton.onclick = function () {
//       console.log("load");
//       text.innerHTML = "Loaded."
//       for (var i = 0; i < allData.length; i++) {
//           var ent = allData[i];
//           var circle = new Circle(gameEngine);
//           circle.x = ent.x;
//           circle.y = ent.y;
//           circle.it = ent.it;
//           circle.radius = ent.radius;
//           circle.visualRadius = ent.visualRadius;
//           circle.colors = ent.colors;
//           circle.speed = ent.speed;
//           circle.velocity.x = ent.velocity.x;
//           circle.velocity.y = ent.velocity.y;
//           gameEngine.addEntity(circle);
//       }
//       socket.emit("load", gameEngine.entities);
//     };
  
//   };