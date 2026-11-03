import { Router } from "express";
import { getMediaUrl } from "../lib/s3.js";

const router = Router();

// redirect to a short-lived signed S3 url; ?format=json returns it instead
// (mobile players can't follow an http -> https redirect in development)
router.get("/*", async (req, res, next) => {
	try {
		const url = await getMediaUrl(req.params[0]);
		res.set("Cache-Control", "private, max-age=3000");
		if (req.query.format === "json") return res.json({ url });
		res.redirect(url);
	} catch (error) {
		next(error);
	}
});

export default router;
