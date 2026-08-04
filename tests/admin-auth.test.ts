import assert from "node:assert/strict";
import test from "node:test";

import {
  createAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from "../lib/admin-auth.ts";

test("verifyAdminPassword accepts only the exact configured password", () => {
  assert.equal(verifyAdminPassword("correct horse", "correct horse"), true);
  assert.equal(verifyAdminPassword("Correct Horse", "correct horse"), false);
  assert.equal(verifyAdminPassword("", "correct horse"), false);
  assert.equal(verifyAdminPassword("correct horse", ""), false);
});

test("createAdminSession produces a verifiable token without password material", () => {
  const now = new Date("2026-08-04T00:00:00.000Z").getTime();
  const token = createAdminSession("session-signing-secret", now);

  assert.equal(verifyAdminSession(token, "session-signing-secret", now), true);
  assert.equal(token.includes("session-signing-secret"), false);
  assert.equal(token.split(".").length, 3);
});

test("verifyAdminSession rejects tampered, wrongly signed, and expired tokens", () => {
  const now = new Date("2026-08-04T00:00:00.000Z").getTime();
  const token = createAdminSession("session-signing-secret", now);
  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  assert.equal(verifyAdminSession(tampered, "session-signing-secret", now), false);
  assert.equal(verifyAdminSession(token, "different-secret", now), false);
  assert.equal(
    verifyAdminSession(token, "session-signing-secret", now + 8 * 60 * 60 * 1000 + 1),
    false,
  );
  assert.equal(verifyAdminSession("not-a-token", "session-signing-secret", now), false);
  assert.equal(verifyAdminSession(token, "", now), false);
});
