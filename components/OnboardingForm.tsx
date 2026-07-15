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
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

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
  ["คณะวิทยาศาสตร์", "Faculty of Science"],
  ["คณะเทคโนโลยี", "Faculty of Technology"],
  ["คณะวิศวกรรมศาสตร์", "Faculty of Engineering"],
  [
    "คณะสถาปัตยกรรมศาสตร์ผังเมืองและนฤมิตศิลป์",
    "Faculty of Architecture, Urban Design and Creative Arts",
  ],
  [
    "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์",
    "Faculty of Environment and Resource Studies",
  ],
  ["คณะวิทยาการสารสนเทศ", "Faculty of Informatics"],
  ["คณะพยาบาลศาสตร์", "Faculty of Nursing"],
  ["คณะเภสัชศาสตร์", "Faculty of Pharmacy"],
  ["คณะสาธารณสุขศาสตร์", "Faculty of Public Health"],
  ["คณะแพทยศาสตร์", "Faculty of Medicine"],
  ["คณะสัตวแพทยศาสตร์", "Faculty of Veterinary Sciences"],
  [
    "คณะมนุษยศาสตร์และสังคมศาสตร์",
    "Faculty of Humanities and Social Sciences",
  ],
  ["คณะศึกษาศาสตร์", "Faculty of Education"],
  ["คณะการบัญชีและการจัดการ", "Faculty of Accountancy and Management"],
  [
    "คณะศิลปกรรมศาสตร์และวัฒนธรรมศาสตร์",
    "Faculty of Fine-Applied Arts and Cultural Science",
  ],
  [
    "คณะการท่องเที่ยวและการโรงแรม",
    "Faculty of Tourism and Hotel Management",
  ],
  ["วิทยาลัยการเมืองการปกครอง", "College of Politics and Governance"],
  ["คณะนิติศาสตร์", "Faculty of Law"],
  ["วิทยาลัยดุริยางคศิลป์", "College of Music"],
] as const;

const YEARS = [
  ["ชั้นปีที่ 1", "Year 1"],
  ["ชั้นปีที่ 2", "Year 2"],
  ["ชั้นปีที่ 3", "Year 3"],
  ["ชั้นปีที่ 4", "Year 4"],
  ["ชั้นปีที่ 5", "Year 5"],
  ["ชั้นปีที่ 6", "Year 6"],
  ["บัณฑิตศึกษา", "Graduate student"],
] as const;

const ONBOARDING_COPY = {
  th: {
    welcome: "ยินดีต้อนรับ",
    intro: "กรุณากรอกข้อมูลเพิ่มเติม เพื่อให้ระบบให้บริการคุณได้ดียิ่งขึ้น",
    roleLabel: "สถานะของคุณ",
    student: "นิสิต",
    studentDescription: "นักศึกษา ม.มหาสารคาม",
    staff: "บุคลากร",
    staffDescription: "อาจารย์ / เจ้าหน้าที่",
    studentInfo: "ข้อมูลนิสิต",
    staffInfo: "ข้อมูลบุคลากร",
    department: "หน่วยงาน / สำนัก / คณะ",
    departmentPlaceholder: "เช่น สำนักวิทยบริการฯ, คณะวิทยาศาสตร์",
    studentId: "รหัสนิสิต",
    studentIdPlaceholder: "เช่น 65123456789",
    year: "ชั้นปี",
    chooseYear: "เลือกชั้นปี",
    faculty: "คณะ",
    chooseFaculty: "เลือกคณะ",
    major: "สาขาวิชา",
    majorPlaceholder: "เช่น วิทยาการคอมพิวเตอร์, การบัญชี",
    privacy:
      "ข้อมูลนี้ใช้เพื่อปรับประสบการณ์การใช้งาน AI Tools เท่านั้น และจะถูกเก็บไว้เฉพาะในเครื่องของคุณ",
    saving: "กำลังบันทึก...",
    enter: "เข้าสู่ระบบ LIB AI",
    institution: "สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม",
  },
  en: {
    welcome: "Welcome",
    intro: "Please provide a few more details so we can serve you better.",
    roleLabel: "Your role",
    student: "Student",
    studentDescription: "Mahasarakham University student",
    staff: "Staff",
    staffDescription: "Faculty member / Staff",
    studentInfo: "Student information",
    staffInfo: "Staff information",
    department: "Department / Office / Faculty",
    departmentPlaceholder: "e.g. Academic Resource Center, Faculty of Science",
    studentId: "Student ID",
    studentIdPlaceholder: "e.g. 65123456789",
    year: "Year of study",
    chooseYear: "Select year",
    faculty: "Faculty",
    chooseFaculty: "Select faculty",
    major: "Major",
    majorPlaceholder: "e.g. Computer Science, Accounting",
    privacy:
      "This information is used only to personalize your AI platform experience and is stored only on your device.",
    saving: "Saving...",
    enter: "Enter LIB AI",
    institution: "Academic Resource Center, Mahasarakham University",
  },
} as const;

type SelectOption = {
  value: string;
  label: string;
};

/* ─── Sub-components ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
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
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
  options: readonly SelectOption[];
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
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
      >
        <option value="" disabled className="text-slate-400">
          {placeholder ?? "เลือก..."}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* ─── Role Card ──────────────────────────────────────────── */
function RoleCard({
  role,
  label,
  icon,
  description,
  selected,
  onClick,
}: {
  role: UserRole;
  label: string;
  icon: React.ReactNode;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all duration-200 cursor-pointer ${
        selected
          ? "border-blue-400 bg-blue-50 shadow-md shadow-blue-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          selected
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-sm font-semibold ${selected ? "text-blue-700" : "text-slate-800"}`}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
      </div>
      {selected && (
        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
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
  const { language } = useLanguage();
  const copy = ONBOARDING_COPY[language];
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
  const facultyOptions = FACULTIES.map(([value, englishLabel]) => ({
    value,
    label: language === "th" ? value : englishLabel,
  }));
  const yearOptions = YEARS.map(([value, englishLabel]) => ({
    value,
    label: language === "th" ? value : englishLabel,
  }));

  return (
    <main className="relative min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <LanguageToggle className="absolute right-4 top-4 z-20" />
      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {copy.welcome},{" "}
              <span className="text-blue-600">{firstName}</span>!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {copy.intro}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Step 1: Role selection */}
            <div className="mb-6">
              <FieldLabel>{copy.roleLabel}</FieldLabel>
              <div className="flex gap-3">
                <RoleCard
                  role="นิสิต"
                  label={copy.student}
                  icon={<GraduationCap className="h-5 w-5" />}
                  description={copy.studentDescription}
                  selected={role === "นิสิต"}
                  onClick={() => setRole("นิสิต")}
                />
                <RoleCard
                  role="บุคลากร"
                  label={copy.staff}
                  icon={<Building2 className="h-5 w-5" />}
                  description={copy.staffDescription}
                  selected={role === "บุคลากร"}
                  onClick={() => setRole("บุคลากร")}
                />
              </div>
            </div>

            {/* Divider */}
            {role && (
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] uppercase tracking-widest text-slate-400">
                  {role === "นิสิต" ? copy.studentInfo : copy.staffInfo}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            )}

            {/* Step 2a: Staff fields */}
            {role === "บุคลากร" && (
              <div className="space-y-4">
                <div>
                  <FieldLabel>{copy.department}</FieldLabel>
                  <TextInput
                    id="department"
                    value={department}
                    onChange={setDepartment}
                    placeholder={copy.departmentPlaceholder}
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
                    <FieldLabel>{copy.studentId}</FieldLabel>
                    <TextInput
                      id="studentId"
                      value={studentId}
                      onChange={setStudentId}
                      placeholder={copy.studentIdPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel>{copy.year}</FieldLabel>
                    <SelectInput
                      id="year"
                      value={year}
                      onChange={setYear}
                      options={yearOptions}
                      placeholder={copy.chooseYear}
                      required
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>{copy.faculty}</FieldLabel>
                  <SelectInput
                    id="faculty"
                    value={faculty}
                    onChange={(v) => {
                      setFaculty(v);
                    }}
                    options={facultyOptions}
                    placeholder={copy.chooseFaculty}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>{copy.major}</FieldLabel>
                  <TextInput
                    id="major"
                    value={major}
                    onChange={setMajor}
                    placeholder={copy.majorPlaceholder}
                    required
                  />
                </div>
              </div>
            )}

            {/* Note */}
            {role && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-[12px] leading-5 text-slate-600">
                  {copy.privacy}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-onboarding-submit"
              type="submit"
              disabled={!isValid() || submitting}
              className="group relative mt-6 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{copy.saving}</span>
                </>
              ) : (
                <>
                  <span>{copy.enter}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {copy.institution}
        </p>
      </div>
    </main>
  );
}
