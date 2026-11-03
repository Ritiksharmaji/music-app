// Third-party catalog from the free iTunes Search API (no key; tracks are 30s previews).
// Results are cached in memory because the API allows only ~20 requests/minute.

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const PER_CATEGORY = 50;

// each term is one API call; results are merged and de-duplicated
export const CATEGORIES = [
	{ id: "bollywood", name: "Bollywood Hits", group: "Bollywood & Hollywood", terms: ["hindi songs", "bollywood"] },
	{
		id: "hollywood",
		name: "Hollywood / English",
		group: "Bollywood & Hollywood",
		country: "US",
		terms: ["taylor swift", "the weeknd", "ed sheeran", "dua lipa", "bruno mars", "billie eilish"],
	},
	{ id: "punjabi", name: "Punjabi", group: "North Indian", terms: ["punjabi"] },
	{ id: "bhojpuri", name: "Bhojpuri", group: "North Indian", terms: ["bhojpuri"] },
	{ id: "haryanvi", name: "Haryanvi", group: "North Indian", terms: ["haryanvi"] },
	{ id: "rajasthani", name: "Rajasthani", group: "North Indian", terms: ["rajasthani"] },
	{ id: "telugu", name: "Telugu", group: "South Indian", terms: ["telugu"] },
	{ id: "tamil", name: "Tamil", group: "South Indian", terms: ["tamil"] },
	{ id: "kannada", name: "Kannada", group: "South Indian", terms: ["kannada"] },
	{ id: "malayalam", name: "Malayalam", group: "South Indian", terms: ["malayalam"] },
	{ id: "marathi", name: "Marathi", group: "West & East Indian", terms: ["marathi"] },
	{ id: "gujarati", name: "Gujarati", group: "West & East Indian", terms: ["gujarati"] },
	{ id: "bengali", name: "Bengali", group: "West & East Indian", terms: ["bengali"] },
	{ id: "odia", name: "Odia", group: "West & East Indian", terms: ["odia"] },
];

const cache = new Map(); // categoryId -> { songs, fetchedAt }
const inFlight = new Map(); // categoryId -> Promise

const toSong = (track, categoryId) => ({
	_id: `itunes-${track.trackId}`,
	title: track.trackName,
	artist: track.artistName,
	albumId: null,
	imageUrl: track.artworkUrl100?.replace("100x100bb", "600x600bb"),
	audioUrl: track.previewUrl,
	duration: 30,
	fullDuration: Math.round((track.trackTimeMillis || 0) / 1000),
	source: "itunes",
	externalUrl: track.trackViewUrl,
	category: categoryId,
	createdAt: track.releaseDate,
	updatedAt: track.releaseDate,
});

const searchTerm = async (term, country, limit) => {
	const params = new URLSearchParams({ term, country, media: "music", entity: "song", limit: String(limit) });
	const response = await fetch(`https://itunes.apple.com/search?${params}`);
	if (!response.ok) throw new Error(`iTunes search failed (${response.status}) for "${term}"`);
	const data = await response.json();
	return data.results;
};

const loadCategory = async (category) => {
	const perTerm = Math.min(200, Math.ceil((PER_CATEGORY * 1.5) / category.terms.length));
	const perTermTracks = [];
	for (const term of category.terms) {
		perTermTracks.push(await searchTerm(term, category.country || "IN", perTerm));
	}

	// round-robin across terms so one artist/term doesn't fill the whole row
	const seenIds = new Set();
	const seenTitles = new Set();
	const songs = [];
	const longest = Math.max(...perTermTracks.map((t) => t.length));
	for (let i = 0; i < longest; i++) {
		for (const tracks of perTermTracks) {
			const track = tracks[i];
			if (!track?.previewUrl) continue;
			const titleKey = `${track.trackName}|${track.artistName}`.toLowerCase();
			if (seenIds.has(track.trackId) || seenTitles.has(titleKey)) continue;
			seenIds.add(track.trackId);
			seenTitles.add(titleKey);
			songs.push(toSong(track, category.id));
		}
	}

	return songs.slice(0, PER_CATEGORY);
};

export const getCategorySongs = async (categoryId) => {
	const category = CATEGORIES.find((c) => c.id === categoryId);
	if (!category) return null;

	const cached = cache.get(categoryId);
	if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.songs;

	if (!inFlight.has(categoryId)) {
		inFlight.set(
			categoryId,
			loadCategory(category)
				.then((songs) => {
					cache.set(categoryId, { songs, fetchedAt: Date.now() });
					return songs;
				})
				.finally(() => inFlight.delete(categoryId))
		);
	}

	try {
		return await inFlight.get(categoryId);
	} catch (error) {
		// serve stale data if the API is rate-limiting us
		if (cached) return cached.songs;
		throw error;
	}
};

export const listCategories = () => CATEGORIES.map(({ id, name, group }) => ({ id, name, group }));

// fill the cache in the background so the first visitor doesn't wait
export const warmCache = async () => {
	for (const category of CATEGORIES) {
		try {
			await getCategorySongs(category.id);
		} catch (error) {
			console.log(`Discover: could not preload ${category.id} -`, error.message);
		}
	}
	console.log("Discover: catalog cached");
};
