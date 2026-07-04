import { test, expect } from '@playwright/test';

test.describe('Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('validates input requirement', async ({ page }) => {
    const runButton = page.getByRole('button', { name: 'Analyze profile', exact: true });
    await expect(runButton).toBeDisabled();

    await page.getByPlaceholder('octocat').fill('octocat');
    await expect(runButton).toBeEnabled();
  });

  test('switches source tabs', async ({ page }) => {
    // LinkedIn analysis is PDF-upload based: the tab shows a dropzone plus
    // instructions for exporting the profile PDF from LinkedIn.
    await page.getByRole('button', { name: 'LinkedIn', exact: true }).click();
    await expect(page.getByText('Click to browse')).toBeVisible();
    await expect(page.getByText('Export from LinkedIn')).toBeVisible();

    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await expect(page.getByText('Click to browse')).toBeVisible();
  });
});
