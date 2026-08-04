import type { UsageLogRow } from "@/lib/admin-stats";

export type FetchUsage = typeof fetch;

export type AdminDataConfig = {
  scriptUrl: string;
  dataSecret: string;
};

export class AdminDataConfigurationError extends Error {
  constructor() {
    super("Admin data service is not configured");
    this.name = "AdminDataConfigurationError";
  }
}

export class AdminDataUpstreamError extends Error {
  constructor() {
    super("Admin data service returned an invalid response");
    this.name = "AdminDataUpstreamError";
  }
}

const ROW_FIELDS: (keyof UsageLogRow)[] = [
  "timestamp",
  "name",
  "role",
  "studentId",
  "year",
  "faculty",
  "major",
  "department",
  "action",
  "platformName",
];

function isUsageLogRow(value: unknown): value is UsageLogRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return ROW_FIELDS.every((field) => typeof candidate[field] === "string");
}

export async function fetchUsageRows(
  fetchImpl: FetchUsage = fetch,
  config: AdminDataConfig = {
    scriptUrl: process.env.GOOGLE_SHEETS_SCRIPT_URL ?? "",
    dataSecret: process.env.ADMIN_DATA_SECRET ?? "",
  },
): Promise<UsageLogRow[]> {
  if (!config.scriptUrl || !config.dataSecret) {
    throw new AdminDataConfigurationError();
  }

  let url: URL;
  try {
    url = new URL(config.scriptUrl);
  } catch {
    throw new AdminDataConfigurationError();
  }
  url.searchParams.set("action", "readLogs");
  url.searchParams.set("secret", config.dataSecret);

  let response: Response;
  try {
    response = await fetchImpl(url, { cache: "no-store" });
  } catch {
    throw new AdminDataUpstreamError();
  }

  if (!response.ok) throw new AdminDataUpstreamError();

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AdminDataUpstreamError();
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AdminDataUpstreamError();
  }

  const result = payload as { success?: unknown; rows?: unknown };
  if (
    result.success !== true ||
    !Array.isArray(result.rows) ||
    !result.rows.every(isUsageLogRow)
  ) {
    throw new AdminDataUpstreamError();
  }

  return result.rows;
}
