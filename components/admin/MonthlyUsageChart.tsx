import type { MonthlyUsage } from "@/lib/admin-stats";

type MonthlyUsageChartProps = {
  data: MonthlyUsage[];
};

export function MonthlyUsageChart({ data }: MonthlyUsageChartProps) {
  const maximum = Math.max(1, ...data.flatMap((month) => [month.students, month.staff]));
  const chartDescription = data
    .map(
      (month) =>
        `${month.label} นิสิต ${month.students.toLocaleString("th-TH")} คน บุคลากร ${month.staff.toLocaleString("th-TH")} คน`,
    )
    .join(", ");

  return (
    <section className="border-y border-[var(--admin-line)] bg-white">
      <header className="flex flex-col gap-4 border-b border-[var(--admin-line)] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="admin-number text-[10px] font-semibold tracking-[0.16em] text-[var(--admin-blue)]">
            MO-12 · รอบการใช้งานประจำปี
          </p>
          <h2 className="admin-display mt-1 text-lg font-semibold tracking-[-0.02em]">
            ผู้ใช้งานไม่ซ้ำรายเดือน
          </h2>
          <p className="mt-1 text-xs text-slate-500">เปรียบเทียบนิสิตและบุคลากรตลอด 12 เดือน</p>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-600" aria-label="คำอธิบายสัญลักษณ์กราฟ">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--admin-student)]" aria-hidden="true" />
            นิสิต
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-[var(--admin-staff)]" aria-hidden="true" />
            บุคลากร
          </span>
        </div>
      </header>

      <div className="overflow-x-auto px-5 pb-5 pt-6 sm:px-6">
        <div
          className="relative min-w-[760px]"
          role="img"
          aria-label={`กราฟผู้ใช้งานไม่ซ้ำรายเดือน: ${chartDescription}`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48" aria-hidden="true">
            {[0, 1, 2].map((line) => (
              <div
                key={line}
                className="absolute inset-x-0 border-t border-dashed border-[var(--admin-line)]"
                style={{ top: `${line * 50}%` }}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-48 border-t border-[var(--admin-ink)]" aria-hidden="true" />

          <div className="relative grid grid-cols-12">
            {data.map((month) => {
              const studentHeight = (month.students / maximum) * 100;
              const staffHeight = (month.staff / maximum) * 100;

              return (
                <div key={month.month} className="min-w-0 px-1.5 text-center">
                  <div className="flex h-48 items-end justify-center gap-2" aria-hidden="true">
                    <div className="flex h-full w-5 flex-col justify-end">
                      <span className="admin-number mb-1 text-[10px] font-semibold text-[var(--admin-ink)]">
                        {month.students.toLocaleString("th-TH")}
                      </span>
                      <span
                        className="relative mx-auto block w-1 bg-[var(--admin-student)] transition-[height] duration-500 motion-reduce:transition-none"
                        style={{ height: `${studentHeight * 0.82}%` }}
                      >
                        <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--admin-student)]" />
                      </span>
                    </div>
                    <div className="flex h-full w-5 flex-col justify-end">
                      <span className="admin-number mb-1 text-[10px] font-semibold text-[var(--admin-ink)]">
                        {month.staff.toLocaleString("th-TH")}
                      </span>
                      <span
                        className="relative mx-auto block w-2 bg-[var(--admin-staff)] transition-[height] duration-500 motion-reduce:transition-none"
                        style={{ height: `${staffHeight * 0.82}%` }}
                      >
                        <span className="absolute -left-0.5 -top-1 h-3 w-3 border-2 border-white bg-[var(--admin-staff)]" />
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5">
                    <p className="text-[11px] font-semibold text-[var(--admin-ink)]">{month.label}</p>
                    <p className="admin-number mt-0.5 text-[10px] text-slate-500">
                      รวม {month.total.toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
