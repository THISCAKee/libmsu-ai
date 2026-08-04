import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarDays,
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
  const reportYear = selectedYear ? formatBuddhistYear(selectedYear) : "กำลังโหลด";

  return (
    <main className="admin-console min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
              <img src="/logotab.png" alt="MSU" className="h-8 w-auto" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
                LIB AI · Admin
              </p>
              <h1 className="text-xl font-bold tracking-tight text-[#102a4c]">
                สถิติการใช้งานแพลตฟอร์ม AI
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="report-year" className="sr-only">เลือกปีรายงาน</label>
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                id="report-year"
                value={selectedYear ?? ""}
                onChange={(event) => onSelectYear(Number(event.target.value))}
                disabled={loading}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{formatBuddhistYear(year)}</option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                aria-hidden="true"
              >
                ▼
              </span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-default disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
                aria-hidden="true"
              />
              รีเฟรช
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">รายงานประจำปี</p>
            <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#102a4c] sm:text-4xl">
              {reportYear}
            </h2>
          </div>
          <div className="flex min-h-5 items-center gap-3 text-xs text-slate-400">
            {lastUpdated && <span>อัปเดตล่าสุด {formatThaiReportTime(lastUpdated)}</span>}
            {loading && stats && (
              <span className="inline-flex items-center gap-1.5 text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                กำลังอัปเดต
              </span>
            )}
          </div>
        </div>

        {error && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              โหลดข้อมูลรายงานไม่สำเร็จ: {error}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              className="cursor-pointer self-start font-bold underline underline-offset-4 sm:self-auto"
            >
              ลองโหลดอีกครั้ง
            </button>
          </div>
        )}

        {loading && !stats ? (
          <section
            className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-white"
            aria-busy="true"
            aria-label="กำลังโหลดรายงาน"
          >
            <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600 motion-reduce:animate-none" aria-hidden="true" />
              กำลังสรุปข้อมูลการใช้งาน
            </div>
          </section>
        ) : stats ? (
          <div
            className={`admin-report-enter ${loading ? "pointer-events-none opacity-60" : ""}`}
            aria-busy={loading}
          >
            <div id="overview" className="scroll-mt-6">
              <AnnualLedger summary={stats.summary} />
            </div>

            {stats.summary.selections === 0 && (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-center text-sm text-slate-500">
                ยังไม่มีบันทึกการใช้งานในปีนี้ ลองเลือกปีรายงานอื่น
              </p>
            )}

            <div id="monthly" className="mt-6 scroll-mt-6">
              <MonthlyUsageChart data={stats.monthly} />
            </div>

            <section
              id="details"
              className="mt-6 grid scroll-mt-6 gap-6 lg:grid-cols-2 xl:grid-cols-4"
              aria-label="รายละเอียดการใช้งาน"
            >
              <RankingPanel
                eyebrow="นิสิต"
                title="คณะสังกัด"
                icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />}
                items={stats.faculties}
                accent="blue"
              />
              <RankingPanel
                eyebrow="บุคลากร"
                title="หน่วยงาน"
                icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
                items={stats.departments}
                accent="cyan"
              />
              <RankingPanel
                eyebrow="นิสิต"
                title="ชั้นปี"
                icon={<BookOpenCheck className="h-5 w-5" aria-hidden="true" />}
                items={stats.studentYears}
                accent="amber"
              />
              <RankingPanel
                eyebrow="แพลตฟอร์ม AI"
                title="ถูกเลือกมากที่สุด"
                icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
                items={stats.platforms}
                accent="violet"
                highlightFirst
              />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
