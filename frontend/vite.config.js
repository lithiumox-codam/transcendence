import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	server: {
		watch: {
			ignored: ['**/node_modules/**', '**/.git/**']
		}
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
