// Third-party catalog from the YouTube Data API v3. Songs play full-length through
// YouTube's official embedded player on the frontend.
// Quota: each category costs ~101 units (search + videos.list) of the free 10,000/day,
// so the catalog is cached on disk for 24h and survives restarts.

import { createCachedCatalog } from "./cachedCatalog.js";

const API = "https://www.googleapis.com/youtube/v3";

export const CATEGORIES = [
	{ id: "bollywood", name: "Bollywood Hits", group: "Bollywood & Hollywood", query: "bollywood song" },
	{ id: "hollywood", name: "Hollywood / English", group: "Bollywood & Hollywood", query: "official music video", region: "US", lang: "en" },
	{ id: "punjabi", name: "Punjabi", group: "North Indian", query: "punjabi song" },
	{ id: "bhojpuri", name: "Bhojpuri", group: "North Indian", query: "bhojpuri song" },
	{ id: "haryanvi", name: "Haryanvi", group: "North Indian", query: "haryanvi song" },
	{ id: "rajasthani", name: "Rajasthani", group: "North Indian", query: "rajasthani song" },
	{ id: "telugu", name: "Telugu", group: "South Indian", query: "telugu song" },
	{ id: "tamil", name: "Tamil", group: "South Indian", query: "tamil song" },
	{ id: "kannada", name: "Kannada", group: "South Indian", query: "kannada song" },
	{ id: "malayalam", name: "Malayalam", group: "South Indian", query: "malayalam song" },
	{ id: "marathi", name: "Marathi", group: "West & East Indian", query: "marathi song" },
	{ id: "gujarati", name: "Gujarati", group: "West & East Indian", query: "gujarati song" },
	{ id: "bengali", name: "Bengali", group: "West & East Indian", query: "bengali song" },
	{ id: "odia", name: "Odia", group: "West & East Indian", query: "odia song" },
];

const youtube = async (endpoint, params) => {
	const query = new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY });
	const response = await fetch(`${API}/${endpoint}?${query}`);
	const data = await response.json();
	if (!response.ok) throw new Error(data.error?.message || `YouTube ${endpoint} failed (${response.status})`);
	return data;
};

// ISO 8601 duration (PT3M45S) -> seconds
const parseDuration = (iso) => {
	const [, h = 0, m = 0, s = 0] = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
	return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

const decode = (text) =>
	text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const NOISE =
	/\b(official\s+(music\s+)?video|official\s+audio|official|full\s+video\s+song|full\s+video|full\s+song|video\s+song|lyrical(\s+video)?|with\s+lyrics|lyric\s+video|4k|hd|new\s+song|latest|superhit|viral)\b/gi;

const clean = (text) =>
	text
		.replace(NOISE, "")
		.replace(/^@/, "")
		.replace(/[()[\]]\s*[()[\]]/g, "")
		.replace(/\s{2,}/g, " ")
		.replace(/^['"‘“:\-\s]+|['"’”:\-\s]+$/g, "")
		.trim();

// Indian labels: "'Song' Full Video Song | Film | Singer"  -> Song / Film
// Western:       "Artist - Song (Official Video)"         -> Song / Artist
const cleanTitle = (raw, channel) => {
	const text = decode(raw)
		.replace(/#\s*video\b/gi, "")
		.replace(/#/g, "")
		.replace(/[([](?:[^)\]]*\b(official|video|lyric|audio|4k|hd)\b[^)\]]*)[)\]]/gi, "");

	const [head = "", ...rest] = text.split(/\s*\|\s*/).filter((part) => clean(part));
	const dash = head.split(/\s+[-–]\s+/);
	let title, subtitle;
	// "Song - Video Song | Film": the part after the dash is only noise, so it's not "Artist - Song"
	if (dash.length >= 2 && clean(dash.slice(1).join(" - "))) {
		[subtitle, title] = [clean(dash[0]), clean(dash.slice(1).join(" - "))];
	} else {
		title = clean(dash[0]);
		subtitle = clean(rest.find((part) => clean(part)) || "");
	}

	title = (title || clean(text) || text).replace(/\s+song$/i, "");
	if (!subtitle || subtitle.length > 45) subtitle = channel;
	return { title, subtitle };
};

const loadCategory = async (category) => {
	const search = await youtube("search", {
		part: "snippet",
		type: "video",
		videoCategoryId: "10", // Music
		videoEmbeddable: "true",
		order: "viewCount",
		maxResults: "50",
		regionCode: category.region || "IN",
		relevanceLanguage: category.lang || "hi",
		q: category.query,
	});

	const ids = search.items.map((item) => item.id.videoId);
	if (!ids.length) return [];

	const details = await youtube("videos", { part: "snippet,contentDetails,status", id: ids.join(",") });

	return details.items
		.filter((video) => video.status.embeddable && video.status.privacyStatus === "public")
		.map((video) => ({ video, duration: parseDuration(video.contentDetails.duration) }))
		.filter(({ duration }) => duration >= 90 && duration <= 9 * 60) // skip shorts and jukeboxes
		.map(({ video, duration }) => {
			const thumbs = video.snippet.thumbnails;
			return {
				_id: `yt-${video.id}`,
				rawTitle: video.snippet.title,
				albumId: null,
				imageUrl: (thumbs.high || thumbs.medium || thumbs.default).url,
				audioUrl: "",
				youtubeId: video.id,
				duration,
				source: "youtube",
				channel: video.snippet.channelTitle,
				externalUrl: `https://www.youtube.com/watch?v=${video.id}`,
				category: category.id,
				createdAt: video.snippet.publishedAt,
				updatedAt: video.snippet.publishedAt,
			};
		});
};

// titles are parsed when served (not when cached) so parser tweaks apply without refetching
const withDisplayTitle = (songs) =>
	songs.map(({ rawTitle, ...song }) => {
		const { title, subtitle } = cleanTitle(rawTitle, song.channel);
		return { ...song, title, artist: subtitle };
	});

export const isEnabled = () => !!process.env.YOUTUBE_API_KEY;

const catalog = createCachedCatalog({
	name: "YouTube",
	file: "youtube-catalog.json",
	categories: CATEGORIES,
	load: loadCategory,
	present: withDisplayTitle,
});

export const getCategorySongs = catalog.getCategorySongs;
export const warmCache = catalog.warm;
