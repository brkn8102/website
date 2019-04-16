function Ball(mass, radius, color, [x, y], [vx, vy] = [0, 0]) {
		this.mass = mass;
		this.radius = radius;
		this.color = color;
		[this.x, this.y] = [x, y];
		[this.vx, this.vy] = [vx, vy];
		[this.Fx, this.Fy] = [0, 0];

		this.position = function() {
			return [this.x, this.y];
		}


		this.velocity = function() {
			return [this.vx, this.vy];
		}

		this.velocityAngle = function() {

			let v = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
			if(v == 0)
				return undefined;
			else {
				let a = Math.acos(this.vx / v);
				if(this.vy < 0) 
					a = 2*Math.PI - a;
				return a;
			}
		};

		this.move = function() {
			this.x += this.vx;
			this.y += this.vy;

			this.vx += this.Fx / this.mass;
			this.vy += this.Fy / this.mass;
		};

		this.kineticEnergy = function() {
			return 1/2 * this.mass * (Math.pow(this.vx, 2) + Math.pow(this.vy, 2));		
		};
}

function BallSystem(width, height) {
	this.width = width;
	this.height = height;

	this.balls = [];

	this.fActive = false; // internal non-contact forces
	this.fx = [];
	this.fy = [];

	this.gActive = false; // external non-contact forces
	this.gx = [];
	this.gy = [];

	this.areColliding = [];

	this.step = 0;

	this.mass = function() {
		let M = 0;
		for(let ball of this.balls)
			M += ball.mass;
		return M;
	};

	// center of mass
	this.position = function() {
		let X = 0;
		let Y = 0;
		for(let ball of this.balls) {
			X += ball.mass * ball.x;
			Y += ball.mass * ball.y;
		}
		let M = this.mass();
		X *= 1 / M;
		Y *= 1 / M;
		return [X, Y];
	};

	this.centerOfMass = function() {
		return new Ball(this.mass(), 4, 'red', this.position())
	};

	this.kineticEnergy = function() {
		let K = 0;
		for(let ball of this.balls)
			K += ball.kineticEnergy();
		return K;
	}

	this.updateForces = function() {
		// update forces f and g 
		for(let i = 0; i < this.balls.length; i++) {
			if(this.gActive)
				[this.gx[i], this.gy[i]] = [0, this.balls[i].mass * -0.1];
			else
				[this.gx[i], this.gy[i]] = [0, 0];

			for(let j = i + 1; j < this.balls.length; j++) {
				if(this.fActive) {
					let r = subtract(this.balls[i].position(), this.balls[j].position());
					let n = scale(1 / norm(r), r);
					[this.fx[i][j], this.fy[i][j]] = scale(-Math.pow(10, 1) * this.balls[i].mass * this.balls[j].mass / Math.pow(norm(r), 2), n);
				}
				else 
					[this.fx[i][j], this.fy[i][j]] = [0, 0];
			}
		}

		// update net forces F
		for(let i = 0; i < this.balls.length; i++) {
			let ball = this.balls[i];
			ball.Fx = 0;
			ball.Fy = 0;

			if(this.fActive) {
				for(let j = 0; j < this.balls.length; j++) {
					if(i < j) {
						ball.Fx += this.fx[i][j];
						ball.Fy += this.fy[i][j];
					} else if(i > j) {
						ball.Fx += -this.fx[j][i];
						ball.Fy += -this.fy[j][i];
					}
				}
			}	

			if(this.gActive){
				ball.Fx += this.gx[i];
				ball.Fy += this.gy[i];
			}
		}
	};

	this.collideBalls = function(b1, b2) {
		let n = subtract(b2.position(), b1.position());
		n = scale(1 / norm(n), n);

		let m = [n[1], -n[0]];
		 
		let mu = b2.mass / b1.mass;

		let u = subtract(b1.velocity(), b2.velocity());
		let uPar = dot(u, n);
		let uPer = dot(u, m);

		let v = add(scale(uPer, m), scale((1 - mu) / (1 + mu) * uPar, n));

		let w = scale(2 / (1 + mu) * uPar, n);

		[b1.vx, b1.vy] = add(v, b2.velocity());
		[b2.vx, b2.vy] = add(w, b2.velocity());
	};

	this.positionUniformly = function() {
		let widthSpaces = 2;
		let heightSpaces = 2;
		while((widthSpaces - 1) * (heightSpaces - 1) < this.balls.length) {
			if(this.width/widthSpaces <= this.height/heightSpaces)
				heightSpaces++;
			else
				widthSpaces++;
		}

		let i = 0;
		for(let j = 1; j < widthSpaces; j++) {
			for(let k = 1; k < heightSpaces; k++) {
				if(i == this.balls.length)
					return;
				else {
					let ball = this.balls[i++];
					[ball.x, ball.y] = [j * this.width/widthSpaces, k * this.height/heightSpaces];
				}
			}
		}
	};

	this.nextStep = function() {
		this.updateForces();

		for(b of this.balls)
			b.move();

		// wall collision
		for(b of this.balls) {
			// left or right wall
			if(b.x - b.radius < 0) {
				b.x = b.radius;
				b.vx = Math.abs(b.vx);
			}
			else if(this.width < b.x + b.radius) {
				b.x = this.width - b.radius;
				b.vx = -Math.abs(b.vx);
			}

			// top or bottom wall
			if(b.y - b.radius < 0) {
				b.y = b.radius;
				b.vy = Math.abs(b.vy);
			}
			else if(this.height < b.y + b.radius) {
				b.y = this.height - b.radius;
				b.vy = -Math.abs(b.vy);
			}
		}

		// ball collision
		for(let i = 0; i < this.balls.length; i++) {
			for(let j = i + 1; j < this.balls.length; j++) {
				let bi = this.balls[i];
				let bj = this.balls[j];
				if(norm(subtract(bi.position(), bj.position())) < bi.radius + bj.radius) {
					if(!this.areColliding[i][j]) {
						this.areColliding[i][i] = true;
						this.collideBalls(bi, bj);
					}
				} else
					this.areColliding[i][j] = false;
			}
		}

		this.step++;
	};

	this.addBall = function(mass, radius, color, [x, y], [vx, vy] = [0, 0], n = 1) {
		while(n-- > 0)
			this.balls.push(new Ball(mass, radius, color, [x, y], [vx, vy]));

		for(let i = 0; i < this.balls.length; i++) {
			this.fx[i] = [];
			this.fy[i] = [];
			for(let j = i + 1; j < this.balls.length; j++) {
				this.fx[i][j] = 0;
				this.fy[i][j] = 0;
			}

			this.gx[i] = 0;
			this.gy[i] = 0;
		}

		this.areColliding = [];
		for(let i = 0; i < this.balls.length; i++) {
			this.areColliding[i] = [];
			for(let j = i + 1; j < this.balls.length; j++)
				this.areColliding[i][j] = false;
		}
	};

	this.addRandomBall = function(n = 1) {
		while(n-- > 0) {
			let radius = 5 + 20 * Math.random();
			let mass = Math.pow(radius, 2) / 100;
			x = radius + (width - 2 * radius) * Math.random();
			y = radius + (height - 2 * radius) * Math.random();
			v = (width + height) / 10000 * Math.random();
			angle = Math.random() * 2 * Math.PI;
			vx = v * Math.cos(angle);
			vy = v * Math.sin(angle);
			this.addBall(mass, radius, 'white', [x, y], [vx, vy]);
		}
	};

	this.removeLastBall = function(n = 1) {
		while(n-- > 0 && this.balls.length)
			this.balls.pop();

		this.areColliding = [];
		for(let i = 0; i < this.balls.length; i++) {
			this.areColliding[i] = [];
			for(let j = i + 1; j < this.balls.length; j++)
				this.areColliding[i][j] = false;
		}
	};
}