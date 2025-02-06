<script lang="ts">
import * as BABYLON from "babylonjs";

let canvas = $state<HTMLCanvasElement>();
let engine = $state<BABYLON.Engine>();
let scene = $state<BABYLON.Scene>();

// Reactive state using new $state() syntax
const ballSize = 8;
const victoryScore = 7;
const upperBound = 10;
const lowerBound = -10;

let leftPaddle = $state<BABYLON.Mesh>();
let rightPaddle = $state<BABYLON.Mesh>();
let ball = $state<BABYLON.Mesh>();

let ballVelocity = $state<BABYLON.Vector3>();
let collisionCooldown = $state(0);

let scoreLeft = $state(0);
let scoreRight = $state(0);
let gameOver = $state(false);
let winner = $state("");

// Reactive key states using object
const keysPressed = $state<Record<string, boolean>>({});

$effect(() => {
  if (!canvas) return;
  engine = new BABYLON.Engine(canvas, true);
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI * 0.75,
    50,
    BABYLON.Vector3.Zero(),
    scene,
  );
  const neonMaterial = new BABYLON.StandardMaterial("neonMaterial", scene);
  neonMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  // Create solid borders
  const borderMaterial = new BABYLON.StandardMaterial("borderMat", scene);
  borderMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // White glow
  borderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black base

  const createDashedLine = () => {
    const dashCount = 10;
    const dashHeight = 1;
    const gap = 1;

    for (let i = 0; i < dashCount; i++) {
      const dash = BABYLON.MeshBuilder.CreateBox(
        "dash",
        {
          height: dashHeight,
          width: 0.5,
          depth: 0.5,
        },
        scene,
      );
      dash.position.y = (i - dashCount / 2) * (dashHeight + gap);
      dash.material = neonMaterial.clone("dashMaterial");
    }
  };

  createDashedLine();

  // Create 4 border walls
  const createBorder = (position: BABYLON.Vector3, size: BABYLON.Vector3) => {
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

  // Top border
  createBorder(
    new BABYLON.Vector3(0, upperBound + 0.5, 0),
    new BABYLON.Vector3(42, 1, 1),
  );

  // Bottom border
  createBorder(
    new BABYLON.Vector3(0, lowerBound - 0.5, 0),
    new BABYLON.Vector3(42, 1, 1),
  );

  // Left border
  //   createBorder(new BABYLON.Vector3(-21, 0, 0), new BABYLON.Vector3(1, 22, 1));

  // Right border
  //   createBorder(new BABYLON.Vector3(21, 0, 0), new BABYLON.Vector3(1, 22, 1));

  //   border.material.wireframe = true; // Make it a wireframe
  //   glowLayer.addExcludedMesh(border); // Optional: exclude from glow if too bright

  const light = new BABYLON.PointLight(
    "light",
    new BABYLON.Vector3(0, 20, -10),
    scene,
  );

  const paddleWidth = 1;
  const paddleHeight = 4;
  const paddleDepth = 1;

  leftPaddle = BABYLON.MeshBuilder.CreateBox(
    "leftPaddle",
    { width: paddleWidth, height: paddleHeight, depth: paddleDepth },
    scene,
  );
  light;
  leftPaddle.position.x = -20;
  leftPaddle.material = neonMaterial;

  rightPaddle = BABYLON.MeshBuilder.CreateBox(
    "rightPaddle",
    { width: paddleWidth, height: paddleHeight, depth: paddleDepth },
    scene,
  );
  rightPaddle.position.x = 20;
  rightPaddle.material = neonMaterial;

  ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
  ball.position = BABYLON.Vector3.Zero();
  ballVelocity = new BABYLON.Vector3(0.1, 0.07, 0);
  ball.material = neonMaterial;

  const glowLayer = new BABYLON.GlowLayer("glow", scene);
  glowLayer.intensity = 0.5;

  const handleKey = (e: KeyboardEvent, pressed: boolean) => {
    e.preventDefault();
    keysPressed[e.key] = pressed;
  };

  window.addEventListener("resize", () => engine?.resize());
  window.addEventListener("keydown", (e) => handleKey(e, true));
  window.addEventListener("keyup", (e) => handleKey(e, false));

  engine.runRenderLoop(() => {
    updatePaddles();
    updateBall();
    scene?.render();
  });

  return () => {
    engine?.dispose();
    window.removeEventListener("keydown", (e) => handleKey(e, true));
    window.removeEventListener("keyup", (e) => handleKey(e, false));
  };
});

function updatePaddles() {
  if (gameOver || !leftPaddle || !rightPaddle) return;
  const moveSpeed = 0.3;
  if (keysPressed.w && leftPaddle.position.y < 8) {
    leftPaddle.position.y += moveSpeed;
  }
  if (keysPressed.s && leftPaddle.position.y > -8) {
    leftPaddle.position.y -= moveSpeed;
  }
  if (keysPressed.ArrowUp && rightPaddle.position.y < 8) {
    rightPaddle.position.y += moveSpeed;
  }
  if (keysPressed.ArrowDown && rightPaddle.position.y > -8) {
    rightPaddle.position.y -= moveSpeed;
  }
}

function resetBall() {
  if (!ball || !ballVelocity) return;
  ball.position = BABYLON.Vector3.Zero();
  ballVelocity.x = Math.random() < 0.5 ? 0.1 : -0.1;
  ballVelocity.y = Math.random() < 0.5 ? 0.07 : -0.07;
}

function updateBall() {
  if (gameOver || !ball || !leftPaddle || !rightPaddle || !ballVelocity) return;
  ball.position.addInPlace(ballVelocity);
  // Define vertical boundaries.
  if (ball.position.y > upperBound || ball.position.y < lowerBound) {
    ballVelocity.y *= -1;
  }
  // Check paddle collisions.
  if (collisionCooldown <= 0) {
    if (ball.intersectsMesh(leftPaddle, false)) {
      ballVelocity.x = Math.abs(ballVelocity.x) * 1.05;
      collisionCooldown = 10; // Set cooldown frames
    }
    if (ball.intersectsMesh(rightPaddle, false)) {
      ballVelocity.x = -Math.abs(ballVelocity.x) * 1.05;
      collisionCooldown = 10;
    }
  } else {
    collisionCooldown--;
  }
  if (ball.position.x < -21) {
    scoreRight++;
    resetBall();
    if (scoreRight >= victoryScore) {
      gameOver = true;
      winner = "Right";
    }
  }
  if (ball.position.x > 21) {
    scoreLeft++;
    resetBall();
    if (scoreLeft >= victoryScore) {
      gameOver = true;
      winner = "Left";
    }
  }
}
</script>

<div class="absolute top-0 left-0 right-0 flex justify-between p-4 text-white text-4xl font-mono z-10 [text-shadow:0_0_10px_#fff]">
    <div>{scoreLeft}</div>
    <div class="opacity-50">|</div>
    <div>{scoreRight}</div>
</div>

{#if gameOver}
<div class="absolute inset-0 grid place-items-center bg-black/80 z-20">
	<div class="text-center">
		<h2 class="text-6xl text-white mb-8 animate-pulse">
			{winner} Wins!
		</h2>
		<button
			onclick={() => {
				scoreLeft = 0;
				scoreRight = 0;
				gameOver = false;
				winner = "";
				resetBall();
			}}
			class="px-8 py-4 text-2xl bg-transparent border-2 border-white/50 rounded-lg
				   text-white hover:bg-white/10 transition-all backdrop-blur-sm"
		>
			Play Again
		</button>
	</div>
</div>
{/if}

<canvas bind:this={canvas} class="z-0" style="width: 100%; height: 100vh; display: block;"></canvas> -->