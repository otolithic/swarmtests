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

var sight = 100;
var neighbordist = 100;
var cohesion = 0.02;//0.002;
var repulsion = 2.5; //0.5;
var consensus = 1;
var antsyness = 0.1;

//form stuff
function setVars() {
    
    if (document.getElementById("sight").value) {
        sight = document.getElementById("sight").value;
    }
    if (document.getElementById("neighbordist").value) {
        neighbordist = document.getElementById("neighbordist").value;
    }
    if (document.getElementById("cohesion").value) {
        cohesion = document.getElementById("cohesion").value;
    }
    if (document.getElementById("repulsion").value) {
        repulsion = document.getElementById("repulsion").value;
    }
    if (document.getElementById("consensus").value) {
        consensus = document.getElementById("consensus").value;
    }
    if (document.getElementById("antsyness").value) {
        antsyness = document.getElementById("antsyness").value;
    }
    //regenerate
    for (var i = 0; i<numSquares; i++) {
        followers[i] = new Follower(xpos,ypos,i);
    }
}


//listener
canvas.addEventListener("mousemove",getCursorXY,false);
function getCursorXY(e) {
    cursorX = e.clientX;
	cursorY = e.clientY;
}

//Follower definition
function Follower(x,y,id) {
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
    
    //random color of image
    this.color = 'red';
    
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

//create agents
for (var i = 0; i<numSquares; i++) {
    followers[i] = new Follower(xpos,ypos,i);
}

function getDist(x1,x2,y1,y2) {
    var xdiff = x2-x1;
    var ydiff = y2-y1;
    var dist = Math.hypot(xdiff,ydiff);
    return dist;
}

//// NEIGHBORHOOD ////
//find nearest neighbors by checking if the distance to each other agent is less than the threshold
function getNeighbors(f) {
    f.neighbors = [];
    followers.forEach(function (g) {
        if (f.id !== g.id){
            if (getDist(f.xpos,g.xpos,f.ypos,g.ypos) < neighbordist) {
                f.neighbors.push(g)
                f.color='orange';
            }
        }
    });
}

//// BEHAVIOR ////
//look in the average direction of your neighbors
function getAverageHeading(f) {
    var totalxh=f.xheading;
    var totalyh=f.yheading;
    
    //iterate through neighbors and add headings to total
    for (var i=0; i<f.neighbors.length;i++){
        var n = f.neighbors[i];
        
        // leader multiplier biases towards leader
        var mult = 1;
        if (n.isleader)
            mult = numSquares;
        
        var proximity = getDist(f.xpos,n.xpos,f.ypos,n.ypos);
        
        // TODO: figure out exactly what consensus mult is
        totalxh += mult*n.xheading*(consensus/(proximity*proximity));
        totalyh += mult*n.yheading*(consensus/(proximity*proximity));
        
        //repulsion if too close
        if (proximity<size*2) {
            totalxh += repulsion*(f.xpos-n.xpos)/proximity;
            totalyh += repulsion*(f.ypos-n.ypos)/proximity;
        }
        //cohesion otherwise
        else {
            totalxh -= cohesion*(f.xpos-n.xpos)/proximity;
            totalyh -= cohesion*(f.ypos-n.ypos)/proximity;    
        }
    }
    //average headings
    f.xheading = totalxh/Math.hypot(totalxh,totalyh);
    f.yheading = totalyh/Math.hypot(totalxh,totalyh);
}

//// UPDATE POSITIONS ////
function drawSquares(cursorX,cursorY) {
    var rectW = size;
    var rectH = size;
    
    context.clearRect(0,0,canvas.width,canvas.height);
    
    followers.forEach(function (f) {
        f.color = 'red';
        getNeighbors(f)
        
        //// LEADERSHIP //// 
        // assign leadership status based on proximity to cursor
        // for some reason this doesn't work as its own function
        f.dx = cursorX - f.xpos;
        f.dy = cursorY - f.ypos;
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
        }
        else {
            getAverageHeading(f);
            
            // add some random behavior to the final result
            var randhx = Math.random()*2-1;
            var randhy = Math.random()*2-1;
            
            f.xheading += randhx*antsyness;
            f.yheading += randhy*antsyness;
            f.xheading = f.xheading/Math.hypot(f.xheading,f.yheading);
            f.yheading = f.yheading/Math.hypot(f.xheading,f.yheading);
        }
        
        //update position based on heading and speed
        if (!isNaN(f.xheading) && !isNaN(f.yheading)) {
            f.xpos += 20*f.xheading/f.steps;
            f.ypos += 20*f.yheading/f.steps;
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


//animation call
animate();

/*
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
*/
/*

    TO DO:
    - avoid Follower collisions by maintaining knowledge among the entire Swarm of neighbors' locations
    - create an independent Swarm with self-guided, random position that avoids the mouse Swarm's location.

*/