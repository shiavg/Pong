var canvas = document.querySelector('#canvas');
var startHeader = document.querySelector('.start-header');
var txtP1Score = document.querySelector('#player1-score');
var txtP2Score = document.querySelector('#player2-score');
var ctx = canvas.getContext('2d');
var raf;
var keys = [];
var cancelCalc = false;
var allowReset = true, fullReset = false, startUp = false;
var p1Score = 0, p2Score = 0;
var winningScore = 3;

var ball = {
  x: 200,
  y: 250,
  vx: 6,
  vy: 3,
  radius: 5,
  color: 'white',
  draw () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  },
  reset () {
    this.x = 200;
    this.y = 250;
    this.vx = 6;
    this.vy = 3;
    if(startUp){
        this.vx = -this.vx;
        this.vy = -this.vy;
    }
  }
};

var barBottom = {
    x: 162,
    y: canvas.height - 20,
    vx: 6,
    length: 75,
    color: 'white',
    draw () {
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
};

var barTop = {
    x: 162,
    y: 20,
    vx: 6,
    length: 75,
    color: 'white',
    draw () {
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.draw();
    barBottom.draw();
    barTop.draw();

    //Move ball
    if(moveBall()){
        //Move bar
        moveBar();

        raf = window.requestAnimationFrame(draw);
    } else {
        //Ball was missed, explode and add to score
        //See moveBall>kaboom>continueGame
    }
}

function moveBall() {
    
    if(ball.y + ball.vy > barBottom.y) {
        if(ball.x > barBottom.x && ball.x <= barBottom.x + barBottom.length && ball.y + ball.vy < canvas.height) {
            calcAngle(barBottom);
            return true;
        } else if(ball.y + ball.vy > canvas.height) {
            kaboom(); //This is in explosion.js

            return false;
        }
    }
    if(ball.y + ball.vy < barTop.y) {
        if(ball.x > barTop.x && ball.x <= barTop.x + barTop.length && ball.y + ball.vy > 0) {
            calcAngle(barTop);
            return true;
        } else if(ball.y + ball.vy < 0) {
            kaboom(); //This is in explosion.js

            return false;
        }
    }

    cancelCalc = false;
    
    if(ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
        ball.vx = -ball.vx;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;
    return true;
}

function calcAngle(bar) {
    //Get x position of ball relative to bar length
    //Adjust ball.vx&vy based on this
    
    if (cancelCalc) return;

    cancelCalc = true;

    let midX = 0, midY = 6,
    halfX = 6, halfY = 4,
    edgeX = 10, edgeY = 2;

    //xPos = X position of ball relative to bar
    let xPos = ball.x - bar.x;
    let vX, vY;
    let steps = 5;
    let left = true;

    if(xPos === bar.length / 2) {
        //Exactly halfway, go vertical
        vX = midX;
        vY = midY;

    } else {

        if(xPos > bar.length / 2) {
            xPos = bar.length - xPos;
            left = false;
        }   

        if(xPos === bar.length * 0.25 || xPos === bar.length * 0.75) {
            //xPos is exactly 1/4 or 3/4 along the bar
            vX = halfX;
            vY = halfY;

        } else if (xPos < bar.length * 0.25 || xPos > bar.length * 0.75) {
            //xPos is between left edge and 1/4 along the bar,
            //or between 3/4 along the bar and the right edge.
            if(xPos > bar.length / 4) {
                xPos /= 2;
            }
            vX = getVelocity(halfX, edgeX, steps, xPos);
            vY = getVelocity(edgeY, halfY, steps, xPos);

        } else {
            //xPos is between 1/4 to halfway along the bar,
            //or between halfway and 3/4 along the bar.
            if(xPos > bar.length / 4) {
                xPos /= 2;
            }

            vX = getVelocity(midX, halfX, steps, xPos);
            vY = getVelocity(halfY, midY, steps, xPos);

        }

        if(left)
            vX = -vX; //Ball is going left, so make vX negative
    } 

    if(bar === barBottom)
        vY = -vY; //Ball is going up, so make vY negative

    ball.vx = vX;
    ball.vy = vY;
}

// function getVelocity(min, max, steps, ballPos) {
//     return min + (((max - min) / steps) * (ballPos / steps));
// }
//Hey look, arrow syntax!
var getVelocity = (min, max, steps, ballPos) => min + (((max - min) / steps) * (ballPos / steps))

function moveBar() {
    if(keys[37] && barBottom.x > 0) {
        barBottom.x -= barBottom.vx;
    }
    if(keys[39] && barBottom.x + barBottom.length < canvas.width) {
        barBottom.x += barBottom.vx;
    }
    if(keys[65] && barTop.x > 0) {
        barTop.x -= barTop.vx;
    }
    if(keys[68] && barTop.x + barTop.length < canvas.width) {
        barTop.x += barTop.vx;
    }
}

function continueGame() {
    //Add to score depending on last ball y position

    //If score > 3? show winner
    //else continue next round

    if(ball.y < barTop.y) {
        p2Score++;
        startUp = true;
    } else if(ball.y > barBottom.y) {
        p1Score++;
        startUp = false;
    } else {
        //This should never happen
        startHeader.style.display = 'block';
        startHeader.textContent = 'Error!';
    }

    displayScores();
    
    if(p1Score === winningScore || p2Score === winningScore) {

        startHeader.style.color = 'red';
        startHeader.textContent = `Player ${startUp ? '2' : '1'} wins! \r\n Click anywhere to restart...`;
        startHeader.style.display = 'block';
        fullReset = true;

    } else {
        //Continue next round
        startHeader.textContent = `Player ${startUp ? '2' : '1'} scored! \r\n Click anywhere to continue...`;
        startHeader.style.display = 'block';
    }

    allowReset = true;
}

function displayScores() {
    txtP1Score.textContent = 'Score: ' + p1Score;
    txtP2Score.textContent = 'Score: ' + p2Score;
}

function reset() {
    allowReset = false;
    startHeader.style.display = 'none';
    startHeader.style.color = 'white';
    ball.reset();
    ball.draw();
    raf = window.requestAnimationFrame(draw);
}

function restart() {
    p1Score = 0;
    p2Score = 0;
    displayScores();
    barTop.x = 162;
    barBottom.x = 162;
    startUp = false;
    fullReset = false;
    reset();
}

window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
});

window.addEventListener('click', function(e) {
    if(fullReset) restart(); else if(allowReset) reset();
});

ball.draw();
barBottom.draw();
barTop.draw();