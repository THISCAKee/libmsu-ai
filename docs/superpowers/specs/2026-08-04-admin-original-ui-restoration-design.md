# Admin Original UI Restoration Design

## Objective

Restore the complete Admin experience to the original card-based visual direction introduced in commit `a9fc6b4`, while retaining the current authentication, reporting behavior, component boundaries, accessibility improvements, responsiveness fixes, and data integrations.

This is a presentation-only restoration. It must not revert later functional work or overwrite unrelated changes in `google-apps-script/Code.gs`.

## Visual Baseline

The visual reference is the Admin UI at commit `a9fc6b4`:

- A navy two-column password page with restrained circular decoration.
- A white utility header on a pale blue-gray dashboard background.
- Four rounded annual-summary cards with colored icons.
- A rounded monthly bar-chart card using blue for students and cyan for staff.
- Four rounded ranking cards with colored progress bars.
- Blue focus, loading, and primary-action states.

The later report-ledger and card-catalog visual metaphors are removed.

## Architecture and Component Boundaries

Keep the current separation of responsibilities:

- `AdminPortal` owns session checks, login and logout requests, report loading, selected-year state, and request errors.
- `AdminLogin` renders the restored original password experience and emits password and submit actions.
- `AdminDashboard` composes the restored original report page and emits year, refresh, and logout actions.
- `AnnualLedger` is replaced in the dashboard by the original four-card annual summary presentation, either inline or as a focused presentation component.
- `MonthlyUsageChart` renders the original paired bar chart.
- `RankingPanel` renders the original ranked card with a semantic accent and optional first-place highlight.

Presentation components receive typed values and callbacks. They do not fetch data or access secrets.

## Behavior and Data Flow

All current behavior remains unchanged:

1. `AdminPortal` checks the Admin session.
2. Unauthenticated users see the restored original password page.
3. Successful authentication loads the available years and selected annual report.
4. Year selection, refresh, and logout continue through the current callbacks and API routes.
5. Existing report values, deduplication rules, Buddhist Era formatting, and Thailand-time display remain authoritative.

## States and Errors

Restore the original visual treatment while preserving current state semantics:

- Session checking shows a centered, quiet progress indicator.
- Initial report loading shows a large white loading card.
- Refreshing keeps the current report visible and marks it busy.
- Empty years show all report sections plus the existing empty-data message.
- Login and report errors retain `role="alert"` and a usable retry action.
- Unauthorized report responses return the user to the password page.

## Accessibility and Responsiveness

- Preserve semantic headings, sections, form labels, buttons, ordered lists, `aria-busy`, and alert roles.
- Preserve autofocus, password autocomplete, disabled states, keyboard submission, and visible focus styling.
- Keep all controls and content usable from 320-pixel mobile widths through large desktop screens.
- Preserve reduced-motion behavior for spinners, chart transitions, and any entrance animation.
- Keep chart values and labels visible so information does not depend on color alone.

## Change Isolation

Only Admin presentation files are in scope. Current API routes, authentication helpers, reporting calculations, data readers, and Google Apps Script code remain untouched. Existing uncommitted work outside the Admin presentation files must be preserved.

No broad Git revert or whole-file restoration from `a9fc6b4` will be used where it would discard later behavior. The old snapshot is a visual reference, and the current component contracts remain the implementation baseline.

## Verification

- Run the existing automated test suite.
- Run TypeScript checking and a production build.
- Verify login, session checking, initial loading, populated report, empty report, error, refresh, year selection, and logout states.
- Inspect the restored page at desktop and mobile widths when browser rendering is available.
- Confirm that only Admin presentation files and the approved documentation/plan changed.

## Non-Goals

- No changes to Admin authentication, cookies, secrets, API contracts, report calculations, or Google Sheets integration.
- No new metrics, filters, exports, chart libraries, or application state libraries.
- No redesign of the public AI workspace.
- No exact rollback of obsolete implementation structure when the same visual result can use the safer current structure.

## Success Criteria

- The login and dashboard clearly match the original card-based Admin UI direction from `a9fc6b4`.
- Later functional fixes and current data behavior remain intact.
- The UI remains responsive, keyboard accessible, and usable across loading, empty, and error states.
- Unrelated and uncommitted user work is preserved.
