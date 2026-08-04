"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarDays,
  GraduationCap,
  KeyRound,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { MonthlyUsageChart } from "@/components/admin/MonthlyUsageChart";
import { RankingPanel } from "@/components/admin/RankingPanel";
import type { AdminStats } from "@/lib/admin-stats";

type StatsResponse = {
  success: true;
  years: number[];
  selectedYear: number;
  stats: AdminStats;
};

type ErrorResponse = { success?: false; error?: string };

const summaryCards = [
  {
    key: "uniqueUsers" as const,
    label: "ผู้ใช้งานไม่ซ้ำ",
    hint: "รวมทั้งปี",
    icon: Users,
    tone: "bg-[#102a4c] text-white",
    iconTone: "bg-white/10 text-cyan-300",
  },
  {
    key: "students" as const,
    label: "นิสิต",
    hint: "นับจากรหัสนิสิต",
    icon: GraduationCap,
    tone: "bg-white text-slate-900",
    iconTone: "bg-blue-50 text-blue-600",
  },
  {
    key: "staff" as const,
    label: "บุคลากร",
    hint: "นับจากชื่อ-นามสกุล",
    icon: Building2,
    tone: "bg-white text-slate-900",
    iconTone: "bg-cyan-50 text-cyan-600",
  },
  {
    key: "selections" as const,
    label: "การเลือกแพลตฟอร์ม",
    hint: "รวมทุกรายการ",
    icon: Sparkles,
    tone: "bg-white text-slate-900",
    iconTone: "bg-violet-50 text-violet-600",
  },
];

async function readJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export function AdminPortal() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async (year?: number) => {
    setLoading(true);
    setDashboardError("");
    try {
      const query = year ? `?year=${year}` : "";
      const response = await fetch(`/api/admin/stats${query}`, { cache: "no-store" });
      const payload = await readJson<StatsResponse | ErrorResponse>(response);

      if (response.status === 401) {
        setAuthenticated(false);
        setStats(null);
        return;
      }
      if (!response.ok || payload?.success !== true) {
        const message = payload && "error" in payload ? payload.error : undefined;
        throw new Error(message || "ไม่สามารถโหลดข้อมูลรายงานได้");
      }

      setAuthenticated(true);
      setStats(payload.stats);
      setYears(payload.years);
      setSelectedYear(payload.selectedYear);
      setLastUpdated(new Date());
    } catch (error) {
      setDashboardError(
        error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลรายงานได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const payload = await readJson<{ authenticated?: boolean }>(response);
        if (!active) return;
        const isAuthenticated = payload?.authenticated === true;
        setAuthenticated(isAuthenticated);
        if (isAuthenticated) await loadStats();
      } catch {
        if (active) setAuthenticated(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadStats]);

  const yearOptions = useMemo(() => {
    const options = new Set(years);
    if (selectedYear) options.add(selectedYear);
    return [...options].sort((a, b) => b - a);
  }, [selectedYear, years]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password || loginPending) return;
    setLoginPending(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await readJson<ErrorResponse>(response);
      if (!response.ok) {
        throw new Error(payload?.error || "เข้าสู่ระบบผู้ดูแลไม่สำเร็จ");
      }
      setPassword("");
      setAuthenticated(true);
      await loadStats();
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "เข้าสู่ระบบผู้ดูแลไม่สำเร็จ",
      );
    } finally {
      setLoginPending(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthenticated(false);
    setStats(null);
    setYears([]);
    setSelectedYear(null);
  };

  if (authenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          กำลังตรวจสอบสิทธิ์ผู้ดูแล
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d2340] px-4 py-10">
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[64px] border-cyan-400/20" />
          <div className="absolute -bottom-40 -left-24 h-[460px] w-[460px] rounded-full border-[80px] border-blue-500/20" />
        </div>
        <div className="relative z-10 grid w-full max-w-[880px] overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl shadow-slate-950/35 md:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[#102a4c] p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <img src="/logotab.png" alt="มหาวิทยาลัยมหาสารคาม" className="h-14 w-auto rounded-xl bg-white p-2" />
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                LIB AI Intelligence
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
                ข้อมูลที่ช่วยให้บริการ<br />ได้ตรงจุดกว่าเดิม
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                ภาพรวมการใช้แพลตฟอร์ม AI สำหรับสำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              สำหรับผู้ดูแลระบบเท่านั้น
            </div>
          </section>

          <section className="px-6 py-10 sm:px-10 md:p-12">
            <div className="mb-8 md:hidden">
              <img src="/logotab.png" alt="มหาวิทยาลัยมหาสารคาม" className="h-12 w-auto" />
            </div>
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Admin access
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              เข้าสู่ระบบผู้ดูแล
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              กรอกรหัสผ่านกลางเพื่อเปิดดูรายงานการใช้งาน
            </p>

            {loginError && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-7">
              <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold text-slate-600">
                รหัสผ่านผู้ดูแล
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError("");
                }}
                autoComplete="current-password"
                autoFocus
                required
                disabled={loginPending}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                placeholder="กรอกรหัสผ่าน"
              />
              <button
                type="submit"
                disabled={!password || loginPending}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {loginPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loginPending ? "กำลังตรวจสอบ" : "เปิด Dashboard"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
              <img src="/logotab.png" alt="MSU" className="h-8 w-auto" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">LIB AI · Admin</p>
              <h1 className="text-xl font-bold tracking-tight text-[#102a4c]">สถิติการใช้งานแพลตฟอร์ม AI</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="report-year" className="sr-only">เลือกปีรายงาน</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                id="report-year"
                value={selectedYear ?? ""}
                onChange={(event) => loadStats(Number(event.target.value))}
                disabled={loading}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>ปี {year + 543}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▼</span>
            </div>
            <button
              type="button"
              onClick={() => loadStats(selectedYear ?? undefined)}
              disabled={loading}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              รีเฟรช
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <LogOut className="h-3.5 w-3.5" />
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
              {selectedYear ? `พ.ศ. ${selectedYear + 543}` : "กำลังโหลด"}
            </h2>
          </div>
          {lastUpdated && (
            <p className="text-xs text-slate-400">
              อัปเดตล่าสุด {lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
            </p>
          )}
        </div>

        {dashboardError && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <span className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{dashboardError}</span>
            <button type="button" onClick={() => loadStats(selectedYear ?? undefined)} className="cursor-pointer self-start font-bold underline underline-offset-4 sm:self-auto">ลองอีกครั้ง</button>
          </div>
        )}

        {loading && !stats ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              กำลังสรุปข้อมูลการใช้งาน
            </div>
          </div>
        ) : stats ? (
          <div className={loading ? "pointer-events-none opacity-60" : ""} aria-busy={loading}>
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="สรุปข้อมูลรายปี">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.key} className={`relative overflow-hidden rounded-[22px] border border-slate-200/70 p-5 shadow-sm ${card.tone}`}>
                    {card.key === "uniqueUsers" && <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full border-[24px] border-cyan-300/10" aria-hidden="true" />}
                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-xs font-medium ${card.key === "uniqueUsers" ? "text-slate-300" : "text-slate-500"}`}>{card.label}</p>
                        <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{stats.summary[card.key].toLocaleString("th-TH")}</p>
                        <p className={`mt-1 text-[10px] ${card.key === "uniqueUsers" ? "text-slate-400" : "text-slate-400"}`}>{card.hint}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconTone}`}><Icon className="h-5 w-5" /></div>
                    </div>
                  </article>
                );
              })}
            </section>

            {stats.summary.selections === 0 && (
              <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-center text-sm text-slate-500">
                ยังไม่มีบันทึกการใช้งานในปีที่เลือก
              </div>
            )}

            <div className="mb-6"><MonthlyUsageChart data={stats.monthly} /></div>

            <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4" aria-label="รายละเอียดการใช้งาน">
              <RankingPanel eyebrow="นิสิต" title="คณะสังกัด" icon={<GraduationCap className="h-5 w-5" />} items={stats.faculties} accent="blue" />
              <RankingPanel eyebrow="บุคลากร" title="หน่วยงาน" icon={<Building2 className="h-5 w-5" />} items={stats.departments} accent="cyan" />
              <RankingPanel eyebrow="นิสิต" title="ชั้นปี" icon={<BookOpenCheck className="h-5 w-5" />} items={stats.studentYears} accent="amber" />
              <RankingPanel eyebrow="แพลตฟอร์ม AI" title="ถูกเลือกมากที่สุด" icon={<BarChart3 className="h-5 w-5" />} items={stats.platforms} accent="violet" highlightFirst />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
