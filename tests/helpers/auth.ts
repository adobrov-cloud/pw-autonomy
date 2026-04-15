import { expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const DEFAULT_PROJECT_URL =
  'https://studio.autonomyai.io/projects/2be2e0b3-f01d-4cae-8fff-19a534fade7c';

export async function loginWithEnv(page: Page, opts?: { expectedRedirect?: string }) {
  const email = process.env.AUTONOMY_EMAIL;
  const password = process.env.AUTONOMY_PASSWORD;

  const expectedRedirect = opts?.expectedRedirect ?? DEFAULT_PROJECT_URL;

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEmail({ email: email!, password: password! });
  await expect(page).toHaveURL(expectedRedirect, { timeout: 30_000 });
}

