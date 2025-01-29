<script>
	import { onMount, onDestroy } from 'svelte';
	import { getContext } from 'svelte';

	const ws = getContext('ws');

	let gameArea;
	let gameAreaWidth = $state(800);
	let gameAreaHeight = $state(400);
	let scaleFactor = $state(1);
	let gameId = $state(1);

	// Game state variables
	let paddle1Y = $state(160);
	let paddle2Y = $state(160);
	let ballX = $state(400);
	let ballY = $state(200);
	let ballSpeedX = $state(2.5);
	let ballSpeedY = $state(1);

	let score1 = $state(0);
	let score2 = $state(0);
	let winner = $state(null);

	// Track pressed keys
	const keys = $state({
		w: false,
		s: false,
		ArrowUp: false,
		ArrowDown: false
	});

	function handleKeyDown(e) {
		if (e.key in keys && !keys[e.key]) {
			e.preventDefault();
			keys[e.key] = true;
			sendInputs();
		}
	}

	function handleKeyUp(e) {
		if (e.key in keys && keys[e.key]) {
			e.preventDefault();
			keys[e.key] = false;
			sendInputs();
		}
	}

	function sendInputs() {
		ws.send('pong', {
			type: 'game_input',
			inputs: keys
		});
	}

	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			const targetAspectRatio = 2;

			// Calculate dimensions maintaining aspect ratio
			const calculatedWidth = Math.min(width, height * targetAspectRatio);
			const calculatedHeight = calculatedWidth / targetAspectRatio;

			gameAreaWidth = calculatedWidth;
			gameAreaHeight = calculatedHeight;
			scaleFactor = calculatedWidth / 800; // Original game width
		});

		if (gameArea) {
			resizeObserver.observe(gameArea.parentElement);
		}

		const removeListener = ws.addListener('pong', (data) => {
			if (data.type === 'game_state') {
				paddle1Y = data.paddle1_y * gameAreaHeight;
				paddle2Y = data.paddle2_y * gameAreaHeight;
				ballX = data.ball_x * gameAreaWidth;
				ballY = data.ball_y * gameAreaHeight;
				ballSpeedX = data.ball_speed_x * scaleFactor;
				ballSpeedY = data.ball_speed_y * scaleFactor;
				score1 = data.score1;
				score2 = data.score2;
				winner = data.winner;
			} else if (data.type === 'game_end') {
				winner = data.winner;
			}
			console.log(data);
		});

		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			resizeObserver.disconnect();
			removeListener();
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	$effect(() => {
		document.documentElement.style.setProperty('--scale-factor', scaleFactor);
	});
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div class="game-container">
	<div class="scoreboard">
		<div class="score-box">
			<span class="score-label">Player 1</span>
			<span class="score-value">{score1}</span>
		</div>
		<div class="score-divider">-</div>
		<div class="score-box">
			<span class="score-label">Player 2</span>
			<span class="score-value">{score2}</span>
		</div>
	</div>

	<div class="game-wrapper">
		<div
			class="game-area"
			bind:this={gameArea}
			style="width: {gameAreaWidth}px; height: {gameAreaHeight}px;"
		>
			<div
				class="paddle paddle-left"
				style="top: {paddle1Y}px; height: {100 * scaleFactor}px; width: {10 * scaleFactor}px;"
			></div>

			<div
				class="paddle paddle-right"
				style="top: {paddle2Y}px; height: {100 * scaleFactor}px; width: {10 * scaleFactor}px;"
			></div>

			<div
				class="ball"
				style="left: {ballX}px; top: {ballY}px; width: {20 * scaleFactor}px; height: {20 *
					scaleFactor}px;"
			></div>

			{#if winner}
				<div class="winner-announcement">
					Player {winner} wins!
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:root {
		--scale-factor: 1;
	}

	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		padding: 0 2rem;
		height: 100vh;
		background: #333;
		overflow: hidden;
	}

	.scoreboard {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 1rem 2rem;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 12px;
		color: white;
		font-size: 2rem;
		font-weight: bold;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 20;
	}

	.score-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.score-label {
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.8;
	}

	.score-value {
		font-size: 3rem;
		font-weight: bold;
	}

	.score-divider {
		font-size: 2rem;
		opacity: 0.5;
	}

	.game-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 0 2rem;
		box-sizing: border-box;
	}

	.game-area {
		position: relative;
		background: black;
		border-style: solid;
		border-color: white;
		border-width: calc(2px * var(--scale-factor));
		border-radius: calc(8px * var(--scale-factor));
		overflow: visible;
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
	}

	.paddle {
		position: absolute;
		background: white;
	}

	.paddle-left {
		left: 0;
	}

	.paddle-right {
		right: 0;
	}

	.ball {
		position: absolute;
		background: white;
		border-radius: 50%;
		transform: translate(-50%, -50%);
	}

	.winner-announcement {
		position: absolute;
		top: 70%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: calc(2rem * var(--scale-factor)) calc(4rem * var(--scale-factor));
		border-radius: 12px;
		font-size: calc(2.5rem * var(--scale-factor));
		font-weight: bold;
		text-align: center;
		box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
		animation: fadeIn 0.5s ease-out;
		z-index: 10;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -60%);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%);
		}
	}

	@media (max-width: 1200px) {
		.game-wrapper {
			grid-template-columns: 1fr minmax(auto, 600px) 1fr;
		}
	}

	@media (max-width: 48em) {
		.game-wrapper {
			grid-template-columns: 1fr minmax(auto, 400px) 1fr;
		}

		.winner-announcement {
			font-size: calc(1.5rem * var(--scale-factor));
			padding: calc(1rem * var(--scale-factor)) calc(2rem * var(--scale-factor));
		}
	}
</style>
