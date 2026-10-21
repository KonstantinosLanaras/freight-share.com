import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Mint the requesting admin's session with lovable auth-session before running.
test('admin deep links wait for assigned roles during session restoration', async ({ page }) => {
  const minted = JSON.parse(readFileSync(join(homedir(), '.cache/lovable-auth/session.json'), 'utf8'));
  await page.goto('http://localhost:8080');
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [
    minted.storage_key, JSON.stringify(minted.session),
  ]);
  await page.route('**/rest/v1/user_roles*', async route => {
    await new Promise(resolve => setTimeout(resolve, 700));
    await route.continue();
  });
  for (const path of ['/admin', '/admin/users']) {
    await page.goto(`http://localhost:8080${path}`);
    await expect(page.getByRole('heading', { name: 'Carrier Verifications', exact: true })).toBeVisible();
    await expect(page).toHaveURL(`http://localhost:8080${path}`);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Carrier Verifications', exact: true })).toBeVisible();
    await expect(page).toHaveURL(`http://localhost:8080${path}`);
  }
});