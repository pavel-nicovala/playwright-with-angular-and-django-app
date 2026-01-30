/**
 * Follow Feed spec: User A follows User B, User B publishes an article,
 * article shows up in User A's My Feed.
 */
import { test, expect } from '@playwright/test';
import {
  EditorPage,
  HeaderPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  SettingsPage,
} from '../support/page-objects/page-objects';
import { testData } from '../support/fixtures/test-data';
import { AuthHelpers } from '../support/utils/auth-helpers';

test.describe.serial('Follow Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User A follows User B, User B publishes article, article appears in User A\'s My Feed', async ({
    page,
  }) => {
    const header = new HeaderPage(page);
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const settingsPage = new SettingsPage(page);
    const editorPage = new EditorPage(page);

    const userA = AuthHelpers.getUniqueUser();
    const userB = AuthHelpers.getUniqueUser();
    const article = testData.article(testData.uniqueSuffix());

    // Register User A
    await header.clickSignUp();
    await registerPage.expectHeading();
    await registerPage.register(userA);
    await expect(page).toHaveURL(/#\/login/);

    // Register User B
    await header.clickSignUp();
    await registerPage.expectHeading();
    await registerPage.register(userB);
    await expect(page).toHaveURL(/#\/login/);

    // Login as User A
    await loginPage.expectHeading();
    await loginPage.login({ email: userA.email, password: userA.password });
    await expect(page).not.toHaveURL(/#\/login/);

    // User A goes to My Feed and asserts that My Feed is empty
    await header.clickMyFeed();
    await expect(
      page.getByText('No articles are here... yet.', { exact: true }),
    ).toBeVisible();

    // User A follows User B
    await profilePage.goto(userB.username);
    await profilePage.followUser(userB.username);

    // Logout User A
    await header.clickSettings();
    await settingsPage.logout();
    await expect(page).toHaveURL(/#\/$/);

    // Login as User B
    await header.clickSignIn();
    await loginPage.expectHeading();
    await loginPage.login({ email: userB.email, password: userB.password });
    await expect(page).not.toHaveURL(/#\/login/);

    // User B publishes a new article
    await header.clickNewArticle();
    await editorPage.expectHeading();
    await editorPage.createArticle(article);
    await editorPage.expectSuccessMessage();

    // Logout User B
    await header.clickSettings();
    await settingsPage.logout();
    await expect(page).toHaveURL(/#\/$/);

    // Login as User A
    await header.clickSignIn();
    await loginPage.expectHeading();
    await loginPage.login({ email: userA.email, password: userA.password });
    await expect(page).not.toHaveURL(/#\/login/);

    // User A goes to Home and asserts that the article is visible in both Global Feed and My Feed
    await header.clickHome();
    await expect(
      page.getByRole('heading', { name: article.title }),
    ).toBeVisible();
    await header.clickMyFeed();
    await expect(
      page.getByRole('heading', { name: article.title }),
    ).toBeVisible();
  });
});
