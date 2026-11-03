// Shared 24h disk cache for third-party catalogs (YouTube, Jamendo). Each category is
// fetched at most once per TTL, survives restarts, and serves stale data if the
// provider is down or rate-limiting us.

import fs from "fs";
import path from "path";

export const createCachedCatalog = ({ name, file, ttl = 24 * 60 * 60 * 1000, categories, load, present = (songs) => songs }) => {
	const cacheFile = path.join(process.cwd(), "cache", file);
	const inFlight = new Map();

	let initial = {};
	try {
		initial = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
	} catch {
		// no cache yet
	}
	const cache = new Map(Object.entries(initial)); // categoryId -> { songs, fetchedAt }

	const save = () => {
		fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
		fs.writeFileSync(cacheFile, JSON.stringify(Object.fromEntries(cache)));
	};

	const getRaw = async (categoryId) => {
		const category = categories.find((c) => c.id === categoryId);
		if (!category) return null;

		const cached = cache.get(categoryId);
		if (cached && Date.now() - cached.fetchedAt < ttl) return cached.songs;

		if (!inFlight.has(categoryId)) {
			inFlight.set(
				categoryId,
				load(category)
					.then((songs) => {
						cache.set(categoryId, { songs, fetchedAt: Date.now() });
						save();
						return songs;
					})
					.finally(() => inFlight.delete(categoryId))
			);
		}

		try {
			return await inFlight.get(categoryId);
		} catch (error) {
			if (cached) return cached.songs;
			throw error;
		}
	};

	return {
		getCategorySongs: async (categoryId) => {
			const songs = await getRaw(categoryId);
			return songs && present(songs);
		},

		// fill the cache in the background so the first visitor doesn't wait
		warm: async () => {
			for (const category of categories) {
				try {
					await getRaw(category.id);
				} catch (error) {
					console.log(`${name}: could not load ${category.id} -`, error.message);
				}
			}
			console.log(`${name}: catalog ready`);
		},
	};
};
