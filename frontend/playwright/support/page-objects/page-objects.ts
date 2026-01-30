import { expect } from '@playwright/test';
import { Page } from '@playwright/test';

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Page object for the app header navbar
 */
export class HeaderPage {
  constructor(private readonly page: Page) {}

  async clickSignUp() {
    await this.page.getByRole('link', { name: 'Sign up' }).click();
  }

  async clickSignIn() {
    await this.page.getByRole('link', { name: 'Sign in' }).click();
  }

  async clickHome() {
    await this.page.getByRole('link', { name: 'Home' }).click();
  }

  async clickNewArticle() {
    await this.page.getByRole('link', { name: 'New Article' }).click();
  }

  async clickGlobalFeed() {
    await this.page.getByText('Global Feed').click();
  }

  async clickMyFeed() {
    await this.page.getByText('My Feed').click();
  }

  async clickSettings() {
    await this.page.getByRole('link', { name: 'Settings' }).click();
  }
}

/**
 * Page object for the user profile page
 */
export class ProfilePage {
  constructor(private readonly page: Page) {}

  async goto(username: string) {
    await this.page.goto(`/#/profile/${username}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async followUser(username: string) {
    await this.page
      .getByRole('button', { name: `Follow ${username}` })
      .click();
  }
}

/**
 * Page object for the Settings page
 */
export class SettingsPage {
  constructor(private readonly page: Page) {}

  async logout() {
    await this.page
      .getByRole('button', { name: 'Or click here to logout.' })
      .click();
  }
}

/**
 * Page object for the Sign up page
 */
export class RegisterPage {
  constructor(private readonly page: Page) {}

  async expectHeading() {
    await this.page
      .getByRole('heading', { name: 'Sign up', level: 1 })
      .waitFor({ state: 'visible' });
  }

  async register(data: RegisterFormData) {
    await this.page.getByPlaceholder('Username').fill(data.username);
    await this.page.getByPlaceholder('Email').fill(data.email);
    await this.page.getByPlaceholder('Password').fill(data.password);
    await this.page.getByRole('button', { name: 'Sign up' }).click();
  }
}

/**
 * Page object for the Signin page
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/#/login', { waitUntil: 'domcontentloaded' });
  }

  async expectHeading() {
    await this.page
      .getByRole('heading', { name: 'Sign in', level: 1 })
      .waitFor({ state: 'visible' });
  }

  async fillForm(data: LoginFormData) {
    await this.page.getByPlaceholder('Email').fill(data.email);
    await this.page.getByPlaceholder('Password').fill(data.password);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async login(data: LoginFormData) {
    await this.fillForm(data);
    await this.submit();
  }
}

export interface ArticleFormData {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

/**
 * Page object for the Article editor page
 */
export class EditorPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/#/editor', { waitUntil: 'domcontentloaded' });
  }

  async gotoEdit(slug: string) {
    await this.page.goto(`/#/editor/${slug}`, { waitUntil: 'domcontentloaded' });
  }

  async expectHeading() {
    await this.page
      .getByRole('heading', { name: 'Article editor', level: 1 })
      .waitFor({ state: 'visible' });
  }

  async fillForm(data: ArticleFormData) {
    await this.page.getByPlaceholder('Article Title').fill(data.title);
    await this.page
      .getByPlaceholder("What's this article about?")
      .fill(data.description);
    await this.page
      .getByPlaceholder('Write your article (in markdown)')
      .fill(data.body);
    if (data.tagList?.length) {
      for (const tag of data.tagList) {
        await this.page.getByPlaceholder('Enter tags').fill(tag);
        await this.page.getByPlaceholder('Enter tags').press('Tab');
      }
    }
  }

  async submit() {
    // When editing, ensure the PUT completes before continuing
    const url = new URL(this.page.url());
    const hashParts = url.hash.split('/').filter(Boolean);
    const slug = hashParts[hashParts.length - 1];
    const isEdit = url.hash.includes('/editor/') && !!slug && slug !== 'editor';

    const responsePromise = this.page.waitForResponse((res) => {
      const method = res.request().method();
      const okStatus = res.status() >= 200 && res.status() < 400;
      if (!okStatus) return false;

      if (isEdit) {
        return (
          method === 'PUT' &&
          res.url().includes('/articles/') &&
          res.url().includes(slug)
        );
      }

      return method === 'POST' && res.url().includes('/articles');
    });

    await this.page.getByRole('button', { name: 'Publish Article' }).click();
    await responsePromise;
  }

  async createArticle(data: ArticleFormData) {
    await this.fillForm(data);
    await this.submit();
  }

  async expectSuccessMessage() {
    await expect(
      this.page.getByText('Published successfully!'),
    ).toBeVisible();
  }

  /** Update only body and tags. Waits for form, clears body, then sets body and tags */
  async updateBodyAndTags(body: string, tagList: string[]) {
    await this.page
      .getByPlaceholder('Write your article (in markdown)')
      .waitFor({ state: 'visible' });
    await this.page
      .getByPlaceholder('Write your article (in markdown)')
      .clear();
    await this.page
      .getByPlaceholder('Write your article (in markdown)')
      .fill(body);
    // Remove existing tags
    while ((await this.page.locator('.tag-pill .ion-close-round').count()) > 0) {
      await this.page.locator('.tag-pill .ion-close-round').first().click();
    }
    for (const tag of tagList) {
      await this.page.getByPlaceholder('Enter tags').fill(tag);
      await this.page.getByPlaceholder('Enter tags').press('Tab');
    }
    await this.submit();
  }
}

/**
 * Page object for the Article details page
 */
export class ArticlePage {
  constructor(private readonly page: Page) {}

  async goto(slug: string) {
    const responsePromise = this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/articles/') &&
        res.url().includes(slug),
    );
    await this.page.goto(`/#/article/${slug}`, {
      waitUntil: 'domcontentloaded',
    });
    await responsePromise;
    await this.page.getByText('Loading article...').waitFor({ state: 'hidden', timeout: 15_000 });
  }

  async clickEditArticle() {
    await this.page.getByRole('button', { name: 'Edit Article' }).first().click();
  }

  async clickDeleteArticle() {
    await this.page.getByRole('button', { name: 'Delete Article' }).first().click();
  }

  async expectBodyToContain(text: string) {
    const bodyContainer = this.page.locator('.article-content');
    await bodyContainer.waitFor({ state: 'visible', timeout: 15_000 });
    await expect(bodyContainer).toContainText(text, { timeout: 15_000 });
  }

  async expectTagVisible(tag: string) {
    await expect(this.page.getByText(tag, { exact: true })).toBeVisible();
  }

  /** Add a comment */
  async addComment(body: string) {
    await this.page.getByPlaceholder('Write a comment...').fill(body);
    await this.page.getByRole('button', { name: 'Post Comment' }).click();
  }

  /** Assert a comment is visible */
  async expectCommentVisible(body: string) {
    await expect(this.page.getByText(body, { exact: true })).toBeVisible();
  }

  /** Delete the comment */
  async deleteComment(body: string) {
    await this.page
      .locator('.card')
      .filter({ hasText: body })
      .locator('.ion-trash-a')
      .click();
  }
}
