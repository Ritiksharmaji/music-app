// One place for the playback bar to read time / seek / set volume, whether the
// current song plays from our <audio> element (uploads) or the YouTube player.

type YouTubePlayer = {
	getCurrentTime: () => number;
	getDuration: () => number;
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	setVolume: (volume: number) => void;
};

let audio: HTMLAudioElement | null = null;
let youtube: YouTubePlayer | null = null;
let active: "audio" | "youtube" = "audio";
let volume = 75;

export const playerEngine = {
	registerAudio: (element: HTMLAudioElement | null) => {
		audio = element;
		if (audio) audio.volume = volume / 100;
	},
	registerYouTube: (player: YouTubePlayer | null) => {
		youtube = player;
		youtube?.setVolume(volume);
	},
	setActive: (source: "audio" | "youtube") => {
		active = source;
	},

	getCurrentTime: () => (active === "youtube" ? youtube?.getCurrentTime() : audio?.currentTime) || 0,
	getDuration: () => (active === "youtube" ? youtube?.getDuration() : audio?.duration) || 0,
	seek: (seconds: number) => {
		if (active === "youtube") youtube?.seekTo(seconds, true);
		else if (audio) audio.currentTime = seconds;
	},
	setVolume: (value: number) => {
		volume = value;
		if (audio) audio.volume = value / 100;
		youtube?.setVolume(value);
	},
};
