import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login (UI) - auth', () => {
  test('can login with email/password (requires env vars)', async ({ page }) => {
    const email = process.env.AUTONOMY_EMAIL;
    const password = process.env.AUTONOMY_PASSWORD;
    const expectedRedirect =
      'https://studio.autonomyai.io/projects/2be2e0b3-f01d-4cae-8fff-19a534fade7c';

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.loginWithEmail({ email: email!, password: password! });

    await expect(page).toHaveURL(expectedRedirect, { timeout: 30_000 });
  });
});

