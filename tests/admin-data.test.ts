import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminDataConfigurationError,
  AdminDataUpstreamError,
  fetchUsageRows,
  type AdminDataConfig,
  type FetchUsage,
} from "../lib/admin-data.ts";

const config: AdminDataConfig = {
  scriptUrl: "https://script.google.com/macros/s/deployment/exec?source=admin",
  dataSecret: "a secret&value",
};

const responseRows = [
  {
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
  },
];

test("fetchUsageRows rejects missing server configuration before fetching", async () => {
  let called = false;
  const fetchImpl: FetchUsage = async () => {
    called = true;
    return new Response();
  };

  await assert.rejects(
    fetchUsageRows(fetchImpl, { scriptUrl: "", dataSecret: "" }),
    AdminDataConfigurationError,
  );
  assert.equal(called, false);
});

test("fetchUsageRows sends an encoded secret and returns complete rows", async () => {
  let requestedUrl = "";
  const fetchImpl: FetchUsage = async (input) => {
    requestedUrl = String(input);
    return Response.json({ success: true, rows: responseRows });
  };

  const rows = await fetchUsageRows(fetchImpl, config);
  const url = new URL(requestedUrl);

  assert.equal(url.searchParams.get("source"), "admin");
  assert.equal(url.searchParams.get("action"), "readLogs");
  assert.equal(url.searchParams.get("secret"), "a secret&value");
  assert.deepEqual(rows, responseRows);
});

test("fetchUsageRows rejects upstream HTTP failures and malformed payloads", async (t) => {
  await t.test("HTTP failure", async () => {
    const fetchImpl: FetchUsage = async () =>
      Response.json({ success: false }, { status: 403 });
    await assert.rejects(fetchUsageRows(fetchImpl, config), AdminDataUpstreamError);
  });

  await t.test("invalid row shape", async () => {
    const fetchImpl: FetchUsage = async () =>
      Response.json({ success: true, rows: [{ timestamp: "09:00 01/01/2026" }] });
    await assert.rejects(fetchUsageRows(fetchImpl, config), AdminDataUpstreamError);
  });

  await t.test("invalid JSON", async () => {
    const fetchImpl: FetchUsage = async () =>
      new Response("not json", { status: 200 });
    await assert.rejects(fetchUsageRows(fetchImpl, config), AdminDataUpstreamError);
  });
});
