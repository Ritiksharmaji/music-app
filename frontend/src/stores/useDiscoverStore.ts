import { axiosInstance } from "@/lib/axios";
import { DiscoverRow, Song } from "@/types";
import { create } from "zustand";

interface DiscoverStore {
	rows: DiscoverRow[];
	librarySongs: Song[];
	categorySongs: Record<string, Song[]>;
	isLoadingRows: boolean;
	isLoadingLibrary: boolean;
	loadingCategory: string | null;
	error: string | null;

	fetchRows: () => Promise<void>;
	fetchLibrary: () => Promise<void>;
	fetchCategory: (id: string) => Promise<void>;
}

export const useDiscoverStore = create<DiscoverStore>((set, get) => ({
	rows: [],
	librarySongs: [],
	categorySongs: {},
	isLoadingRows: false,
	isLoadingLibrary: false,
	loadingCategory: null,
	error: null,

	fetchRows: async () => {
		if (get().rows.length) return;
		set({ isLoadingRows: true, error: null });
		try {
			const response = await axiosInstance.get("/discover/home");
			set({ rows: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Could not load music" });
		} finally {
			set({ isLoadingRows: false });
		}
	},

	fetchLibrary: async () => {
		set({ isLoadingLibrary: true });
		try {
			const response = await axiosInstance.get("/songs/library");
			set({ librarySongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Could not load songs" });
		} finally {
			set({ isLoadingLibrary: false });
		}
	},

	fetchCategory: async (id) => {
		if (get().categorySongs[id]) return;
		set({ loadingCategory: id });
		try {
			const response = await axiosInstance.get(`/discover/${id}`);
			set((state) => ({ categorySongs: { ...state.categorySongs, [id]: response.data.songs } }));
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Could not load category" });
		} finally {
			set({ loadingCategory: null });
		}
	},
}));
