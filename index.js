if (window.location.search) {
	const hashes = window.location.search.slice(window.location.search.indexOf('?') + 1).split('&');
	for (i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		if (hashes.length > 1) {
			document.querySelector(`#${hash[0]}`).value = hash[1]
		}
	}
}
document.querySelector(`#main-href`).setAttribute('href', window.location.origin+window.location.pathname)


const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")
canvas.setAttribute('width', document.querySelector("#canvasWidth").value);
canvas.setAttribute('height', document.querySelector("#canvasHeight").value);
const resolution = document.querySelector("#resolution").value;


const [canvasWidth, canvasHeight] = [canvas.width, canvas.height]
const [rows, cols] = [Math.round(canvasHeight / resolution), Math.round(canvasWidth / resolution)]

let reqAnimationFrame;
let grid;
let running;
let mouseDown = false;
let lastX = 0;
let lastY = 0;

document.addEventListener('mouseup', canvasMouseUp, false);
canvas.addEventListener('mousedown', canvasMouseDown, false);
canvas.addEventListener('mousemove', canvasMouseMove, false);
document.getElementById('buttonRun').addEventListener('click', run, false);
document.getElementById('buttonStep').addEventListener('click', step, false);
document.getElementById('buttonClear').addEventListener('click', clear, false);
document.getElementById('buttonRandom').addEventListener('click', randomMatrix, false);

function matrix(cols, rows) {
	let arr = new Array(cols);
	for (let i = 0; i < arr.length; i++) {
		arr[i] = new Array(rows);
	}
	return arr;
}

function setupMatrix(random = 1) {
	grid = matrix(cols, rows);
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j] = random ? (Math.random() > 0.9 ? 1 : 0) : 0;
		}
	}
}

function drawMatrix() {
	canvas.width = canvas.width;
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			let x = i * resolution;
			let y = j * resolution;
			ctx.beginPath();
			ctx.strokeStyle = "rgb(233, 233, 233)";
			ctx.fillStyle = "rgb(55, 55, 55)";
			ctx.rect(x, y, resolution - 1, resolution - 1);
			if (grid[i][j] == 1) ctx.fill();
			ctx.stroke();
		}
	}

	if (running) {
		grid = computeNextGrid(grid);
		reqAnimationFrame = requestAnimationFrame(drawMatrix);
	}
}

function computeNextGrid(grid) {
	let next = matrix(cols, rows);
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			let state = grid[i][j];
			let neighbors = countNeighbors(grid, i, j);

			if (state == 0 && neighbors == 3) {
				next[i][j] = 1;
			} else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
				next[i][j] = 0;
			} else {
				next[i][j] = state;
			}
		}
	}
	return next
}

function countNeighbors(grid, x, y) {
	let sum = 0;
	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			let col = (x + i + cols) % cols;
			let row = (y + j + rows) % rows;
			sum += grid[col][row];
		}
	}
	sum -= grid[x][y];
	return sum;
}

function switchGridCell(i, j) {
	if (i >= 0 && i < cols && j >= 0 && j < rows) {
		grid[i][j] = grid[i][j] ? 0 : 1;
		drawMatrix();
	}
}

function canvasMouseDown(event) {
	running = false;
	let position = mousePosition(event);
	switchGridCell(position[0], position[1]);
	lastX = position[0];
	lastY = position[1];
	mouseDown = true;
}

function canvasMouseUp() {
	mouseDown = false;
}

function canvasMouseMove(event) {
	if (mouseDown) {
		let position = mousePosition(event);
		if ((position[0] !== lastX) || (position[1] !== lastY)) {
			switchGridCell(position[0], position[1]);
			lastX = position[0];
			lastY = position[1];
		}
	}
}

function mousePosition(e) {
	// http://www.malleus.de/FAQ/getImgMousePos.html
	// http://www.quirksmode.org/js/events_properties.html#position
	var event, x, y, domObject, posx = 0,
		posy = 0,
		top = 0,
		left = 0,
		cellSize = resolution;

	event = e;
	if (!event) {
		event = window.event;
	}

	if (event.pageX || event.pageY) {
		posx = event.pageX;
		posy = event.pageY;
	} else if (event.clientX || event.clientY) {
		posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	domObject = event.target || event.srcElement;

	while (domObject.offsetParent) {
		left += domObject.offsetLeft;
		top += domObject.offsetTop;
		domObject = domObject.offsetParent;
	}

	domObject.pageTop = top;
	domObject.pageLeft = left;

	x = Math.ceil(((posx - domObject.pageLeft) / cellSize) - 1);
	y = Math.ceil(((posy - domObject.pageTop) / cellSize) - 1);

	return [x, y];
}

function run() {
	running = !running;
	if (running) {
		drawMatrix();
		document.getElementById('buttonRun').value = 'Pause';
	} else {
		document.getElementById('buttonRun').value = 'Start';
	}
}

function step() {
	if (!running) {
		grid = computeNextGrid(grid);
		drawMatrix();
	}
}

function clear() {
	running = false;
	document.getElementById('buttonRun').value = 'Start';
	setupMatrix(0);
	drawMatrix();
}

function randomMatrix() {
	setupMatrix();
	drawMatrix();
}

function init() {
	setupMatrix(0);
	drawMatrix();
}


init();
