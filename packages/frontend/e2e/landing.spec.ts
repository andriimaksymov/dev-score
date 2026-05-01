import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/DevScore/);
    });

    test('displays main headline', async ({ page }) => {
        await expect(page.getByText('Your Complete Developer Profile Analysis')).toBeVisible();
    });

    test('navigation works', async ({ page }) => {
        await page.getByRole('button', { name: 'How It Works' }).click();
        await expect(page.locator('#how-it-works')).toBeVisible();
    });
});
