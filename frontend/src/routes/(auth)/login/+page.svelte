<script>
	import logo from '$lib/images/svelte-logo.svg';
    import loader from '$lib/images/dots.svg';
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
    
    let hasError = $state(false);
    let isSubmitting = $state(false);

    async function handleLogin(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        try {
            isSubmitting = true;
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
			{#if !isSubmitting}
			    <button type="submit" class="button">Login</button>
            {:else if isSubmitting}
                <button disabled class="button-loading" aria-label="loading"><image class="loading-svg" src={loader} alt="loading element"/></button>
            {/if}
		</form>
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

	.button {
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
	}

	.button:hover {
		background-color: hsl(var(--primary) / 0.9);
	}

	.button:active {
		transform: scale(0.98);
	}

    .button-loading {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        font-weight: 500;
        color: hsl(var(--primary-foreground));
        background: linear-gradient(135deg, hsl(var(--primary) / 0.8) 25%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8) 75%);
        border: none;
        border-radius: var(--radius);
        cursor: pointer;
        transition:
            transform 0.1s ease;
        background-size: 300% 100%;
        animation: loading-animation 4s ease-in-out infinite;
    }

    @keyframes loading-animation {
        0% {
            background-position: 0% 0%;
        }
        50% {
            background-position: 100% 0%;
        }
        100% {
            background-position: 0% 0%;
        }
    }

    .loading-svg {
        height: 16px;
        width: 16px;
    }
</style>
