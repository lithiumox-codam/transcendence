<script lang="ts">
	import { goto } from "$app/navigation";

	let letters = $state(Array.from("TRANCENDENCE"));
	let letterStates = $state(letters.map(() => false));

	$effect(() => {
		const letterInterval = setInterval(
			() => {
				letters.forEach((_, i) => {
					setTimeout(() => {
						letterStates[i] = !letterStates[i];
					}, i * 100);
				});
			},
			letters.length * 100 + 1000,
		);
		return () => clearInterval(letterInterval);
	});

	function handlePlayNow() {
		const token = localStorage.getItem("token");
		if (token) {
			goto("/stats"); // Redirect to stats page if token exists
		} else {
			goto("/login"); // Redirect to login page if no token
		}
	}
</script>

<main
	class="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
>
	<div class="absolute inset-0 bg-black">
		<!-- Animated grid background -->
		<div
			class="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#4a55681a_1px,transparent_1px),linear-gradient(to_bottom,#4a55681a_1px,transparent_1px)] opacity-50 animate-[backgroundPan_20s_linear_infinite]"
		></div>

		<!-- Pulsing center glow -->
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
		></div>

		<!-- Floating hexagons -->
		<div
			class="absolute left-1/4 top-1/3 w-16 h-16 bg-cyan-500/10 clip-hexagon animate-float"
		>
			<div class="absolute inset-0 bg-cyan-500/20 clip-hexagon"></div>
		</div>
		<div
			class="absolute right-1/4 bottom-1/4 w-24 h-24 bg-purple-500/10 clip-hexagon animate-float-delayed"
		>
			<div class="absolute inset-0 bg-purple-500/20 clip-hexagon"></div>
		</div>
	</div>

	<div class="relative z-10 text-center">
		<h1
			class="text-4xl md:text-6xl font-extrabold mb-6 tracking-wider text-white pb-10"
		>
			{#each letters as letter, i}
				<span
					class="inline-block transition-transform duration-300 {letterStates[
						i
					]
						? 'scale-110 rotate-6 retro-glow'
						: ''}"
				>
					{letter === " " ? "\u00A0" : letter}
				</span>
			{/each}
		</h1>

		<!-- Updated Play Now button -->
		<button
			class="live-button relative inline-block px-10 py-5 bg-black border border-white/30 text-white font-bold uppercase tracking-wide rounded-lg overflow-hidden transform transition-transform duration-200 hover:scale-105"
			onclick={handlePlayNow}
		>
			<span class="relative z-10 animate-pulseButton">Play now!</span>
			<!-- Isometric glowing overlay -->
			<div
				class="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1))] bg-[length:20px_20px] animate-isometric"
			></div>
		</button>
	</div>
</main>

<div class="flex items-center justify-between px-4 py-2 min-h-[200vh]"></div>

<style global>
	@keyframes backgroundPan {
		0% {
			transform: scale(1) translate(0, 0);
		}
		50% {
			transform: scale(1.05) translate(10px, 10px);
		}
		100% {
			transform: scale(1) translate(0, 0);
		}
	}

	@keyframes slideOverlay {
		0% {
			transform: translateX(-100%);
		}
		50% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes neon {
		from {
			text-shadow:
				0 0 5px #0ff,
				0 0 10px #0ff,
				0 0 20px #0ff,
				0 0 30px #f0f,
				0 0 40px #f0f,
				0 0 55px #f0f,
				0 0 75px #f0f;
		}
		to {
			text-shadow:
				0 0 10px #0ff,
				0 0 20px #0ff,
				0 0 30px #0ff,
				0 0 40px #f0f,
				0 0 50px #f0f,
				0 0 65px #f0f,
				0 0 100px #f0f;
		}
	}

	@keyframes flicker {
		0% {
			opacity: 0.9;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.8;
		}
	}

	@keyframes float {
		0% {
			transform: translateY(0) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
		}
		100% {
			transform: translateY(0) rotate(360deg);
		}
	}

	@keyframes isometric {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 20px 20px;
		}
	}

	@keyframes pulseButton {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
		}
	}

	@keyframes buttonGlow {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.5;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.1);
			opacity: 0.7;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.5;
		}
	}

	.clip-hexagon {
		clip-path: polygon(
			50% 0%,
			100% 25%,
			100% 75%,
			50% 100%,
			0% 75%,
			0% 25%
		);
	}

	.animate-float {
		animation: float 8s ease-in-out infinite;
	}

	.animate-float-delayed {
		animation: float 10s ease-in-out infinite 2s;
	}

	.retro-glow {
		animation: neon 1.5s ease-in-out infinite alternate;
		text-shadow:
			0 0 8px #0ff,
			0 0 16px #0ff,
			0 0 24px #f0f,
			0 0 32px #f0f;
	}

	/* New live-button styling for a pulsating background glow */
	.live-button {
		position: relative;
		z-index: 0;
		overflow: hidden;
	}
	.live-button::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 120%;
		height: 120%;
		background: radial-gradient(
			circle,
			rgba(0, 255, 255, 0.2) 0%,
			rgba(255, 0, 255, 0.2) 100%
		);
		filter: blur(20px);
		opacity: 0.5;
		animation: buttonGlow 3s ease-in-out infinite;
		z-index: -1;
	}

	/* Optional: Enhance hover effect with a glowing box-shadow */
	.live-button:hover {
		box-shadow: 0 0 25px rgba(255, 255, 255, 0.7);
		transition: box-shadow 0.3s ease-in-out;
	}
</style>
