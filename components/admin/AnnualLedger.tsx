import {
  Building2,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";

import { buildAnnualSummaryCards } from "@/lib/admin-presentation";
import type { AdminStats } from "@/lib/admin-stats";

type AnnualLedgerProps = {
  summary: AdminStats["summary"];
};

const cardStyles = {
  navy: {
    card: "bg-[#102a4c] text-white",
    icon: "bg-white/10 text-cyan-300",
    label: "text-slate-300",
    hint: "text-slate-400",
  },
  blue: {
    card: "bg-white text-slate-900",
    icon: "bg-blue-50 text-blue-600",
    label: "text-slate-500",
    hint: "text-slate-400",
  },
  cyan: {
    card: "bg-white text-slate-900",
    icon: "bg-cyan-50 text-cyan-600",
    label: "text-slate-500",
    hint: "text-slate-400",
  },
  violet: {
    card: "bg-white text-slate-900",
    icon: "bg-violet-50 text-violet-600",
    label: "text-slate-500",
    hint: "text-slate-400",
  },
} as const;

const cardIcons = {
  uniqueUsers: Users,
  students: GraduationCap,
  staff: Building2,
  selections: Sparkles,
} as const;

export function AnnualLedger({ summary }: AnnualLedgerProps) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="สรุปข้อมูลรายปี"
    >
      {buildAnnualSummaryCards(summary).map((card) => {
        const Icon = cardIcons[card.key];
        const styles = cardStyles[card.accent];

        return (
          <article
            key={card.key}
            className={`relative overflow-hidden rounded-[22px] border border-slate-200/70 p-5 shadow-sm ${styles.card}`}
          >
            {card.key === "uniqueUsers" && (
              <div
                className="absolute -right-10 -top-12 h-32 w-32 rounded-full border-[24px] border-cyan-300/10"
                aria-hidden="true"
              />
            )}
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-medium ${styles.label}`}>{card.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
                  {card.value.toLocaleString("th-TH")}
                </p>
                <p className={`mt-1 text-[10px] ${styles.hint}`}>{card.hint}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
