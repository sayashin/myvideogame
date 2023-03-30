var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;
var canyons;
var collectable;

var game_score;
var flagpole;
var lives;

var jumpSound;
var fallingSound;
var bonusSound;
var levelSound;
var backgroundMusic;
var enemySound;

var platforms;
var enemies;

var cloudInc = 0.3;;
var cloudMove = 1;


function preload()
{
    soundFormats('mp3','wav');
    
    //load my sounds here
    jumpSound = loadSound('assets/jump5.wav');
    jumpSound.setVolume(0.8);
    fallingSound = loadSound('assets/falling3.mp3');
    fallingSound.setVolume(0.2);
    bonusSound = loadSound('assets/yeah2.wav');
    bonusSound.setVolume(0.7);
    levelSound = loadSound('assets/level3.wav');
    levelSound.setVolume(0.6);
    backgroundMusic = loadSound('assets/music.mp3');
    backgroundMusic.setVolume(0.2);
    enemySound = loadSound('assets/falling.wav');
    enemySound.setVolume(0.3);
}


function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
	
    game_score = 0;
    lives = 3;
    
    startGame();
}


function draw()
{
	background(220, 240, 250); // fill the sky blue

	noStroke();
	fill(142, 170, 154);
	rect(0, floorPos_y, width, height/4); // draw some green ground
    
    push();
    translate(scrollPos*0.3, 0); // move the canvas position

	// Draw clouds.
    drawClouds();
	// Draw mountains.
    drawMountains();
    
    pop();
    
    push();
    translate(scrollPos, 0); 
    
	// Draw trees.
    drawTrees();

	// Draw canyons.
    for (var i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }

	// Draw collectable items.
    for (var i = 0; i < collectable.length; i++)
    {
        if(collectable[i].isFound == false)
        {
            drawCollectable(collectable[i]); 
            checkCollectable(collectable[i]);
        }
    }
    
    // Draw Flogpole
    renderFlagpole();
    
    // Draw Platforms
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
    
    // Draw Enemies
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].updateParticles();
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

        if(isContact == true)
        {
            enemySound.play();
            if(lives > 0)
            {
                lives -= 1;
                backgroundMusic.stop();
                startGame();
                break;
            }
        }
    }
    
    pop();

	// Draw game character.
	drawGameChar();
    
    // Score text
    fill(255);
    noStroke();
    textSize(15);
    textAlign(LEFT);
    text("Score: " + game_score, 10 ,20);
    
    // Ending texts
    if(lives == 0)
    {
        cloudInc = 0.3;
        cloudMove = 1;
        textSize(30);
        textAlign(CENTER);
        textStyle(BOLD);
        fill(255,0,0);
        text("Game Over", width/2, 100);
        textStyle(ITALIC);
        text("Press space to continue", width/2, 140);
        
        backgroundMusic.stop();
    }
    
    if(flagpole.isReached)
    {
        var perc = (game_score*100)/15
        textSize(30);
        textAlign(CENTER);
        textStyle(BOLD);
        fill(255,0,0);
        text("Level complete. Press space to continue.", width/2, 100);
        text("You completed a score of " + round(perc, 1) + "%", width/2, 140);
        
        backgroundMusic.stop();
    }

    
	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y)
    {
        var isContact = false;
        for(var i = 0; i < platforms.length; i++)
        {
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
            {
                isContact = true;
                isFalling = false;
                gameChar_y = platforms[i].y;
                break;
            }
        } 

        if(isContact == false)
        {
            gameChar_y +=10;
            isFalling = true;
            isPlummeting = false;
        }
    } 
    else   
    {
        isFalling = false;
    }
    
    if(isPlummeting == true && gameChar_y >= floorPos_y && gameChar_y < height+200)
    {
        gameChar_y +=8;
        fallingSound.play();
    }
    else
    {
        isPlummeting = false
    }
    

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
    
    // Check if Flagpole is reached
    if(flagpole.isReached == false)
    {
        checkFlagpole();
    }
    
    // Check character lives
    checkPlayerDie();
    
    for (var i = 0; i < lives; i++)
    {
        fill(255,200,200);
        ellipse(1000-(i*24), 20, 10, 10);
        ellipse(992-(i*24), 20, 10, 10);
        triangle(987-(i*24), 22, 1005-(i*24), 22, 996-(i*24), 32)
    }
}

// ---------------------
// Key control functions
// ---------------------
function keyPressed()
{
    if(key == 'A' || keyCode == 37)
    {
        isLeft = true;
    }
 
	if(key == 'D' || keyCode == 39)
    {
       isRight = true;
    }
    
    if((keyCode == 32) && (isFalling == false) && (isPlummeting == false))
    {  
        gameChar_y -= 140;  // jumping
        jumpSound.play();
    }
    
    if((keyCode == 32) && (lives == 0 || flagpole.isReached))
    {
        lives = 3;
        game_score = 0;
        startGame();
    }
}

function keyReleased()
{
    if(key == 'A' || keyCode == 37)
    {
        isLeft = false;
    }

	if(key == 'D' || keyCode == 39)
    {
        isRight = false;
    }
}

// ------------------------------
// Game character render function
// ------------------------------
function drawGameChar()
{
    var a = gameChar_world_x/3;
    var b = false;
    if(a == int(a))
    {
        b = true
    }
    else
    {
        b = false
    };
    
    if(isLeft && isFalling)
    {   
    // jumping-left code
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x +16, gameChar_y -63, 
             gameChar_x +24, gameChar_y -61, 
             gameChar_x +21, gameChar_y -34, 
             gameChar_x +17, gameChar_y -36);
        quad(gameChar_x +16, gameChar_y -74, 
             gameChar_x -15, gameChar_y -75, 
             gameChar_x -16, gameChar_y -26, 
             gameChar_x +19, gameChar_y -27);
        quad(gameChar_x -23, gameChar_y -32, 
             gameChar_x -12, gameChar_y -39, 
             gameChar_x -3, gameChar_y -22, 
             gameChar_x -13, gameChar_y -16);
        quad(gameChar_x -1, gameChar_y -29, 
             gameChar_x +15, gameChar_y -37, 
             gameChar_x +22, gameChar_y -20, 
             gameChar_x +11, gameChar_y -14);

        fill(113, 208, 245);
        quad(gameChar_x -18, gameChar_y -67, 
             gameChar_x +9, gameChar_y -68, 
             gameChar_x +8, gameChar_y -49, 
             gameChar_x -19, gameChar_y -51);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x -9, gameChar_y -63, 14,6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x -14, gameChar_y -42, 
             gameChar_x +17, gameChar_y -40, 
             gameChar_x +18, gameChar_y -27, 
             gameChar_x -14, gameChar_y -29);
	}
	else if(isRight && isFalling)
	{
    // jumping-right code
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x -23, gameChar_y -61, 
             gameChar_x -16, gameChar_y -63, 
             gameChar_x -17, gameChar_y -36, 
             gameChar_x -21, gameChar_y -34);
        quad(gameChar_x -15, gameChar_y -74, 
             gameChar_x +16, gameChar_y -75, 
             gameChar_x +20, gameChar_y -28, 
             gameChar_x -16, gameChar_y -26);
        quad(gameChar_x +12, gameChar_y -39, 
             gameChar_x +23, gameChar_y -32, 
             gameChar_x +13, gameChar_y -16, 
             gameChar_x +3, gameChar_y -22);
        quad(gameChar_x -10, gameChar_y -37, 
             gameChar_x +3, gameChar_y -29, 
             gameChar_x -10, gameChar_y -13, 
             gameChar_x -20, gameChar_y -20);

        fill(113, 208, 245);
        quad(gameChar_x -9, gameChar_y -68, 
             gameChar_x +18, gameChar_y -67, 
             gameChar_x +19, gameChar_y -51, 
             gameChar_x -8, gameChar_y -49);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x +9, gameChar_y -63, 14,6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x +5, gameChar_y -41, 
             gameChar_x +17, gameChar_y -40, 
             gameChar_x +19, gameChar_y -29, 
             gameChar_x +5, gameChar_y -29);
        quad(gameChar_x -14, gameChar_y -39, 
             gameChar_x +6, gameChar_y -39, 
             gameChar_x +8, gameChar_y -30, 
             gameChar_x -15, gameChar_y -23);
	}
    else if(isLeft && b == false)
    {
    // walking left foot forward code 
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x, gameChar_y -14, 
             gameChar_x +17, gameChar_y -14, 
             gameChar_x +16, gameChar_y, 
             gameChar_x +2, gameChar_y);
        quad(gameChar_x -22, gameChar_y -14, 
             gameChar_x -7, gameChar_y -14, 
             gameChar_x -8, gameChar_y -1, 
             gameChar_x -20, gameChar_y -1);
        quad(gameChar_x -20, gameChar_y -64, 
             gameChar_x +14, gameChar_y -66, 
             gameChar_x +17, gameChar_y -14, 
             gameChar_x -22, gameChar_y -14);
        quad(gameChar_x +15, gameChar_y -49, 
             gameChar_x +22, gameChar_y -49, 
             gameChar_x +21, gameChar_y -17, 
             gameChar_x +17, gameChar_y -17);

        fill(113, 208, 245);
        quad(gameChar_x -22, gameChar_y -55, 
             gameChar_x +8, gameChar_y -57, 
             gameChar_x +9, gameChar_y -37, 
             gameChar_x -21, gameChar_y -38);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x -9, gameChar_y -50, 14,6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x +1, gameChar_y -16, 
             gameChar_x +15, gameChar_y -16, 
             gameChar_x +15, gameChar_y -12, 
             gameChar_x +2, gameChar_y -12);
        quad(gameChar_x -20, gameChar_y -16, 
             gameChar_x -8, gameChar_y -16, 
             gameChar_x -9, gameChar_y -12, 
             gameChar_x -20, gameChar_y -12);
    }
	else if(isLeft && b)
	{
    // walking left code
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x +15, gameChar_y -49, 
             gameChar_x +23, gameChar_y -49, 
             gameChar_x +22, gameChar_y -17, 
             gameChar_x +17, gameChar_y -17);
        quad(gameChar_x -20, gameChar_y -19, 
             gameChar_x -6, gameChar_y -17, 
             gameChar_x -11, gameChar_y -4, 
             gameChar_x -23, gameChar_y -7);
        quad(gameChar_x +1, gameChar_y -17, 
             gameChar_x +16, gameChar_y -18, 
             gameChar_x +18, gameChar_y -3, 
             gameChar_x +5, gameChar_y);
        quad(gameChar_x -19, gameChar_y -65, 
             gameChar_x +14, gameChar_y -67, 
             gameChar_x +17, gameChar_y -15, 
             gameChar_x -21, gameChar_y -15);

        fill(113, 208, 245);
        quad(gameChar_x -22, gameChar_y -56, 
             gameChar_x +7, gameChar_y -58, 
             gameChar_x +8, gameChar_y -38, 
             gameChar_x -21, gameChar_y -39);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x -12, gameChar_y -50, 14,6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x -20, gameChar_y -17, 
             gameChar_x -8, gameChar_y -17, 
             gameChar_x -11, gameChar_y -8, 
             gameChar_x -18, gameChar_y -7);
        quad(gameChar_x +2, gameChar_y -17, 
             gameChar_x +15, gameChar_y -17, 
             gameChar_x +16, gameChar_y -3, 
             gameChar_x +3, gameChar_y -12);
	}
	else if(isRight && b)
	{
    // walking right foot forward code
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x -23, gameChar_y -49, 
             gameChar_x -15, gameChar_y -49, 
             gameChar_x -17, gameChar_y -17, 
             gameChar_x -22, gameChar_y -17);
        quad(gameChar_x +6, gameChar_y -16, 
             gameChar_x +20, gameChar_y -19, 
             gameChar_x +23, gameChar_y -5, 
             gameChar_x +11, gameChar_y -2);
        quad(gameChar_x -16, gameChar_y -17, 
             gameChar_x -1, gameChar_y -16, 
             gameChar_x -5, gameChar_y, 
             gameChar_x -18, gameChar_y -3);
        quad(gameChar_x -14, gameChar_y -66, 
             gameChar_x +19, gameChar_y -65, 
             gameChar_x +21, gameChar_y -14, 
             gameChar_x -17, gameChar_y -14);

        fill(113, 208, 245);
        quad(gameChar_x -7, gameChar_y -57, 
             gameChar_x +22, gameChar_y -55, 
             gameChar_x +22, gameChar_y -38, 
             gameChar_x -7, gameChar_y -37);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x +8, gameChar_y -49, 14,6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x +8, gameChar_y -16, 
             gameChar_x +19, gameChar_y -21, 
             gameChar_x +21, gameChar_y -7, 
             gameChar_x +11, gameChar_y -7);
        quad(gameChar_x -15, gameChar_y -16, 
             gameChar_x -2, gameChar_y -16, 
             gameChar_x -3, gameChar_y -11, 
             gameChar_x -16, gameChar_y -2);
	}
	else if(isFalling || isPlummeting)
	{
    // jumping facing forwards code
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x -16, gameChar_y -31, 
             gameChar_x -1, gameChar_y -31, 
             gameChar_x, gameChar_y -21, 
             gameChar_x -15, gameChar_y -21);
        quad(gameChar_x -13, gameChar_y -75, 
             gameChar_x +20, gameChar_y -75, 
             gameChar_x +22, gameChar_y -29, 
             gameChar_x -16, gameChar_y -29);
        quad(gameChar_x +8, gameChar_y -35, 
             gameChar_x +23, gameChar_y -35, 
             gameChar_x +21, gameChar_y -19, 
             gameChar_x +10, gameChar_y -19);

        quad(gameChar_x -20, gameChar_y -60, 
             gameChar_x -16, gameChar_y -62, 
             gameChar_x -17, gameChar_y -32, 
             gameChar_x -20, gameChar_y -31);

        fill(113, 208, 245);
        quad(gameChar_x -9, gameChar_y -68, 
             gameChar_x +18, gameChar_y -68., 
             gameChar_x +17, gameChar_y -50, 
             gameChar_x -8, gameChar_y -51);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x +4, gameChar_y -63, 14,6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x -15, gameChar_y -31, 
             gameChar_x -2, gameChar_y -31, 
             gameChar_x -2, gameChar_y -23, 
             gameChar_x -12, gameChar_y -23);
	}
	else
	{
    // standing front & walking right facing code
        fill(240, 30, 30);
        stroke(0);
        strokeWeight(3);

        quad(gameChar_x -17, gameChar_y -14, 
             gameChar_x, gameChar_y -14, 
             gameChar_x -2, gameChar_y, 
             gameChar_x -16, gameChar_y);
        quad(gameChar_x +7, gameChar_y -14, 
             gameChar_x + 22, gameChar_y -14, 
             gameChar_x +20, gameChar_y -1, 
             gameChar_x + 8, gameChar_y -1);
        quad(gameChar_x -14, gameChar_y -66, 
             gameChar_x +20, gameChar_y -64, 
             gameChar_x +22, gameChar_y -14, 
             gameChar_x -17, gameChar_y -14);
        quad(gameChar_x -22, gameChar_y -49, 
             gameChar_x -15, gameChar_y -49, 
             gameChar_x -17, gameChar_y -17, 
             gameChar_x -21, gameChar_y -17);

        fill(113, 208, 245);
        quad(gameChar_x -9, gameChar_y -57, 
             gameChar_x +21, gameChar_y -55, 
             gameChar_x +21, gameChar_y -38, 
             gameChar_x -9, gameChar_y -37);

        fill(255, 200);
        strokeWeight(1)
        ellipse(gameChar_x +6, gameChar_y -50, 14, 6);

        noStroke();
        fill(240, 30, 30);
        quad(gameChar_x -15, gameChar_y -16, 
             gameChar_x -1, gameChar_y -16, 
             gameChar_x -2, gameChar_y -12, 
             gameChar_x -15, gameChar_y -12);
        quad(gameChar_x +8, gameChar_y -16, 
             gameChar_x +20, gameChar_y -16, 
             gameChar_x +20, gameChar_y -12, 
             gameChar_x +9, gameChar_y -12);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{   
    cloudMove += cloudInc;
    if(cloudMove > 500)
    {
        cloudInc = -0.3
    } 
    else if(cloudMove<=1)
    {
        cloudInc = 0.3
    };

    for (var i = 0; i < clouds.length; i++)
    {
        noStroke();
        fill(225, 226, 230);
                
        ellipse(clouds[i].x_pos +cloudMove, 
                clouds[i].y_pos, 
                183 * clouds[i].size, 
                173 * clouds[i].size);
        ellipse(clouds[i].x_pos -45 * clouds[i].size +cloudMove, 
                clouds[i].y_pos +42 * clouds[i].size, 
                196 * clouds[i].size, 
                90 * clouds[i].size);
        ellipse(clouds[i].x_pos +94 * clouds[i].size +cloudMove, 
                clouds[i].y_pos +60 * clouds[i].size, 
                154 * clouds[i].size, 
                130 * clouds[i].size);
        ellipse(clouds[i].x_pos +102 * clouds[i].size +cloudMove, 
                clouds[i].y_pos +90 * clouds[i].size, 
                247 * clouds[i].size,
                73 * clouds[i].size);
        ellipse(clouds[i].x_pos -35 * clouds[i].size +cloudMove, 
                clouds[i].y_pos +80 * clouds[i].size, 
                380 * clouds[i].size, 
                70 * clouds[i].size);
    }
}

// Function to draw mountains objects.
function drawMountains()
{
    for (var i = 0; i < mountains.length; i++)
    {
        noStroke();
        fill(195, 205, 193);
        beginShape();
        vertex(mountains[i].x_pos, 
               mountains[i].y_pos);
        vertex(mountains[i].x_pos +150 * mountains[i].size, 
               mountains[i].y_pos -148 * mountains[i].size);
        vertex(mountains[i].x_pos +270 * mountains[i].size, 
               mountains[i].y_pos -45 * mountains[i].size);
        vertex(mountains[i].x_pos +201 * mountains[i].size, 
               mountains[i].y_pos -113 * mountains[i].size);
        vertex(mountains[i].x_pos +267 * mountains[i].size, 
               mountains[i].y_pos -169 * mountains[i].size);
        vertex(mountains[i].x_pos +453 * mountains[i].size, 
               mountains[i].y_pos -42 * mountains[i].size);
        vertex(mountains[i].x_pos +305 * mountains[i].size, 
               mountains[i].y_pos -158 * mountains[i].size);
        vertex(mountains[i].x_pos +435 * mountains[i].size, 
               mountains[i].y_pos -392 * mountains[i].size);
        vertex(mountains[i].x_pos +663 * mountains[i].size, 
               mountains[i].y_pos -33 * mountains[i].size);
        vertex(mountains[i].x_pos +586 * mountains[i].size, 
               mountains[i].y_pos -169 * mountains[i].size);
        vertex(mountains[i].x_pos +648 * mountains[i].size, 
               mountains[i].y_pos -257 * mountains[i].size);
        vertex(mountains[i].x_pos +870 * mountains[i].size, 
               mountains[i].y_pos -31 * mountains[i].size);
        vertex(mountains[i].x_pos +785 * mountains[i].size, 
               mountains[i].y_pos -129 * mountains[i].size);
        vertex(mountains[i].x_pos +854 * mountains[i].size, 
               mountains[i].y_pos -209 * mountains[i].size);
        vertex(mountains[i].x_pos +1024 * mountains[i].size, 
               mountains[i].y_pos -85 * mountains[i].size);
        vertex(mountains[i].x_pos +1115 * mountains[i].size, 
               mountains[i].y_pos);
        endShape();
    }
}

// Function to draw trees objects.
function drawTrees()
    {
        for (var i = 0; i < trees_x.length; i++)
        {
            noStroke();
            fill(83, 40, 52);
            rect(trees_x[i], floorPos_y -35, 45, 35);

            fill(47, 60, 68);
            beginShape();
            vertex(trees_x[i], floorPos_y -30);
            vertex(trees_x[i] -52, floorPos_y -16);
            vertex(trees_x[i] -14, floorPos_y -85);
            vertex(trees_x[i] -33, floorPos_y -79);
            vertex(trees_x[i] -6, floorPos_y -134);
            vertex(trees_x[i] -26, floorPos_y -130);
            vertex(trees_x[i] +25, floorPos_y -230);
            vertex(trees_x[i] +73, floorPos_y -135);
            vertex(trees_x[i] +55, floorPos_y -139);
            vertex(trees_x[i] +81, floorPos_y -79);
            vertex(trees_x[i] +64, floorPos_y -85);
            vertex(trees_x[i] +99, floorPos_y -21);
            vertex(trees_x[i] +43, floorPos_y -30);
            endShape();   
        }
    }

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
        noStroke();
        fill(195, 205, 193);
        rect(t_canyon.x_pos +165 * t_canyon.width, 
             floorPos_y, 
             125 * t_canyon.width, 
             425);
        
        // cliffs
        fill(47, 60, 68);
        triangle(t_canyon.x_pos +103 * t_canyon.width, 436,
                 t_canyon.x_pos +188 * t_canyon.width, 432,
                 t_canyon.x_pos +103 * t_canyon.width, 577);
        triangle(t_canyon.x_pos +287 * t_canyon.width, 430,
                 t_canyon.x_pos +364 * t_canyon.width, 432,
                 t_canyon.x_pos +293 * t_canyon.width, 480);

        fill(61, 73, 80);
        quad(t_canyon.x_pos +121 * t_canyon.width, 466,
             t_canyon.x_pos +208 * t_canyon.width, 445,
             t_canyon.x_pos +165 * t_canyon.width, 576,
             t_canyon.x_pos +121 * t_canyon.width, 576);
        quad(t_canyon.x_pos +267 * t_canyon.width, 455,
             t_canyon.x_pos +346 * t_canyon.width, 474,
             t_canyon.x_pos +346 * t_canyon.width, 576,
             t_canyon.x_pos +276 * t_canyon.width, 576);

        fill(96, 119, 121);
        quad(t_canyon.x_pos +9 * t_canyon.width, 513,
             t_canyon.x_pos +170 * t_canyon.width, 474,
             t_canyon.x_pos +130 * t_canyon.width, 576,
             t_canyon.x_pos +9 * t_canyon.width, 576);
        quad(t_canyon.x_pos +293 * t_canyon.width, 484,
             t_canyon.x_pos +454 * t_canyon.width, 535,
             t_canyon.x_pos +454 * t_canyon.width, 576,
             t_canyon.x_pos +303 * t_canyon.width, 576);

        fill(18, 26, 28);
        quad(t_canyon.x_pos, 532, 
             t_canyon.x_pos +53 * t_canyon.width, 517, 
             t_canyon.x_pos +23 * t_canyon.width, 576, 
             t_canyon.x_pos -100 * t_canyon.width, 576);
        triangle(t_canyon.x_pos +373 * t_canyon.width, 534, 
                 t_canyon.x_pos +503 * t_canyon.width, 576, 
                 t_canyon.x_pos +375 * t_canyon.width, 576);
        
        // grounds
        fill(142, 170, 154);
        beginShape();
        vertex(t_canyon.x_pos, 435);
        vertex(t_canyon.x_pos +188  * t_canyon.width, 431);
        vertex(t_canyon.x_pos +134 * t_canyon.width, 447);
        vertex(t_canyon.x_pos +210 * t_canyon.width, 444);
        vertex(t_canyon.x_pos +125 * t_canyon.width, 466);
        vertex(t_canyon.x_pos +170 * t_canyon.width, 474);
        vertex(t_canyon.x_pos +12 * t_canyon.width, 513);
        vertex(t_canyon.x_pos +53 * t_canyon.width, 517);
        vertex(t_canyon.x_pos, 532);
        endShape();
            
        beginShape();
        vertex(t_canyon.x_pos +287 * t_canyon.width, 430);
        vertex(t_canyon.x_pos +502 * t_canyon.width, 435);
        vertex(t_canyon.x_pos +502 * t_canyon.width, 576);
        vertex(t_canyon.x_pos +502 * t_canyon.width, 576);
        vertex(t_canyon.x_pos +373 * t_canyon.width, 534);
        vertex(t_canyon.x_pos +450 * t_canyon.width, 534);
        vertex(t_canyon.x_pos +292 * t_canyon.width, 484);
        vertex(t_canyon.x_pos +344 * t_canyon.width, 475);
        vertex(t_canyon.x_pos +266 * t_canyon.width, 454);
        vertex(t_canyon.x_pos +341 * t_canyon.width, 449);
        endShape();
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
    if(gameChar_world_x > t_canyon.x_pos +190 * t_canyon.width 
       && gameChar_world_x < t_canyon.x_pos +285 * t_canyon.width 
       && gameChar_y >= floorPos_y)
        {
            isPlummeting = true;
        }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
        // background
        noStroke();
        fill(168, 169, 99);
        ellipse(t_collectable.x_pos, 
                t_collectable.y_pos, 
                22 * t_collectable.size, 
                22 * t_collectable.size);

        // head
        fill(255);
        rect(t_collectable.x_pos -5 * t_collectable.size, 
             t_collectable.y_pos -8 * t_collectable.size, 
             10 * t_collectable.size, 
             7 * t_collectable.size, 
             2 * t_collectable.size);

        // body
        strokeWeight(3 * t_collectable.size);
        stroke(255);
        line(t_collectable.x_pos -7 * t_collectable.size, 
             t_collectable.y_pos +2 * t_collectable.size, 
             t_collectable.x_pos, 
             t_collectable.y_pos);
        line(t_collectable.x_pos, 
             t_collectable.y_pos, 
             t_collectable.x_pos +6 * t_collectable.size, 
             t_collectable.y_pos +2 * t_collectable.size);
        line(t_collectable.x_pos -4 * t_collectable.size, 
             t_collectable.y_pos +7 * t_collectable.size, 
             t_collectable.x_pos, 
             t_collectable.y_pos);
        line(t_collectable.x_pos, 
             t_collectable.y_pos, 
             t_collectable.x_pos +2 * t_collectable.size, 
             t_collectable.y_pos +7 * t_collectable.size);

        // eyes
        stroke(168, 169, 99);
        strokeWeight(2 * t_collectable.size);
        point(t_collectable.x_pos -3 * t_collectable.size, 
              t_collectable.y_pos -5 * t_collectable.size);
        point(t_collectable.x_pos +2 * t_collectable.size, 
              t_collectable.y_pos -5 * t_collectable.size);

}

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
    if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 35)
        {
            t_collectable.isFound = true;
            game_score += 1;
            bonusSound.play();
        }
}

// Function to draw the flagpole
function renderFlagpole()
{
    strokeWeight(9);
    stroke(100);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y -250);
    
    fill(200, 50, 50);
    noStroke();
    
    if(flagpole.isReached)
    {
        triangle(flagpole.x_pos, floorPos_y -250, 
                 flagpole.x_pos +80, floorPos_y -220, 
                 flagpole.x_pos, floorPos_y -190);
    }
    else
    {
        triangle(flagpole.x_pos, floorPos_y-5, 
                 flagpole.x_pos +80, floorPos_y, 
                 flagpole.x_pos, floorPos_y +5);
    }
}

// Function to check if flagpole is reached
function checkFlagpole()
{
    var d = abs(gameChar_world_x - flagpole.x_pos);
    if(d < 15)
    {
        flagpole.isReached = true;
        levelSound.play();
    }
}

// Function to check if player die and count lives
function checkPlayerDie()
{
    if(gameChar_y == height+80)
    {
        lives -= 1;
        backgroundMusic.stop();

        if(lives > 0)
        {
            startGame();
        }
    }
}

// Function to start and re start the game
function startGame()
{
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    backgroundMusic.play();

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    trees_x = [50, 300, 500, 750, 1070, 1300, 1550, 2000, 2350, 2600, 2800, -70, -650, -1100, -1250];
    
    clouds = [{x_pos: 100, y_pos: 65, size: 0.7}, 
              {x_pos: 610, y_pos: 118, size: 0.5}, 
              {x_pos: 808, y_pos: 89, size: 0.6},
              {x_pos: 1500, y_pos: 130, size: 0.6},
              {x_pos: 1700, y_pos: 90, size: 0.4},
              {x_pos: 2270, y_pos: 30, size: 0.8},
              {x_pos: 2570, y_pos: 40, size: 0.4},
              {x_pos: -700, y_pos: 60, size: 0.8},
              {x_pos: -1200, y_pos: 150, size: 0.3},
              {x_pos: -1500, y_pos: 50, size: 0.5},
              {x_pos: -350, y_pos: 150, size: 0.4}];
    
    mountains = [{x_pos: 0, y_pos: floorPos_y, size: 1}, 
                 {x_pos: 1000, y_pos: floorPos_y, size: 0.7},
                 {x_pos: 1600, y_pos: floorPos_y, size: 0.4},
                 {x_pos: -500, y_pos: floorPos_y, size: 0.5},
                 {x_pos: -1920, y_pos: floorPos_y, size: 1.2},
                 {x_pos: 2000, y_pos: floorPos_y, size: 1.1}];
    
    canyons = [{x_pos: -705, width: 0.7},
               {x_pos: 0, width: 1},
               {x_pos: 500, width: 0.4},
               {x_pos: 850, width: 1.5},
               {x_pos: 1551, width: 0.6},
               {x_pos: 2050, width: 1.9}];
    
    if(lives == 3)
    {
         collectable = [{x_pos: 20, y_pos: 358, size: 0.6, isFound: false},     
                       {x_pos: 325, y_pos: 202, size: 0.6, isFound: false},
                       {x_pos: 578, y_pos: 353, size: 1, isFound: false},
                       {x_pos: 725, y_pos: 305, size: 0.7, isFound: false},
                       {x_pos: 1095, y_pos: 202, size: 0.8, isFound: false},
                       {x_pos: 1255, y_pos: 419, size: 1, isFound: false},
                       {x_pos: 1620, y_pos: 305, size: 1.2, isFound: false},
                       {x_pos: 1972, y_pos: 305, size: 0.8, isFound: false},
                       {x_pos: 2330, y_pos: 305, size: 0.7, isFound: false},
                       {x_pos: 2625, y_pos: 202, size: 1, isFound: false},
                       {x_pos: 2775, y_pos: 305, size: 0.6, isFound: false},
                       {x_pos: -1225, y_pos: 202, size: 0.9, isFound: false},
                       {x_pos: -1125, y_pos: 305, size: 1, isFound: false},
                       {x_pos: -95, y_pos: 305, size: 0.5, isFound: false},
                       {x_pos: -579, y_pos: 300, size: 0.4, isFound: false}];
    }
       
    flagpole = {isReached: false, x_pos: 3020};
    
    platforms = [];
    platforms.push(createPlatforms(240, floorPos_y-30, 65));
    platforms.push(createPlatforms(320, floorPos_y-110, 40));
    platforms.push(createPlatforms(1108, floorPos_y-60, 85));
    platforms.push(createPlatforms(1245, floorPos_y-90, 55));
    platforms.push(createPlatforms(2385, floorPos_y-80, 81));
    platforms.push(createPlatforms(2550, floorPos_y-40, 50));
    platforms.push(createPlatforms(2530, floorPos_y-100, 70));
    platforms.push(createPlatforms(2830, floorPos_y-40, 40));
    platforms.push(createPlatforms(-1245, floorPos_y-100, 40));
    
    enemies = [];
    enemies.push(new Emitter(-15, floorPos_y, 195));
    enemies.push(new Emitter(-500, floorPos_y, 420));
    enemies.push(new Emitter(-1045, floorPos_y, 465));
    enemies.push(new Emitter(-1195, floorPos_y, 90));
    enemies.push(new Emitter(-1195, floorPos_y, 540));
    enemies.push(new Emitter(620, floorPos_y, 120));
    enemies.push(new Emitter(805, floorPos_y, 255));
    enemies.push(new Emitter(1280, floorPos_y, 380));
    enemies.push(new Emitter(1355, floorPos_y, 185));
    enemies.push(new Emitter(1735, floorPos_y, 250));
    enemies.push(new Emitter(1740, floorPos_y, 600));
    enemies.push(new Emitter(2055, floorPos_y, 340));
    enemies.push(new Emitter(2600, floorPos_y, 190));
    enemies.push(new Emitter(2655, floorPos_y, 360));
    enemies.push(new Emitter(2855, floorPos_y, 155));
    
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].startEmitter();
    }
}

// Function to create Patforms
function createPlatforms(x, y, length)
{
    var p = 
    {
        x: x,
        y: y,
        length: length,
        draw: function()
        {
            fill(83, 40, 52);
            rect(this.x, this.y, this.length, 10, 0, 0, 10, 10);
        },
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                var d = this.y - gc_y;
                if(d >= 0 && d < 5)
                {
                    return true;
                }
            }
            return false;
        },
    }
    return p;
}

// Function to create enemies
function Particle(x, y, range)
{
    this.pos = createVector(x, y);
    this.xSpeed = random(-0.1, 0.1);
    this.ySpeed = random(-2, 0);
    this.size = random(0, 6);
    this.colour = color(255, 230, 0, 0);
    this.age = 0;
    this.blend = 230;
    this.range = range;
    
    this.drawParticle = function()
    {
        
        fill(this.colour);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);
    }
    
    this.updateParticle = function()
    {
        this.blend -= 3;
        this.colour = color(this.blend +150, this.blend, 0, this.blend -5);
        this.pos.x += this.xSpeed;
        this.pos.y += this.ySpeed;
        this.age++;
    }
};

// Function to display enemies
function Emitter(x, y, range)
{
    this.pos = createVector(x, y);
    this.xSpeed = random(-0.1, 0.1);
    this.ySpeed = random(-2, 0);;
    this.size = random(0, 6);
    this.colour = color(255, 230, 0, random(0, 255));
    this.startParticles = 0;
    this.lifetime = 0;
    this.currentX = x;
    this.inc = 1;
    this.range = range;
    
    this.particles = [];

    this.addParticle = function()
    {
        var p = new Particle(random(this.currentX-10, this.currentX+10), 
                             random(this.pos.y, this.pos.y-11), 
                             this.range);
        return p;
    }
    
    this.startEmitter = function()
    {
        this.startParticles = 400;
        this.lifetime = 100;
        
    //start initial particles
    for(var i = 0; i < this.startParticles; i++)
        {
            this.particles.push(this.addParticle());
        }
    }
    
    this.updateParticles = function()
    {
        this.update();
        var deadParticles = 0;
        for(var i = this.particles.length-1; i >= 0; i--)
        {
            this.particles[i].drawParticle();
            this.particles[i].updateParticle();
            
            if(this.particles[i].age > random(10, this.lifetime))
            {
                this.particles.splice(i, 1);
                deadParticles++;
            }
        }
        
        if(deadParticles > 0)
        {
            for(var i = 0; i < deadParticles; i++)
            {
                this.particles.push(this.addParticle());
            }
        }
    }
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        if(this.currentX >= this.pos.x + this.range)
        {
            this.inc = -1;
        }
    else if(this.currentX < this.pos.x)
        {
            this.inc = 1;
        }
    }
    
    this.checkContact = function(gc_x, gc_y)
    {
        var e = dist(gc_x, gc_y, this.currentX, this.pos.y);
        
        if(e < 20)
        {
            return true;
        }
        
        return false;
    }
}