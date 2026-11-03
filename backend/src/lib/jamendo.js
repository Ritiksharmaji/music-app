// Free, Creative Commons catalog from the Jamendo API (https://developer.jamendo.com).
// Tracks are plain MP3 streams, so they play in our own audio players: full length,
// in the background and with lock-screen controls on mobile.
// Free for non-commercial use with a client id; commercial apps need a Jamendo licence.

import { createCachedCatalog } from "./cachedCatalog.js";

const API = "https://api.jamendo.com/v3.0";
const GROUP = "Free music · Jamendo";

// Single tags that are confirmed to return results: combining tags in `fuzzytags`
// can return nothing (e.g. "indian+ethnic"), and some tags ("lounge", "bollywood") don't exist.
export const CATEGORIES = [
	{ id: "jm-indian", name: "Indian Fusion", group: GROUP, params: { tags: "indian" } },
	{ id: "jm-lofi", name: "Lo-fi Beats", group: GROUP, params: { fuzzytags: "lofi+chillhop+lo-fi" } },
	{ id: "jm-chill", name: "Chill & Lounge", group: GROUP, params: { tags: "chillout" } },
	{ id: "jm-workout", name: "Workout", group: GROUP, params: { fuzzytags: "energetic+workout+motivational" } },
	{ id: "jm-acoustic", name: "Acoustic", group: GROUP, params: { tags: "acoustic" } },
	{ id: "jm-instrumental", name: "Instrumental", group: GROUP, params: { vocalinstrumental: "instrumental" } },
	{ id: "jm-piano", name: "Piano & Classical", group: GROUP, params: { fuzzytags: "piano+classical" } },
	{ id: "jm-electronic", name: "Electronic", group: GROUP, params: { tags: "electronic" } },
	{ id: "jm-hiphop", name: "Hip-Hop", group: GROUP, params: { tags: "hiphop" } },
	{ id: "jm-rock", name: "Rock", group: GROUP, params: { tags: "rock" } },
];

const toSong = (track, categoryId) => ({
	_id: `jm-${track.id}`,
	title: track.name,
	artist: track.artist_name,
	albumId: null,
	imageUrl: track.image || track.album_image,
	audioUrl: track.audio,
	duration: Number(track.duration) || 0,
	source: "jamendo",
	externalUrl: track.shareurl,
	license: track.license_ccurl,
	category: categoryId,
	createdAt: track.releasedate,
	updatedAt: track.releasedate,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Jamendo often answers a query it hasn't seen recently with an empty list and the
// full results a moment later, so retry empty answers; never cache an empty category.
const loadCategory = async (category) => {
	for (let attempt = 1; attempt <= 4; attempt++) {
		const songs = await fetchCategory(category);
		if (songs.length) return songs;
		await sleep(attempt * 1500);
	}
	throw new Error("no results (Jamendo returned an empty list)");
};

const fetchCategory = async (category) => {
	const query = new URLSearchParams({
		client_id: process.env.JAMENDO_CLIENT_ID,
		format: "json",
		limit: "50",
		order: "popularity_total",
		audioformat: "mp32",
		imagesize: "600",
		...category.params,
	});
	const response = await fetch(`${API}/tracks/?${query}`);
	const data = await response.json();
	// Jamendo reports errors in headers.status with HTTP 200
	if (!response.ok || data.headers?.status !== "success") {
		throw new Error(data.headers?.error_message || `Jamendo request failed (${response.status})`);
	}
	return data.results.filter((track) => track.audio).map((track) => toSong(track, category.id));
};

export const isEnabled = () => !!process.env.JAMENDO_CLIENT_ID;

const catalog = createCachedCatalog({
	name: "Jamendo",
	file: "jamendo-catalog.json",
	categories: CATEGORIES,
	load: loadCategory,
});

export const getCategorySongs = catalog.getCategorySongs;
export const warmCache = catalog.warm;
