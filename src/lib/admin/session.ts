import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "phantom_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or CRON_SECRET must be set");
  }
  return secret;
}

export function createAdminSessionToken(email: string) {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = `${email}|${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyAdminSessionToken(token: string): { email: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastPipe = decoded.lastIndexOf("|");
    const secondLastPipe = decoded.lastIndexOf("|", lastPipe - 1);
    if (lastPipe === -1 || secondLastPipe === -1) return null;

    const email = decoded.slice(0, secondLastPipe);
    const expStr = decoded.slice(secondLastPipe + 1, lastPipe);
    const sig = decoded.slice(lastPipe + 1);
    const payload = `${email}|${expStr}`;

    const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    if (Date.now() > Number(expStr)) return null;
    return { email };
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}
