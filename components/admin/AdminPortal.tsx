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
