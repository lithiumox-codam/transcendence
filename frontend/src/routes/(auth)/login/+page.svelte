<script>
	import logo from '$lib/images/svelte-logo.svg';
	import Logo42 from '$lib/components/42-white.svelte';
	import DotBounce from '$lib/components/DotBounce.svelte';
	import { onMount } from 'svelte';
	import client from '$lib/utils/axios';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let hasError = $state(false);
	let isSubmitting = $state(false);

	onMount(async () => {
		try {
			const res = await client.get('/user/profile/');
			if (res.status === 200) {
				history.back();
			} else {
				throw new Error('Failed to get profile');
			}
		} catch (e) {
			console.error(e);
		}
	});

	async function handleLogin(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const data = Object.fromEntries(formData);

		try {
			isSubmitting = true;
			const res = await fetch('https://localhost/api/auth/login/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			if (!res.ok) {
				throw new Error('Failed to login');
			} else {
				const json = await res.json();
				localStorage.setItem('access', json.access);
				localStorage.setItem('refresh', json.refresh);
				setTimeout(() => {
					isSubmitting = false;
					goto('/pong');
				}, 2500);
			}
		} catch (e) {
			hasError = true;
		}
	}
</script>

<div class="page-container">
	<img class="logo" src={logo} alt="Svelte Logo" />
	<div class="login-container">
		<form class="login-form" onsubmit={handleLogin}>
			<label for="username" class="label">Username</label>
			<input
				id="username"
				type="text"
				name="username"
				placeholder="Enter your username"
				class="input"
				required
			/>
			<label for="password" class="label">Password</label>
			<input
				id="password"
				type="password"
				name="password"
				placeholder="Enter your password"
				class="input"
				required
			/>
			<button type="submit" class={isSubmitting ? 'button-loading' : 'button'}>
				{#if isSubmitting}
					<DotBounce />
				{:else}
					Login
				{/if}
			</button>
		</form>
		<div class="spacer"></div>
		<button class="oauth-button">Login with <Logo42 /> </button>
	</div>
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: hsl(var(--background));
		gap: 1.5rem;
		padding: 1rem;
	}

	.logo {
		width: 4rem;
		height: auto;
	}

	.login-container {
		width: 100%;
		max-width: 24rem;
		background-color: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--card-foreground));
	}

	.input {
		padding: 0.75rem 1rem;
		font-size: 1rem;
		color: hsl(var(--foreground));
		background-color: hsl(var(--input));
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.input:focus {
		border-color: hsl(var(--ring));
		box-shadow: 0 0 0 2px hsl(var(--ring) / 0.5);
	}

	.button,
	.button-loading {
		min-height: 2.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		font-weight: 500;
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease,
			min-height 0.2s ease; /* Smooth transition for height */
	}

	.button {
		background-color: hsl(var(--primary));
		padding: 0.75rem 1rem;
	}

	.button:hover {
		background-color: hsl(var(--primary) / 0.9);
		size: 0.99;
	}

	.button-loading {
		background: linear-gradient(135deg, #ff7f50 25%, #ff4500 50%, #ff7f50 75%);
		background-size: 300% 300%;
		animation:
			loading-animation 5s ease-in-out infinite,
			color-shift 8s ease-in-out infinite;
		border: 2px solid #ff6347;
		box-shadow: 0 0 10px rgba(255, 99, 71, 0.5);
		padding: 0; /* Remove inner padding for loading state */
		min-height: 2rem;
	}

	@keyframes color-shift {
		0%,
		100% {
			filter: hue-rotate(0deg);
		}
		50% {
			filter: hue-rotate(360deg);
		}
	}

	@keyframes loading-animation {
		0%,
		100% {
			background-position: 0% 0%;
		}
		50% {
			background-position: 100% 100%;
		}
	}

	.spacer {
		background: linear-gradient(to right, transparent, hsl(var(--border)), transparent);
		height: 1px;
		margin: 1rem 0;
	}

	.oauth-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		font-weight: 500;
		color: hsl(var(--primary-foreground));
		background-color: hsl(var(--primary));
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease;
		margin: auto;
		width: 50%;
	}

	.oauth-button:hover {
		background-color: hsl(var(--primary) / 0.9);
	}

	.oauth-button:active {
		transform: scale(0.98);
	}

	.oauth-svg {
		margin-left: 0.5rem;
		width: 1.5rem;
		height: auto;
		margin-right: 0.5rem;
	}
</style>
