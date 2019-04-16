function add(u, v) {
	w = [];
	for(let i = 0; i < u.length; i++)
		w[i] = u[i] + v[i];
	return w;
}

function subtract(u, v) {
	w = [];
	for(let i = 0; i < u.length; i++)
		w[i] = u[i] - v[i];
	return w;
}

function norm(v) {
	sumOfSquares = 0;
	for(let x of v)
		sumOfSquares += Math.pow(x, 2);
	return Math.sqrt(sumOfSquares);
}

function dot(u, v) {
	d = 0;
	for(let i = 0; i < u.length; i++)
		d += u[i] * v[i];
	return d;
}

function scale(c, v) {
	w = [];
	for(let i = 0; i < v.length; i++)
		w[i] = c * v[i];
	return w;
}