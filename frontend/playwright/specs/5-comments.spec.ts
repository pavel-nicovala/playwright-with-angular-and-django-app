/**
 * Comments spec: add a comment → it displays; delete the comment → it disappears.
 */
import { test, expect } from '@playwright/test';
import {
  ArticlePage,
  EditorPage,
  HeaderPage,
  LoginPage,
  RegisterPage,
} from '../support/page-objects/page-objects';
import { testData } from '../support/fixtures/test-data';
import { AuthHelpers } from '../support/utils/auth-helpers';

test.describe.serial('Comments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can add comment and then delete it', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);

    const user = AuthHelpers.getUniqueUser();
    const article = testData.article(testData.uniqueSuffix());
    const commentBody = `A test comment ${testData.uniqueSuffix()}.`;

    // Register and login
    await header.clickSignUp();
    await registerPage.expectHeading();
    await registerPage.register(user);
    await expect(page).toHaveURL(/#\/login/);
    await loginPage.expectHeading();
    await loginPage.login({ email: user.email, password: user.password });
    await expect(page).not.toHaveURL(/#\/login/);

    // Create article
    await header.clickNewArticle();
    await editorPage.expectHeading();
    await editorPage.createArticle(article);
    await editorPage.expectSuccessMessage();

    // Open article from home
    await header.clickHome();
    await page.getByRole('heading', { name: article.title }).click();
    await expect(page).toHaveURL(/\/#\/article\//);

    // Add a comment
    await articlePage.addComment(commentBody);

    // Comment displays
    await articlePage.expectCommentVisible(commentBody);

    // Delete the comment
    await articlePage.deleteComment(commentBody);

    // Comment disappears
    await expect(page.getByText(commentBody, { exact: true })).not.toBeVisible();
  });
});
