import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "Unauthorized - you must be logged in" });
		}

		const { userId } = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(userId).select("+email");
		if (!user) {
			return res.status(401).json({ message: "Unauthorized - user not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Unauthorized - invalid token" });
	}
};

export const requireAdmin = async (req, res, next) => {
	const isAdmin = process.env.ADMIN_EMAIL?.toLowerCase() === req.user.email;

	if (!isAdmin) {
		return res.status(403).json({ message: "Unauthorized - you must be an admin" });
	}

	next();
};
