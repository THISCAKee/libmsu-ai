import type { AdminStats } from "./admin-stats.ts";

export type AnnualSummaryCard = {
  key: "uniqueUsers" | "students" | "staff" | "selections";
  label: string;
  hint: string;
  value: number;
  accent: "navy" | "blue" | "cyan" | "violet";
};

export function formatBuddhistYear(year: number): string {
  return `พ.ศ. ${year + 543}`;
}

export function formatThaiReportTime(date: Date): string {
  return `${date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })} น.`;
}

export function getReportingYearOptions(
  years: number[],
  selectedYear: number | null,
): number[] {
  const options = new Set(years);
  if (selectedYear !== null) options.add(selectedYear);
  return [...options].sort((a, b) => b - a);
}

export function buildAnnualSummaryCards(
  summary: AdminStats["summary"],
): AnnualSummaryCard[] {
  return [
    {
      key: "uniqueUsers",
      label: "ผู้ใช้งานไม่ซ้ำ",
      hint: "รวมทั้งปี",
      value: summary.uniqueUsers,
      accent: "navy",
    },
    {
      key: "students",
      label: "นิสิต",
      hint: "นับจากรหัสนิสิต",
      value: summary.students,
      accent: "blue",
    },
    {
      key: "staff",
      label: "บุคลากร",
      hint: "นับจากชื่อ-นามสกุล",
      value: summary.staff,
      accent: "cyan",
    },
    {
      key: "selections",
      label: "การเลือกแพลตฟอร์ม",
      hint: "รวมทุกรายการ",
      value: summary.selections,
      accent: "violet",
    },
  ];
}
