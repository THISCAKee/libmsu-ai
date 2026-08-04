export type UsageLogRow = {
  timestamp: string;
  name: string;
  role: string;
  studentId: string;
  year: string;
  faculty: string;
  major: string;
  department: string;
  action: string;
  platformName: string;
};

export type ParsedUsageTimestamp = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  sortKey: number;
};

export type RankingItem = {
  label: string;
  count: number;
};

export type MonthlyUsage = {
  month: number;
  label: string;
  students: number;
  staff: number;
  total: number;
};

export type AdminStats = {
  summary: {
    uniqueUsers: number;
    students: number;
    staff: number;
    selections: number;
  };
  monthly: MonthlyUsage[];
  faculties: RankingItem[];
  departments: RankingItem[];
  studentYears: RankingItem[];
  platforms: RankingItem[];
};

const MONTH_LABELS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

const MISSING_VALUES = new Set(["", "-", "ไม่ระบุ"]);

function cleanValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasValue(value: string): boolean {
  return !MISSING_VALUES.has(value);
}

export function parseUsageTimestamp(
  value: string,
): ParsedUsageTimestamp | null {
  const match = /^(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/.exec(
    cleanValue(value),
  );
  if (!match) return null;

  const [, hourText, minuteText, dayText, monthText, yearText] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (hour > 23 || minute > 59 || month < 1 || month > 12 || day < 1) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    sortKey: year * 100000000 + month * 1000000 + day * 10000 + hour * 100 + minute,
  };
}

export function listUsageYears(rows: UsageLogRow[]): number[] {
  const years = new Set<number>();
  for (const row of rows) {
    const timestamp = parseUsageTimestamp(row.timestamp);
    if (timestamp) years.add(timestamp.year);
  }
  return [...years].sort((a, b) => b - a);
}

function getUserIdentity(row: UsageLogRow): {
  key: string;
  role: "นิสิต" | "บุคลากร";
} | null {
  if (row.role === "นิสิต") {
    const studentId = cleanValue(row.studentId);
    return hasValue(studentId)
      ? { key: `student:${studentId}`, role: "นิสิต" }
      : null;
  }

  if (row.role === "บุคลากร") {
    const name = cleanValue(row.name);
    return hasValue(name)
      ? { key: `staff:${name.toLocaleLowerCase("th")}`, role: "บุคลากร" }
      : null;
  }

  return null;
}

function toRanking(counts: Map<string, number>): RankingItem[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.label.localeCompare(b.label, "th", { numeric: true }),
    );
}

function countLabels(values: string[]): RankingItem[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = hasValue(value) ? value : "ไม่ระบุ";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return toRanking(counts);
}

type UserProfile = {
  role: "นิสิต" | "บุคลากร";
  faculty: string;
  department: string;
  year: string;
  facultyUpdatedAt: number;
  departmentUpdatedAt: number;
  yearUpdatedAt: number;
};

export function buildAdminStats(rows: UsageLogRow[], year: number): AdminStats {
  const studentKeys = new Set<string>();
  const staffKeys = new Set<string>();
  const monthlyStudentKeys = Array.from({ length: 12 }, () => new Set<string>());
  const monthlyStaffKeys = Array.from({ length: 12 }, () => new Set<string>());
  const profiles = new Map<string, UserProfile>();
  const platformCounts = new Map<string, number>();
  let selections = 0;

  for (const row of rows) {
    const timestamp = parseUsageTimestamp(row.timestamp);
    if (!timestamp || timestamp.year !== year) continue;

    selections += 1;
    const platformName = cleanValue(row.platformName);
    if (hasValue(platformName)) {
      platformCounts.set(
        platformName,
        (platformCounts.get(platformName) ?? 0) + 1,
      );
    }

    const identity = getUserIdentity(row);
    if (!identity) continue;

    if (identity.role === "นิสิต") {
      studentKeys.add(identity.key);
      monthlyStudentKeys[timestamp.month - 1].add(identity.key);
    } else {
      staffKeys.add(identity.key);
      monthlyStaffKeys[timestamp.month - 1].add(identity.key);
    }

    const profile = profiles.get(identity.key) ?? {
      role: identity.role,
      faculty: "",
      department: "",
      year: "",
      facultyUpdatedAt: -1,
      departmentUpdatedAt: -1,
      yearUpdatedAt: -1,
    };

    const faculty = cleanValue(row.faculty);
    if (hasValue(faculty) && timestamp.sortKey >= profile.facultyUpdatedAt) {
      profile.faculty = faculty;
      profile.facultyUpdatedAt = timestamp.sortKey;
    }

    const department = cleanValue(row.department);
    if (
      hasValue(department) &&
      timestamp.sortKey >= profile.departmentUpdatedAt
    ) {
      profile.department = department;
      profile.departmentUpdatedAt = timestamp.sortKey;
    }

    const studentYear = cleanValue(row.year);
    if (hasValue(studentYear) && timestamp.sortKey >= profile.yearUpdatedAt) {
      profile.year = studentYear;
      profile.yearUpdatedAt = timestamp.sortKey;
    }

    profiles.set(identity.key, profile);
  }

  const monthly = MONTH_LABELS.map((label, index) => {
    const students = monthlyStudentKeys[index].size;
    const staff = monthlyStaffKeys[index].size;
    return { month: index + 1, label, students, staff, total: students + staff };
  });

  const studentProfiles = [...profiles.values()].filter(
    (profile) => profile.role === "นิสิต",
  );
  const staffProfiles = [...profiles.values()].filter(
    (profile) => profile.role === "บุคลากร",
  );

  return {
    summary: {
      uniqueUsers: studentKeys.size + staffKeys.size,
      students: studentKeys.size,
      staff: staffKeys.size,
      selections,
    },
    monthly,
    faculties: countLabels(studentProfiles.map((profile) => profile.faculty)),
    departments: countLabels(
      staffProfiles.map((profile) => profile.department),
    ),
    studentYears: countLabels(studentProfiles.map((profile) => profile.year)),
    platforms: toRanking(platformCounts),
  };
}
