# Admin Original UI Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Admin login and reporting dashboard to the original rounded card-based UI from commit `a9fc6b4` without reverting current behavior or unrelated work.

**Architecture:** Keep `AdminPortal` as the state and request orchestrator and retain the current typed component contracts. Rebuild only the Admin presentation layer using `a9fc6b4` as the visual reference, with a small tested presentation model for the four summary cards and verification gates after each visual unit.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide React, Node test runner

## Global Constraints

- Treat commit `a9fc6b4` as a visual reference, not as a source tree to restore wholesale.
- Preserve current authentication, API routes, reporting calculations, Buddhist Era formatting, Thailand-time formatting, loading behavior, error behavior, empty behavior, year selection, refresh, and logout.
- Preserve semantic labels, alert roles, `aria-busy`, keyboard behavior, visible focus, responsive layouts from 320 pixels upward, and reduced-motion support.
- Do not modify `google-apps-script/Code.gs`, API files, authentication helpers, reporting calculations, or the public AI workspace.
- Do not add dependencies, metrics, filters, exports, or state libraries.
- Stage only the exact files named by each task because the worktree contains unrelated uncommitted changes.

## File Map

- `lib/admin-presentation.ts`: pure formatting and ordered summary-card model.
- `tests/admin-presentation.test.ts`: tests formatting, year options, and summary-card mapping.
- `app/admin/admin.css`: Admin palette, focus, entrance, and reduced-motion rules.
- `app/admin/layout.tsx`: imports Admin styles without a second font system.
- `components/admin/AdminPortal.tsx`: request orchestration and session-checking presentation.
- `components/admin/AdminLogin.tsx`: original navy split-panel login.
- `components/admin/AdminDashboard.tsx`: original header, annual report heading, states, and composition.
- `components/admin/AnnualLedger.tsx`: keeps its public name but renders four original summary cards.
- `components/admin/MonthlyUsageChart.tsx`: original blue/cyan monthly bar chart.
- `components/admin/RankingPanel.tsx`: original ranking card with accent icon and progress bars.

---

### Task 1: Encode the Original Summary-Card Model

**Files:**
- Modify: `lib/admin-presentation.ts`
- Test: `tests/admin-presentation.test.ts`

**Interfaces:**
- Consumes: `AdminStats["summary"]`.
- Produces: `buildAnnualSummaryCards(summary): AnnualSummaryCard[]`, with accent `"navy" | "blue" | "cyan" | "violet"`.

- [ ] **Step 1: Write the failing summary-card test**

Replace the `buildAnnualLedger` import/test with:

```ts
import {
  buildAnnualSummaryCards,
  formatBuddhistYear,
  formatThaiReportTime,
  getReportingYearOptions,
} from "../lib/admin-presentation.ts";

test("buildAnnualSummaryCards maps annual values to the original card order and accents", () => {
  assert.deepEqual(
    buildAnnualSummaryCards({ uniqueUsers: 12, students: 8, staff: 4, selections: 31 })
      .map(({ key, value, accent }) => ({ key, value, accent })),
    [
      { key: "uniqueUsers", value: 12, accent: "navy" },
      { key: "students", value: 8, accent: "blue" },
      { key: "staff", value: 4, accent: "cyan" },
      { key: "selections", value: 31, accent: "violet" },
    ],
  );
});
```

- [ ] **Step 2: Verify the new API is absent**

Run: `node --test tests/admin-presentation.test.ts`

Expected: FAIL because `buildAnnualSummaryCards` is not exported.

- [ ] **Step 3: Implement the typed summary-card model**

Add the new model alongside the existing `AnnualLedgerItem` and `buildAnnualLedger` exports so the current component continues to type-check until Task 3.

```ts
export type AnnualSummaryCard = {
  key: "uniqueUsers" | "students" | "staff" | "selections";
  label: string;
  hint: string;
  value: number;
  accent: "navy" | "blue" | "cyan" | "violet";
};

export function buildAnnualSummaryCards(summary: AdminStats["summary"]): AnnualSummaryCard[] {
  return [
    { key: "uniqueUsers", label: "ผู้ใช้งานไม่ซ้ำ", hint: "รวมทั้งปี", value: summary.uniqueUsers, accent: "navy" },
    { key: "students", label: "นิสิต", hint: "นับจากรหัสนิสิต", value: summary.students, accent: "blue" },
    { key: "staff", label: "บุคลากร", hint: "นับจากชื่อ-นามสกุล", value: summary.staff, accent: "cyan" },
    { key: "selections", label: "การเลือกแพลตฟอร์ม", hint: "รวมทุกรายการ", value: summary.selections, accent: "violet" },
  ];
}
```

- [ ] **Step 4: Run the presentation tests and type-check**

Run: `node --test tests/admin-presentation.test.ts && npm run typecheck`

Expected: all presentation tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit the isolated model change**

```bash
git add lib/admin-presentation.ts tests/admin-presentation.test.ts
git commit -m "refactor: model original admin summary cards"
```

---

### Task 2: Restore the Admin Shell, Session Check, and Login

**Files:**
- Modify: `app/admin/admin.css`
- Modify: `app/admin/layout.tsx`
- Modify: `components/admin/AdminPortal.tsx`
- Modify: `components/admin/AdminLogin.tsx`

**Interfaces:**
- Consumes: the current `AdminLoginProps` contract and current `AdminPortal` request/state logic.
- Produces: the original navy split-panel login and centered session-checking shell.

- [ ] **Step 1: Record pre-change theme evidence**

Run:

```bash
rg -n "desk-wood|catalog-card|Taviraj|Space_Mono|CARD REGISTER|DRAWER" app/admin components/admin/AdminPortal.tsx components/admin/AdminLogin.tsx
```

Expected: matches prove the card-catalog theme is active.

- [ ] **Step 2: Restore original Admin palette and motion rules**

```css
.admin-console {
  --admin-navy: #102a4c;
  --admin-page: #f4f7fb;
  --admin-blue: #2563eb;
  --admin-cyan: #06b6d4;
  background: var(--admin-page);
  color: #0f172a;
  font-family: var(--font-anuphun), system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

.admin-console :focus-visible {
  outline: 3px solid var(--admin-blue);
  outline-offset: 3px;
}
```

Keep `admin-report-enter`, its keyframes, and `prefers-reduced-motion`. Keep the catalog-specific variables and selectors temporarily so the dashboard remains styled between tasks; Task 5 removes them after every consumer has migrated.

- [ ] **Step 3: Remove the secondary Admin font system**

```tsx
import type { ReactNode } from "react";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
```

- [ ] **Step 4: Restore session-checking presentation only**

Keep all `AdminPortal` hooks, requests, callbacks, and transitions. Replace only the `authenticated === null` return:

```tsx
<main className="admin-console flex min-h-screen items-center justify-center bg-[#f4f7fb]">
  <div className="flex items-center gap-3 text-sm font-medium text-slate-500" role="status" aria-live="polite">
    <Loader2 className="h-5 w-5 animate-spin text-blue-600 motion-reduce:animate-none" aria-hidden="true" />
    กำลังตรวจสอบสิทธิ์ผู้ดูแล
  </div>
</main>
```

- [ ] **Step 5: Restore the original split-panel login**

Use the existing controlled props. Restore the `a9fc6b4` navy background, decorative circle borders, `max-w-[880px]` rounded white two-column card, institution panel, `Admin access` eyebrow, `KeyRound` heading tile, password field, alert, and `ShieldCheck`/`Loader2` submit state.

Preserve `autoFocus`, `autoComplete="current-password"`, `required`, controlled value/change/submit callbacks, disabled behavior, `role="alert"`, and blue focus rings. Read the exact original JSX before adapting it to the current props:

```bash
git show a9fc6b4:components/admin/AdminPortal.tsx | sed -n '125,255p'
```

Move that login-only JSX into `AdminLogin` and replace its old local state references with `password`, `pending`, `error`, `onPasswordChange`, and `onSubmit`. Add `AlertCircle`, `KeyRound`, `Loader2`, and `ShieldCheck` imports from `lucide-react`.

- [ ] **Step 6: Verify the restored shell**

Run: `npm run typecheck && npm run build`

Expected: both commands exit 0; `/admin` appears in the successful build.

- [ ] **Step 7: Commit only shell/login files**

```bash
git add app/admin/admin.css app/admin/layout.tsx components/admin/AdminPortal.tsx components/admin/AdminLogin.tsx
git commit -m "style: restore original admin login shell"
```

---

### Task 3: Restore Dashboard Header and Summary Cards

**Files:**
- Modify: `components/admin/AdminDashboard.tsx`
- Modify: `components/admin/AnnualLedger.tsx`

**Interfaces:**
- Consumes: current `AdminDashboardProps` and `buildAnnualSummaryCards` from Task 1.
- Produces: original utility header, annual heading, states, and four-card grid.

- [ ] **Step 1: Switch to the new model and confirm rendering fails type-check**

Change `AnnualLedger.tsx` to import/call `buildAnnualSummaryCards`. Run: `npm run typecheck`.

Expected: FAIL until the old `tone` rendering is replaced by `accent`.

- [ ] **Step 2: Render original summary cards**

Use `Users`, `GraduationCap`, `Building2`, and `Sparkles`. Map accents as follows:

```ts
const cardStyles = {
  navy: { card: "bg-[#102a4c] text-white", icon: "bg-white/10 text-cyan-300" },
  blue: { card: "bg-white text-slate-900", icon: "bg-blue-50 text-blue-600" },
  cyan: { card: "bg-white text-slate-900", icon: "bg-cyan-50 text-cyan-600" },
  violet: { card: "bg-white text-slate-900", icon: "bg-violet-50 text-violet-600" },
} as const;
```

Render `sm:grid-cols-2 xl:grid-cols-4`; each card uses `rounded-[22px] border border-slate-200/70 p-5 shadow-sm`, label, localized value, hint, and 40-pixel icon tile. Keep the export name `AnnualLedger`.

After `AnnualLedger` uses the new API, delete the now-unused `AnnualLedgerItem` type and `buildAnnualLedger` function from `lib/admin-presentation.ts` and stage that file with this task.

- [ ] **Step 3: Restore the original dashboard frame**

Use a white utility header over `bg-[#f4f7fb]`, `max-w-[1400px]`, logo/title at left, and `CalendarDays`, year selector, `RefreshCw`, and `LogOut` at right. Restore the annual report heading and last-updated line. Continue using `formatBuddhistYear` and `formatThaiReportTime`.

Read the exact original dashboard frame and copy only its presentation structure:

```bash
git show a9fc6b4:components/admin/AdminPortal.tsx | sed -n '255,440p'
```

Adapt request calls to the existing `onSelectYear`, `onRefresh`, and `onLogout` callbacks, and keep the current `stats`, `years`, `selectedYear`, `loading`, `error`, and `lastUpdated` props.

- [ ] **Step 4: Preserve states in the original visual language**

Use the rounded red error panel with retry, a `rounded-[28px]` white initial-loading card, existing empty-year message, and mounted report content at reduced opacity during refresh. Preserve `role="alert"`, `aria-busy`, callbacks, and reduced-motion spinner behavior.

- [ ] **Step 5: Verify dashboard and model**

Run: `npm run test && npm run typecheck`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit dashboard/summary files**

```bash
git add components/admin/AdminDashboard.tsx components/admin/AnnualLedger.tsx lib/admin-presentation.ts
git commit -m "style: restore original admin dashboard cards"
```

---

### Task 4: Restore Monthly Chart and Ranking Cards

**Files:**
- Modify: `components/admin/MonthlyUsageChart.tsx`
- Modify: `components/admin/RankingPanel.tsx`
- Modify: `components/admin/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `MonthlyUsage[]`, `RankingItem[]`, and report data already supplied by `AdminPortal`.
- Produces: `MonthlyUsageChart({ data })` and `RankingPanel({ eyebrow, title, icon, items, accent, highlightFirst })`.

- [ ] **Step 1: Change ranking props and confirm callers fail**

```ts
type RankingPanelProps = {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  items: RankingItem[];
  accent?: "blue" | "cyan" | "amber" | "violet";
  highlightFirst?: boolean;
};
```

Run: `npm run typecheck`.

Expected: FAIL because `AdminDashboard` still passes `reportCode` and `variant`.

- [ ] **Step 2: Restore original ranking cards**

```ts
const accents = {
  blue: { icon: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
  cyan: { icon: "bg-cyan-50 text-cyan-600", bar: "bg-cyan-500" },
  amber: { icon: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
  violet: { icon: "bg-violet-50 text-violet-600", bar: "bg-violet-500" },
} as const;
```

Render rounded white cards, accent icon tile, ordered rank badges, localized counts, proportional progress bars, empty dashed panel, and amber first-place badge when `highlightFirst` is true.

- [ ] **Step 3: Restore original monthly bar chart**

Render a `rounded-[28px]` white card with blue/cyan legend, four dashed guide lines, shared dark baseline, visible values, month labels, and totals. Keep the current detailed `chartDescription` in the `role="img"` accessible label, localized counts, horizontal scrolling, and `motion-reduce:transition-none`.

- [ ] **Step 4: Update dashboard ranking calls**

```tsx
<RankingPanel eyebrow="นิสิต" title="คณะสังกัด" icon={<GraduationCap className="h-5 w-5" />} items={stats.faculties} accent="blue" />
<RankingPanel eyebrow="บุคลากร" title="หน่วยงาน" icon={<Building2 className="h-5 w-5" />} items={stats.departments} accent="cyan" />
<RankingPanel eyebrow="นิสิต" title="ชั้นปี" icon={<BookOpenCheck className="h-5 w-5" />} items={stats.studentYears} accent="amber" />
<RankingPanel eyebrow="แพลตฟอร์ม AI" title="ถูกเลือกมากที่สุด" icon={<BarChart3 className="h-5 w-5" />} items={stats.platforms} accent="violet" highlightFirst />
```

Place them in `grid gap-6 lg:grid-cols-2 xl:grid-cols-4`; remove register codes and catalog-specific copy.

- [ ] **Step 5: Run automated verification**

Run: `npm run test && npm run typecheck && npm run build`

Expected: tests PASS, TypeScript exits 0, and production build succeeds.

- [ ] **Step 6: Commit chart/ranking integration**

```bash
git add components/admin/MonthlyUsageChart.tsx components/admin/RankingPanel.tsx components/admin/AdminDashboard.tsx
git commit -m "style: restore original admin report visuals"
```

---

### Task 5: Visual and Scope Verification

**Files:**
- Verify: `app/admin/*`
- Verify: `components/admin/*`
- Verify unchanged by this work: `google-apps-script/Code.gs`

**Interfaces:**
- Consumes: complete restored Admin presentation from Tasks 1-4.
- Produces: visual and command evidence that the original UI is restored and unrelated work was not included.

- [ ] **Step 1: Start the development server**

Run: `npm run dev`

Expected: server starts without compilation errors and exposes `/admin`.

- [ ] **Step 2: Inspect desktop and mobile states**

Verify around 1440×900 and 390×844: session check; responsive login; wrong-password alert; populated dashboard; zero-selection year; empty rankings; year selection; refresh; retry; logout; keyboard focus; and reduced motion. Confirm the header, four summary cards, blue/cyan monthly bars, and four ranking cards match the `a9fc6b4` direction.

- [ ] **Step 3: Remove obsolete catalog-theme CSS**

Delete the unused `--desk-wood`, `--desk-wood-soft`, `--page-paper`, `--card-cream`, `--ink`, `--line`, `--stamp-red`, `--guide-green`, and `--guide-ochre` variables and the `.catalog-card`, tilt, and `.guide-tab` selectors from `app/admin/admin.css`. Keep the original Admin variables, focus styling, entrance animation, and reduced-motion rules introduced in Task 2.

- [ ] **Step 4: Scan theme residue and run final checks**

```bash
rg -n "desk-wood|catalog-card|guide-tab|stamp-red|Taviraj|Space_Mono|CARD REGISTER|DETAIL DRAWER" app/admin components/admin
npm run test
npm run typecheck
npm run build
git diff --check
```

Expected: residue scan has no matches; all other commands exit 0.

- [ ] **Step 5: Confirm isolation**

```bash
git status --short
git diff -- google-apps-script/Code.gs
```

Expected: the Apps Script file still contains only its pre-existing user changes and was not staged by restoration commits. No API, auth, report-calculation, or public-workspace file appears in a restoration commit.

- [ ] **Step 6: Commit the CSS cleanup and any narrowly scoped QA corrections**

```bash
git add app/admin/admin.css app/admin/layout.tsx components/admin/AdminPortal.tsx components/admin/AdminLogin.tsx components/admin/AdminDashboard.tsx components/admin/AnnualLedger.tsx components/admin/MonthlyUsageChart.tsx components/admin/RankingPanel.tsx lib/admin-presentation.ts tests/admin-presentation.test.ts
git commit -m "fix: finish original admin UI restoration"
```

If no corrections were needed, do not create an empty commit.
