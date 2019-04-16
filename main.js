let newNumberOfBalls = true;
let showCenterOfMass = false;
let width, height, numberOfBalls, ballSystem;

$(document).ready(function() {
	// fit container size to window
	width = Math.round(0.7 * $(window).width());
	height = Math.round(0.9 * ($(window).height() - $('.heading').height()));
	$('#container').css('width', width);
	$('#container').css('height', height);

	ballSystem = new BallSystem(width, height);
	
	$('#container').append(circle('centerOfMass', ballSystem.centerOfMass()));

	let animateDuration = 16;
	timer = setInterval(function() {
		if(ballSystem.step == 100000)
			clearInterval(timer);

		if(newNumberOfBalls) {
			updateNumberOfBalls();
			ballSystem.positionUniformly();
			newNumberOfBalls = false;
		}

		$('#centerOfMass').css('z-index', showCenterOfMass ? 1 : -1);

		for(let i = 0; i < ballSystem.balls.length; i++)
			animate('ball' + i, ballSystem.balls[i], animateDuration);
		animate('centerOfMass', ballSystem.centerOfMass(), animateDuration);

		ballSystem.nextStep();
		$('#step').text('Step: ' + ballSystem.step);
		$('#kineticEnergy').text('Kinetic Energy: ' +  Math.round(ballSystem.kineticEnergy()));
	}, 
	20);
});