import { buildAnnualLedger } from "@/lib/admin-presentation";
import type { AdminStats } from "@/lib/admin-stats";

type AnnualLedgerProps = {
  summary: AdminStats["summary"];
};

const toneClasses = {
  ink: "border-t-[var(--admin-ink)] text-[var(--admin-ink)]",
  student: "border-t-[var(--admin-student)] text-[var(--admin-student)]",
  staff: "border-t-[var(--admin-staff)] text-[var(--admin-staff)]",
  neutral: "border-t-slate-400 text-[var(--admin-ink)]",
} as const;

export function AnnualLedger({ summary }: AnnualLedgerProps) {
  return (
    <section aria-labelledby="annual-ledger-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="admin-number text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            ANNUAL TOTALS
          </p>
          <h2
            id="annual-ledger-title"
            className="admin-display mt-1 text-xl font-semibold tracking-tight"
          >
            ทะเบียนยอดรวมประจำปี
          </h2>
        </div>
        <p className="hidden text-xs text-slate-500 sm:block">นับผู้ใช้ไม่ซ้ำตลอดปีรายงาน</p>
      </div>

      <div className="grid grid-cols-2 border-y border-[var(--admin-line)] bg-white lg:grid-cols-4">
        {buildAnnualLedger(summary).map((item, index) => (
          <article
            key={item.key}
            className={`border-t-4 px-4 py-5 sm:px-5 sm:py-6 ${toneClasses[item.tone]} ${
              index % 2 === 0 ? "border-r border-r-[var(--admin-line)]" : ""
            } ${index < 2 ? "border-b border-b-[var(--admin-line)] lg:border-b-0" : ""} ${
              index === 1 ? "lg:border-r lg:border-r-[var(--admin-line)]" : ""
            } ${index === 2 ? "lg:border-r lg:border-r-[var(--admin-line)]" : ""}`}
          >
            <p className="text-xs font-semibold text-slate-600">{item.label}</p>
            <p
              className={`admin-number mt-4 leading-none tracking-[-0.06em] ${
                item.key === "uniqueUsers" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
              }`}
            >
              {item.value.toLocaleString("th-TH")}
            </p>
            <p className="mt-3 text-[11px] text-slate-500">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
