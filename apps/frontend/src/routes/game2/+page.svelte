<script lang="ts">
	import * as BABYLON from "babylonjs";
	import { onMount } from "svelte";
	import { playerInputs, type GameState, type Player } from "@repo/game";
	import { client } from "$lib/trpc";
	import { vec2 } from "gl-matrix";
	// import { players } from "@repo/database";

	const ARENA_WIDTH = 40;
	const PADDLE_LENGTH = 8;
	const PADDLE_WIDTH = 1;
	const BALL_RADIUS = 1;
	const axisX = 0;
	const axisY = 1;

	let arenaHeight: 30 | 40 = 30;
	let paddleCount: 2 | 4 = 2;

	let canvas = $state<HTMLCanvasElement>();
	let engine = $state<BABYLON.Engine>();
	let scene = $state<BABYLON.Scene>();

	let gameState = $state<GameState | null>(null);
	let playerId = $state<number | null>(null);
	let gameId = $state<number | null>(null);

	let ground = $state<BABYLON.Mesh>();
	let paddles = $state<BABYLON.Mesh[]>();
	let ball = $state<BABYLON.Mesh>();
	let ballLight = $state<BABYLON.PointLight>();

	let topBorder = $state<BABYLON.Mesh>();
	let bottomBorder = $state<BABYLON.Mesh>();

	const keysPressed = $state<Record<string, boolean>>({});

	async function startGame() {
		if (!gameId) {
			console.error("No gameId available");
			return;
		}
		try {
			await client.game.start.mutate(gameId);
			console.log("Game started successfully");
		} catch (error) {
			console.error("Error starting game:", error);
		}
	}

	onMount(() => {
		(async () => {
			const gameInfo = await client.game.create.mutate(2);

			if (!gameInfo) return;
			gameId = gameInfo.gameId;
			playerId = gameInfo.players.userId;

			await client.game.join.mutate(gameId);
			client.game.listen.subscribe(gameId, {
				onData: (data) => {
					console.log("received data", data);
					gameState = data;
				},
				onError: (error) => {
					console.error(error);
				},
			});
			if (!gameState) {
				return;
			}
		})();
		if (!canvas) return;
		initBabylon();
		if (!engine || !scene) return;
		window.addEventListener("resize", () => engine?.resize());
		engine.runRenderLoop(() => {
			updateScene();
			scene?.render();
		});

		const handleKey = (e: KeyboardEvent, pressed: boolean) => {
			e.preventDefault();
			if (keysPressed[e.key] === pressed) return;
			keysPressed[e.key] = pressed;
			if (!["w", "s", "ArrowUp", "ArrowDown"].includes(e.key)) return;
			const input = pressed
				? e.key === "w" || e.key === "ArrowUp"
					? playerInputs.up
					: e.key === "s" || e.key === "ArrowDown"
						? playerInputs.down
						: playerInputs.none
				: playerInputs.none;

			if (!gameId || !playerId) return;
			console.log("sending input", input);
			client.game.sendInput.mutate({
				gameId: gameId,
				playerId: playerId,
				input: input,
			});
		};

		window.addEventListener("resize", () => engine?.resize());
		window.addEventListener("keydown", (e) => handleKey(e, true));
		window.addEventListener("keyup", (e) => handleKey(e, false));

		return () => {
			engine?.dispose();
			window.removeEventListener("keydown", (e) => handleKey(e, true));
			window.removeEventListener("keyup", (e) => handleKey(e, false));
		};
	});

	function initBabylon() {
		if (!canvas) return;
		engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);
		scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
		const axes = new BABYLON.Debug.AxesViewer(scene, 2);

		const ambientLight = new BABYLON.HemisphericLight(
			"ambientLight",
			new BABYLON.Vector3(0, 1, 0),
			scene,
		);
		ambientLight.intensity = 0.1;

		const mirrorMaterial = new BABYLON.StandardMaterial(
			"mirrorMaterial",
			scene,
		);
		mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture(
			"mirror",
			512,
			scene,
			true,
		);
		mirrorMaterial.reflectionTexture.level = 1;
		ground = BABYLON.MeshBuilder.CreatePlane(
			"MirrorMesh",
			{ width: 200, height: 200 },
			scene,
		);
		ground.position.z = 0.5;
		ground.material = mirrorMaterial;
		const camera = new BABYLON.ArcRotateCamera(
			"camera",
			-Math.PI / 2,
			Math.PI * 0.75,
			50,
			BABYLON.Vector3.Zero(),
			scene,
		);
		// camera.attachControl(canvas, true);

		const neonMaterial = new BABYLON.StandardMaterial(
			"neonMaterial",
			scene,
		);
		neonMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
		initBorders();

		const createDashedLine = () => {
			const dashCount = 15;
			const dashHeight = 1;
			const gap = 1;

			for (let i = 0; i < dashCount; i++) {
				const dash = BABYLON.MeshBuilder.CreateBox(
					"dash",
					{
						height: dashHeight,
						width: 0.5,
						depth: 0.1,
					},
					scene,
				);
				dash.position.y =
					(i - dashCount / 2) * (dashHeight + gap) + 0.5;
				dash.material = neonMaterial.clone("dashMaterial");
			}
		};

		createDashedLine();

		neonMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

		const createPaddles = () => {
			if (!scene) return;
			const paddles = [];
			for (let i = 0; i < paddleCount; i++) {
				const paddle = BABYLON.MeshBuilder.CreateBox(
					`paddle${i}`,
					{
						width: PADDLE_WIDTH,
						height: PADDLE_LENGTH,
						depth: PADDLE_WIDTH,
					},
					scene,
				);
				paddle.material = neonMaterial;
				paddles.push(paddle);
			}
			return paddles;
		};
		paddles = createPaddles();

		if (!paddles) return;
		paddles[0].position.x = -ARENA_WIDTH / 2 + 1;
		paddles[1].position.x = ARENA_WIDTH / 2 - 1;
		// leftPaddle = BABYLON.MeshBuilder.CreateBox(
		// 	"leftPaddle",
		// 	{ width: PADDLE_WIDTH, height: PADDLE_LENGTH, depth: PADDLE_WIDTH },
		// 	scene,
		// );
		// leftPaddle.position.x = -(ARENA_WIDTH / 2) + 1;
		// leftPaddle.material = neonMaterial;

		// rightPaddle = BABYLON.MeshBuilder.CreateBox(
		// 	"rightPaddle",
		// 	{ width: PADDLE_WIDTH, height: PADDLE_LENGTH, depth: PADDLE_WIDTH },
		// 	scene,
		// );
		// rightPaddle.position.x = ARENA_WIDTH / 2 - 1;
		// rightPaddle.material = neonMaterial;
		const ballMaterial = new BABYLON.StandardMaterial(
			"ballMaterial",
			scene,
		);
		ballMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
		ballMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

		ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
		ball.position = BABYLON.Vector3.Zero();
		ball.material = ballMaterial;

		ballLight = new BABYLON.PointLight("ballLight", ball.position, scene);
		ballLight.diffuse = new BABYLON.Color3(1, 0, 0);
		ballLight.intensity = 0.4;
	}

	function initBorders() {
		if (!scene) return;
		const borderMaterial = new BABYLON.StandardMaterial("borderMat", scene);
		borderMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // White glow
		borderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black base

		const createBorder = (
			position: BABYLON.Vector3,
			size: BABYLON.Vector3,
		) => {
			const border = BABYLON.MeshBuilder.CreateBox(
				"border",
				{
					width: size.x,
					height: size.y,
					depth: size.z,
				},
				scene,
			);
			border.position = position;
			border.material = borderMaterial;
			return border;
		};
		topBorder = createBorder(
			new BABYLON.Vector3(0, arenaHeight / 2 + 0.5, 0),
			new BABYLON.Vector3(42, 1, 1),
		);

		bottomBorder = createBorder(
			new BABYLON.Vector3(0, -arenaHeight / 2 - 0.5, 0),
			new BABYLON.Vector3(42, 1, 1),
		);
	}

	function updateScene() {
		if (!gameState || !paddles || !ball || !ballLight) return;

		for (let i = 0; i < paddles.length; i++) {
			const paddle = paddles[i];
			const player = gameState.players[i];
			if (!player) continue;
			const axis = player.movementAxis === "x" ? axisX : axisY;
			if (axis === axisX) {
				paddle.position.x = player.position[axis];
			} else {
				paddle.position.y = player.position[axis];
			}
		}
		ball.position.x = gameState.ball.pos[axisX];
		ball.position.y = gameState.ball.pos[axisY];
		ballLight.position = ball.position;
	}
</script>

<div
	class="absolute top-0 left-0 right-0 flex justify-between p-4 text-white text-4xl font-mono z-10 [text-shadow:0_0_10px_#fff]"
>
	<div>{gameState?.players[0].score}</div>
	<div class="opacity-50">|</div>
	<div>{gameState?.players[1].score}</div>
</div>

<div class="absolute top-20 left-0 p-4 z-20">
	<button
		onclick={startGame}
		class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
	>
		Test Start Game
	</button>
</div>

{#if gameState?.gameOver}
	<div class="absolute inset-0 grid place-items-center bg-black/80 z-20">
		<div class="text-center">
			<h2 class="text-6xl text-white mb-8 animate-pulse">
				{gameState.ball.lastHit} Wins!
			</h2>
			<button
				onclick={() => {}}
				class="px-8 py-4 text-2xl bg-transparent border-2 border-white/50 rounded-lg
				   text-white hover:bg-white/10 transition-all backdrop-blur-sm"
			>
				Play Again
			</button>
		</div>
	</div>
{/if}

<canvas
	bind:this={canvas}
	class="z-0"
	style="width: 100%; height: 100vh; display: block;"
></canvas>
