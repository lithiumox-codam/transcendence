import { expect, test } from '@playwright/test';
import randomstring from 'randomstring';

// Kind of works 50% of the time
test('able to create account', async ({ page }) => {
	await page.goto('https://localhost/signup');

	const username = randomstring.generate();
	const password = randomstring.generate();
	const email = `${randomstring.generate()}@example.com`;

	await page.fill('input[name="username"]', username);

	await page.fill('input[name="password"]', password);

	await page.fill('input[name="email"]', email);

	await page.click('button[type="submit"]');

	await page.waitForTimeout(1000);
	const currentUrl = page.url();
	expect(currentUrl).toBe('https://localhost/pong');
});
