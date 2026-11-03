import { Router } from "express";
import { getCategories, getDiscoverCategory, getDiscoverHome } from "../controller/discover.controller.js";
import { youtubePlayerPage } from "../lib/youtubePlayerPage.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/home", getDiscoverHome);
// embedded player page for the mobile app
router.get("/player", (req, res) => res.type("html").send(youtubePlayerPage));
router.get("/:categoryId", getDiscoverCategory);

export default router;
