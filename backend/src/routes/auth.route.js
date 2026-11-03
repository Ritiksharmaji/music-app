import { Router } from "express";
import { getMe, login, signup } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protectRoute, getMe);

export default router;
