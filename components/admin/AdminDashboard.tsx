import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  Building2,
  GraduationCap,
  Loader2,
  LogOut,
  RefreshCw,
} from "lucide-react";

import { AnnualLedger } from "@/components/admin/AnnualLedger";
import { MonthlyUsageChart } from "@/components/admin/MonthlyUsageChart";
import { RankingPanel } from "@/components/admin/RankingPanel";
import {
  formatBuddhistYear,
  formatThaiReportTime,
} from "@/lib/admin-presentation";
import type { AdminStats } from "@/lib/admin-stats";

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

export function AdminDashboard({
  stats,
  years,
  selectedYear,
  loading,
  error,
  lastUpdated,
  onSelectYear,
  onRefresh,
  onLogout,
}: AdminDashboardProps) {
  const reportYear = selectedYear ? formatBuddhistYear(selectedYear) : "รายงานประจำปี";

  return (
    <main className="admin-console min-h-screen lg:grid lg:grid-cols-[112px_minmax(0,1fr)]">
      <aside className="border-b border-[var(--admin-line)] bg-[var(--admin-ink)] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <div className="flex h-20 items-center justify-between gap-5 px-5 lg:h-full lg:flex-col lg:items-stretch lg:px-3 lg:py-5">
          <div className="flex items-center gap-3 lg:flex-col lg:gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-white p-1.5 lg:h-12 lg:w-12">
              <img src="/logotab.png" alt="MSU" className="h-full w-auto object-contain" />
            </div>
            <p className="admin-number text-[10px] font-semibold tracking-[0.08em] text-slate-300 lg:text-center">
              {reportYear}
            </p>
          </div>

          <nav aria-label="ส่วนของรายงาน" className="hidden lg:block">
            <ul className="space-y-5 text-center text-[10px] font-medium text-slate-300">
              <li><a href="#overview" className="block border-l-2 border-[var(--admin-blue)] py-1 text-white">ภาพรวม</a></li>
              <li><a href="#monthly" className="block border-l-2 border-transparent py-1 hover:text-white">รายเดือน</a></li>
              <li><a href="#details" className="block border-l-2 border-transparent py-1 hover:text-white">รายละเอียด</a></li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 text-[10px] text-slate-300 lg:flex-col lg:text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-staff)]" aria-hidden="true" />
            <span>เซสชันปลอดภัย</span>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-[var(--admin-line)] bg-white">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 sm:px-8 xl:flex-row xl:items-end xl:justify-between xl:px-10">
            <div>
              <p className="admin-number text-[10px] font-semibold tracking-[0.18em] text-[var(--admin-blue)]">
                LIB AI · USAGE REGISTER
              </p>
              <h1 className="admin-display mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                รายงานการใช้งานแพลตฟอร์ม AI
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{reportYear}</span>
                {lastUpdated && <span>อัปเดตล่าสุด {formatThaiReportTime(lastUpdated)}</span>}
                {loading && stats && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--admin-blue)]">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    กำลังอัปเดต
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="report-year" className="sr-only">เลือกปีรายงาน</label>
              <select
                id="report-year"
                value={selectedYear ?? ""}
                onChange={(event) => onSelectYear(Number(event.target.value))}
                disabled={loading}
                className="h-10 border border-[var(--admin-line)] bg-white px-3 text-sm font-semibold disabled:opacity-60"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{formatBuddhistYear(year)}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="flex h-10 cursor-pointer items-center gap-2 border border-[var(--admin-line)] bg-white px-3 text-xs font-semibold transition-colors hover:border-[var(--admin-blue)] hover:text-[var(--admin-blue)] disabled:cursor-default disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
                รีเฟรชข้อมูล
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-10 cursor-pointer items-center gap-2 px-3 text-xs font-semibold text-slate-600 transition-colors hover:text-red-700"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10">
          {error && (
            <div className="mb-6 flex flex-col gap-3 border-l-4 border-red-600 bg-red-50 px-4 py-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                โหลดข้อมูลรายงานไม่สำเร็จ: {error}
              </span>
              <button type="button" onClick={onRefresh} className="cursor-pointer self-start font-bold underline underline-offset-4 sm:self-auto">
                ลองโหลดอีกครั้ง
              </button>
            </div>
          )}

          {loading && !stats ? (
            <section className="min-h-[520px] border-y border-[var(--admin-line)] bg-white" aria-busy="true" aria-label="กำลังโหลดรายงาน">
              <div className="grid grid-cols-2 border-b border-[var(--admin-line)] lg:grid-cols-4" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-32 animate-pulse border-r border-[var(--admin-line)] bg-slate-100/60" />
                ))}
              </div>
              <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[var(--admin-blue)]" aria-hidden="true" />
                กำลังสรุปข้อมูลการใช้งาน
              </div>
            </section>
          ) : stats ? (
            <div className="admin-report-enter" aria-busy={loading}>
              <div id="overview" className="scroll-mt-6">
                <AnnualLedger summary={stats.summary} />
              </div>

              {stats.summary.selections === 0 && (
                <p className="mt-5 border border-dashed border-[var(--admin-line)] bg-white px-5 py-4 text-center text-sm text-slate-500">
                  ยังไม่มีบันทึกการใช้งานในปีนี้ ลองเลือกปีรายงานอื่น
                </p>
              )}

              <div id="monthly" className="mt-7 scroll-mt-6">
                <MonthlyUsageChart data={stats.monthly} />
              </div>

              <section id="details" className="mt-7 scroll-mt-6" aria-label="รายละเอียดการใช้งาน">
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
                  <RankingPanel eyebrow="นิสิต" title="คณะสังกัด" icon={<GraduationCap className="h-5 w-5" />} items={stats.faculties} accent="blue" />
                  <RankingPanel eyebrow="บุคลากร" title="หน่วยงาน" icon={<Building2 className="h-5 w-5" />} items={stats.departments} accent="cyan" />
                  <RankingPanel eyebrow="นิสิต" title="ชั้นปี" icon={<BookOpenCheck className="h-5 w-5" />} items={stats.studentYears} accent="amber" />
                  <RankingPanel eyebrow="แพลตฟอร์ม AI" title="ถูกเลือกมากที่สุด" icon={<BarChart3 className="h-5 w-5" />} items={stats.platforms} accent="violet" highlightFirst />
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
