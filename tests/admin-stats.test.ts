import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAdminStats,
  listUsageYears,
  parseUsageTimestamp,
  type UsageLogRow,
} from "../lib/admin-stats.ts";

const row = (overrides: Partial<UsageLogRow> = {}): UsageLogRow => ({
  timestamp: "09:15 03/01/2026",
  name: "สมชาย ใจดี",
  role: "นิสิต",
  studentId: "65000000001",
  year: "ชั้นปีที่ 4",
  faculty: "คณะวิทยาการสารสนเทศ",
  major: "วิทยาการคอมพิวเตอร์",
  department: "-",
  action: "Click AI Platform",
  platformName: "ChatGPT",
  ...overrides,
});

test("parseUsageTimestamp rejects impossible and malformed Thailand dates", () => {
  assert.deepEqual(parseUsageTimestamp("23:59 31/12/2026"), {
    year: 2026,
    month: 12,
    day: 31,
    hour: 23,
    minute: 59,
    sortKey: 202612312359,
  });
  assert.equal(parseUsageTimestamp("24:00 31/12/2026"), null);
  assert.equal(parseUsageTimestamp("09:00 31/02/2026"), null);
  assert.equal(parseUsageTimestamp("2026-12-31"), null);
});

test("listUsageYears returns valid distinct years newest first", () => {
  const rows = [
    row({ timestamp: "08:00 01/01/2025" }),
    row({ timestamp: "09:00 01/01/2026" }),
    row({ timestamp: "10:00 02/01/2025" }),
    row({ timestamp: "invalid" }),
  ];

  assert.deepEqual(listUsageYears(rows), [2026, 2025]);
});

test("buildAdminStats deduplicates users annually and separately in each month", () => {
  const rows = [
    row(),
    row({ timestamp: "10:15 03/01/2026", platformName: "Gemini" }),
    row({ timestamp: "10:15 03/02/2026", platformName: "ChatGPT" }),
    row({
      timestamp: "11:00 05/01/2026",
      name: "สุดา เก่งงาน",
      role: "บุคลากร",
      studentId: "-",
      year: "-",
      faculty: "-",
      major: "-",
      department: "สำนักวิทยบริการ",
    }),
    row({
      timestamp: "12:00 06/01/2026",
      name: " สุดา เก่งงาน ",
      role: "บุคลากร",
      studentId: "-",
      year: "-",
      faculty: "-",
      major: "-",
      department: "สำนักวิทยบริการ",
      platformName: "Claude",
    }),
    row({ timestamp: "09:00 01/01/2025" }),
  ];

  const stats = buildAdminStats(rows, 2026);

  assert.deepEqual(stats.summary, {
    uniqueUsers: 2,
    students: 1,
    staff: 1,
    selections: 5,
  });
  assert.equal(stats.monthly.length, 12);
  assert.deepEqual(stats.monthly[0], {
    month: 1,
    label: "ม.ค.",
    students: 1,
    staff: 1,
    total: 2,
  });
  assert.deepEqual(stats.monthly[1], {
    month: 2,
    label: "ก.พ.",
    students: 1,
    staff: 0,
    total: 1,
  });
  assert.equal(stats.monthly[11]?.total, 0);
});

test("buildAdminStats excludes missing identities and uses latest valid profile values", () => {
  const rows = [
    row({
      timestamp: "08:00 01/01/2026",
      faculty: "คณะวิทยาศาสตร์",
      year: "ชั้นปีที่ 3",
    }),
    row({
      timestamp: "08:00 01/03/2026",
      faculty: "คณะวิทยาการสารสนเทศ",
      year: "ชั้นปีที่ 4",
    }),
    row({
      timestamp: "09:00 01/03/2026",
      name: "-",
      role: "บุคลากร",
      studentId: "-",
      department: "กองกลาง",
    }),
    row({ timestamp: "10:00 01/03/2026", studentId: "-" }),
  ];

  const stats = buildAdminStats(rows, 2026);

  assert.deepEqual(stats.summary, {
    uniqueUsers: 1,
    students: 1,
    staff: 0,
    selections: 4,
  });
  assert.deepEqual(stats.faculties, [
    { label: "คณะวิทยาการสารสนเทศ", count: 1 },
  ]);
  assert.deepEqual(stats.studentYears, [{ label: "ชั้นปีที่ 4", count: 1 }]);
  assert.deepEqual(stats.departments, []);
});

test("buildAdminStats groups missing profile values and ranks AI selections stably", () => {
  const rows = [
    row({ faculty: "-", year: "", platformName: "Gemini" }),
    row({
      name: "กมล คนดี",
      studentId: "65000000002",
      faculty: "-",
      year: "-",
      platformName: "ChatGPT",
    }),
    row({
      name: "วิภา ตั้งใจ",
      role: "บุคลากร",
      studentId: "-",
      year: "-",
      faculty: "-",
      department: "",
      platformName: "Gemini",
    }),
    row({
      timestamp: "12:00 08/01/2026",
      name: "มานะ ทำงาน",
      role: "บุคลากร",
      studentId: "-",
      year: "-",
      faculty: "-",
      department: "กองกลาง",
      platformName: "ChatGPT",
    }),
  ];

  const stats = buildAdminStats(rows, 2026);

  assert.deepEqual(stats.faculties, [{ label: "ไม่ระบุ", count: 2 }]);
  assert.deepEqual(stats.departments, [
    { label: "กองกลาง", count: 1 },
    { label: "ไม่ระบุ", count: 1 },
  ]);
  assert.deepEqual(stats.studentYears, [{ label: "ไม่ระบุ", count: 2 }]);
  assert.deepEqual(stats.platforms, [
    { label: "ChatGPT", count: 2 },
    { label: "Gemini", count: 2 },
  ]);
});

test("buildAdminStats returns twelve empty months and zero summaries for an empty year", () => {
  const stats = buildAdminStats([], 2026);

  assert.equal(stats.monthly.length, 12);
  assert.ok(stats.monthly.every((month) => month.total === 0));
  assert.deepEqual(stats.summary, {
    uniqueUsers: 0,
    students: 0,
    staff: 0,
    selections: 0,
  });
  assert.deepEqual(stats.platforms, []);
});
