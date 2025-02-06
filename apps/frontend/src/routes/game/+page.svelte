<script lang="ts">
import { onMount } from "svelte";

let canvas = $state<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D;

// Reactive state using new $state() syntax
const paddleHeight = 80;
const paddleWidth = 10;
const ballSize = 8;
const victoryScore = 7;

const leftPaddle = $state({ y: 200 });
const rightPaddle = $state({ y: 200 });
const ball = $state({ x: 400, y: 300, dx: 3, dy: 3, radius: ballSize });
let scoreLeft = $state(0);
let scoreRight = $state(0);
let gameOver = $state(false);

// Reactive key states using object
const keysPressed = $state<Record<string, boolean>>({});

// Game loop control
let animationFrame: number;

$effect(() => {
  const context = canvas?.getContext("2d");
  if (context) {
    ctx = context;
  } else {
    throw new Error("Failed to get 2D context");
  }
  animationFrame = requestAnimationFrame(gameLoop);

  const handleKey = (e: KeyboardEvent, pressed: boolean) => {
    e.preventDefault();
    keysPressed[e.key] = pressed;
  };

  window.addEventListener("keydown", (e) => handleKey(e, true));
  window.addEventListener("keyup", (e) => handleKey(e, false));

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener("keydown", (e) => handleKey(e, true));
    window.removeEventListener("keyup", (e) => handleKey(e, false));
  };
});

function updatePaddles() {
  if (!canvas) return;
  if (keysPressed.w && leftPaddle.y > 0) leftPaddle.y -= 5;
  if (keysPressed.s && leftPaddle.y < canvas.height - paddleHeight)
    leftPaddle.y += 5;

  if (keysPressed.ArrowUp && rightPaddle.y > 0) rightPaddle.y -= 5;
  if (keysPressed.ArrowDown && rightPaddle.y < canvas.height - paddleHeight)
    rightPaddle.y += 5;
}

function updateBall() {
  if (!canvas) return;
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top/bottom collision
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle collisions
  if (
    ball.x - ball.radius < paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    ball.dx *= -1.1;
    ball.dy *= 1.1;
    ball.x = paddleWidth + ball.radius;
  }

  if (
    ball.x + ball.radius > canvas.width - paddleWidth &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    ball.dx *= -1.1;
    ball.dy *= 1.1;
    ball.x = canvas.width - paddleWidth - ball.radius;
  }

  // Score points
  if (ball.x < 0) {
    scoreRight++;
    if (scoreRight >= victoryScore) gameOver = true;
    resetBall();
  }
  if (ball.x > canvas.width) {
    scoreLeft++;
    if (scoreLeft >= victoryScore) gameOver = true;
    resetBall();
  }
}

function resetBall() {
  if (!canvas) return;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = Math.random() > 0.5 ? 4 : -4;
  ball.dy = Math.random() * 4 - 2;
}

function draw() {
  if (!canvas) return;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(0, leftPaddle.y, paddleWidth, paddleHeight);
  ctx.fillRect(
    canvas.width - paddleWidth,
    rightPaddle.y,
    paddleWidth,
    paddleHeight,
  );

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "48px Arial";
  ctx.fillText(scoreLeft.toString(), canvas.width / 4, 50);
  ctx.fillText(scoreRight.toString(), (canvas.width * 3) / 4, 50);
}

function gameLoop() {
  updatePaddles();
  updateBall();
  draw();
  animationFrame = requestAnimationFrame(gameLoop);
}

function restartGame() {
  scoreLeft = 0;
  scoreRight = 0;
  gameOver = false;
  resetBall();
  leftPaddle.y = 200;
  rightPaddle.y = 200;
  animationFrame = requestAnimationFrame(gameLoop);
}
</script>
  
  <div class="game-container">
	{#if gameOver}
	  <div class="game-over">
		<h2>Game Over!</h2>
		<p>{scoreLeft} - {scoreRight}</p>
		<button onclick={restartGame}>Play Again</button>
	  </div>
	{:else}
	  <canvas
		bind:this={canvas}
		width={800}
		height={400}
		class="pong-canvas"
	  ></canvas>
	{/if}
  </div>
  
  <style>
	  :global(body) {
    background: black;
    margin: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    font-family: Arial, sans-serif;
  }
	.pong-canvas {
	  border: 2px solid white;
	  background: black;
	}
	canvas {
	  margin: 0 auto;
	  display: block;
	}

	.game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: rgba(0, 0, 0, 0.8);
    padding: 2rem;
    border-radius: 10px;
    border: 2px solid white;
  }

  	button {
    background: white;
    color: black;
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 1.2rem;
    cursor: pointer;
    border-radius: 5px;
    margin-top: 1rem;
  }

  	button:hover {
    background: #ddd;
  }
  </style>