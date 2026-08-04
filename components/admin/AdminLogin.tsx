import type { FormEvent } from "react";

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
    <main className="admin-console admin-login min-h-screen md:grid md:grid-cols-[minmax(13rem,26vw)_1fr]">
      <header className="flex min-h-44 flex-col bg-[var(--admin-ink)] px-6 py-6 text-white sm:px-8 md:min-h-screen md:px-10 md:py-10">
        <div className="flex items-center justify-between gap-4 md:block">
          <img
            src="/logotab.png"
            alt="มหาวิทยาลัยมหาสารคาม"
            className="h-12 w-auto bg-white p-1.5 md:h-14"
          />
          <p className="admin-number text-[10px] tracking-[0.14em] text-white/55 md:mt-6">
            ระเบียน 01 / ผู้ดูแล
          </p>
        </div>

        <div className="mt-auto hidden md:block">
          <div className="mb-6 h-px w-full bg-white/25" aria-hidden="true" />
          <p className="text-xs font-medium leading-6 text-white/60">
            สำนักวิทยบริการ
            <br />
            มหาวิทยาลัยมหาสารคาม
          </p>
          <h1 className="admin-display mt-3 max-w-xs text-2xl font-semibold leading-[1.45] tracking-[-0.02em]">
            ศูนย์รายงานการใช้แพลตฟอร์ม AI
          </h1>
        </div>

        <div className="mt-auto flex items-end justify-between gap-5 md:hidden">
          <h1 className="admin-display max-w-[15rem] text-xl font-semibold leading-snug tracking-[-0.02em]">
            ศูนย์รายงานการใช้แพลตฟอร์ม AI
          </h1>
          <p className="shrink-0 text-right text-[10px] leading-5 text-white/55">
            สำนักวิทยบริการ
            <br />
            มหาวิทยาลัยมหาสารคาม
          </p>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-11rem)] items-center px-6 py-12 sm:px-10 md:min-h-screen md:px-[clamp(3rem,9vw,9rem)]">
        <div className="admin-report-enter w-full max-w-xl">
          <p className="admin-number text-[10px] font-semibold tracking-[0.12em] text-[var(--admin-blue)]">
            รายงานการใช้บริการ · ผู้ดูแลระบบ
          </p>
          <h2 className="admin-display mt-4 text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.18] tracking-[-0.035em] text-[var(--admin-ink)]">
            เปิดระเบียนรายงานประจำปี
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[color:color-mix(in_srgb,var(--admin-ink)_62%,transparent)]">
            ใช้รหัสผ่านกลางของผู้ดูแลเพื่อดูสถิติการใช้แพลตฟอร์ม AI
          </p>

          <dl className="mt-8 grid grid-cols-[7.5rem_1fr] border-y border-[var(--admin-line)] py-3 text-xs leading-6 sm:grid-cols-[9rem_1fr]">
            <dt className="text-[color:color-mix(in_srgb,var(--admin-ink)_52%,transparent)]">
              ประเภทเอกสาร
            </dt>
            <dd className="font-medium text-[var(--admin-ink)]">
              รายงานสถิติการใช้งาน
            </dd>
            <dt className="text-[color:color-mix(in_srgb,var(--admin-ink)_52%,transparent)]">
              สิทธิ์การเข้าถึง
            </dt>
            <dd className="font-medium text-[var(--admin-ink)]">ผู้ดูแลระบบ</dd>
          </dl>

          {error && (
            <div
              className="mt-6 border-l-[3px] border-red-600 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7">
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-semibold text-[var(--admin-ink)]"
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
              className="h-13 w-full rounded-lg border border-[var(--admin-line)] bg-white px-4 text-base text-[var(--admin-ink)] outline-none transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-65"
              placeholder="กรอกรหัสผ่าน"
            />
            <button
              type="submit"
              disabled={!password || pending}
              className="mt-4 flex h-13 w-full cursor-pointer items-center justify-between rounded-md bg-[var(--admin-ink)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-blue)] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <span>{pending ? "กำลังตรวจสอบ" : "เข้าสู่รายงาน"}</span>
              <span className="admin-number text-xs text-white/65" aria-hidden="true">
                {pending ? "···" : "→"}
              </span>
            </button>
          </form>

          <p className="mt-7 text-xs leading-6 text-[color:color-mix(in_srgb,var(--admin-ink)_48%,transparent)]">
            ระบบรายงานภายใน · สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม
          </p>
        </div>
      </section>
    </main>
  );
}
