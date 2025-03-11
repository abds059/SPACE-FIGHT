let tilesize = 32;
let rows = 16;
let columns = 16;

let board;
let boardwidth = tilesize * columns;
let boardheight = tilesize * rows;
let context;

//Ship 
let shipwidth = tilesize * 2;
let shipheight = tilesize;
let shipX = tilesize * columns / 2 - tilesize;
let shipY = tilesize * rows - tilesize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipwidth,
    height: shipheight
}

let shipimg;
let shipvelocityX = tilesize;

//Aliens
let alienarr = [];
let alienwidth = tilesize * 2;
let alienheight = tilesize;
let alienX = tilesize;
let alienY = tilesize;
let alienimg;

let alienrows = 2;
let aliencolumns = 3;
let aliencount = 0;
let alienvelocityX = 1;

//Bullets
let bulletarr = [];
let bulletvelocityY = -10;

let score = 0;
let gameover = false;
let gameovertext = "Game Over!";


window.onload = function(){
    board = document.getElementById("board");
    board.width = boardwidth;
    board.height = boardheight;
    context = board.getContext("2d");

    shipimg = new Image();
    shipimg.src = "./ship.png";
    shipimg.onload = function() {
        context.drawImage(shipimg, ship.x, ship.y, ship.width, ship.height);
    }

    alienimg = new Image();
    alienimg.src = "./alien.png";
    createaliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveship);
    document.addEventListener("keyup", shoot);
}

function update(){
    requestAnimationFrame(update);

    if(gameover){
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipimg, ship.x, ship.y, ship.width, ship.height);

    for(let i = 0; i < alienarr.length; i++){
        let alien = alienarr[i];
        if(alien.alive){
            alien.x += alienvelocityX;

            if(alien.x + alien.width >= board.width || alien.x <= 0){
                alienvelocityX *= -1;
                alien.x += alienvelocityX * 2;

                for(let j = 0; j < alienarr.length; j++){
                    alienarr[j].y += alienheight;
                }
            }
            context.drawImage(alienimg, alien.x, alien.y, alien.width, alien.height);

            if(alien.y >= ship.y){
                gameover = true;
            }
        }
    }

    //Check collision between aliens and bullets
    for(let i = 0; i < bulletarr.length; i++){
        let bullet = bulletarr[i];
        bullet.y += bulletvelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for(let j = 0; j < alienarr.length; j++){
            let alien = alienarr[j];
            if(!bullet.used && alien.alive && checkcollision(bullet, alien)){
                bullet.used = true;
                alien.alive = false;
                aliencount--;
                score += 100;//Increments core by 100 for each Alien killed
            }
        }
    }

    //Clear bullets from array if bullet passes through the canvas height
    while(bulletarr.length > 0 && (bulletarr[0].used || bulletarr[0].y < 0)){
        bulletarr.shift();
    }

    //If Alien count becomes zero produces a new set of aliens incrementing the alien row and column by 1 and velocity by 0.2
    if(aliencount == 0){
        aliencolumns = Math.min(aliencolumns + 1, columns/2 - 2);
        alienrows = Math.min(alienrows + 1, rows - 4);
        alienvelocityX += 0.2;
        alienarr = [];
        bulletarr = [];
        createaliens();
    }

    //Score
    context.fillStyle = "white";
    context.font = "16px";
    context.fillText("Score: " + score, 5, 20);

    // Game Over Display
    if (gameover) {
        context.font = "24px Arial";
        context.fillStyle = "red"; 
        context.textAlign = "center"; 
        context.fillText(gameovertext, board.width / 2, 40);
    }
}


function moveship(e){

    if(gameover){
        return;
    }

    if(e.code == "ArrowLeft" && ship.x - shipvelocityX >= 0){
        ship.x -= shipvelocityX;
    }
    else if(e.code == "ArrowRight" && ship.x + shipvelocityX + ship.width <= board.width){
        ship.x += shipvelocityX;
    }

}

function createaliens(){
    for(let c = 0; c < aliencolumns; c++){
        for(let r = 0; r < alienrows; r++){
            let alien = {
                img : alienimg,
                x : alienX + c * alienwidth,
                y : alienY + r * alienheight,
                width : alienwidth,
                height : alienheight,
                alive : true
            }

            alienarr.push(alien);
        }
    }
    aliencount = alienarr.length;
}

function shoot(e){

    if(gameover){
        return;
    }

    if(e.code == 'Space'){
        let bullet = {
            x : ship.x + ship.width * 15/32,
            y : ship.y,
            width : tilesize / 8,
            height : tilesize / 2,
            used : false
        }
        bulletarr.push(bullet);
    }
}

function checkcollision(a, b){
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

//For Phone controls
let touchstartX = 0;
let touchendX = 0;

document.addEventListener("touchstart", (e)=>{
    touchstartX = e.touches[0].clientX;
});

document.addEventListener("touchmove", (e)=>{
    e.preventDefault();

    touchendX = e.touches[0].clientX;
    let diff = touchendX - touchstartX;

    if(!gameover){
        if(diff > 20 && ship.x + shipvelocityX + ship.width <= board.width){
            ship.x += shipvelocityX;
        }
        else if(diff < -20 && ship.x - shipvelocityX >= 0){
            ship.x -= shipvelocityX;
        }
    }
    touchstartX = touchendX;
});

document.addEventListener("touchend", (e)=>{
    if(!gameover){
        let bullet = {
            x: ship.x + ship.width * 15 / 32,
            y: ship.y,
            width: tilesize / 8,
            height: tilesize / 2,
            used: false
        };
        bulletarr.push(bullet);
    }
});