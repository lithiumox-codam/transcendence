<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { json } from '@sveltejs/kit';
	import { getContext } from 'svelte';

	const ws = getContext('ws');

	let data = $state(null);
	let gameArea;
	let gameLoop;
	let mounted = false;
	let gameId = 1; // You'll want to get this from your game creation/joining logic

	// Game state variables with $state for reactivity
	let paddle1Y = $state(160);
	let paddle2Y = $state(160);
	let ballX = $state(400);
	let ballY = $state(200);
	let ballSpeedX = $state(2.5);
	let ballSpeedY = $state(1);

	// Constants
	const PADDLE_HEIGHT = 100;
	const PADDLE_WIDTH = 10;
	const GAME_WIDTH = 800;
	const GAME_HEIGHT = 400;
	const BALL_SIZE = 20;
	const SPEED_INCREASE = 1.05;
	const START_SPEED = 1;

	// Track pressed keys
	const keys = $state({
		w: false,
		s: false,
		ArrowUp: false,
		ArrowDown: false
	});

	function handleKeyDown(e) {
		if (e.key in keys) {
			e.preventDefault();
			keys[e.key] = true;
			sendInputs();
		}
	}

	function handleKeyUp(e) {
		if (e.key in keys) {
			e.preventDefault();
			keys[e.key] = false;
			sendInputs();
		}
	}

	function sendInputs() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send('pong', { type: 'game_input', inputs: keys });
		}
	}

	onMount(() => {
		const removeListener = ws.addListener('pong', (data) => {
			data = data;
			console.log('pong', data);
		});

		console.log('received game state:', data);
		if (data.type === 'game_state') {
			paddle1Y = data.paddle1_y;
			paddle2Y = data.paddle2_y;
			ballX = data.ball_x;
			ballY = data.ball_y;
			ballSpeedX = data.ball_speed_x;
			ballSpeedY = data.ball_speed_y;
		}

		if (browser) {
			document.addEventListener('keydown', (e) => {
				if (e.key in keys) {
					e.preventDefault();
					keys[e.key] = true;
					sendInputs();
				}
			});
			document.addEventListener('keyup', (e) => {
				if (e.key in keys) {
					e.preventDefault();
					keys[e.key] = false;
					sendInputs();
				}
			});
		}

		return () => {
			removeListener();
		};
	});
</script>

<div class="game-container">
	<div class="game-area" bind:this={gameArea}>
		<div class="paddle paddle-left" style="top: {paddle1Y}px"></div>
		<div class="paddle paddle-right" style="top: {paddle2Y}px"></div>
		<div class="ball" style="left: {ballX}px; top: {ballY}px"></div>
	</div>
</div>

<style>
	.game-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #333;
	}

	.game-area {
		position: relative;
		width: 800px;
		height: 400px;
		background: black;
		border: 1px solid white;
		overflow: hidden;
	}

	.paddle {
		position: absolute;
		width: 10px;
		height: 100px;
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
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 100%;
		transform: translate(-50%, -50%);
	}
</style>
