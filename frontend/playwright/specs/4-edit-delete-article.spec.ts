/**
 * Edit / Delete Article spec: author can update body & tags (changes visible),
 * then delete the article and it disappears from all lists.
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

test.describe.serial('Edit & Delete Article', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can update article body and tags then delete article, changes are visible and article disappears from lists', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);

    const user = AuthHelpers.getUniqueUser();
    const suffix = testData.uniqueSuffix();
    const article = testData.article(suffix);
    const updatedBody = `Updated body content ${suffix}.`;
    const updatedTags = ['edited', 'tags'];

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

    // Open article from home to get to article page 
    await header.clickHome();
    await page.getByRole('heading', { name: article.title }).click();
    await expect(page).toHaveURL(/\/#\/article\//);
    const slug = new URL(page.url()).hash.split('/').pop() ?? '';

    // Edit: update body and tags
    await articlePage.clickEditArticle();
    await editorPage.expectHeading();
    await editorPage.updateBodyAndTags(updatedBody, updatedTags);
    await editorPage.expectSuccessMessage();

    // View article again and assert changes are visible
    await articlePage.goto(slug);
    await articlePage.expectBodyToContain(updatedBody);
    for (const tag of updatedTags) {
      await articlePage.expectTagVisible(tag);
    }

    // Delete article
    await articlePage.clickDeleteArticle();
    await expect(page).toHaveURL(/#\/$/);

    // Article no longer in Global Feed
    await expect(
      page.getByRole('heading', { name: article.title }),
    ).not.toBeVisible();
  });
});
