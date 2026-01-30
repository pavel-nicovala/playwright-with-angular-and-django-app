/**
 * Auth spec: sign up, login success, and login error (wrong password).
 * Tests run serially so the login tests use the user created in the register test.
 */
import { test, expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';
import {
  HeaderPage,
  LoginPage,
  RegisterPage,
  type RegisterFormData,
} from '../support/page-objects/page-objects';
import { testData } from '../support/fixtures/test-data';
import { AuthHelpers } from '../support/utils/auth-helpers';

test.describe.serial('Sign up & Login', () => {
  /** User created in the first test; reused by login tests. */
  let registeredUser: RegisterFormData;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can sign up', async ({ page }) => {
    const header = new HeaderPage(page);
    const registerPage = new RegisterPage(page);
    registeredUser = AuthHelpers.getUniqueUser();

    await header.clickSignUp();
    await registerPage.expectHeading();
    await registerPage.register(registeredUser);

    await expect(
      page.getByText('Registration successful. Redirecting to login page...'),
    ).toBeVisible();
    await expect(page).toHaveURL(/#\/login/);
  });

  // This test will fail if the first test on registration fails
  test('User can log in', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    const loginPage = new LoginPage(page);

    await header.clickSignIn();
    await loginPage.expectHeading();

    // Assert login page and form state
    await expect(page).toHaveURL(/#\/login/);
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();

    const signInButton = page.getByRole('button', { name: 'Sign in' });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeDisabled();

    await loginPage.fillForm({
      email: registeredUser.email,
      password: registeredUser.password,
    });
    await expect(signInButton).toBeEnabled();

    await loginPage.submit();

    // Assert redirect and signed-in header
    await expect(page).not.toHaveURL(/#\/login/);
    await expect(
      page.getByRole('link', { name: 'User profile image' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'New Article' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Settings' }),
    ).toBeVisible();
  });

  test('User cannot log in with wrong password and a error message is displayed', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    const loginPage = new LoginPage(page);

    await header.clickSignIn();
    await loginPage.expectHeading();

    // Intercept POST /users/login to assert 422 and error message
    const loginResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/users/login') &&
        res.request().method() === 'POST',
    );

    await loginPage.login({
      email: registeredUser.email,
      password: testData.wrongPassword,
    });

    const loginResponse = await loginResponsePromise;
    await AuthHelpers.assertLoginErrorResponse(
      loginResponse as unknown as APIResponse,
    );

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/#\/login/);
  });
});
