import { CATEGORIES, getCategorySongs, listCategories } from "../lib/youtube.js";

export const getCategories = (req, res) => {
	res.json(listCategories());
};

// every category with a few songs each, for the home page rows
export const getDiscoverHome = async (req, res, next) => {
	try {
		const limit = Number(req.query.limit) || 12;
		const rows = [];

		// a few at a time to stay under the iTunes rate limit on a cold cache
		for (let i = 0; i < CATEGORIES.length; i += 3) {
			const batch = CATEGORIES.slice(i, i + 3);
			const results = await Promise.allSettled(batch.map((c) => getCategorySongs(c.id)));
			results.forEach((result, j) => {
				const { id, name, group } = batch[j];
				if (result.status === "fulfilled") rows.push({ id, name, group, songs: result.value.slice(0, limit) });
				else console.log(`Discover: ${id} unavailable -`, result.reason.message);
			});
		}

		res.json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDiscoverCategory = async (req, res, next) => {
	try {
		const songs = await getCategorySongs(req.params.categoryId);
		if (!songs) return res.status(404).json({ message: "Category not found" });

		const { id, name, group } = CATEGORIES.find((c) => c.id === req.params.categoryId);
		res.json({ id, name, group, songs });
	} catch (error) {
		next(error);
	}
};
