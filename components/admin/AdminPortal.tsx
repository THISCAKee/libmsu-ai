"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getReportingYearOptions } from "@/lib/admin-presentation";
import type { AdminStats } from "@/lib/admin-stats";

type StatsResponse = {
  success: true;
  years: number[];
  selectedYear: number;
  stats: AdminStats;
};

type ErrorResponse = { success?: false; error?: string };

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

  const yearOptions = useMemo(
    () => getReportingYearOptions(years, selectedYear),
    [selectedYear, years],
  );

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
      <main className="admin-console grid min-h-screen grid-rows-[5rem_1fr] md:grid-cols-[minmax(13rem,26vw)_1fr] md:grid-rows-1">
        <header className="flex items-center justify-between gap-4 bg-[var(--admin-ink)] px-6 text-white sm:px-8 md:min-h-screen md:flex-col md:items-start md:px-10 md:py-10">
          <img
            src="/logotab.png"
            alt="มหาวิทยาลัยมหาสารคาม"
            className="h-11 w-auto bg-white p-1.5 md:h-14"
          />
          <div className="hidden w-full md:block">
            <div className="mb-6 h-px w-full bg-white/25" aria-hidden="true" />
            <p className="text-xs leading-6 text-white/60">สำนักวิทยบริการ</p>
            <p className="admin-display mt-2 text-xl font-semibold leading-snug">
              ศูนย์รายงานการใช้แพลตฟอร์ม AI
            </p>
          </div>
          <p className="admin-number text-[10px] tracking-[0.14em] text-white/55">
            ระเบียน 01 / ผู้ดูแล
          </p>
        </header>

        <section className="flex min-w-0 items-center px-6 py-12 sm:px-10 md:px-[clamp(3rem,9vw,9rem)]">
          <div
            className="w-full max-w-xl border-y border-[var(--admin-line)] py-6"
            role="status"
            aria-live="polite"
          >
            <p className="admin-number text-[10px] font-semibold tracking-[0.12em] text-[var(--admin-blue)]">
              รายงานการใช้บริการ · ผู้ดูแลระบบ
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-600">
              <Loader2
                className="h-5 w-5 animate-spin text-[var(--admin-blue)] motion-reduce:animate-none"
                aria-hidden="true"
              />
              กำลังตรวจสอบสิทธิ์ผู้ดูแล
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <AdminLogin
        password={password}
        pending={loginPending}
        error={loginError}
        onPasswordChange={(value) => {
          setPassword(value);
          setLoginError("");
        }}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <AdminDashboard
      stats={stats}
      years={yearOptions}
      selectedYear={selectedYear}
      loading={loading}
      error={dashboardError}
      lastUpdated={lastUpdated}
      onSelectYear={(year) => loadStats(year)}
      onRefresh={() => loadStats(selectedYear ?? undefined)}
      onLogout={handleLogout}
    />
  );
}
