import { Router } from "express";
import { getCategories, getDiscoverCategory, getDiscoverHome } from "../controller/discover.controller.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/home", getDiscoverHome);
router.get("/:categoryId", getDiscoverCategory);

export default router;
