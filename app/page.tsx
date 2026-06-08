"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { AiWorkspace } from "@/components/AiWorkspace";
import {
  OnboardingForm,
  type OnboardingData,
} from "@/components/OnboardingForm";
import { aiPlatforms } from "@/data/platforms";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
type UserProfile = {
  name: string;
  role: "นิสิต" | "บุคลากร";
  studentId?: string;
  year?: string;
  faculty?: string;
  major?: string;
  department?: string;
};

/* ─── Helpers ────────────────────────────────────────────── */
const STORAGE_KEY = "lib-ai-profile";

function loadProfile(email: string): OnboardingData | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}:${email}`);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}

function saveProfile(email: string, data: OnboardingData) {
  try {
    sessionStorage.setItem(`${STORAGE_KEY}:${email}`, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function onboardingToUserProfile(
  name: string,
  data: OnboardingData,
): UserProfile {
  if (data.role === "บุคลากร") {
    return { name, role: "บุคลากร", department: data.department };
  }
  return {
    name,
    role: "นิสิต",
    studentId: data.studentId,
    year: data.year,
    faculty: data.faculty,
    major: data.major,
  };
}

/* ─── Error messages ─────────────────────────────────────── */
const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "ไม่สามารถเชื่อมต่อ Google OAuth ได้ กรุณาตรวจสอบการตั้งค่า",
  OAuthCallback: "เกิดข้อผิดพลาดระหว่าง callback กรุณาลองใหม่อีกครั้ง",
  OAuthCreateAccount: "ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่",
  EmailCreateAccount: "ไม่สามารถสร้างบัญชีด้วยอีเมลนี้ได้",
  Callback: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  OAuthAccountNotLinked:
    "อีเมลนี้ถูกใช้กับวิธีอื่นอยู่แล้ว กรุณาเข้าสู่ระบบด้วยวิธีเดิม",
  AccessDenied:
    "ไม่มีสิทธิ์เข้าใช้งาน — กรุณาใช้อีเมลมหาวิทยาลัย @msu.ac.th เท่านั้น",
  Verification: "ลิงก์ยืนยันหมดอายุ กรุณาลองใหม่",
  Default: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
};

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const { data: session, status } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  // Profile stored locally per-email
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* Read URL error param */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    setAuthError(ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  /* Load saved profile when session is ready */
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    // ตรวจสอบว่ามี flag ใน sessionStorage หรือไม่ (ถ้าเปิด tab ใหม่/เปิด browser ใหม่ sessionStorage จะว่างเปล่า)
    const isTabActive = sessionStorage.getItem("tab_session_active");
    if (!isTabActive) {
      (async () => {
        await signOut({ callbackUrl: "/" });
      })();
      return;
    }

    const saved = loadProfile(session.user.email);
    setProfile(saved);
    setProfileLoaded(true);
  }, [status, session?.user?.email]);

  /* Auto-logout หลัง 3 ชั่วโมง */
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loginAt = (session as any).loginAt as number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maxAge = (session as any).maxAge as number | undefined;

    if (!loginAt || !maxAge) return;

    const expiresAt = loginAt + maxAge * 1000;

    function checkAndLogout() {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        (async () => {
          await signOut({ callbackUrl: "/" });
        })();
      }
      return remaining;
    }

    // ตรวจสอบทันที
    const remaining = checkAndLogout();
    if (remaining <= 0) return;

    // ตั้ง timer นับถอยหลัง
    const timerId = setTimeout(() => {
      (async () => {
        await signOut({ callbackUrl: "/" });
      })();
    }, remaining);

    // ตรวจสอบอีกครั้งเมื่อกลับมาที่ tab (กรณี laptop sleep)
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        checkAndLogout();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [status, session]);

  const handleLogin = async () => {
    const email = emailInput.trim().toLowerCase();
    const name = nameInput.trim();
    setEmailError(null);
    setNameError(null);
    setAuthError(null);

    let hasError = false;

    if (!name) {
      setNameError("กรุณากรอกชื่อ-นามสกุลของคุณ");
      hasError = true;
    }

    if (!email) {
      setEmailError("กรุณากรอกอีเมลของคุณ");
      hasError = true;
    } else if (!email.endsWith("@msu.ac.th")) {
      setEmailError("กรุณาใช้อีเมลมหาวิทยาลัย @msu.ac.th เท่านั้น");
      hasError = true;
    }

    if (hasError) return;

    setIsLoginPending(true);
    try {
      sessionStorage.setItem("tab_session_active", "true");
      const res = await signIn("credentials", {
        redirect: false,
        email,
        name,
        callbackUrl: "/",
      });
      if (res?.error) {
        // หาก credentials ตรวจสอบแล้วไม่ผ่าน
        setAuthError(ERROR_MESSAGES[res.error] ?? ERROR_MESSAGES.Default);
        setIsLoginPending(false);
      }
    } catch {
      setAuthError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoginPending(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("tab_session_active");
    await signOut({ callbackUrl: "/" });
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    if (!session?.user?.email) return;
    saveProfile(session.user.email, data);
    setProfile(data);
  };

  /* ── Loading ── */
  if (status === "loading" || (status === "authenticated" && !profileLoaded)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
          <p className="text-sm text-slate-300">
            กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
          </p>
        </div>
      </main>
    );
  }

  /* ── Authenticated ── */
  if (session?.user?.email) {
    // No profile yet → show onboarding
    if (!profile) {
      return (
        <OnboardingForm
          userName={session.user.name ?? session.user.email}
          onComplete={handleOnboardingComplete}
        />
      );
    }

    // Has profile → go to workspace
    const userProfile = onboardingToUserProfile(
      session.user.name ?? session.user.email,
      profile,
    );

    return (
      <AiWorkspace
        platforms={aiPlatforms}
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    );
  }

  /* ── Login page ── */
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl backdrop-blur-2xl"
          style={{
            boxShadow:
              "0 0 80px 0 rgba(20,184,166,0.08), 0 32px 64px 0 rgba(0,0,0,0.5)",
          }}
        >
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="h-20 w-20 rounded-2xl border border-white/10 bg-white/10 flex items-center justify-center shadow-xl">
                <img
                  src="/logo.png"
                  alt="MSU Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-teal-400 shadow-md shadow-teal-400/50" />
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-teal-300">
              <Sparkles className="h-3 w-3" />
              LIB AI System
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              สำหรับนิสิตและบุคลากร{" "}
              <span className="text-teal-300 font-medium">
                มหาวิทยาลัยมหาสารคาม
              </span>
            </p>
          </div>

          {/* Info cards */}
          <div className="mb-6 space-y-2.5">
            <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  ยืนยันอีเมลมหาวิทยาลัย
                </p>
                <p className="text-xs text-slate-500">
                  ใช้อีเมล @msu.ac.th เพื่อระบุตัวตน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  ระบบเครื่องคอมพิวเตอร์ส่วนรวม
                </p>
                <p className="text-xs text-slate-500">
                  ป้องกันบัญชีปะปนบนบราวเซอร์สาธารณะ
                </p>
              </div>
            </div>
          </div>

          {/* Error from Auth */}
          {authError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-5">{authError}</p>
            </div>
          )}

          {/* Email & Name Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="name-input"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                ชื่อ-นามสกุล
              </label>
              <input
                id="name-input"
                type="text"
                autoComplete="off"
                placeholder="ชื่อ นามสกุล"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError(null);
                }}
                disabled={isLoginPending}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-slate-600 bg-white/[0.04] outline-none transition-all duration-200 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  nameError
                    ? "border-red-400/60 focus:ring-red-400/30"
                    : "border-white/10 focus:border-teal-400/50 focus:ring-teal-400/20"
                }`}
              />
              {nameError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {nameError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email-input"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                อีเมลมหาวิทยาลัย
              </label>
              <input
                id="email-input"
                type="email"
                autoComplete="off"
                placeholder="username@msu.ac.th"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError(null);
                }}
                disabled={isLoginPending}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-slate-600 bg-white/[0.04] outline-none transition-all duration-200 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  emailError
                    ? "border-red-400/60 focus:ring-red-400/30"
                    : "border-white/10 focus:border-teal-400/50 focus:ring-teal-400/20"
                }`}
              />
              {emailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {emailError}
                </p>
              )}
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={isLoginPending}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-teal-400 px-5 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-teal-950/40 transition-all duration-200 hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-400/30 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {isLoginPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังลงชื่อเข้าใช้...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-5 text-slate-600">
            ระบบจัดทำขึ้นเพื่อการใช้บริการคอมพิวเตอร์และสื่อสารสนเทศของห้องสมุด
          </p>

        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม
        </p>
      </div>
    </main>
  );
}
