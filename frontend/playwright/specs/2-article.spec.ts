/**
 * Article spec: logged-in user creates an article; article appears in My Feed.
 * Spec is independent: registers a user, logs in, then creates article and asserts.
 */
import { test, expect } from '@playwright/test';
import {
  EditorPage,
  HeaderPage,
  LoginPage,
  RegisterPage,
} from '../support/page-objects/page-objects';
import { testData } from '../support/fixtures/test-data';
import { AuthHelpers } from '../support/utils/auth-helpers';

test.describe.serial('Write Article', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can create new article and display it in Global Feed', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);

    const user = AuthHelpers.getUniqueUser();
    const article = testData.article(testData.uniqueSuffix());

    // Signup
    await header.clickSignUp();
    await registerPage.expectHeading();
    await registerPage.register(user);
    await expect(page).toHaveURL(/#\/login/);

    // Login
    await loginPage.expectHeading();
    await loginPage.login({ email: user.email, password: user.password });
    await expect(page).not.toHaveURL(/#\/login/);

    // Create article
    await header.clickNewArticle();
    await editorPage.expectHeading();
    await editorPage.createArticle(article);
    await editorPage.expectSuccessMessage();

    // Go to home
    await header.clickHome();
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();
  });
});
