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
var numSquares = 100;
var size = 10;
var followers = Array(numSquares);
var xpos = 0;
var ypos = 0;
var cursorX = 0;
var cursorY = 0;
var cursorVelX = 0;
var cursorVelY = 0;
var sight = 100;
var neighbordist = 250;
var cohesion = 0.00001;
var repulsion = 0.01;
var consensus = 0;
var antsyness = 0.1;
var cursorBufferX = Array(100).fill(0);
var cursorBufferY = Array(100).fill(0);

//create followers
for (var i = 0; i<numSquares; i++) {
    followers[i] = new Follower(xpos,ypos,size,i);
}

//listener
canvas.addEventListener("mousemove",getCursorXY,false);

//Follower definition
function Follower(x,y,size,id) {
    //target position relative to the cursor
    this.xoffset = Math.random()*50*2-50;
    this.yoffset = Math.random()*50*2-50;
    
    //actual position
    this.xpos = x + this.xoffset+ canvas.width/2;
    this.ypos = y + this.yoffset+ canvas.height/2;
    
    //distance from target point
    this.dx = 0;
    this.dy = 0;
    
    //# steps per update
    //change this to a velocity
    this.steps = Math.random()*10+100;
    
    //size of image
    this.s = size;
    //random color of image
    this.color = getRandomColor();
    
    this.neighbors=[];
    //this.steps = Math.random()*10+5;
    this.steps = 10;
    
    this.id = id;
    this.isleader = false;
    
    this.xheading = Math.random()*2-1;
    this.yheading = Math.random()*2-1;
    hyp = Math.hypot(this.xheading,this.yheading);
    this.xheading = this.xheading/hyp;
    this.yheading = this.yheading/hyp;
}


//functions
function getCursorXY(e) {
    cursorX = e.clientX;
	cursorY = e.clientY;
}

function drawSquares(cursorX,cursorY,followers) {
    var rectW = size;
    var rectH = size;
    
    context.clearRect(0,0,canvas.width,canvas.height);
    
    followers.forEach(function (f) {
        //distance from cursor is cursor position minus the current position of the follower
        f.dx = cursorX - f.xpos;
        f.dy = cursorY - f.ypos;
        
        f.color = 'red';
        
        //find nearest neighbors
        f.neighbors = [];
        followers.forEach(function (g) {
            if (f.id !== g.id){
                var xdiff = f.xpos - g.xpos;
                var ydiff = f.ypos - g.ypos;
                var dist = Math.hypot(xdiff,ydiff);
                if (dist < neighbordist) {
                    f.neighbors.push(g)
                    f.color='orange';
                }
            }
        });
        
        //assign leadership status based on proximity to cursor
        var dist2cursor = Math.hypot(f.dx, f.dy);
        if (dist2cursor < sight) {
            f.isleader = true;
            f.color = 'green';
        }
        else {
            f.isleader = false;
        }

        //new position of the follower should be updated by adding a fraction of the distance between it and the cursor
        if (f.isleader) {
            f.xheading = f.dx/dist2cursor;
            f.yheading = f.dy/dist2cursor;
            
            f.xpos += 20*f.xheading/f.steps;
            f.ypos += 20*f.yheading/f.steps;
        }
        else {
            //look in the average direction of your neighbors
            var totalxh=f.xheading;
            var totalyh=f.yheading;
            for (var i=0; i<f.neighbors.length;i++){
                var n = f.neighbors[i];
                var mult = 1;
                if (n.isleader)
                    mult = numSquares;
                totalxh += mult*consensus*n.xheading;
                totalyh += mult*consensus*n.yheading;
                
                if (Math.hypot(f.xpos-n.xpos,f.ypos-n.ypos)<size*2) {
                    totalxh += repulsion*(f.xpos-n.xpos);
                    totalyh += repulsion*(f.ypos-n.ypos);
                }
                else {
                    totalxh -= cohesion*(f.xpos-n.xpos);
                    totalyh -= cohesion*(f.ypos-n.ypos);    
                }
            }
            f.xheading = totalxh/Math.hypot(totalxh,totalyh);
            f.yheading = totalyh/Math.hypot(totalxh,totalyh);
            
            if (!isNaN(f.xheading) && !isNaN(f.yheading)) {
                f.xpos += 20*f.xheading/f.steps;
                f.ypos += 20*f.yheading/f.steps;
            } 
            
            var randhx = Math.random()*2-1;
            var randhy = Math.random()*2-1;
            
            f.xheading = f.xheading+randhx*antsyness;
            f.yheading = f.yheading+randhy*antsyness;
            f.xheading = f.xheading/Math.hypot(f.xheading,f.yheading);
            f.yheading = f.yheading/Math.hypot(f.xheading,f.yheading);
        }
            
        if (f.xpos > canvas.width) {
            f.xpos = f.xpos % canvas.width;
        }
        if (f.xpos < 0) {
            f.xpos = f.xpos + canvas.width;
        }
        if (f.ypos > canvas.width) {
            f.ypos = f.ypos % canvas.width;
        }
        if (f.ypos < 0) {
            f.ypos = f.ypos + canvas.width;
        }
        
        //draw
        context.fillStyle=f.color;
        context.fillRect(f.xpos-rectW/2,f.ypos-rectH/2,rectW,rectH);
    });
}

function animate() {    
    drawSquares(cursorX, cursorY,followers);
    
    //I should learn more about this line probably
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