<script>
	import { onMount } from 'svelte';
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';

	let mouse = $state({ x: 0, y: 0 });
	let mouseEnter = $state(false);

	const dotWidthWeight = 0.4;
	const dotHeightWeight = 0.6;
	const dotSizePercentage = 1.9;

	const paddleHeightPercentage = 0.26;
	let rightPaddleY = $state((innerHeight.current - innerHeight.current * paddleHeightPercentage) / 2);
	let leftPaddleY = $state((innerHeight.current - innerHeight.current * paddleHeightPercentage) / 2);

	const baseSpeed = 0.0045; // Base speed multiplier
	let paddleSpeed = $state(innerHeight.current * baseSpeed); // Dynamically calculated speed

	let leftDirection = $state(Math.random() > 0.5 ? 1 : -1);
	let rightDirection = $state(Math.random() > 0.5 ? 1 : -1);
	onMount(() => {
		paddleSpeed = innerHeight.current * baseSpeed;

		function movePaddles() {
			if (Math.random() < 0.001) leftDirection *= -1;
			if (Math.random() < 0.001) rightDirection *= -1;

			leftPaddleY += leftDirection * paddleSpeed;
			rightPaddleY += rightDirection * paddleSpeed;

			if (leftPaddleY <= 0 || leftPaddleY >= innerHeight.current - innerHeight.current * paddleHeightPercentage) {
				leftDirection *= -1;
			}
			if (rightPaddleY <= 0 || rightPaddleY >= innerHeight.current - innerHeight.current * paddleHeightPercentage) {
				rightDirection *= -1;
			}

			requestAnimationFrame(movePaddles);
		}

		movePaddles()

	});

	let showLearnMore = $state(false);

	function redirectToLogin() {
		window.location.href = '/login';
	}

	function showLearnMoreContent() {
		document.body.style.overflow = 'hidden';
		showLearnMore = true;
	}

	function goBack() {
		showLearnMore = false;
        leftPaddleTouched = false;
        rightPaddleTouched = false;
	}

	function handlePaddleInteraction(callback) {
		setTimeout(() => {
			callback();
		}, 200);
	}

	let isHoveringPaddle = $state(false);
	let leftPaddleTouched = $state(false);
	let rightPaddleTouched = $state(false);


	onMount(() => {
		document.body.style.overflow = 'hidden';
	});

	
</script>

<svelte:window
	onmousemove={(e) => {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		mouseEnter = true;
	}}
/>

<svelte:body
  onmouseenter={() => (mouseEnter = true)}
  onmouseleave={() => (mouseEnter = false)}
/>

{#if mouseEnter && !isHoveringPaddle}
<div 
	class="dot" 
	style="
		left: {mouse.x}px; 
		top: {mouse.y}px; 
		height: {(innerWidth.current * dotWidthWeight + innerHeight.current * dotHeightWeight) * (dotSizePercentage / 100)}px; 
		width: {(innerWidth.current * dotWidthWeight + innerHeight.current * dotHeightWeight) * (dotSizePercentage / 100)}px"
></div>
{/if}	

<div class="page" style:transform={showLearnMore ? 'translateY(-100vh)' : 'translateY(0)'}>
	<h1
		class="title"
		style="transform: translateX({mouse.x * 0.02}px) translateY({mouse.y * 0.02}px);"
	>
		Transcendence
	</h1>

	<p class="subtitle">42</p>

	<div
	class="paddle left"
	role="button"
	on:mouseenter={() => (isHoveringPaddle = true) && (leftPaddleTouched = true) && handlePaddleInteraction(redirectToLogin)}
    on:mouseleave={() => (isHoveringPaddle = false)}
	style="
		top: {leftPaddleY}px; 
		height: {innerHeight.current * paddleHeightPercentage}px; 
		width: {innerWidth.current * 0.03}px;
		background-color: {leftPaddleTouched ? '#e6007a' : 'white'};"
	>
		<span
			class="paddle-text"
			style="
				color: {leftPaddleTouched ? 'white' : '#e6007a'};
				font-size: {innerHeight.current * paddleHeightPercentage * 0.1}px;" 
		>
			Login/Register
		</span>
	</div>

	<div
		class="paddle right"
		role="button"
		on:mouseenter={() => (isHoveringPaddle = true) && (rightPaddleTouched = true) && handlePaddleInteraction(showLearnMoreContent)}
		on:mouseleave={() => (isHoveringPaddle = false)}
		style="
			top: {rightPaddleY}px; 
			height: {innerHeight.current * paddleHeightPercentage}px; 
			width: {innerWidth.current * 0.03}px;
			background-color: {rightPaddleTouched ? '#e6007a' : 'white'};"
	>
		<span
			class="paddle-text"
			style="
				color: {rightPaddleTouched ? 'white' : '#e6007a'};
				font-size: {innerHeight.current * paddleHeightPercentage * 0.12}px;"
		>
			See More
		</span>
	</div>

</div>

<div class="learn-more" style:transform={showLearnMore ? 'translateY(0)' : 'translateY(100vh)'}>
	<h1>About Transcendence</h1>
	<p>
		This is the 'More Information' section of the page.
	</p>

	<button class="go-back" on:click={goBack}>Go Back</button>
</div>

<style>
	:global(:root) {
		cursor: none;
	}

	body {
		margin: 0;
		overflow: hidden;
		font-family: 'Arial', sans-serif;
		background: linear-gradient(135deg, #1a1a1a, #000);
		color: rgb(255, 255, 255);
	}

	.page, .learn-more {
		position: fixed;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		position: relative;
		overflow: hidden;
		transition: transform 1s ease-in-out;
	}

	.title {
		font-size: 5rem;
		font-weight: bold;
		text-align: center;
		color: #fff;
		text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
		transition: transform 0.1s linear;
	}

	.title:hover {
		color: #e6007a;
		text-shadow: 0 0 40px #e6007a;
		transform: scale(1.1);
	}

	.subtitle {
		font-size: 1.5rem;
		color: #999;
		margin-top: 20px;
		opacity: 0.8;
	}

	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, #e6007a, #8e00e6, #00b894, #000);
		animation: moveBg 20s infinite linear;
		z-index: -1;
	}

	@keyframes moveBg {
		0% {
			transform: translate(-20%, -20%);
		}
		50% {
			transform: translate(20%, 20%);
		}
		100% {
			transform: translate(-20%, -20%);
		}
	}

	.dot {
		position: absolute;
		background: #ffffff;
		border-radius: 50%;
		pointer-events: none;
		z-index: 1000;
	}
  
	.paddle {
    position: absolute;
    width: 20px;
    border-radius: 5px;
    display: flex; 
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: background-color 0.3s ease, transform 0.1s linear, box-shadow 0.3s ease;
}

	.paddle.left {
	  left: 0;
	}
  
	.paddle.right {
	  right: 0;
	}

	.paddle:hover {
		background: #e6007a; 
		box-shadow: 0 0 20px #e6007a; 
		transform: scale(1.1); 
	}

	.paddle-text {
		writing-mode: vertical-rl; 
		transform: rotate(180deg);
		font-size: 1rem;
		font-weight: bold;
		text-align: center;
		transition: color 0.3s ease, text-shadow 0.3s ease;
		pointer-events: none;
		line-height: 1.2;
		text-shadow: 0 0 15px #e6007a, 0 0 30px #e6007a, 0 0 45px #e6007a; 
	}

	.paddle.left:hover .paddle-text, .paddle.right:hover .paddle-text {
		text-shadow: 0 0 10px white, 0 0 20px white, 0 0 30px white; 
	}
	
	.paddle.right .paddle-text {
		transform: rotate(0deg);
	}

	.learn-more {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: absolute; 
		top: 0;
		left: 0;
		width: 100vw; 
		height: 100vh; 
		background: linear-gradient(135deg, #e6007a, #00b894);
		color: white;
		text-align: center;
		padding: 2rem;
		transition: transform 1s ease-in-out; 
	}

	.go-back {
		margin-top: 20px;
		padding: 10px 20px;
		font-size: 1rem;
		background: #ffffff;
		border: none;
		color: #333;
		border-radius: 5px;
		cursor: none;
		transition: background 0.2s;
	}

	.go-back:hover {
		background: #ddd;
	}
</style>
