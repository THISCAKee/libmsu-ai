# Admin Usage Dashboard Design

## Objective

Build a password-protected Thai-language Admin dashboard at `/admin` for annual reporting from the existing Google Sheets usage records. An administrator selects a year and sees monthly unique users, student/staff composition, faculty and workplace affiliation, student year levels, and the most-selected AI platforms.

## Scope

The dashboard reports the existing **บันทึกการใช้งาน** created whenever a user performs a **การเลือกแพลตฟอร์ม**. It does not add user accounts, role management, record editing, exports, or a new database.

## Architecture

- Keep the existing `Logs` Google Sheet as the source of truth.
- Extend the Google Apps Script with a read operation protected by a separate shared data secret stored in Apps Script Properties.
- Add server-only Next.js Admin endpoints for login, logout, available reporting years, and annual statistics.
- Authenticate administrators with one shared password from `ADMIN_PASSWORD`.
- On successful login, issue a signed, `httpOnly`, `sameSite=lax` cookie. Mark it `secure` in production and give it a fixed expiration.
- Use a separate `ADMIN_SESSION_SECRET` to sign and verify the cookie. Do not store the Admin password in the cookie.
- Use `ADMIN_DATA_SECRET` for server-to-server access to Apps Script. The browser must never receive this secret or the raw Sheets rows.
- Parse and aggregate raw records on the Next.js server. The browser receives summary values only.

## Admin Flow

1. An unauthenticated visit to `/admin` displays a Thai login form.
2. The form submits the shared password to the Admin login endpoint.
3. The endpoint compares the password safely and creates the signed Admin session cookie.
4. The dashboard loads the list of available years and selects the current year when it has data; otherwise it selects the newest available year.
5. Selecting a year requests `/api/admin/stats?year=YYYY` and refreshes every dashboard section.
6. Logout clears the Admin session cookie and returns to the login state.

## Reporting Rules

### Time

- Parse the existing Thailand-time value in the format `HH:mm DD/MM/YYYY`.
- Group records into January through December for the selected calendar year.
- Invalid timestamps are excluded from reporting.

### Unique users

- A student is uniquely identified by normalized `รหัสนิสิต`.
- A staff member is uniquely identified by normalized `ชื่อ-นามสกุล`.
- Normalization trims surrounding whitespace. Staff names are also case-folded for comparison.
- Missing identifiers are excluded from unique-user totals rather than merged into one anonymous user.
- The same person selected multiple times in one month counts once in that month.
- The same person active in multiple months counts once in each relevant month, but only once in the selected year's annual total.
- Student and staff identifiers use separate namespaces, preventing accidental collision.

### Breakdowns

- Annual summary cards show unique users overall, unique students, unique staff, and total platform selections.
- Monthly statistics contain all 12 months, including months with zero usage, split into student and staff unique-user counts.
- Student faculty counts use unique students per `คณะสังกัด`.
- Staff workplace counts use unique staff per `หน่วยงาน`.
- Student year-level counts use unique students per `ชั้นปี`.
- Missing faculty, workplace, or year values appear as `ไม่ระบุ`.
- AI popularity counts every valid platform selection, because the requested measure is which platform was used most often rather than how many unique people used it.
- AI platforms are sorted by selection count descending, then by name for stable ties. The top result is visually emphasized.

If one user has conflicting affiliation or year values within the selected year, the most recent valid value is used in the annual breakdown.

## Dashboard Interface

- A compact header contains the dashboard title, selected-year control, manual refresh, and logout.
- Four summary cards show annual unique users, students, staff, and total platform selections.
- A responsive 12-month chart compares unique students and staff. It uses repository-native HTML/CSS/SVG and adds no chart dependency.
- Separate ranked panels show student faculties, staff workplaces, student year levels, and AI platforms.
- The interface is responsive for mobile and desktop and uses the project's existing Anuphan typography and light visual language.
- Accessible labels, native buttons/select controls, visible focus states, and non-color-only chart legends are required.

## States and Errors

- Loading uses a visible progress state without showing stale values as current.
- An empty year shows the dashboard structure with zero totals and an explicit no-data message.
- Invalid passwords return a generic Thai error without revealing configuration details.
- Missing server configuration returns a controlled service-unavailable response.
- Upstream Apps Script or parsing failures return a controlled dashboard error and allow manual retry.
- Unauthorized API access returns HTTP 401 and never includes reporting data.

## Security

- Admin secrets remain server-only and must not use the `NEXT_PUBLIC_` prefix.
- Password comparison avoids obvious timing leaks.
- Session cookies are cryptographically signed and verified on every Admin API request.
- Apps Script rejects read requests without the matching Script Property secret.
- The reporting API returns aggregates only; names, student IDs, and raw usage rows are never exposed to the browser.
- Existing user authentication and platform-selection logging remain unchanged.

## Testing

- Unit tests cover timestamp parsing, year filtering, unique-user rules, repeated activity, monthly cross-counting, missing identifiers, conflicting affiliations, empty data, and AI ranking ties.
- Authentication tests cover correct and incorrect passwords, signed-cookie validation, expiration, logout, and missing configuration.
- API-level tests cover unauthorized requests, invalid years, upstream failure, and successful aggregate responses.
- Verification includes type checking, automated tests, production build, and manual checks of mobile and desktop dashboard states.

## Configuration

Next.js environment:

- `ADMIN_PASSWORD`: shared password entered by administrators.
- `ADMIN_SESSION_SECRET`: high-entropy value used only to sign Admin session cookies.
- `ADMIN_DATA_SECRET`: high-entropy value sent only from the Next.js server to Apps Script.
- `GOOGLE_SHEETS_SCRIPT_URL`: existing deployed Apps Script URL.

Google Apps Script Properties:

- `ADMIN_DATA_SECRET`: the same value configured on the Next.js server.

## Success Criteria

- An administrator can log in with the shared password and log out.
- Unauthenticated visitors cannot access dashboard aggregates.
- Selecting a year displays all 12 months and the requested annual breakdowns.
- Students are deduplicated by student ID and staff by full name according to the reporting rules.
- The browser never receives raw user records or server secrets.
- Existing user-facing AI selection and logging behavior continues to work.
