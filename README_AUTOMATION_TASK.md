# Playwright E2E Tests

End-to-end tests for the Conduit-style app (Angular frontend, Django REST backend).

---

## 1. Test structure

- **`frontend/playwright/specs/`** – Test files:
  - **`1-auth.spec.ts`** – Sign up, login success, login error (wrong password). 
  - **`2-article.spec.ts`** – Register → login → create article → assert it appears in Global Feed.
  - **`3-follow-feed.spec.ts`** – User A follows User B, User B publishes article, article appears in User A's My Feed.
  - **`4-edit-delete-article.spec.ts`** – Create article → edit body/tags → delete → assert it disappears from lists.
  - **`5-comments.spec.ts`** – Add comment → assert visible → delete comment → assert is removed.

- **`frontend/playwright/support/`**
  - **`page-objects/page-objects.ts`** – Page objects
  - **`fixtures/test-data.ts`** – Shared test data
  - **`utils/auth-helpers.ts`** – Auth helpers

- **`frontend/playwright/playwright.config.ts`** – Config: `testDir`, `baseURL`, custom options (e.g. `apiURL`), projects (chromium, firefox, webkit), timeouts, reporter.

Specs are **independent**: each that needs a user registers and logs in (or uses helpers). They use **serial** execution within a file where order matters (e.g. auth).

---

## 2. Start the app with Docker Compose

From the **project root** (where `docker-compose.yml` lives):

```bash
docker compose up -d --build
```

- **Backend:** http://localhost:8000  
- **Frontend:** http://localhost:4200  

Wait until both are up (e.g. open the frontend in a browser or poll `/api/tags` and `/`). The E2E workflow waits for both before running tests.

---

## 3. Running tests: headless, UI, debug, report

All commands are run from the **frontend** directory (or with `--prefix frontend` / `working-directory: frontend`).

If this is your first time running the tests (or `node_modules/` is missing), install dependencies first:

```bash
cd frontend
npm ci   # or: npm install
```

### Headless (default)

```bash
cd frontend
npm run test:e2e
```

Runs all specs in headless Chromium, Firefox, and WebKit (configurable in `playwright.config.ts`). To run only Chromium:

```bash
npx playwright test -c playwright/playwright.config.ts --project=chromium
```

### UI mode

```bash
npm run test:e2e:ui
```

Opens the Playwright UI: pick tests, watch, and inspect.

### Debug mode

```bash
npm run test:e2e:debug
```

- Opens the Playwright Inspector and runs tests in headed mode so you can step through.
- **Pause in code:** add `await page.pause()` in a spec (e.g. before a failing line). When the test hits it, execution stops and the Inspector lets you explore the page, console, and continue/step.
- Run a single file:  
  `npx playwright test -c playwright/playwright.config.ts --debug specs/1-auth.spec.ts`

### HTML report

By default the config uses `reporter: 'html'`. After a run, open the report with:

```bash
cd frontend && npx playwright show-report
```

Report is written to `frontend/playwright-report/` (and uploaded as an artifact in CI).

---

## 4. Clearing the database (`clear_db.sh`)

The backend script **`backend/clear_db.sh`** clears all app data from the SQLite DB while keeping the schema and `django_migrations`. Use it for a clean state before E2E (e.g. in CI or locally).

**Locally** (backend not in Docker):

```bash
cd backend
./clear_db.sh
```

**With Docker Compose** (backend running in container):

```bash
docker compose exec -T backend sh -c "cd /app && ./clear_db.sh"
```

The backend image must have `sqlite3` installed (see `backend/Dockerfile`). The script deletes rows from app tables and runs `VACUUM`.

---

## 5. Environment / config (Playwright config file)

URLs and options are set in **`frontend/playwright/playwright.config.ts`**:

- **`use.baseURL`** – Frontend base URL for `page.goto('/')` (e.g. `http://localhost:4200`).
- **`use.apiURL`** – Custom option for the backend API base (e.g. `http://localhost:8000`). Reserved for future tests (e.g. API requests). Access in tests via fixtures or project options.

To support multiple environments (e.g. local vs staging), you can:

- Read `process.env` in the config and set `baseURL` / `apiURL` from it.
- Or define a small `config/environments.ts` and import it in `playwright.config.ts` to pick `baseURL` and `apiURL` by env (e.g. `PW_ENV=staging`).

Example pattern in config:

```ts
const baseURL = process.env.BASE_URL ?? 'http://localhost:4200';
const apiURL = process.env.API_URL ?? 'http://localhost:8000';
// then use in defineConfig({ use: { baseURL, apiURL, ... } })
```

---

## 6. How E2E runs in CI

The **`.github/workflows/e2e.yml`** workflow:

1. **Triggers:** On push and pull_request.
2. **Checkout** the repo.
3. **Start app:** `docker compose up -d --build`, then wait for backend (e.g. `curl` http://localhost:8000/api/tags) and frontend (http://localhost:4200/) with retries.
4. **Clear DB:** `docker compose exec -T backend sh -c "cd /app && ./clear_db.sh"`.
5. **Node:** setup-node (e.g. Node 20), npm cache using `frontend/package-lock.json`.
6. **Install:** `npm ci` in `frontend`, then `npx playwright install --with-deps chromium`.
7. **Run E2E:** `npx playwright test -c playwright/playwright.config.ts --project=chromium` 
8. **Artifact:** On success or failure, upload `frontend/playwright-report/` as the `playwright-report` artifact. Download it from the run and open with `npx playwright show-report` to inspect failures.

