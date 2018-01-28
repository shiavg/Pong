//Mostly from http://seowebsitedesigning.com/create-fireworks-effect-using-html5-canvas/

var minParticleV = 5;
var deltaParticleV = 5;

var gravity = 2;

function kaboom(){
    let b = new bomb();
    b.init();
    raf = requestAnimationFrame(b.animation);
}

function bomb() {
    var self = this;

    self.init =  function(){
        self.particles = [];

        console.log('bomb go');

        explode(self.particles);
    }
    
    self.update = function(){
        var aliveParticles = [];
        while(self.particles.length > 0){
            var particle = self.particles.shift();
            particle.update();
            if(particle.alive){
                aliveParticles.push(particle);
            }
        }
        self.particles = aliveParticles;
    }

    self.draw = function(){
        ctx.beginPath();
        ctx.fillStyle='rgba(138, 43, 226, 0.1)'; // Ghostly effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for(var i = 0; i < self.particles.length; i++){
            self.particles[i].draw(ctx);
        }
    }

    self.animation = function(){
        console.log('animation go');
        self.update();
        self.draw();
        barBottom.draw();
        barTop.draw();
        if(self.particles.length > 0)
            raf = requestAnimationFrame(self.animation);
        else {
            cancelAnimationFrame(raf);
            continueGame(); //Explosion over, let's go back to script.js
        }
    }
}

function explode(particlesVector) {
    var e = 3 + Math.floor(Math.random() * 3);
    for(var j = 0; j < e; j++){
        var n = 10 + Math.floor(Math.random() * 21); // 10 - 30
        var speed = minParticleV + Math.random() * deltaParticleV;
        var deltaAngle = 2 * Math.PI / n;
        var initialAngle = Math.random() * deltaAngle;
        for(var i = 0; i < n; i++){
            particlesVector.push(new Particle(ball,  i * deltaAngle + initialAngle, speed));
        }
    }   
}

function Particle(parent, angle, speed){
    var self = this;
    self.px = parent.x;
    self.py = parent.y;
    self.vx = Math.cos(angle) * speed;
    self.vy = Math.sin(angle) * speed;
    self.color = parent.color;
    self.duration = 40 + Math.floor(Math.random()*20);
    self.alive = true;

    self.update = function(){
        self.vx += 0;
        self.vy += gravity / 10;

        self.px += self.vx;
        self.py += self.vy;
        self.radius = 3;

        self.duration--;
        if(self.duration <= 0){
        self.alive = false;
        }
    };

    self.draw = function(ctx){
        console.log('draw particle');
        ctx.beginPath();
        ctx.arc(self.px, self.py, self.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = self.color;
        ctx.lineWidth = 1;
        ctx.fill();
    };

}