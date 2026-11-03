// Web origins allowed to call the API / open sockets (comma-separated in CLIENT_URLS).
// In production the web apps are served from the same origin as the API, so this
// mainly matters for local development.
export const CLIENT_URLS = (process.env.CLIENT_URLS || "http://localhost:3000")
	.split(",")
	.map((url) => url.trim())
	.filter(Boolean);
