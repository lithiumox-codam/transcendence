<script>
	import { getContext, onMount } from 'svelte';

	const ws = getContext('ws');
	const grid_size = 100;
	let canvas, ctx, cell_size;
	let stim = $state({
		grid: Array.from({ length: grid_size }, () =>
			Array.from({ length: grid_size }, () => ({ state: 0, intensity: 0 }))
		)
	});
	let viewers = $state(0);

	function calculateCellSize() {
		const container = document.querySelector('.container');
		const size = Math.min(container.clientWidth, container.clientHeight);
		cell_size = size / grid_size;
		canvas.width = size;
		canvas.height = size;
	}

	function getColor(intensity) {
		const hue = (intensity * 360) % 360;
		return `hsl(${hue}, 100%, 50%)`;
	}

	function drawGrid() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < grid_size; i++) {
			for (let j = 0; j < grid_size; j++) {
				const cell = stim.grid[i][j];
				if (cell.state === 1) {
					cell.intensity = 1;
				} else {
					cell.intensity = Math.max(0, cell.intensity - 0.05); // Reduced afterglow
				}

				if (cell.intensity > 0) {
					ctx.fillStyle = getColor(cell.intensity);
					ctx.fillRect(j * cell_size, i * cell_size, cell_size, cell_size);
				}
			}
		}
		requestAnimationFrame(drawGrid);
	}

	onMount(() => {
		canvas = document.getElementById('gameCanvas');
		ctx = canvas.getContext('2d');

		const resizeCanvas = () => {
			calculateCellSize();
		};

		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
		requestAnimationFrame(drawGrid);

		const remove = ws.addListener('count', (event) => {
			if (event.changes) {
				event.changes.forEach(({ i, j, state }) => {
					stim.grid[i][j].state = state;
				});
			}
			if (event.type === 'viewer_update') {
				viewers = event.viewers;
			}
		});

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			remove();
		};
	});
</script>

<div class="container">
	<div class="game-container">
		<canvas id="gameCanvas"></canvas>
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100vw;
		height: 100vh;
		align-items: center;
		justify-content: center;
	}
	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.viewer-count {
		color: #fff;
		font-size: 1.2rem;
		font-family: monospace;
	}
	canvas {
		border: 1px solid #fff;
	}
</style>
