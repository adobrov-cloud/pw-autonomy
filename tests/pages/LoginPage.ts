import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly LogInWithGoogle: Locator;
  readonly LogInWithGitHub: Locator;

  readonly EmailSignInLabel: Locator;
  readonly EmailField: Locator;
  readonly PasswordField: Locator;
  readonly LoginButton: Locator;

  readonly ForgotPasswordLink: Locator;
  readonly SignUpLink: Locator;

  readonly WelcomeHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    this.LogInWithGoogle = page.getByRole('button', { name: /connect with google/i });
    this.LogInWithGitHub = page.getByRole('button', { name: /continue with github/i });
    this.EmailSignInLabel = page.getByText('Sign in with an Email');

    this.EmailField = page.getByTestId('login-email-input');
    this.PasswordField = page.getByTestId('login-password-input');

    this.LoginButton = page.getByTestId('login-submit-button');

    this.ForgotPasswordLink = page.getByTestId('login-forgot-password-link');
    this.SignUpLink = page.getByTestId('login-sign-up-link');

    this.WelcomeHeading = page.getByRole('heading', { name: 'Welcome to' });
  }

  async goto() {
    await this.page.goto('https://studio.autonomyai.io/login');
    await this.assertLoaded();
  }

  async assertLoaded() {
    await expect(this.WelcomeHeading).toBeVisible();
    await expect(this.LogInWithGoogle).toBeVisible();
    await expect(this.LogInWithGitHub).toBeVisible();
    await expect(this.EmailSignInLabel).toBeVisible();
    await expect(this.EmailField).toBeVisible();
    await expect(this.PasswordField).toBeVisible();
    await expect(this.LoginButton).toBeVisible();
  }

  async assertEmailFormVisible() {
    await expect(this.EmailSignInLabel).toBeVisible();
    await expect(this.EmailField).toBeVisible();
    await expect(this.PasswordField).toBeVisible();
    await expect(this.LoginButton).toBeVisible();
  }

  async loginWithEmail(params: { email: string; password: string }) {
    await this.assertEmailFormVisible();
    await this.EmailField.fill(params.email);
    await this.PasswordField.fill(params.password);
    await this.LoginButton.click();
  }

  async startGoogleOAuth() {
    await this.LogInWithGoogle.click();
  }

  async startGitHubOAuth() {
    await this.LogInWithGitHub.click();
  }

  async goToForgotPassword() {
    await this.assertEmailFormVisible();
    await this.ForgotPasswordLink.click();
  }

  async goToSignUp() {
    await this.assertEmailFormVisible();
    await this.SignUpLink.click();
  }
}

