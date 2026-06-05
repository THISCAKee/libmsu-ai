"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronDown,
  GraduationCap,
  Loader2,
  UserCheck,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
export type UserRole = "นิสิต" | "บุคลากร";

export type OnboardingData =
  | {
      role: "บุคลากร";
      department: string;
    }
  | {
      role: "นิสิต";
      studentId: string;
      year: string;
      faculty: string;
      major: string;
    };

/* ─── Constants ──────────────────────────────────────────── */
const FACULTIES = [
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
] as const;

const YEARS = [
  "ชั้นปีที่ 1",
  "ชั้นปีที่ 2",
  "ชั้นปีที่ 3",
  "ชั้นปีที่ 4",
  "ชั้นปีที่ 5",
  "ชั้นปีที่ 6",
  "บัณฑิตศึกษา",
];

/* ─── Sub-components ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-teal-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-teal-400/20"
    />
  );
}

function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-teal-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-teal-400/20 disabled:opacity-50"
        style={{ colorScheme: "dark" }}
      >
        <option value="" disabled className="bg-slate-900 text-slate-500">
          {placeholder ?? "เลือก..."}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-900 text-white">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

/* ─── Role Card ──────────────────────────────────────────── */
function RoleCard({
  role,
  icon,
  description,
  selected,
  onClick,
}: {
  role: UserRole;
  icon: React.ReactNode;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all duration-200 ${
        selected
          ? "border-teal-400/50 bg-teal-400/10 shadow-lg shadow-teal-400/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          selected
            ? "bg-teal-400/20 text-teal-300"
            : "bg-white/[0.06] text-slate-400"
        }`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-sm font-semibold ${selected ? "text-teal-300" : "text-white"}`}
        >
          {role}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
      </div>
      {selected && (
        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-slate-950">
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
interface OnboardingFormProps {
  userName: string;
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingForm({ userName, onComplete }: OnboardingFormProps) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Staff fields */
  const [department, setDepartment] = useState("");

  /* Student fields */
  const [studentId, setStudentId] = useState("");
  const [year, setYear] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");

  const isValid = () => {
    if (!role) return false;
    if (role === "บุคลากร") return department.trim().length > 0;
    return (
      studentId.trim().length > 0 &&
      year.length > 0 &&
      faculty.length > 0 &&
      major.trim().length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid() || submitting) return;

    setSubmitting(true);

    // Simulate brief save animation
    await new Promise((r) => setTimeout(r, 600));

    const data: OnboardingData =
      role === "บุคลากร"
        ? { role: "บุคลากร", department: department.trim() }
        : {
            role: "นิสิต",
            studentId: studentId.trim(),
            year,
            faculty,
            major: major.trim(),
          };

    onComplete(data);
  };

  const firstName = userName.split(" ")[0] || userName;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full bg-teal-500/8 blur-[140px]" />
        <div className="absolute -bottom-60 -right-60 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl"
          style={{
            boxShadow:
              "0 0 80px 0 rgba(20,184,166,0.06), 0 32px 64px 0 rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-300">
              <UserCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-white">
              ยินดีต้อนรับ, <span className="text-teal-300">{firstName}</span>!
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              กรุณากรอกข้อมูลเพิ่มเติม เพื่อให้ระบบให้บริการคุณได้ดียิ่งขึ้น
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Step 1: Role selection */}
            <div className="mb-6">
              <FieldLabel>สถานะของคุณ</FieldLabel>
              <div className="flex gap-3">
                <RoleCard
                  role="นิสิต"
                  icon={<GraduationCap className="h-5 w-5" />}
                  description="นักศึกษา ม.มหาสารคาม"
                  selected={role === "นิสิต"}
                  onClick={() => setRole("นิสิต")}
                />
                <RoleCard
                  role="บุคลากร"
                  icon={<Building2 className="h-5 w-5" />}
                  description="อาจารย์ / เจ้าหน้าที่"
                  selected={role === "บุคลากร"}
                  onClick={() => setRole("บุคลากร")}
                />
              </div>
            </div>

            {/* Divider */}
            {role && (
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-widest text-slate-600">
                  {role === "นิสิต" ? "ข้อมูลนิสิต" : "ข้อมูลบุคลากร"}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            )}

            {/* Step 2a: Staff fields */}
            {role === "บุคลากร" && (
              <div className="space-y-4">
                <div>
                  <FieldLabel>หน่วยงาน / สำนัก / คณะ</FieldLabel>
                  <TextInput
                    id="department"
                    value={department}
                    onChange={setDepartment}
                    placeholder="เช่น สำนักวิทยบริการฯ, คณะวิทยาศาสตร์"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2b: Student fields */}
            {role === "นิสิต" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>รหัสนิสิต</FieldLabel>
                    <TextInput
                      id="studentId"
                      value={studentId}
                      onChange={setStudentId}
                      placeholder="เช่น 6512345678901"
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel>ชั้นปี</FieldLabel>
                    <SelectInput
                      id="year"
                      value={year}
                      onChange={setYear}
                      options={YEARS}
                      placeholder="เลือกชั้นปี"
                      required
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>คณะ</FieldLabel>
                  <SelectInput
                    id="faculty"
                    value={faculty}
                    onChange={(v) => {
                      setFaculty(v);
                    }}
                    options={FACULTIES}
                    placeholder="เลือกคณะ"
                    required
                  />
                </div>

                <div>
                  <FieldLabel>สาขาวิชา</FieldLabel>
                  <TextInput
                    id="major"
                    value={major}
                    onChange={setMajor}
                    placeholder="เช่น วิทยาการคอมพิวเตอร์, การบัญชี"
                    required
                  />
                </div>
              </div>
            )}

            {/* Note */}
            {role && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-400/15 bg-blue-500/8 px-4 py-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <p className="text-[12px] leading-5 text-slate-400">
                  ข้อมูลนี้ใช้เพื่อปรับประสบการณ์การใช้งาน AI Tools เท่านั้น
                  และจะถูกเก็บไว้เฉพาะในเครื่องของคุณ
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-onboarding-submit"
              type="submit"
              disabled={!isValid() || submitting}
              className="group relative mt-6 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-teal-400 px-5 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-teal-950/40 transition-all duration-200 hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-400/30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ LIB AI</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม
        </p>
      </div>
    </main>
  );
}
