import type { AdminStats } from "./admin-stats.ts";

export type AnnualLedgerItem = {
  key: "uniqueUsers" | "students" | "staff" | "selections";
  label: string;
  note: string;
  value: number;
  tone: "ink" | "student" | "staff" | "neutral";
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

export function buildAnnualLedger(
  summary: AdminStats["summary"],
): AnnualLedgerItem[] {
  return [
    {
      key: "uniqueUsers",
      label: "ผู้ใช้งานไม่ซ้ำ",
      note: "รวมทั้งปี",
      value: summary.uniqueUsers,
      tone: "ink",
    },
    {
      key: "students",
      label: "นิสิต",
      note: "นับจากรหัสนิสิต",
      value: summary.students,
      tone: "student",
    },
    {
      key: "staff",
      label: "บุคลากร",
      note: "นับจากชื่อ-นามสกุล",
      value: summary.staff,
      tone: "staff",
    },
    {
      key: "selections",
      label: "การเลือกแพลตฟอร์ม",
      note: "รวมทุกรายการ",
      value: summary.selections,
      tone: "neutral",
    },
  ];
}
