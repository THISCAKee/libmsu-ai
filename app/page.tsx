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
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-brand">
          <img src="/logo.png" alt="MSU Logo" className="auth-logo-img" />
          <div>
            <span className="auth-eyebrow">LIB AI SYSTEM</span>
            <h1 className="auth-title">ลงทะเบียนเข้าใช้งาน</h1>
          </div>
        </div>

        <p className="auth-subtitle">กรุณากรอกข้อมูลส่วนตัวเพื่อเข้าสู่ระบบศูนย์รวมเครื่องมือ AI</p>

        {error && <div className="auth-error-badge">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="name-input">
              <User size={16} />
              <span>ชื่อ - นามสกุล</span>
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อและนามสกุลจริง"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role-select">
              <ClipboardList size={16} />
              <span>สถานะของคุณ</span>
            </label>
            <div className="select-wrapper">
              <select
                id="role-select"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as "นิสิต" | "บุคลากร");
                  setError("");
                }}
              >
                <option value="นิสิต">นิสิต</option>
                <option value="บุคลากร">บุคลากร</option>
              </select>
            </div>
          </div>

          {role === "นิสิต" ? (
            <>
              <div className="form-group">
                <label htmlFor="student-id-input">
                  <GraduationCap size={16} />
                  <span>รหัสนิสิต (11 หลัก)</span>
                </label>
                <input
                  id="student-id-input"
                  type="text"
                  maxLength={11}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
                  placeholder="เช่น 64010912345"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="year-select">
                  <GraduationCap size={16} />
                  <span>ชั้นปี</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="year-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="faculty-select">
                  <Building2 size={16} />
                  <span>คณะสังกัด</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="faculty-select"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                  >
                    {faculties.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="major-input">
                  <GraduationCap size={16} />
                  <span>สาขาวิชา</span>
                </label>
                <input
                  id="major-input"
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="เช่น วิทยาการคอมพิวเตอร์"
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="department-input">
                <Building2 size={16} />
                <span>ชื่อหน่วยงาน / กอง / คณะ</span>
              </label>
              <input
                id="department-input"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น สำนักคอมพิวเตอร์"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            <span>เข้าสู่ระบบหลัก</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
