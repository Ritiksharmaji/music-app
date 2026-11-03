export interface Song {
	_id: string;
	title: string;
	artist: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	createdAt: string;
	updatedAt: string;
	// set for third-party tracks: YouTube plays in its embedded player, Jamendo is a plain MP3 stream
	source?: "youtube" | "jamendo";
	youtubeId?: string;
	channel?: string;
	externalUrl?: string;
}

export interface DiscoverRow {
	id: string;
	name: string;
	group: string;
	source: "youtube" | "jamendo";
	songs: Song[];
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	fullName: string;
	imageUrl: string;
}

export interface AuthUser extends User {
	email: string;
}
