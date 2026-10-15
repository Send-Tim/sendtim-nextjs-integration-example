import { timingSafeEqual } from "node:crypto";

export function hasAdminAccess(request: Request) {
  const configuredToken = process.env.SENDTIM_ADMIN_TOKEN;
  const providedToken = request.headers.get("x-demo-admin-token") ?? "";

  if (!configuredToken || !providedToken) return false;

  const configured = Buffer.from(configuredToken);
  const provided = Buffer.from(providedToken);
  return configured.length === provided.length && timingSafeEqual(configured, provided);
}
