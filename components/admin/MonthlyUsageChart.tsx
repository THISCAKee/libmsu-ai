import type { MonthlyUsage } from "@/lib/admin-stats";

type MonthlyUsageChartProps = {
  data: MonthlyUsage[];
};

export function MonthlyUsageChart({ data }: MonthlyUsageChartProps) {
  const maximum = Math.max(1, ...data.flatMap((month) => [month.students, month.staff]));

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            ภาพรวม 12 เดือน
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
            ผู้ใช้งานไม่ซ้ำรายเดือน
          </h2>
        </div>
        <div className="flex items-center gap-5 text-xs font-medium text-slate-600" aria-label="คำอธิบายกราฟ">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" aria-hidden="true" />
            นิสิต
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" aria-hidden="true" />
            บุคลากร
          </span>
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-5 pt-6 sm:px-6">
        <div className="relative min-w-[720px]">
          <div className="pointer-events-none absolute inset-x-0 top-6 h-48" aria-hidden="true">
            {[0, 1, 2, 3].map((line) => (
              <div
                key={line}
                className="absolute inset-x-0 border-t border-dashed border-slate-200"
                style={{ top: `${line * 33.333}%` }}
              />
            ))}
          </div>

          <div className="relative grid grid-cols-12 gap-2" role="img" aria-label="กราฟเปรียบเทียบจำนวนนิสิตและบุคลากรไม่ซ้ำในแต่ละเดือน">
            {data.map((month) => {
              const studentHeight = (month.students / maximum) * 100;
              const staffHeight = (month.staff / maximum) * 100;
              return (
                <div key={month.month} className="flex min-w-0 flex-col items-center">
                  <div className="flex h-52 w-full items-end justify-center gap-1.5 border-b-2 border-slate-800/80 px-1">
                    <div className="flex h-full w-[42%] flex-col justify-end">
                      <span className="mb-1 text-center text-[10px] font-semibold tabular-nums text-slate-500">
                        {month.students}
                      </span>
                      <div
                        className="min-h-[3px] w-full rounded-t-md bg-blue-600 transition-[height] duration-500 motion-reduce:transition-none"
                        style={{ height: `${studentHeight}%` }}
                      />
                    </div>
                    <div className="flex h-full w-[42%] flex-col justify-end">
                      <span className="mb-1 text-center text-[10px] font-semibold tabular-nums text-slate-500">
                        {month.staff}
                      </span>
                      <div
                        className="min-h-[3px] w-full rounded-t-md bg-cyan-500 transition-[height] duration-500 motion-reduce:transition-none"
                        style={{ height: `${staffHeight}%` }}
                      />
                    </div>
                  </div>
                  <span className="mt-3 text-[11px] font-semibold text-slate-500">
                    {month.label}
                  </span>
                  <span className="mt-0.5 text-[10px] tabular-nums text-slate-400">
                    รวม {month.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
