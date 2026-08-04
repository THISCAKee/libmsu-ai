import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAnnualLedger,
  formatBuddhistYear,
  formatThaiReportTime,
  getReportingYearOptions,
} from "../lib/admin-presentation.ts";

test("formatBuddhistYear presents Gregorian report years in Buddhist Era", () => {
  assert.equal(formatBuddhistYear(2026), "พ.ศ. 2569");
});

test("formatThaiReportTime presents a compact Thai report timestamp", () => {
  assert.equal(
    formatThaiReportTime(new Date(2026, 0, 1, 9, 5)),
    "09:05 น.",
  );
});

test("getReportingYearOptions includes the selected empty year and sorts distinct years newest first", () => {
  assert.deepEqual(
    getReportingYearOptions([2024, 2026, 2024], 2025),
    [2026, 2025, 2024],
  );
});

test("buildAnnualLedger preserves all four report values in report order", () => {
  assert.deepEqual(
    buildAnnualLedger({
      uniqueUsers: 12,
      students: 8,
      staff: 4,
      selections: 31,
    }).map(({ key, value, tone }) => ({ key, value, tone })),
    [
      { key: "uniqueUsers", value: 12, tone: "ink" },
      { key: "students", value: 8, tone: "student" },
      { key: "staff", value: 4, tone: "staff" },
      { key: "selections", value: 31, tone: "neutral" },
    ],
  );
});
