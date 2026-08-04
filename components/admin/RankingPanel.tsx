import type { RankingItem } from "@/lib/admin-stats";

type RankingPanelProps = {
  reportCode: string;
  title: string;
  items: RankingItem[];
  variant?: "student" | "staff" | "neutral" | "platform";
};

const variantLabel = {
  student: "ข้อมูลนิสิต",
  staff: "ข้อมูลบุคลากร",
  neutral: "ทะเบียนสรุป",
  platform: "ข้อมูลการเลือกใช้",
} as const;

const variantRule = {
  student: "bg-[var(--admin-student)]",
  staff: "bg-[var(--admin-staff)]",
  neutral: "bg-[var(--admin-ink)]",
  platform: "bg-[var(--admin-blue)]",
} as const;

export function RankingPanel({
  reportCode,
  title,
  items,
  variant = "neutral",
}: RankingPanelProps) {
  return (
    <section className="h-full bg-white px-5 py-5 sm:px-6" aria-labelledby={`${reportCode}-title`}>
      <header className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--admin-line)] pb-4">
        <div className="min-w-0">
          <p className="admin-number text-[10px] font-semibold tracking-[0.14em] text-slate-500">
            {reportCode}
          </p>
          <h2 id={`${reportCode}-title`} className="admin-display mt-1 text-base font-semibold tracking-[-0.01em]">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5 text-[10px] text-slate-500">
          <span className={`h-3 w-1 ${variantRule[variant]}`} aria-hidden="true" />
          {variantLabel[variant]}
        </div>
      </header>

      {items.length === 0 ? (
        <p className="flex min-h-32 items-center justify-center border-y border-dashed border-[var(--admin-line)] px-4 text-center text-sm text-slate-500">
          ยังไม่มีรายการในปีรายงานนี้
        </p>
      ) : (
        <ol className="divide-y divide-[var(--admin-line)]">
          {items.map((item, index) => {
            const isTopPlatform = variant === "platform" && index === 0;

            return (
              <li
                key={`${item.label}-${index}`}
                className={`relative grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 py-3 ${
                  isTopPlatform ? "border-l-2 border-[var(--admin-blue)] pl-3" : ""
                }`}
              >
                <span className="admin-number text-[10px] text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="min-w-0 text-sm leading-5 text-[var(--admin-ink)]">{item.label}</span>
                  <span className="min-w-3 flex-1 border-b border-dotted border-slate-300" aria-hidden="true" />
                  {isTopPlatform && (
                    <span className="shrink-0 text-[10px] font-semibold text-[var(--admin-blue)]">
                      อันดับสูงสุด
                    </span>
                  )}
                </div>
                <span className="admin-number text-sm font-semibold text-[var(--admin-ink)]">
                  {item.count.toLocaleString("th-TH")}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
