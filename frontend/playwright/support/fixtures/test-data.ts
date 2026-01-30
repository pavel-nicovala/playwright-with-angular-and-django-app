export const testData = {
  /** Unique suffix to avoid collisions between runs */
  uniqueSuffix: () =>
    `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

  /** Valid user for sign up / login */
  validUser: (suffix: string) => ({
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: 'SecurePass123!',
  }),

  /** Wrong password for login failure test */
  wrongPassword: 'WrongPassword123!',

  /** Article form data for create article tests */
  article: (suffix?: string) => ({
    title: suffix ? `Test Article ${suffix}` : 'Test Article',
    description: 'What this article is about',
    body: 'Article body: Lorem ipsum dolor sit amet, consectetur adipiscing elit. In consectetur dapibus magna, eu lacinia sem varius non. Nam placerat nec tellus eget facilisis. Integer accumsan, arcu sed facilisis ornare, metus libero tristique lacus, eu aliquam nunc turpis et mauris. Nulla diam sapien, ultricies nec feugiat vehicula, luctus sit amet erat. In ornare, libero ut commodo lobortis, metus metus hendrerit dolor, nec hendrerit eros ligula et elit. Proin placerat, ligula at volutpat varius, nibh sapien elementum lectus, in rhoncus ante justo eu lacus. Quisque commodo est leo, vel lacinia leo feugiat vitae. In pellentesque elit gravida, consectetur velit eget, luctus sapien. Proin feugiat augue at ligula malesuada pellentesque. Sed ac erat sed ex finibus tincidunt. Nunc vel consectetur metus.',
    tagList: ['kraken', 'test', `Random Tag ${suffix}`],
  }),
} as const;
