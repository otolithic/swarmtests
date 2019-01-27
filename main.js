//define the canvas and attach it
var canvas = document.createElement("canvas")
document.body.appendChild(canvas)
canvas.width=document.body.getBoundingClientRect().width
canvas.height=document.body.getBoundingClientRect().height

//center the canvas on the page
var marginLeft = document.body.getBoundingClientRect().width/2 - canvas.width/2
canvas.style.marginLeft=`${marginLeft}px`

//set the context to 2D
var context = canvas.getContext("2d")

//buncha variables
var numSquares = 20;
var size = 10;
var followers = Array(numSquares);
var xpos = 100;
var ypos = 100;


for (var i = 0; i<numSquares; i++) {    
    followers[i] = new Follower(xpos,ypos,size);
    followers[i].steps = Math.random()*10+5;
}

var cursorX = 0;
var cursorY = 0;

//listener
canvas.addEventListener("mousemove",getCursorXY,false);

//objects

function Follower(x,y,size) {
    this.xoffset = Math.random()*50*2-50;
    this.yoffset = Math.random()*50*2-50;
    
    this.xpos = x+ this.xoffset;
    this.ypos = y+ this.yoffset;
    
    this.s = size;
    this.dx = 0;
    this.dy = 0;
    this.steps = Math.random()*size+5;
    this.color = getRandomColor();
}


//functions
function getCursorXY(e) {
	cursorX = e.clientX;
	cursorY = e.clientY;
}

/*
function getRandPos(numSquares,size) {
    var randPos = Array(numSquares).fill(0);
    for(var i = 1; i<numSquares; i++) {
        randPos[i] = Math.random()*size*2-size;
    }
    return randPos;
}
*/

function drawSquares(cursorX,cursorY,followers) {
    var rectW = size;
    var rectH = size;
    
    context.clearRect(0,0,canvas.width,canvas.height);
    
    followers.forEach(function (f) {
        f.dx = cursorX - f.xpos + f.xoffset;
        f.dy = cursorY - f.ypos + f.yoffset;

        f.xpos += f.dx/f.steps;
        f.ypos += f.dy/f.steps;
        
        context.fillStyle=f.color;
        context.fillRect(f.xpos-rectW/2,f.ypos-rectH/2,rectW,rectH);
    });
}

function animate() {    
    drawSquares(cursorX, cursorY,followers);
    
    requestAnimationFrame(animate);
}

function getRandomColor() {
    var randocolor =[Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];

    var hexcolor = "#";
    //convert these rgb values to hex
    for (x = 0; x < randocolor.length; x++) {
        var hex = randocolor[x].toString(16);		

        if (hex.length == 1) {
            hex = "0" + hex;	
        }

        hexcolor = hexcolor.concat(hex);
    }
    return hexcolor;
}

//animation call
animate();


/*

    TO DO:
    - allow Followers to move while mouse is still while remaining within a given range of the mouse
    - avoid Follower collisions by maintaining knowledge among the entire Swarm of neighbors' locations
    - create an independent Swarm with self-guided, random position that avoids the mouse Swarm's location.

*/