"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AiWorkspace } from "@/components/AiWorkspace";
import { aiPlatforms } from "@/data/platforms";
import { Sparkles, User, GraduationCap, Building2, ClipboardList, ArrowRight } from "lucide-react";

type UserProfile = {
  name: string;
  role: "นิสิต" | "บุคลากร";
  studentId?: string;
  year?: string;
  faculty?: string;
  major?: string;
  department?: string;
};

const faculties = [
  "คณะวิทยาศาสตร์",
  "คณะเทคโนโลยี",
  "คณะวิศวกรรมศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์ผังเมืองและนฤมิตศิลป์",
  "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์",
  "คณะวิทยาการสารสนเทศ",
  "คณะพยาบาลศาสตร์",
  "คณะเภสัชศาสตร์",
  "คณะสาธารณสุขศาสตร์",
  "คณะแพทยศาสตร์",
  "คณะสัตวแพทยศาสตร์",
  "คณะมนุษยศาสตร์และสังคมศาสตร์",
  "คณะศึกษาศาสตร์",
  "คณะการบัญชีและการจัดการ",
  "คณะศิลปกรรมศาสตร์และวัฒนธรรมศาสตร์",
  "คณะการท่องเที่ยวและการโรงแรม",
  "วิทยาลัยการเมืองการปกครอง",
  "คณะนิติศาสตร์",
  "วิทยาลัยดุริยางคศิลป์",
];

const years = [
  "ชั้นปีที่ 1",
  "ชั้นปีที่ 2",
  "ชั้นปีที่ 3",
  "ชั้นปีที่ 4",
  "ชั้นปีที่ 5 ขึ้นไป",
];

const sessionTimeoutMs = 3 * 60 * 60 * 1000;
const userProfileStorageKey = "lib_ai_user_profile";
const sessionResetStorageKey = "lib_ai_session_reset";
const sessionResetChannelName = "lib_ai_session_reset_channel";
const sessionResetMessage = "หมดเวลาใช้งานระบบ กรุณากรอกข้อมูลใหม่";

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastSessionResetId = useRef<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState<"นิสิต" | "บุคลากร">("นิสิต");
  const [studentId, setStudentId] = useState("");
  const [year, setYear] = useState(years[0]);
  const [faculty, setFaculty] = useState(faculties[0]);
  const [major, setMajor] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const applySessionReset = useCallback((resetId: string) => {
    if (lastSessionResetId.current === resetId) {
      return;
    }

    lastSessionResetId.current = resetId;
    localStorage.removeItem(userProfileStorageKey);
    setUserProfile(null);
    window.alert(sessionResetMessage);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(userProfileStorageKey);
    if (stored) {
      try {
        setUserProfile(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored user profile", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleSessionReset = (event: StorageEvent) => {
      if (event.key !== sessionResetStorageKey || !event.newValue) {
        return;
      }

      applySessionReset(event.newValue);
    };

    window.addEventListener("storage", handleSessionReset);

    return () => window.removeEventListener("storage", handleSessionReset);
  }, [applySessionReset]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(sessionResetChannelName);

    channel.onmessage = (event) => {
      if (typeof event.data === "string") {
        applySessionReset(event.data);
      }
    };

    return () => channel.close();
  }, [applySessionReset]);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const resetId = Date.now().toString();
      localStorage.setItem(sessionResetStorageKey, resetId);

      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(sessionResetChannelName);
        channel.postMessage(resetId);
        channel.close();
      }

      applySessionReset(resetId);
    }, sessionTimeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [applySessionReset, userProfile]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (role === "นิสิต") {
      const cleanId = studentId.replace(/\D/g, "");
      if (cleanId.length !== 11) {
        setError("กรุณากรอกรหัสนิสิตให้ครบ 11 หลัก");
        return;
      }
      if (!year) {
        setError("กรุณาเลือกชั้นปี");
        return;
      }
      if (!faculty) {
        setError("กรุณาเลือกคณะ");
        return;
      }
      if (!major.trim()) {
        setError("กรุณากรอกสาขาวิชา");
        return;
      }

      const profileData: UserProfile = {
        name: name.trim(),
        role,
        studentId: cleanId,
        year,
        faculty,
        major: major.trim(),
      };

      await saveProfile(profileData);
    } else {
      if (!department.trim()) {
        setError("กรุณากรอกชื่อหน่วยงาน");
        return;
      }

      const profileData: UserProfile = {
        name: name.trim(),
        role,
        department: department.trim(),
      };

      await saveProfile(profileData);
    }
  };

  const saveProfile = async (profile: UserProfile) => {
    localStorage.setItem(userProfileStorageKey, JSON.stringify(profile));
    setUserProfile(profile);
  };

  const handleLogout = () => {
    localStorage.removeItem(userProfileStorageKey);
    setUserProfile(null);
  };

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (userProfile) {
    return (
      <AiWorkspace
        platforms={aiPlatforms}
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-100vh p-6 bg-[#0b0f19]">
      <div className="w-full max-w-[480px] bg-slate-900/55 border border-white/8 rounded-3xl p-10 backdrop-blur-[20px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:height-[4px] before:bg-gradient-to-r before:from-teal-600 before:to-violet-700 before:rounded-t-3xl animate-[fadeIn_0.4s_ease-out]">
        <div className="flex items-center gap-4 mb-3">
          <img src="/logo.png" alt="MSU Logo" className="w-auto h-[90px] object-contain" />
          <div>
            <span className="block text-[11px] font-bold tracking-[0.15em] text-[#2dd4bf] uppercase">
              LIB AI SYSTEM
            </span>
            <h1 className="text-26px font-bold text-white">ลงทะเบียนเข้าใช้งาน</h1>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-normal mb-7">กรุณากรอกข้อมูลส่วนตัวเพื่อเข้าสู่ระบบศูนย์รวมเครื่องมือ AI</p>

        {error && <div className="bg-red-500/10 border border-red-500/25 text-red-500 p-3.5 rounded-lg text-xs font-semibold mb-6">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name-input" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <User size={16} />
              <span className="text-slate-300">ชื่อ - นามสกุล</span>
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อและนามสกุลจริง"
              className="w-full p-4 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none transition-all duration-250 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="role-select" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <ClipboardList size={16} />
              <span className="text-slate-300">สถานะของคุณ</span>
            </label>
            <div className="relative w-full after:content-['▼'] after:text-[10px] after:text-slate-400 after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:pointer-events-none">
              <select
                id="role-select"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as "นิสิต" | "บุคลากร");
                  setError("");
                }}
                className="w-full p-4 pr-10 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none cursor-pointer appearance-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
              >
                <option value="นิสิต" className="bg-slate-900 text-white">นิสิต</option>
                <option value="บุคลากร" className="bg-slate-900 text-white">บุคลากร</option>
              </select>
            </div>
          </div>

          {role === "นิสิต" ? (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="student-id-input" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <GraduationCap size={16} />
                  <span className="text-slate-300">รหัสนิสิต (11 หลัก)</span>
                </label>
                <input
                  id="student-id-input"
                  type="text"
                  maxLength={11}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
                  placeholder="เช่น 64010912345"
                  className="w-full p-4 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none transition-all duration-250 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="year-select" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <GraduationCap size={16} />
                  <span className="text-slate-300">ชั้นปี</span>
                </label>
                <div className="relative w-full after:content-['▼'] after:text-[10px] after:text-slate-400 after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:pointer-events-none">
                  <select
                    id="year-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-4 pr-10 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none cursor-pointer appearance-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-slate-900 text-white">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="faculty-select" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Building2 size={16} />
                  <span className="text-slate-300">คณะสังกัด</span>
                </label>
                <div className="relative w-full after:content-['▼'] after:text-[10px] after:text-slate-400 after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:pointer-events-none">
                  <select
                    id="faculty-select"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full p-4 pr-10 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none cursor-pointer appearance-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
                  >
                    {faculties.map((f) => (
                      <option key={f} value={f} className="bg-slate-900 text-white">
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="major-input" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <GraduationCap size={16} />
                  <span className="text-slate-300">สาขาวิชา</span>
                </label>
                <input
                  id="major-input"
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="เช่น วิทยาการคอมพิวเตอร์"
                  className="w-full p-4 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none transition-all duration-250 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
                  required
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label htmlFor="department-input" className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Building2 size={16} />
                <span className="text-slate-300">ชื่อหน่วยงาน / กอง / คณะ</span>
              </label>
              <input
                id="department-input"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น สำนักคอมพิวเตอร์"
                className="w-full p-4 text-sm rounded-lg border border-white/10 bg-slate-950/60 text-slate-50 outline-none transition-all duration-250 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:bg-slate-950/80"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 w-full p-4 rounded-xl border-none bg-gradient-to-r from-teal-600 to-teal-800 text-white text-base font-semibold cursor-pointer shadow-[0_8px_24px_rgba(13,148,136,0.25)] mt-2.5 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-[0_12px_30px_rgba(13,148,136,0.35)] active:translate-y-0"
          >
            <span>เข้าสู่ระบบหลัก</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
