import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "lib-ai-admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function verifyAdminPassword(
  candidate: string,
  configuredPassword: string,
): boolean {
  if (!candidate || !configuredPassword) return false;
  return timingSafeEqual(digest(candidate), digest(configuredPassword));
}

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
}

export function createAdminSession(
  secret: string,
  now = Date.now(),
): string {
  if (!secret) throw new Error("Admin session secret is not configured");
  const expiresAt = now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `v1.${expiresAt}`;
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyAdminSession(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token || !secret) return false;

  const [version, expiresAtText, receivedSignature, extra] = token.split(".");
  if (version !== "v1" || !expiresAtText || !receivedSignature || extra) {
    return false;
  }

  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  const expectedSignature = signature(`v1.${expiresAtText}`, secret);
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}
