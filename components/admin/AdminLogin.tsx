import type { FormEvent } from "react";
import { AlertCircle, KeyRound, Loader2, ShieldCheck } from "lucide-react";

type AdminLoginProps = {
  password: string;
  pending: boolean;
  error: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminLogin({
  password,
  pending,
  error,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) {
  return (
    <main className="admin-console relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d2340] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[64px] border-cyan-400/20" />
        <div className="absolute -bottom-40 -left-24 h-[460px] w-[460px] rounded-full border-[80px] border-blue-500/20" />
      </div>

      <div className="relative z-10 grid w-full max-w-[880px] overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl shadow-slate-950/35 md:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[#102a4c] p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <img
              src="/logotab.png"
              alt="มหาวิทยาลัยมหาสารคาม"
              className="h-14 w-auto rounded-xl bg-white p-2"
            />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              LIB AI Intelligence
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
              ข้อมูลที่ช่วยให้บริการ
              <br />
              ได้ตรงจุดกว่าเดิม
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              ภาพรวมการใช้แพลตฟอร์ม AI สำหรับสำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            สำหรับผู้ดูแลระบบเท่านั้น
          </div>
        </section>

        <section className="px-6 py-10 sm:px-10 md:p-12">
          <div className="mb-8 md:hidden">
            <img
              src="/logotab.png"
              alt="มหาวิทยาลัยมหาสารคาม"
              className="h-12 w-auto"
            />
          </div>
          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
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

          {error && (
            <div
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7">
            <label
              htmlFor="admin-password"
              className="mb-2 block text-xs font-semibold text-slate-600"
            >
              รหัสผ่านผู้ดูแล
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              disabled={pending}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
              placeholder="กรอกรหัสผ่าน"
            />
            <button
              type="submit"
              disabled={!password || pending}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {pending ? "กำลังตรวจสอบ" : "เปิด Dashboard"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
