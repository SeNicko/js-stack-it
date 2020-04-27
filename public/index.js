const canvas = document.querySelector('#gameView');

canvSize();

function canvSize() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
}

const ctx = canvas.getContext('2d');
const fps = 120;

const blockHeight = 30;
let blockWidth = innerWidth / 5 > 300 ? innerWidth / 5 : 300;
const groundWidth = blockWidth;
let allBlocks = [];
let groundHeight = 120;
let bottomSpace = 5;

const colors = ['57D1FF', '66BFFF', '76AEFF', '869DFF', '958BFF', 'A57AFF', 'B569FF', 'C457FF', 'D446FF', 'E435FF', 'F424FF'];
let currentColor = 0;
let gradientDirection = true;

const fontSize = 80;
let score = 0;

class Block {
	coords = {
		_x: allBlocks.length % 2 === 0 ? 0 : innerWidth - blockWidth,
		_y: innerHeight - blockHeight * bottomSpace,
		x: blockWidth,
		y: blockHeight,
	};
	moveInterval = null;
	color = colors[currentColor];

	display() {
		ctx.fillStyle = `#${this.color}`;
		ctx.fillRect(this.coords._x, this.coords._y, this.coords.x, this.coords.y);
	}

	clear(options) {
		let data = options || {};
		ctx.clearRect(data._x || this.coords._x, data._y || this.coords._y, data.x || this.coords.x, data.y || this.coords.y);
	}

	place() {
		clearInterval(this.moveInterval);
		this.moveInterval = null;
		score++;

		if ((gradientDirection && currentColor === colors.length - 1) || (!gradientDirection && currentColor === 0))
			gradientDirection = !gradientDirection;
		gradientDirection ? currentColor++ : currentColor--;

		const bottomBlockCoords = allBlocks[allBlocks.length - 2].coords;
		let difference = 0;
		if (bottomBlockCoords._x + bottomBlockCoords.x < this.coords._x || bottomBlockCoords._x > this.coords._x + this.coords.x) {
			restart();
		} else if (bottomBlockCoords._x > this.coords._x) {
			difference = bottomBlockCoords._x - this.coords._x;
			this.clear({ x: difference });
			this.coords._x += difference;
		} else if (bottomBlockCoords._x + bottomBlockCoords.x < this.coords._x + this.coords.x) {
			difference = this.coords._x + this.coords.x - (bottomBlockCoords._x + bottomBlockCoords.x);
			this.clear({ _x: this.coords._x + this.coords.x - difference });
		}
		blockWidth -= difference;
		this.coords.x -= difference;

		if (allBlocks.length * blockHeight >= innerHeight - fontSize * 5) {
			ctx.clearRect(0, 0, innerWidth, innerHeight);

			allBlocks[0].coords._y += blockHeight;
			setGround();

			allBlocks.forEach((block) => {
				if (block instanceof Block) {
					block.down();
				}
			});
		} else bottomSpace++;

		dislpayScore();
		start();
	}

	move() {
		let direction = true;
		this.moveInterval = setInterval(() => {
			this.clear();
			if (direction && this.coords._x + blockWidth < innerWidth) {
				this.coords._x += 4;
			} else if (!direction && this.coords._x > 0) {
				this.coords._x -= 4;
			} else {
				direction = !direction;
			}
			this.display();
		}, 1000 / fps);
	}

	down() {
		this.coords._y += blockHeight;
		this.display();
	}
}

function restart() {
	ctx.clearRect(0, 0, innerWidth, innerHeight - groundHeight);
	allBlocks.length = 1;
	blockWidth = innerWidth / 5 > 300 ? innerWidth / 5 : 300;
	bottomSpace = 4;
	currentColor = 0;
	score = 0;
	setGround(true);
}

function start() {
	const block = new Block();
	allBlocks.push(block);
	block.display();
	block.move();
}

function setGround(initialize) {
	let coords;
	if (initialize) {
		coords = {
			_x: innerWidth / 2 - blockWidth / 2,
			_y: innerHeight - groundHeight,
			x: groundWidth,
			y: groundHeight,
		};
		allBlocks[0] = { coords: coords };
	}
	coords = allBlocks[0].coords;

	ctx.fillStyle = '#000 ';
	ctx.fillRect(coords._x, coords._y, coords.x, coords.y);
}

function dislpayScore() {
	ctx.fillStyle = 'white';
	ctx.font = `${fontSize}px Arial`;
	ctx.clearRect(0, 0, innerWidth, fontSize + 1);
	ctx.fillText(`${score}`, innerWidth / 2 - ctx.measureText(`${score}`).width / 2, fontSize);
}

window.addEventListener('keypress', (e) => {
	if ((e.key = 'Space')) {
		if (allBlocks.length) allBlocks[allBlocks.length - 1].place();
	}
});

window.addEventListener('resize', () => {
	location.reload(false);
});

if (canvas.width >= 930 && canvas.height >= 730) {
	setGround(true);
	dislpayScore();
	start();
} else {
	const info = 'Oops! This game needs bigger browser window!';
	ctx.fillStyle = 'white';
	ctx.font = '20px Arial';

	ctx.fillText(info, innerWidth / 2 - ctx.measureText(info).width / 2, innerHeight / 2);
}
