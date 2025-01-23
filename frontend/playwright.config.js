import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	use: {
		ignoreHTTPSErrors: true
	},
	testDir: 'e2e'
});
