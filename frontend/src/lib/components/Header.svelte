<script>
	import { page } from '$app/state';
	import logo from '$lib/images/svelte-logo.svg';
	import { clickOutside } from '$lib/utils/clickOutside.js';
	import { theme } from '$lib/stores/theme.svelte.js';
	import { slide } from 'svelte/transition';
	
	let showUserMenu = $state(false);
	let showMobileMenu = $state(false);

	const navItems = [
		{path: '/', text: 'Leaderboard'},
		{path: '/pong', text: 'Play'},
	];

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}
	
	function closeMenus() {
		showUserMenu = false;
		showMobileMenu = false;
	}
</script>

{#snippet navItem(path, text)}
	<li aria-current={page.url.pathname === path ? 'page' : undefined}>
		<a href={path}>{text}</a>
	</li>
{/snippet}

{#snippet mobileNavItem(path, text)}
	<a href={path} class="mobile-nav-item">{text}</a>
{/snippet}

<header>
	<div class="header-container">
		<div class="header-left">
			<a href="/" class="logo-link">
				<!-- <img src={logo} alt="Logo" /> -->
				<span>Transcendence</span>
			</a>
		</div>

		<nav class="desktop-nav">
			<ul>
				{#each navItems as {path, text} (path)}
					{@render navItem(path, text)}
				{/each}
			</ul>
		</nav>

		
		<div class="header-right">
			<button class="theme-toggle" onclick={() => theme.toggle()} aria-label="Toggle theme">
				{#if theme.isDark}
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="4"></circle>
					<path d="M12 2v2"></path>
					<path d="M12 20v2"></path>
					<path d="M4.93 4.93l1.41 1.41"></path>
					<path d="M17.66 17.66l1.41 1.41"></path>
					<path d="M2 12h2"></path>
					<path d="M20 12h2"></path>
					<path d="M6.34 17.66l-1.41 1.41"></path>
					<path d="M19.07 4.93l-1.41 1.41"></path>
				</svg>
				{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
				</svg>
				{/if}
			</button>
			
			<div class="user-menu-container" use:clickOutside={closeMenus}>
				<button class="user-button" onclick={toggleUserMenu}>
					<div class="avatar">
						<span>JD</span>
					</div>
				</button>

				{#if showUserMenu}
					<div class="dropdown-menu" transition:slide>
						<div class="user-info">
							<div class="avatar">
								<span>JD</span>
							</div>
							<div class="user-details">
								<span class="user-name">John Doe</span>
								<span class="user-email">john@example.com</span>
							</div>
						</div>
						<div class="dropdown-divider"></div>
						<a href="/profile" class="dropdown-item">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
							Profile
						</a>
						<a href="/settings" class="dropdown-item">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
							Settings
						</a>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item text-destructive">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
								<polyline points="16 17 21 12 16 7"></polyline>
								<line x1="21" y1="12" x2="9" y2="12"></line>
							</svg>
							Log out
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

<style>
	header {
		background-color: hsl(var(--background));
		border-bottom: 1px solid hsl(var(--border));
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(8px);
	}

	.header-container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0.75rem 1rem;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
	}

	.header-left {
		justify-self: start;
	}

	.desktop-nav {
		justify-self: center;
	}

	.header-right {
		justify-self: end;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: hsl(var(--foreground));
		font-weight: 600;
	}

	.logo-link img {
		width: 2rem;
		height: 2rem;
	}

	.desktop-nav ul {
		display: flex;
		gap: 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.desktop-nav a {
		color: hsl(var(--muted-foreground));
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.desktop-nav a:hover {
		color: hsl(var(--foreground));
		background-color: hsl(var(--accent));
	}

	li[aria-current='page'] a {
		color: hsl(var(--foreground));
		background-color: hsl(var(--accent));
	}

	.theme-toggle {
		background-color: hsl(var(--secondary));
		border: 1px solid hsl(var(--border));
		padding: 0.5rem;
		color: hsl(var(--foreground));
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.theme-toggle:hover {
		background-color: hsl(var(--accent));
		transform: scale(1.05);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.theme-toggle svg {
		width: 18px;
		height: 18px;
	}

	.user-menu-container {
		position: relative;
	}

	.user-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.avatar {
		width: 2.25rem;
		height: 2.25rem;
		background-color: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 1.5rem;
		width: 15rem;
		background-color: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px hsl(var(--foreground) / 0.08);
		overflow: hidden;
	}

	.user-info {
		padding: 1rem;
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.user-name {
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	.user-email {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.dropdown-divider {
		height: 1px;
		background-color: hsl(var(--border));
		margin: 0.25rem 0;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: hsl(var(--foreground));
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
		font-size: 0.875rem;
	}

	.dropdown-item:hover {
		background-color: hsl(var(--accent));
	}

	.text-destructive {
		color: hsl(var(--destructive));
	}

	.text-destructive:hover {
		background-color: hsl(var(--destructive) / 0.1);
	}

	@media (max-width: 640px) {
		.desktop-nav {
			display: none;
		}
		.header-container {
			grid-template-columns: 1fr 1fr;
		}
		.header-left {
			justify-self: start;
		}
		.header-right {
			justify-self: end;
		}
	}

</style>
