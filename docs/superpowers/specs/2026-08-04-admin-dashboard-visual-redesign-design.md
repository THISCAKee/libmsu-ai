# Admin Dashboard Visual Redesign Design

## Objective

Redesign the complete Admin experience, including password entry and the authenticated reporting dashboard, so it feels like a deliberately designed institutional reporting product for the Academic Resource Center rather than a generic SaaS or AI-generated dashboard.

The redesign changes presentation and component boundaries only. Authentication, API contracts, reporting calculations, year selection, refresh, logout, loading, empty, and error behavior remain unchanged.

## Audience and Job

The primary audience is library administrators reviewing annual use of approved AI platforms. The page's single job is to let an administrator understand the year's usage pattern, user composition, affiliations, student years, and platform popularity quickly and confidently.

## Design Direction: Library Operations Console

The visual metaphor is a bound annual circulation report brought to life as an operational screen. A narrow report spine anchors the interface, a continuous annual ledger replaces generic metric cards, and the 12-month circulation strip is the single expressive visual element.

### Visual tokens

- Institution Ink `#0B1F33`: navigation spine, primary headings, and high-contrast anchors.
- Report Paper `#F5F7F8`: page background.
- Ledger Line `#D9E0E5`: structure, dividers, and chart guides.
- Signal Blue `#1B4DFF`: active controls and primary data emphasis.
- Staff Teal `#16827A`: staff series and staff-specific reporting.
- Student Amber `#E9A23B`: student series and student-specific reporting.

### Typography

- Bai Jamjuree is the restrained display face for report titles and key section headings.
- Anuphan remains the body and interface face for readable Thai text.
- The system monospace stack with tabular numerals is used only for report values, timestamps, and compact utility labels.

### Shape and depth

- Use mostly square or subtly rounded corners between 4 and 12 pixels.
- Reserve larger rounding for the password input surface only where it supports focus.
- Prefer ledger rules, alignment, and tonal backgrounds over floating cards and diffuse shadows.
- Do not use decorative gradients, glowing circles, colored icon tiles, or four identical KPI cards.

### Motion

- Use one coordinated reveal when annual data becomes available.
- Animate chart values only when the selected year changes.
- Respect `prefers-reduced-motion` and keep all controls immediately usable.

## Login Experience

The password page uses the same report-spine language as the dashboard. It presents the institution mark, a concise system title, a direct password instruction, and a single primary action. It removes marketing copy, ornamental background circles, split-card SaaS composition, and the English "Admin access" eyebrow.

The page must preserve autofocus, password autocomplete, disabled/pending state, generic credential error, keyboard focus, and responsive behavior. On narrow screens, the report spine becomes a compact masthead.

## Dashboard Structure

### Report spine

On desktop, a narrow fixed left rail resembles the spine of an annual report. It contains the institution mark, current report year, short section markers, and a secure-session indicator. Markers identify real report sections and may link to their anchors. It is not a generic application navigation menu.

On mobile, the spine becomes a horizontal masthead and section markers are omitted to preserve space.

### Utility header

The content header contains the report title, selected-year control, last-updated time, refresh, and logout. Controls use plain labels and compact utility styling. The year is displayed in Buddhist Era while API requests continue using the Gregorian year.

### Annual ledger

The annual totals appear as one continuous ruled ledger with four columns: unique users, students, staff, and platform selections. The unique-user value receives typographic emphasis, while student and staff values use their series colors sparingly. Responsive layouts wrap the ledger into two columns without turning values into independent cards.

### Monthly circulation strip

The 12-month visualization is the signature element. It uses a continuous shared baseline, visible values, month labels, and separate student/staff marks. It must remain understandable without color, include an accessible description, show zero months, and support horizontal scrolling at narrow widths.

### Detail register

Faculty, workplace, student-year, and AI-platform rankings use structured register lists. Each register has a clear report label, ranked rows, aligned tabular values, and restrained rules. Colored progress bars and repeated colored icon tiles are removed. The most-selected AI platform receives one subtle, meaningful distinction.

The registers use a responsive asymmetric grid driven by content: affiliation registers receive more width than student-year and AI rankings. They must not be forced into four equal cards.

## Component Boundaries

- `AdminPortal` retains session and request orchestration only.
- `AdminLogin` renders the password experience and emits login intent.
- `AdminDashboard` composes authenticated report sections and emits year, refresh, and logout actions.
- `AnnualLedger` renders the four annual totals.
- `MonthlyUsageChart` owns the circulation-strip visualization.
- `RankingPanel` renders one detail register with a small semantic variant set.

Each component receives typed values and callbacks. No presentation component fetches data or knows Admin secrets.

## States and Errors

- Authentication checking uses a quiet full-page progress state aligned to the report spine.
- Initial data loading preserves the report structure with purposeful placeholders rather than an isolated floating spinner card.
- Refreshing existing data keeps the current report visible and marks it as updating.
- Empty years keep every report section visible with zero values and a concise invitation to select another year.
- Errors state what could not be loaded and provide one clearly named retry action.
- Unauthorized API responses return to the password page as before.

## Accessibility and Responsiveness

- Maintain semantic headings, sections, labels, buttons, select controls, ordered rankings, `role="alert"`, and `aria-busy` behavior.
- Use visible focus rings that meet contrast requirements.
- Data distinctions use labels, position, and shape in addition to color.
- Layout supports 320-pixel mobile width through large desktop screens.
- Motion is disabled or reduced under `prefers-reduced-motion`.

## Testing and Verification

- Existing domain, authentication, and data-reader tests must remain green.
- Add focused tests for any new pure formatting or presentation-model helpers before implementation.
- Run TypeScript type checking and the production build.
- Verify login, loading, populated, empty, error, refresh, year selection, and logout states.
- Inspect desktop and mobile rendering when a browser backend is available; otherwise document the visual-QA limitation and verify rendered HTTP output plus static behavior.

## Explicit Non-Goals

- No changes to Admin authentication, cookie behavior, Google Apps Script access, reporting calculations, or API response shapes.
- No additional reporting metrics, exports, filters, or live updates.
- No chart library, design-system dependency, or client-side data store.
- No redesign of the public AI platform workspace.

## Success Criteria

- Login and dashboard read as one coherent institutional product.
- The layout does not rely on generic floating KPI cards, ornamental gradients, or rainbow icon treatments.
- The annual circulation strip is the memorable visual signature.
- An administrator can find the year, annual totals, monthly pattern, affiliation breakdowns, student years, and top AI platform at a glance.
- Existing Admin behavior and reporting results remain unchanged.
- Mobile, keyboard, reduced-motion, loading, empty, and error experiences remain usable.
