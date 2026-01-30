import { expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';
import { Page } from '@playwright/test';
import { LoginPage } from '../page-objects/page-objects';
import { testData } from '../fixtures/test-data';

/**
 * Reusable auth utility functions for specs.
 * Use when a test needs to be in an authenticated state without depending on another spec.
 */
export const AuthHelpers = {
  /**
   * Navigate to login page and fill credentials. Does not submit.
   */
  async goToLoginAndFill(
    page: Page,
    email: string,
    password: string
  ): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectHeading();
    await loginPage.fillForm({ email, password });
  },

  /**
   * Perform full login. Use when test needs to start as logged-in.
   * Uses unique user per run to avoid dependencies on signup spec.
   */
  async loginWithCredentials(
    page: Page,
    email: string,
    password: string
  ): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectHeading();
    await loginPage.login({ email, password });
  },

  /**
   * Get a unique user payload for sign up (avoids "user already exists" in parallel runs).
   */
  getUniqueUser() {
    const suffix = testData.uniqueSuffix();
    return testData.validUser(suffix);
  },

  /**
   * Assert login API response is 422 with "Invalid email or password" in errors.non_field_errors.
   */
  async assertLoginErrorResponse(response: APIResponse): Promise<void> {
    expect(response.status()).toBe(422);
    const body = (await response.json()) as {
      errors: { non_field_errors?: string[] };
    };
    expect(body.errors?.non_field_errors).toContain(
      'Invalid email or password',
    );
  },
};
