# Admin Dashboard Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Admin login and dashboard presentation with a cohesive Library Operations Console while preserving all authentication, API, and reporting behavior.

**Architecture:** Keep `AdminPortal` as the client-side state and request orchestrator, then extract typed presentation components for login, the authenticated report shell, annual totals, monthly usage, and rankings. Scope the new typography, color tokens, layout, and motion to the `/admin` route so the public workspace is unaffected.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, route-scoped CSS, `next/font/google`, Node `node:test`

## Global Constraints

- Do not modify Admin authentication, cookie behavior, Google Apps Script access, reporting calculations, or API response shapes.
- Do not add reporting metrics, exports, filters, live updates, chart libraries, design-system dependencies, or client-side data stores.
- Do not redesign the public AI platform workspace.
- Preserve the existing `google-apps-script/Code.gs` working-tree change and never stage it with redesign commits.
- Preserve login, year selection, refresh, logout, loading, empty, error, unauthorized, keyboard, mobile, and reduced-motion behavior.
- Use Institution Ink `#0B1F33`, Report Paper `#F5F7F8`, Ledger Line `#D9E0E5`, Signal Blue `#1B4DFF`, Staff Teal `#16827A`, and Student Amber `#E9A23B`.
- Use Bai Jamjuree for restrained display text, Anuphan for body text, and system monospace tabular numerals for report values and utility labels.

---

### Task 1: Admin presentation model

**Files:**
- Create: `lib/admin-presentation.ts`
- Create: `tests/admin-presentation.test.ts`

**Interfaces:**
- Consumes: `AdminStats["summary"]` from `lib/admin-stats.ts`.
- Produces: `formatBuddhistYear(year: number): string`, `formatThaiReportTime(date: Date): string`, `getReportingYearOptions(years: number[], selectedYear: number | null): number[]`, and `buildAnnualLedger(summary: AdminStats["summary"]): AnnualLedgerItem[]`.
- `AnnualLedgerItem` is `{ key: "uniqueUsers" | "students" | "staff" | "selections"; label: string; note: string; value: number; tone: "ink" | "student" | "staff" | "neutral" }`.

- [ ] **Step 1: Write failing presentation tests**

```typescript
test("formatBuddhistYear presents Gregorian report years in Buddhist Era", () => {
  assert.equal(formatBuddhistYear(2026), "พ.ศ. 2569");
});

test("getReportingYearOptions includes the selected empty year and sorts newest first", () => {
  assert.deepEqual(getReportingYearOptions([2024, 2026], 2025), [2026, 2025, 2024]);
});

test("buildAnnualLedger preserves all four report values in report order", () => {
  assert.deepEqual(
    buildAnnualLedger({ uniqueUsers: 12, students: 8, staff: 4, selections: 31 }).map(
      ({ key, value, tone }) => ({ key, value, tone }),
    ),
    [
      { key: "uniqueUsers", value: 12, tone: "ink" },
      { key: "students", value: 8, tone: "student" },
      { key: "staff", value: 4, tone: "staff" },
      { key: "selections", value: 31, tone: "neutral" },
    ],
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/admin-presentation.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/admin-presentation.ts`.

- [ ] **Step 3: Implement the presentation model**

Implement literal Thai labels and notes, deduplicate years with `Set`, sort descending, and format time with `toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น."`. Do not calculate new business metrics.

- [ ] **Step 4: Run presentation and full tests and verify GREEN**

Run: `node --test tests/admin-presentation.test.ts`
Expected: all presentation tests PASS.

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit the presentation model only**

```bash
git add lib/admin-presentation.ts tests/admin-presentation.test.ts
git commit -m "refactor: add admin presentation model"
```

### Task 2: Route-scoped typography and design tokens

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/admin.css`

**Interfaces:**
- Produces: the `--font-admin-display` variable and `.admin-console` scoped color, typography, focus, reveal, reduced-motion, and report-number utilities.
- Consumed by: all Admin presentation components in Tasks 3–5.

- [ ] **Step 1: Add the Admin route layout**

Use `Bai_Jamjuree` from `next/font/google` with Thai and Latin subsets, weights `500`, `600`, and `700`, and variable `--font-admin-display`. Import `admin.css` only from this layout and wrap children in the font-variable class.

- [ ] **Step 2: Define the scoped console tokens and motion**

```css
.admin-console {
  --admin-ink: #0b1f33;
  --admin-paper: #f5f7f8;
  --admin-line: #d9e0e5;
  --admin-blue: #1b4dff;
  --admin-staff: #16827a;
  --admin-student: #e9a23b;
  background: var(--admin-paper);
  color: var(--admin-ink);
}

.admin-display { font-family: var(--font-admin-display), var(--font-anuphun), sans-serif; }
.admin-number { font-variant-numeric: tabular-nums; font-family: ui-monospace, monospace; }
```

Add a single `admin-report-enter` animation and disable it under `prefers-reduced-motion: reduce`. Add scoped `:focus-visible` styling with Signal Blue and no decorative gradient rules.

- [ ] **Step 3: Run static verification**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit only route layout and CSS**

```bash
git add app/admin/layout.tsx app/admin/admin.css
git commit -m "style: add admin report visual system"
```

### Task 3: Institutional Admin login

**Files:**
- Create: `components/admin/AdminLogin.tsx`
- Modify: `components/admin/AdminPortal.tsx`

**Interfaces:**
- `AdminLogin` consumes `{ password: string; pending: boolean; error: string; onPasswordChange(value: string): void; onSubmit(event: FormEvent<HTMLFormElement>): void }`.
- `AdminPortal` keeps all login state and fetch behavior, and renders `AdminLogin` only when unauthenticated.

- [ ] **Step 1: Extract the current login contract without changing behavior**

Move password input, autofocus, `current-password` autocomplete, pending label, error alert, and submit callback into `AdminLogin`. Keep network calls in `AdminPortal`.

```typescript
type AdminLoginProps = {
  password: string;
  pending: boolean;
  error: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminLogin(props: AdminLoginProps) {
  return (
    <main className="admin-console admin-login">
      <header className="admin-login__masthead">
        <img src="/logotab.png" alt="มหาวิทยาลัยมหาสารคาม" />
        <h1 className="admin-display">ศูนย์รายงานการใช้แพลตฟอร์ม AI</h1>
      </header>
      <form onSubmit={props.onSubmit}>
        <label htmlFor="admin-password">รหัสผ่านผู้ดูแล</label>
        <input id="admin-password" type="password" value={props.password} />
        <button type="submit" disabled={props.pending}>เข้าสู่รายงาน</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Implement the report-spine login composition**

Build a full-height Institution Ink masthead/spine with the university mark and Thai product name, paired with a Report Paper credential surface. Remove background circles, gradient-like decoration, split SaaS marketing copy, English eyebrow copy, icon tile, and diffuse shadow. Use one horizontal rule and a report reference label such as `รายงานการใช้บริการ · ผู้ดูแลระบบ`.

```tsx
<p className="admin-kicker">รายงานการใช้บริการ · ผู้ดูแลระบบ</p>
<h1 className="admin-display">ศูนย์รายงานการใช้แพลตฟอร์ม AI</h1>
<label htmlFor="admin-password">รหัสผ่านผู้ดูแล</label>
<input id="admin-password" type="password" autoFocus autoComplete="current-password" />
<button type="submit">เข้าสู่รายงาน</button>
```

- [ ] **Step 3: Verify login accessibility and types**

Run: `npm run typecheck`
Expected: PASS with the form label, alert role, disabled state, autofocus, autocomplete, and keyboard-submit behavior intact.

- [ ] **Step 4: Commit the login extraction and redesign**

```bash
git add components/admin/AdminLogin.tsx components/admin/AdminPortal.tsx
git commit -m "style: redesign admin login"
```

### Task 4: Annual report shell and ledger

**Files:**
- Create: `components/admin/AnnualLedger.tsx`
- Create: `components/admin/AdminDashboard.tsx`
- Modify: `components/admin/AdminPortal.tsx`

**Interfaces:**
- `AnnualLedger` consumes `{ summary: AdminStats["summary"] }` and uses `buildAnnualLedger`.
- `AdminDashboard` consumes `{ stats: AdminStats | null; years: number[]; selectedYear: number | null; loading: boolean; error: string; lastUpdated: Date | null; onSelectYear(year: number): void; onRefresh(): void; onLogout(): void }`.
- `AdminPortal` owns state and passes these values and callbacks without presentation markup.

- [ ] **Step 1: Build the responsive report spine and utility header**

Create a desktop left spine with institution mark, Buddhist report year, real section anchors (`ภาพรวม`, `รายเดือน`, `รายละเอียด`), and secure-session label. Replace it below the desktop breakpoint with a compact horizontal masthead. Put report title, year select, update time, refresh, and logout in a ruled content header.

```typescript
type AdminDashboardProps = {
  stats: AdminStats | null;
  years: number[];
  selectedYear: number | null;
  loading: boolean;
  error: string;
  lastUpdated: Date | null;
  onSelectYear: (year: number) => void;
  onRefresh: () => void;
  onLogout: () => void;
};
```

```tsx
<main className="admin-console min-h-screen lg:grid lg:grid-cols-[112px_1fr]">
  <aside className="admin-report-spine">
    <img src="/logotab.png" alt="MSU" />
    <p>{selectedYear ? formatBuddhistYear(selectedYear) : "รายงาน"}</p>
    <nav><a href="#overview">ภาพรวม</a><a href="#monthly">รายเดือน</a><a href="#details">รายละเอียด</a></nav>
  </aside>
  <div>
    <header className="border-b border-[var(--admin-line)]">
      <h1>รายงานการใช้งานแพลตฟอร์ม AI</h1>
      <select value={selectedYear ?? ""} onChange={(event) => onSelectYear(Number(event.target.value))} />
      <button onClick={onRefresh}>รีเฟรชข้อมูล</button>
      <button onClick={onLogout}>ออกจากระบบ</button>
    </header>
    <div id="overview"><AnnualLedger summary={stats.summary} /></div>
    <div id="monthly"><MonthlyUsageChart data={stats.monthly} /></div>
    <div id="details"><RankingPanel reportCode="AI-01" title="แพลตฟอร์ม AI" items={stats.platforms} /></div>
  </div>
</main>
```

- [ ] **Step 2: Build the continuous annual ledger**

Render all four totals in one ruled grid with shared outer structure. Emphasize unique users through scale and Institution Ink, then use Student Amber and Staff Teal only on their corresponding rule/label. At small widths, wrap into two columns while preserving the shared ledger container.

```tsx
<section className="grid grid-cols-2 border-y border-[var(--admin-line)] lg:grid-cols-4">
  {buildAnnualLedger(summary).map((item) => (
    <article key={item.key} className="border-r border-[var(--admin-line)] px-5 py-6">
      <p>{item.label}</p>
      <p className="admin-number text-4xl">{item.value.toLocaleString("th-TH")}</p>
      <p>{item.note}</p>
    </article>
  ))}
</section>
```

- [ ] **Step 3: Move authenticated composition out of AdminPortal**

Replace authenticated JSX in `AdminPortal` with `AdminDashboard`, preserve the exact `loadStats`, `handleLogout`, selected-year, refresh, `aria-busy`, initial loading, stale-data refreshing, error retry, and empty-year paths.

```tsx
return (
  <AdminDashboard
    stats={stats}
    years={years}
    selectedYear={selectedYear}
    loading={loading}
    error={dashboardError}
    lastUpdated={lastUpdated}
    onSelectYear={(year) => loadStats(year)}
    onRefresh={() => loadStats(selectedYear ?? undefined)}
    onLogout={handleLogout}
  />
);
```

- [ ] **Step 4: Run tests and type checking**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit the dashboard shell and ledger**

```bash
git add components/admin/AnnualLedger.tsx components/admin/AdminDashboard.tsx components/admin/AdminPortal.tsx
git commit -m "style: build admin annual report shell"
```

### Task 5: Circulation strip and detail registers

**Files:**
- Modify: `components/admin/MonthlyUsageChart.tsx`
- Modify: `components/admin/RankingPanel.tsx`
- Modify: `components/admin/AdminDashboard.tsx`

**Interfaces:**
- `MonthlyUsageChart` continues consuming `{ data: MonthlyUsage[] }`.
- `RankingPanel` consumes `{ reportCode: string; title: string; items: RankingItem[]; variant?: "student" | "staff" | "neutral" | "platform" }`.
- `AdminDashboard` assigns semantic variants and asymmetric grid spans; it does not transform report values.

- [ ] **Step 1: Redesign the monthly chart as one circulation strip**

Use one shared ruled surface, a continuous baseline, visible student circles and staff square marks or distinctly shaped bars, direct numeric values, and 12 month labels. Use Student Amber and Staff Teal with pattern/shape distinction, preserve the accessible chart label, zero months, and narrow-screen horizontal scrolling.

```tsx
<div className="flex h-56 items-end border-b border-[var(--admin-ink)]">
  <span
    className="block w-3 rounded-full bg-[var(--admin-student)]"
    style={{ height: `${studentHeight}%` }}
    aria-hidden="true"
  />
  <span
    className="block w-3 rounded-none bg-[var(--admin-staff)]"
    style={{ height: `${staffHeight}%` }}
    aria-hidden="true"
  />
</div>
```

- [ ] **Step 2: Replace ranking cards with register lists**

Remove colored icon tiles and progress bars. Render a report code, title, ranked rows, dotted or ruled leaders, aligned tabular counts, and a restrained empty register. For `platform`, distinguish the first row with one Signal Blue side rule and the label `อันดับสูงสุด`.

```typescript
type RankingPanelProps = {
  reportCode: string;
  title: string;
  items: RankingItem[];
  variant?: "student" | "staff" | "neutral" | "platform";
};
```

```tsx
<ol className="divide-y divide-[var(--admin-line)]">
  {items.map((item, index) => (
    <li key={item.label} className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 py-3">
      <span className="admin-number">{String(index + 1).padStart(2, "0")}</span>
      <span>{item.label}</span>
      <span className="admin-number">{item.count.toLocaleString("th-TH")}</span>
    </li>
  ))}
</ol>
```

- [ ] **Step 3: Compose the asymmetric detail grid**

Give faculty and workplace registers broader spans than student year and AI platform lists. Use real section anchors and preserve semantic ordered lists, headings, empty states, and the existing Thai domain terms `คณะสังกัด`, `หน่วยงาน`, and `ชั้นปี`.

```tsx
<section className="grid gap-px bg-[var(--admin-line)] xl:grid-cols-12">
  <div className="bg-white xl:col-span-7"><RankingPanel reportCode="ST-01" title="คณะสังกัด" items={stats.faculties} variant="student" /></div>
  <div className="bg-white xl:col-span-5"><RankingPanel reportCode="SF-01" title="หน่วยงาน" items={stats.departments} variant="staff" /></div>
  <div className="bg-white xl:col-span-4"><RankingPanel reportCode="ST-02" title="ชั้นปี" items={stats.studentYears} variant="student" /></div>
  <div className="bg-white xl:col-span-8"><RankingPanel reportCode="AI-01" title="แพลตฟอร์ม AI ที่ถูกเลือก" items={stats.platforms} variant="platform" /></div>
</section>
```

- [ ] **Step 4: Run full automated verification**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: production build completes and lists `/admin` plus existing API routes.

- [ ] **Step 5: Commit only visual components**

```bash
git add components/admin/MonthlyUsageChart.tsx components/admin/RankingPanel.tsx components/admin/AdminDashboard.tsx
git commit -m "style: finish admin reporting registers"
```

### Task 6: Visual, responsive, and scope verification

**Files:**
- Modify only if verification exposes a reproducible presentation defect: `app/admin/admin.css`, `components/admin/AdminLogin.tsx`, `components/admin/AdminDashboard.tsx`, `components/admin/AnnualLedger.tsx`, `components/admin/MonthlyUsageChart.tsx`, or `components/admin/RankingPanel.tsx`.

**Interfaces:**
- Consumes the complete `/admin` route.
- Produces no new public interface; this task verifies approved behavior and presentation.

- [ ] **Step 1: Inspect login at mobile and desktop widths**

Verify 320×720 and 1440×1000: no horizontal overflow, label and error remain visible, password can be submitted by keyboard, focus is visible, and the report spine becomes a compact masthead on mobile.

- [ ] **Step 2: Inspect report states at mobile and desktop widths**

Verify initial loading, populated report, empty year, upstream error with retry, refreshing existing data, year selection, and logout. Confirm the annual ledger wraps to two columns, the circulation strip scrolls only within its chart region, and detail registers form an asymmetric grid on desktop.

- [ ] **Step 3: Critique against the design brief**

Remove any remaining decorative gradient, oversized corner radius, colored icon tile, redundant shadow, equal-height four-card pattern, generic English admin copy, or motion that does not communicate state. Confirm the circulation strip remains the only expressive visual signature.

- [ ] **Step 4: Run final verification and inspect scope**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: production build completes successfully.

Run: `git diff --check && git status --short`
Expected: no whitespace errors; the pre-existing `google-apps-script/Code.gs` change remains unstaged and is not included in redesign commits.

- [ ] **Step 5: Commit verification fixes only if Step 1–3 required code changes**

```bash
git add app/admin/admin.css components/admin/AdminLogin.tsx components/admin/AdminDashboard.tsx components/admin/AnnualLedger.tsx components/admin/MonthlyUsageChart.tsx components/admin/RankingPanel.tsx
git commit -m "fix: refine admin dashboard responsiveness"
```
