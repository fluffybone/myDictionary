type TSessionState = {
  expiresAt: Date | null;
  isExpiringSoon: boolean;
};

const EXPIRING_WINDOW_DAYS = 7;

const decodeJwtPayload = (token: string) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalizedPayload = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "=",
    );
    return JSON.parse(window.atob(normalizedPayload)) as { exp?: number };
  } catch {
    return null;
  }
};

export const getSessionStateFromToken = (token: string | null): TSessionState => {
  if (!token) {
    return { expiresAt: null, isExpiringSoon: false };
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return { expiresAt: null, isExpiringSoon: false };
  }

  const expiresAt = new Date(payload.exp * 1000);
  const warningTime = Date.now() + EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return {
    expiresAt,
    isExpiringSoon: expiresAt.getTime() <= warningTime,
  };
};
