<script lang="ts">
	import {
		GameEngine,
		type GameState,
	} from "../../../../../packages/game/src/logic";
	import { vec2 } from "gl-matrix";

	import * as BABYLON from "babylonjs";
	import { onMount } from "svelte";

	// Game Engine Integration
	const gameEngine = new GameEngine(2);
	let gameState = $state<GameState>(gameEngine.getState());

	// Babylon.js Setup
	let canvas = $state<HTMLCanvasElement>();
	let engine = $state<BABYLON.Engine>();
	let scene = $state<BABYLON.Scene>();

	// Testing Interface
	let showDebug = $state(false);
	let testScoreLeft = $state(0);
	let testScoreRight = $state(0);

	// Reactive state
	const ballSize = 8;
	const victoryScore = 7;
	const upperBound = 10;
	const lowerBound = -10;

	// Babylon objects
	let ground = $state<BABYLON.Mesh>();
	let leftPaddle = $state<BABYLON.Mesh>();
	let rightPaddle = $state<BABYLON.Mesh>();
	let ball = $state<BABYLON.Mesh>();

	// Testing controls
	function simulateScore(player: "left" | "right") {
		gameEngine.forceScore(player);
		gameState = gameEngine.getState();
	}

	function resetTest() {
		gameEngine.resetGame();
		gameState = gameEngine.getState();
	}

	// Modified initBabylon to use gameState
	function initBabylon() {
		if (!canvas) return;

		engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);

		// Setup camera, lights, materials...
		// Keep your existing visual setup but use gameState for positions

		// Example paddle setup
		leftPaddle = BABYLON.MeshBuilder.CreateBox(
			"leftPaddle",
			{ width: 1, height: 4, depth: 1 },
			scene,
		);

		// Similar setup for rightPaddle and ball...
	}

	// Updated game loop
	onMount(() => {
		if (!canvas) return;
		initBabylon();

		const frameLoop = () => {
			gameEngine.update(16); // 60fps delta
			gameState = gameEngine.getState();

			// Update Babylon.js objects from gameState
			if (leftPaddle)
				leftPaddle.position.y = gameState.players.get("left")?.position. || 0;
			if (rightPaddle)
				rightPaddle.position.y = gameState.players.get("right")?.y || 0;
			if (ball)
				ball.position.set(
					gameState.ball.pos.x,
					gameState.ball.pos.y,
					0,
				);

			scene?.render();
			requestAnimationFrame(frameLoop);
		};

		frameLoop();

		return () => engine?.dispose();
	});

	// Input handling
	const keysPressed = $state<Record<string, boolean>>({});
	window.addEventListener("keydown", (e) => {
		keysPressed[e.key] = true;
		// Map keys to engine inputs
		if (e.key === "w") gameEngine.handleInput("left", "up");
		if (e.key === "s") gameEngine.handleInput("left", "down");
		if (e.key === "ArrowUp") gameEngine.handleInput("right", "up");
		if (e.key === "ArrowDown") gameEngine.handleInput("right", "down");
	});

	window.addEventListener("keyup", (e) => {
		keysPressed[e.key] = false;
	});
</script>

<div class="relative h-screen w-full">
	<!-- Score Display -->
	<div
		class="absolute top-0 left-0 right-0 flex justify-between p-4 text-white text-4xl font-mono z-10 [text-shadow:0_0_10px_#fff]"
	>
		<div>{gameState.scores.left}</div>
		<div class="opacity-50">|</div>
		<div>{gameState.scores.right}</div>
	</div>

	<!-- Testing Interface -->
	{#if showDebug}
		<div
			class="absolute top-20 left-4 bg-black/50 p-4 rounded-lg space-y-2"
		>
			<h3 class="text-white font-bold mb-2">Testing Controls</h3>
			<div class="flex gap-2">
				<button
					on:click={() => simulateScore("left")}
					class="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-white"
				>
					+ Left Score
				</button>
				<button
					on:click={() => simulateScore("right")}
					class="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
				>
					+ Right Score
				</button>
				<button
					on:click={resetTest}
					class="px-3 py-1 bg-gray-500 rounded hover:bg-gray-600 text-white"
				>
					Reset Test
				</button>
			</div>
			<div class="text-white">
				<p>
					Ball Position: {gameState.ball.pos.x.toFixed(2)}, {gameState.ball.pos.y.toFixed(
						2,
					)}
				</p>
				<p>
					Left Paddle: {gameState.players.get("left")?.y.toFixed(2)}
				</p>
				<p>
					Right Paddle: {gameState.players.get("right")?.y.toFixed(2)}
				</p>
			</div>
		</div>
	{/if}

	<!-- Toggle Debug -->
	<button
		on:click={() => (showDebug = !showDebug)}
		class="absolute top-4 right-4 p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
	>
		{showDebug ? "Hide Debug" : "Show Debug"}
	</button>

	<!-- Game Over Modal -->
	{#if gameState.gameOver}
		<div class="absolute inset-0 grid place-items-center bg-black/80 z-20">
			<div class="text-center">
				<h2 class="text-6xl text-white mb-8 animate-pulse">
					{gameState.winner} Wins!
				</h2>
				<button
					on:click={() => gameEngine.resetGame()}
					class="px-8 py-4 text-2xl bg-transparent border-2 border-white/50 rounded-lg
						   text-white hover:bg-white/10 transition-all backdrop-blur-sm"
				>
					Play Again
				</button>
			</div>
		</div>
	{/if}

	<canvas bind:this={canvas} class="z-0 w-full h-full" />
</div>

<style>
	/* Additional custom styles if needed */
	canvas {
		touch-action: none;
		outline: none;
	}
</style>
