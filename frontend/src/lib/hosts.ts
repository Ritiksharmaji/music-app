// The admin dashboard can live on its own subdomain (VITE_ADMIN_URL, e.g.
// https://music-admin.onekampus.com/admin). Without it, it's just /admin on this site.
export const ADMIN_URL: string = import.meta.env.VITE_ADMIN_URL || "/admin";

const adminOrigin = ADMIN_URL.startsWith("http") ? new URL(ADMIN_URL).origin : null;

// true when this page is the admin subdomain
export const isAdminHost = adminOrigin === window.location.origin;
