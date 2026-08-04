# Admin Usage Dashboard Implementation Plan

> **For agentic workers:** Implement this plan task-by-task with TDD. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected annual Admin dashboard that aggregates the existing Google Sheets usage records into monthly unique-user and platform statistics.

**Architecture:** Google Apps Script exposes protected raw log rows to the Next.js server. Server-only modules authenticate the shared Admin session, aggregate records for a selected year, and return summary-only JSON to a responsive client dashboard.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node `node:test`, Tailwind CSS 4, Google Apps Script

## Global Constraints

- Do not create Git commits; the user will commit the completed work.
- Keep raw names and student IDs on the server and return aggregates only.
- Add no charting or authentication dependencies.
- Preserve the existing user sign-in, onboarding, platform selection, and logging behavior.
- Use Thailand calendar timestamps in the existing `HH:mm DD/MM/YYYY` format.

---

### Task 1: Usage statistics domain module

**Files:**
- Create: `lib/admin-stats.ts`
- Create: `tests/admin-stats.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `UsageLogRow`, `AdminStats`, `parseUsageTimestamp(value)`, `listUsageYears(rows)`, and `buildAdminStats(rows, year)`.
- `buildAdminStats` returns summary totals, 12 monthly student/staff counts, faculty/workplace/year rankings, and platform rankings.

- [ ] **Step 1: Add a Node test script and failing aggregation tests**

```json
"test": "node --test tests/*.test.ts"
```

Tests construct real usage rows and assert timestamp parsing, annual and monthly deduplication, exclusion of missing identifiers, most-recent affiliation, all 12 months, `ไม่ระบุ` buckets, available years, and stable AI ranking ties.

- [ ] **Step 2: Run the domain tests and verify RED**

Run: `npm test -- tests/admin-stats.test.ts`
Expected: FAIL because `lib/admin-stats.ts` does not exist.

- [ ] **Step 3: Implement the typed aggregation module**

Use student keys in the form `student:<trimmed studentId>` and staff keys in the form `staff:<trimmed lowercase name>`. Track monthly sets separately from the annual set, and store the most recent valid profile for each annual user before building affiliation rankings.

- [ ] **Step 4: Run domain tests and verify GREEN**

Run: `npm test -- tests/admin-stats.test.ts`
Expected: all aggregation tests PASS.

### Task 2: Signed Admin authentication

**Files:**
- Create: `lib/admin-auth.ts`
- Create: `tests/admin-auth.test.ts`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `app/api/admin/session/route.ts`

**Interfaces:**
- Produces: `ADMIN_COOKIE_NAME`, `verifyAdminPassword(candidate, configured)`, `createAdminSession(secret, now?)`, and `verifyAdminSession(value, secret, now?)`.
- Login accepts `{ password: string }`; session returns `{ authenticated: boolean }`; logout expires the cookie.

- [ ] **Step 1: Write failing authentication tests**

Assert that equal passwords succeed, unequal and missing passwords fail, valid signed sessions verify, tampered or expired sessions fail, and generated tokens never contain the Admin password.

- [ ] **Step 2: Run authentication tests and verify RED**

Run: `npm test -- tests/admin-auth.test.ts`
Expected: FAIL because `lib/admin-auth.ts` does not exist.

- [ ] **Step 3: Implement minimal crypto helpers and routes**

Use Node `crypto.timingSafeEqual` for equal-length digests and HMAC-SHA256 for a versioned payload containing only the expiration time. Configure the cookie as `httpOnly`, `sameSite: "lax"`, `path: "/"`, and `secure` in production.

- [ ] **Step 4: Run authentication tests and verify GREEN**

Run: `npm test -- tests/admin-auth.test.ts`
Expected: all authentication tests PASS.

### Task 3: Protected Sheets reader and statistics API

**Files:**
- Create: `lib/admin-data.ts`
- Create: `tests/admin-data.test.ts`
- Create: `app/api/admin/stats/route.ts`
- Modify: `google-apps-script/Code.gs`

**Interfaces:**
- Produces: `fetchUsageRows(fetchImpl?)` returning `Promise<UsageLogRow[]>`.
- GET `/api/admin/stats?year=YYYY` returns `{ years: number[], selectedYear: number, stats: AdminStats }` only for a valid Admin cookie.
- Apps Script GET accepts `secret` and returns `{ success: true, rows: [...] }` using the existing sheet headers.

- [ ] **Step 1: Write failing data-reader tests**

Assert environment validation, URL query encoding, successful row validation, and rejection of non-OK or malformed upstream responses using a deterministic injected fetch function.

- [ ] **Step 2: Run data tests and verify RED**

Run: `npm test -- tests/admin-data.test.ts`
Expected: FAIL because `lib/admin-data.ts` does not exist.

- [ ] **Step 3: Implement the server data reader, protected API, and Apps Script GET**

Map the ten existing sheet columns into named JSON properties. In Apps Script, compare the request secret with `PropertiesService.getScriptProperties().getProperty("ADMIN_DATA_SECRET")`; return no rows when it does not match. In Next.js, validate `year` as a four-digit integer and return 401, 400, 503, or 502 for authentication, input, configuration, or upstream errors.

- [ ] **Step 4: Run data and full domain tests and verify GREEN**

Run: `npm test`
Expected: all tests PASS.

### Task 4: Admin login and dashboard UI

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/admin/AdminPortal.tsx`
- Create: `components/admin/MonthlyUsageChart.tsx`
- Create: `components/admin/RankingPanel.tsx`

**Interfaces:**
- `AdminPortal` owns login/session/year/loading/error state and consumes the Admin API routes.
- `MonthlyUsageChart` consumes `AdminStats["monthly"]`.
- `RankingPanel` consumes a title and `{ label, count }[]`.

- [ ] **Step 1: Create the server page shell and client state flow**

The page renders a Thai Admin title and the client portal. The portal first checks `/api/admin/session`, presents the password form when unauthenticated, and fetches statistics after authentication.

- [ ] **Step 2: Build accessible dashboard primitives**

Create summary cards, a native year select, refresh/logout buttons, a 12-month grouped bar chart with textual legend and values, and ranked progress rows. Ensure keyboard focus, mobile horizontal chart scrolling, and explicit loading/empty/error states.

- [ ] **Step 3: Connect login, logout, year selection, and retry**

Login posts the password and clears the input on success. Year changes request new aggregate data. Retry repeats the selected request. Logout clears dashboard state after the endpoint succeeds.

- [ ] **Step 4: Run static verification**

Run: `npm run typecheck`
Expected: PASS with no TypeScript errors.

### Task 5: Configuration guidance and full verification

**Files:**
- Create: `.env.example`
- Modify: `CONTEXT.md`

**Interfaces:**
- Documents the three Admin variables and matching Apps Script Property without including real secrets.

- [ ] **Step 1: Document deployment configuration**

Add placeholders for `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_DATA_SECRET`, and the existing `GOOGLE_SHEETS_SCRIPT_URL`. Explain that Apps Script must be redeployed after adding `doGet`, and that its Script Property must match `ADMIN_DATA_SECRET`.

- [ ] **Step 2: Run automated verification**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: production build completes successfully.

- [ ] **Step 3: Review the working tree without committing**

Run: `git diff --check && git status --short`
Expected: no whitespace errors; only the intended Admin dashboard, documentation, tests, and configuration files are modified or untracked.
