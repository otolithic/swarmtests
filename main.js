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

//behavior variables
var sight = 100;
var neighbordist = 250;
var cohesion = 0.00001;
var repulsion = 0.01;
var consensus = 0;
var antsyness = 0.1;

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
    
    //random color of image
    this.color = 'red');
    
    //# steps per update
    this.steps = 10;
    
    //distance from target point
    this.dx = 0;
    this.dy = 0;
    
    //neighbor list
    this.neighbors=[];    
    
    //identity
    this.id = id;
    this.isleader = false;
    
    //heading
    this.xheading = Math.random()*2-1;
    this.yheading = Math.random()*2-1;
    hyp = Math.hypot(this.xheading,this.yheading);
    this.xheading = this.xheading/hyp;
    this.yheading = this.yheading/hyp;
}

//create followers
for (var i = 0; i<numSquares; i++) {
    followers[i] = new Follower(xpos,ypos,size,i);
}

///// UPDATE POSITIONS ////
function drawSquares(cursorX,cursorY,followers) {
    var rectW = size;
    var rectH = size;
    
    context.clearRect(0,0,canvas.width,canvas.height);
    
    followers.forEach(function (f) {        
        ///// NEIGHBORHOOD ////
        f.neighbors = [];
        //for each swarm member that isn't the current one, check that the distance to it is within neighbor range. if so, add it to the list of neighbors 
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
        
        //// LEADERSHIP ////
        //assign leadership status based on proximity to cursor
        f.dx = cursorX - f.xpos;
        f.dy = cursorY - f.ypos;
        var dist2cursor = Math.hypot(f.dx, f.dy);
        if (dist2cursor < sight) {
            f.isleader = true;
            f.color = 'green';
        }
        else {
            f.isleader = false;
            f.color = 'red';
        }

        //// BEHAVIOR ////
        //leaders follow the evader/cursor, others follow everyone else
        if (f.isleader) {
            f.xheading = f.dx/dist2cursor;
            f.yheading = f.dy/dist2cursor;
        }
        else {
            var totalxh=f.xheading;
            var totalyh=f.yheading;
            for (var i=0; i<f.neighbors.length;i++){
                var n = f.neighbors[i];
                
                // TODO: multiplier for leader heading?
                var mult = 1;
                if (n.isleader)
                    mult = numSquares;
                
                //add each neighbor's heading to the total
                totalxh += mult*consensus*n.xheading;
                totalyh += mult*consensus*n.yheading;
                
                //TODO: fix this
                //add some repulsion if too close
                if (Math.hypot(f.xpos-n.xpos,f.ypos-n.ypos)<size*2) {
                    totalxh += repulsion*(f.xpos-n.xpos);
                    totalyh += repulsion*(f.ypos-n.ypos);
                }
                //TODO: fix this
                //otherwise add some attraction
                else {
                    totalxh -= cohesion*(f.xpos-n.xpos);
                    totalyh -= cohesion*(f.ypos-n.ypos);    
                }
            }
            
            //TODO: check this
            //add some random behavior
            var randhx = Math.random()*2-1;
            var randhy = Math.random()*2-1;
            
            f.xheading = f.xheading+randhx*antsyness;
            f.yheading = f.yheading+randhy*antsyness;
            f.xheading = f.xheading/Math.hypot(f.xheading,f.yheading);
            f.yheading = f.yheading/Math.hypot(f.xheading,f.yheading);
            
            //get the average heading
            f.xheading = totalxh/Math.hypot(totalxh,totalyh);
            f.yheading = totalyh/Math.hypot(totalxh,totalyh);
        }
        
        //update position
        if (!isNaN(f.xheading) && !isNaN(f.yheading)) {
            f.xpos += 20*f.xheading/f.steps;
            f.ypos += 20*f.yheading/f.steps;
        } 
            
        //allow going off edges
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
        
        //// DRAW ////
        context.fillStyle=f.color;
        context.fillRect(f.xpos-rectW/2,f.ypos-rectH/2,rectW,rectH);
    });
}

///// ANIMATE ////
function animate() {    
    drawSquares(cursorX, cursorY,followers);
    requestAnimationFrame(animate);
}
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