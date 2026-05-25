import { test, expect } from '@playwright/test';

test.describe('SecretOps Sentinel E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:42000');
  });

  test('shows warning banner', async ({ page }) => {
    const banner = page.locator('header').first();
    await expect(banner).toContainText('Only scan systems');
  });

  test('scan demo fixture and show findings', async ({ page }) => {
    await page.click('text=Scan Demo Fixture');
    await page.waitForResponse(resp => resp.url().includes('/api/scan') && resp.status() === 200);

    await expect(page.locator('text=Findings Dashboard')).toBeVisible();
    const rows = page.locator('table tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('no full secrets displayed in findings', async ({ page }) => {
    await page.click('text=Scan Demo Fixture');
    await page.waitForResponse(resp => resp.url().includes('/api/scan') && resp.status() === 200);

    const body = page.locator('body');
    const text = await body.textContent();
    expect(text).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(text).not.toContain('FAKE_TEST_ONLY_');
  });

  test('finding detail page shows workflow and redacted match', async ({ page }) => {
    await page.click('text=Scan Demo Fixture');
    await page.waitForResponse(resp => resp.url().includes('/api/scan') && resp.status() === 200);

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();

    await expect(page.locator('text=Finding Detail')).toBeVisible();
    await expect(page.locator('text=Redacted Match')).toBeVisible();
  });

  test('state transition flow', async ({ page }) => {
    await page.click('text=Scan Demo Fixture');
    await page.waitForResponse(resp => resp.url().includes('/api/scan') && resp.status() === 200);

    await page.locator('table tbody tr').first().click();
    await page.waitForSelector('text=Update Status');

    await page.selectOption('select', 'confirmed');
    await page.click('text=Update Status');

    await expect(page.locator('text=confirmed')).toBeVisible();
  });

  test('export report generates markdown', async ({ page }) => {
    await page.click('text=Scan Demo Fixture');
    await page.waitForResponse(resp => resp.url().includes('/api/scan') && resp.status() === 200);

    await page.click('text=Reports');
    await page.click('text=Export Incident Report');

    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('incident-report');
  });

  test('rotation checklists page works', async ({ page }) => {
    await page.click('text=Rotation');
    await expect(page.locator('text=Rotation Checklists')).toBeVisible();

    const firstButton = page.locator('button').filter({ hasText: 'aws' }).first();
    await firstButton.click();
    await expect(page.locator('text=AWS Access Key Rotation')).toBeVisible();
  });

  test('pre-commit page shows instructions', async ({ page }) => {
    await page.click('text=Pre-Commit');
    await expect(page.locator('text=Pre-Commit Hook Setup')).toBeVisible();
    await expect(page.locator('text=Setup Instructions')).toBeVisible();
  });
});
