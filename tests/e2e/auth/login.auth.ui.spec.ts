import { expect, test } from '@playwright/test';
import { loginWithEnv } from '../../helpers/auth';

test.describe('Login (UI) - auth', () => {
  test('can login with email/password (requires env vars)', async ({ page }) => {
    await loginWithEnv(page);
    await expect(page).toHaveURL(/\/projects\//i);
  });
});

