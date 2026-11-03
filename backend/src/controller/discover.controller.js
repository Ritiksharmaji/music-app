import { getCategorySongs, listCategories } from "../lib/catalog.js";

export const getCategories = (req, res) => {
	res.json(listCategories());
};

// every category with a few songs each, for the home page rows
export const getDiscoverHome = async (req, res, next) => {
	try {
		const limit = Number(req.query.limit) || 12;
		const categories = listCategories();
		const rows = [];

		// a few at a time so a cold cache doesn't burst the providers' rate limits
		for (let i = 0; i < categories.length; i += 3) {
			const batch = categories.slice(i, i + 3);
			const results = await Promise.allSettled(batch.map((c) => getCategorySongs(c.id)));
			results.forEach((result, j) => {
				if (result.status === "fulfilled") rows.push({ ...batch[j], songs: result.value.slice(0, limit) });
				else console.log(`Discover: ${batch[j].id} unavailable -`, result.reason.message);
			});
		}

		res.json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDiscoverCategory = async (req, res, next) => {
	try {
		const category = listCategories().find((c) => c.id === req.params.categoryId);
		if (!category) return res.status(404).json({ message: "Category not found" });

		const songs = await getCategorySongs(category.id);
		res.json({ ...category, songs });
	} catch (error) {
		next(error);
	}
};
