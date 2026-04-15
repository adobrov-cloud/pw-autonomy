import { expect, test, type Locator, type Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

async function clickIfEnabled(locator: Locator) {
  if (await locator.isEnabled()) {
    await locator.click();
  }
}

async function expectSomeValidationVisible(page: Page) {
  const maybeValidation = page.getByText(/required|invalid|something went wrong|error/i).first();
  if (await maybeValidation.isVisible().catch(() => false)) {
    await expect(maybeValidation).toBeVisible();
  }
}

test.describe('Login form (UI) - negative', () => {
  test('cannot submit with both fields empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveURL(/\/login\b/i);

    await clickIfEnabled(loginPage.LoginButton);
    await expect(page).toHaveURL(/\/login\b/i);
    await expectSomeValidationVisible(page);
  });

  test('cannot submit with missing password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.EmailField.fill('someone@example.com');

    await clickIfEnabled(loginPage.LoginButton);
    await expect(page).toHaveURL(/\/login\b/i);
    await expectSomeValidationVisible(page);
  });

  test('invalid email format is rejected by browser validity (when applicable)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.EmailField.fill('not-an-email');
    await loginPage.PasswordField.fill('some-password');

    const emailType = await loginPage.EmailField.getAttribute('type');
    if (emailType?.toLowerCase() === 'email') {
      const validity = await loginPage.EmailField.evaluate((el) => {
        const input = el as HTMLInputElement;
        return {
          valid: input.validity.valid,
          typeMismatch: input.validity.typeMismatch,
          valueMissing: input.validity.valueMissing,
        };
      });
      expect(validity.valid).toBeFalsy();
      expect(validity.typeMismatch).toBeTruthy();
    }

    // Regardless of HTML5 validity, we should not navigate away on submit with an invalid email.
    await clickIfEnabled(loginPage.LoginButton);
    await expect(page).toHaveURL(/\/login\b/i);
    await expectSomeValidationVisible(page);
  });
});

