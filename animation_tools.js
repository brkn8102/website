function animate(id, ball, duration) {
	let element = $('#' + id);
	element.animate({
		left: Math.round(ball.x - ball.radius) + 'px', 
		bottom: Math.round(ball.y - ball.radius) + 'px'},
		{duration: duration}
	);
}

// create canvas element 
let circle = function(id, ball) {
	let r = Math.round(ball.radius);

	let element = $('<canvas></canvas>');
	element.attr({
		id: id,
		width: 2*r,
		height: 2*r
	});
	element.css({
		'background-color': 'transparent',
		'position': 'absolute',
		'left': Math.round(ball.x - ball.radius) + 'px',
		'bottom': Math.round(ball.y - ball.radius) + 'px'
	});

	let context = element[0].getContext('2d');
	context.beginPath();
	context.arc(r, r, r, 0, 2 * Math.PI);
	context.fillStyle = ball.color;
	context.fill();
	context.strokeStyle = 'transparent';
	context.stroke();

	return element;
}

let updateNumberOfBalls = function() {
	// read desired number of balls 
	numberOfBalls = $('#numberOfBalls').val();
	if(numberOfBalls < 0) {
		numberOfBalls = 0;
		$('#numberOfBalls').val(0);
	}
	else if(numberOfBalls > 100) {
		numberOfBalls = 100;
		$('#numberOfBalls').val(100);
	}

	// remove excess balls
	while(ballSystem.balls.length > numberOfBalls) {
		ballSystem.removeLastBall();
		$('#ball' + ballSystem.balls.length).remove();
	}

	// add necessary balls
	while(ballSystem.balls.length < numberOfBalls) {
		ballSystem.addRandomBall();
		let i = ballSystem.balls.length - 1;
		$('#container').append(circle('ball' + i, ballSystem.balls[i]));
	}
}

let randomize = function() {
	ballSystem.removeLastBall(ballSystem.balls.length);
	$('[id^=ball]').remove();
	updateNumberOfBalls();
}