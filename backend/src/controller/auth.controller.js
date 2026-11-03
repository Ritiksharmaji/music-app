import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const toPublicUser = (user) => ({
	_id: user._id,
	fullName: user.fullName,
	email: user.email,
	imageUrl: user.imageUrl,
});

export const signup = async (req, res, next) => {
	try {
		const { fullName, email, password } = req.body;

		if (!fullName?.trim() || !email?.trim() || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters" });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
		if (existingUser) {
			return res.status(400).json({ message: "An account with this email already exists" });
		}

		const user = await User.create({
			fullName: fullName.trim(),
			email,
			password: await bcrypt.hash(password, 10),
			imageUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
		});

		res.status(201).json({ token: createToken(user._id), user: toPublicUser(user) });
	} catch (error) {
		console.log("Error in signup", error);
		next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email: email?.toLowerCase().trim() }).select("+password +email");
		if (!user || !(await bcrypt.compare(password || "", user.password))) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		res.status(200).json({ token: createToken(user._id), user: toPublicUser(user) });
	} catch (error) {
		console.log("Error in login", error);
		next(error);
	}
};

export const getMe = async (req, res) => {
	res.status(200).json(toPublicUser(req.user));
};
