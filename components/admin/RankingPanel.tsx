import type { ReactNode } from "react";

import type { RankingItem } from "@/lib/admin-stats";

type RankingPanelProps = {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  items: RankingItem[];
  accent?: "blue" | "cyan" | "amber" | "violet";
  highlightFirst?: boolean;
};

const accents = {
  blue: { icon: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
  cyan: { icon: "bg-cyan-50 text-cyan-600", bar: "bg-cyan-500" },
  amber: { icon: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
  violet: { icon: "bg-violet-50 text-violet-600", bar: "bg-violet-500" },
} as const;

export function RankingPanel({
  eyebrow,
  title,
  icon,
  items,
  accent = "blue",
  highlightFirst = false,
}: RankingPanelProps) {
  const palette = accents[accent];
  const maximum = Math.max(1, ...items.map((item) => item.count));

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette.icon}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>
          <h2 className="truncate text-base font-bold text-slate-900">{title}</h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-sm text-slate-400">
          ยังไม่มีข้อมูลในปีนี้
        </div>
      ) : (
        <ol className="space-y-4">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-bold tabular-nums ${
                      highlightFirst && index === 0
                        ? "bg-amber-400 text-amber-950"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium leading-5 text-slate-700">
                    {item.label}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                  {item.count.toLocaleString("th-TH")}
                </span>
              </div>
              <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${palette.bar}`}
                  style={{ width: `${Math.max(3, (item.count / maximum) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
