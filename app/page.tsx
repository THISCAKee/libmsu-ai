"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { AiWorkspace } from "@/components/AiWorkspace";
import {
  OnboardingForm,
  type OnboardingData,
} from "@/components/OnboardingForm";
import { aiPlatforms } from "@/data/platforms";
import { isValidFullName, normalizeFullName } from "@/lib/user-validation";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  type Language,
  useLanguage,
} from "@/components/LanguageProvider";
import { AlertCircle, ArrowRight, Loader2, Mail, User } from "lucide-react";

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
const AUTH_ERROR_MESSAGES: Record<string, Record<Language, string>> = {
  OAuthSignin: {
    th: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบการตั้งค่า",
    en: "Unable to connect to the authentication service. Please check the configuration.",
  },
  OAuthCallback: {
    th: "เกิดข้อผิดพลาดระหว่าง callback กรุณาลองใหม่อีกครั้ง",
    en: "An authentication callback error occurred. Please try again.",
  },
  AccessDenied: {
    th: "ไม่มีสิทธิ์เข้าใช้งาน — กรุณาใช้อีเมลมหาวิทยาลัย @msu.ac.th เท่านั้น",
    en: "Access denied — please use a university @msu.ac.th email address.",
  },
  InvalidName: {
    th: "กรุณากรอกชื่อและนามสกุลด้วยตัวอักษรเท่านั้น โดยเว้นวรรคระหว่างชื่อกับนามสกุล",
    en: "Enter your first and last name using letters only, separated by a space.",
  },
  Default: {
    th: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    en: "Sign-in failed. Please try again.",
  },
};

const LOGIN_COPY = {
  th: {
    loading: "กำลังตรวจสอบสถานะการเข้าสู่ระบบ...",
    title: "เข้าสู่ระบบ",
    audience: "สำหรับนิสิตและบุคลากร",
    university: "มหาวิทยาลัยมหาสารคาม",
    fullName: "ชื่อ-นามสกุล",
    namePlaceholder: "ชื่อ นามสกุล",
    nameRequired: "กรุณากรอกชื่อ-นามสกุลของคุณ",
    nameInvalid:
      "กรุณากรอกชื่อและนามสกุลด้วยตัวอักษรเท่านั้น โดยเว้นวรรคระหว่างชื่อกับนามสกุล",
    universityEmail: "อีเมลมหาวิทยาลัย",
    emailRequired: "กรุณากรอกอีเมลของคุณ",
    emailInvalid: "กรุณาใช้อีเมลมหาวิทยาลัย @msu.ac.th เท่านั้น",
    signingIn: "กำลังลงชื่อเข้าใช้...",
    signIn: "เข้าสู่ระบบ",
    emailOnly: "อีเมล @msu.ac.th เท่านั้น",
    purpose:
      "ระบบจัดทำขึ้นเพื่อการใช้บริการคอมพิวเตอร์และสื่อสารสนเทศของห้องสมุด",
    institution: "สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม",
  },
  en: {
    loading: "Checking your sign-in status...",
    title: "Sign in",
    audience: "For students and staff of",
    university: "Mahasarakham University",
    fullName: "Full name",
    namePlaceholder: "First name Last name",
    nameRequired: "Please enter your first and last name.",
    nameInvalid:
      "Enter your first and last name using letters only, separated by a space.",
    universityEmail: "University email",
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please use a university @msu.ac.th email address.",
    signingIn: "Signing in...",
    signIn: "Sign in",
    emailOnly: "@msu.ac.th email only",
    purpose:
      "This service provides access to the library's computer and information resources.",
    institution: "Academic Resource Center, Mahasarakham University",
  },
} as const;

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const { language } = useLanguage();
  const copy = LOGIN_COPY[language];
  const { data: session, status } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<
    "required" | "invalid" | null
  >(null);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<
    "required" | "invalid" | null
  >(null);

  // Profile stored locally per-email
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* Read URL error param */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    setAuthError(error);
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
    const name = normalizeFullName(nameInput);
    setEmailError(null);
    setNameError(null);
    setAuthError(null);

    let hasError = false;

    if (!name) {
      setNameError("required");
      hasError = true;
    } else if (!isValidFullName(name)) {
      setNameError("invalid");
      hasError = true;
    }

    if (!email) {
      setEmailError("required");
      hasError = true;
    } else if (!email.endsWith("@msu.ac.th")) {
      setEmailError("invalid");
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
        setAuthError(res.error);
        setIsLoginPending(false);
      }
    } catch {
      setAuthError("Default");
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

  const authErrorMessage = authError
    ? (AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default)[language]
    : null;

  /* ── Loading ── */
  if (status === "loading" || (status === "authenticated" && !profileLoaded)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500">{copy.loading}</p>
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
    <main className="relative min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <LanguageToggle className="absolute right-4 top-4 z-20" />
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="h-20 w-20 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center shadow-sm">
                <img
                  src="/logotab.png"
                  alt="MSU Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
              LIB AI System
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {copy.audience}{" "}
              <span className="text-blue-600 font-medium">
                {copy.university}
              </span>
            </p>
          </div>

          {/* Error from Auth */}
          {authErrorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-5">{authErrorMessage}</p>
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
                className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {copy.fullName}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="name-input"
                  type="text"
                  autoComplete="off"
                  placeholder={copy.namePlaceholder}
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setNameError(null);
                  }}
                  disabled={isLoginPending}
                  className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white outline-none transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                    nameError
                      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
              </div>
              {nameError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {nameError === "required"
                    ? copy.nameRequired
                    : copy.nameInvalid}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email-input"
                className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {copy.universityEmail}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
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
                  className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white outline-none transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                    emailError
                      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {emailError === "required"
                    ? copy.emailRequired
                    : copy.emailInvalid}
                </p>
              )}
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={isLoginPending}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
            >
              {isLoginPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{copy.signingIn}</span>
                </>
              ) : (
                <>
                  <span>{copy.signIn}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 justify-center">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">
              {copy.emailOnly}
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
            {copy.purpose}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {copy.institution}
        </p>
      </div>
    </main>
  );
}
