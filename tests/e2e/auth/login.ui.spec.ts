import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login page (UI)', () => {
  test('loads and shows primary auth options', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.WelcomeHeading).toBeVisible();
    await expect(loginPage.LogInWithGoogle).toBeVisible();
    await expect(loginPage.LogInWithGitHub).toBeVisible();
    await expect(loginPage.EmailSignInLabel).toBeVisible();
  });

  test('email sign-in fields are visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.assertEmailFormVisible();
  });

  test('forgot password link navigates', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToForgotPassword();
    await expect(page).toHaveURL(/\/forgot-password\b/i);
  });

  test('sign up link navigates', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToSignUp();
    await expect(page).toHaveURL(/\/(sign-?up|signup|register)\b/i);
  });
});

