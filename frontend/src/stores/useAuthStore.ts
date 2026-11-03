import { axiosInstance } from "@/lib/axios";
import { AuthUser } from "@/types";
import { create } from "zustand";

const TOKEN_KEY = "token";

const setApiToken = (token: string | null) => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
		axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		localStorage.removeItem(TOKEN_KEY);
		delete axiosInstance.defaults.headers.common["Authorization"];
	}
};

interface AuthStore {
	user: AuthUser | null;
	isAdmin: boolean;
	isLoading: boolean;
	isCheckingAuth: boolean;
	error: string | null;

	checkAuth: () => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	signup: (fullName: string, email: string, password: string) => Promise<void>;
	logout: () => void;
	checkAdminStatus: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	isAdmin: false,
	isLoading: false,
	isCheckingAuth: true,
	error: null,

	checkAuth: async () => {
		const token = localStorage.getItem(TOKEN_KEY);
		if (!token) return set({ isCheckingAuth: false });

		setApiToken(token);
		try {
			const response = await axiosInstance.get("/auth/me");
			set({ user: response.data });
		} catch {
			setApiToken(null);
			set({ user: null });
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/auth/login", { email, password });
			setApiToken(response.data.token);
			set({ user: response.data.user });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Login failed" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	signup: async (fullName, email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/auth/signup", { fullName, email, password });
			setApiToken(response.data.token);
			set({ user: response.data.user });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Signup failed" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	logout: () => {
		setApiToken(null);
		set({ user: null, isAdmin: false, error: null });
	},

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch (error: any) {
			set({ isAdmin: false });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isLoading: false, error: null });
	},
}));
