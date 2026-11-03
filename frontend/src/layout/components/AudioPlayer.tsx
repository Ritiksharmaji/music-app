import { playerEngine } from "@/lib/playerEngine";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

// plays our own (S3 / local) songs; YouTube songs are handled by YouTubePlayer
const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext } = usePlayerStore();
	const isYouTube = currentSong?.source === "youtube";

	useEffect(() => {
		playerEngine.registerAudio(audioRef.current);
		return () => playerEngine.registerAudio(null);
	}, []);

	// handle play/pause logic
	useEffect(() => {
		if (isYouTube) return;
		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [isPlaying, isYouTube]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		if (isYouTube) {
			audio.pause();
			prevSongRef.current = null;
			return;
		}

		playerEngine.setActive("audio");

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			audio.src = currentSong?.audioUrl;
			// reset the playback position
			audio.currentTime = 0;

			prevSongRef.current = currentSong?.audioUrl;

			if (isPlaying) audio.play();
		}
	}, [currentSong, isPlaying, isYouTube]);

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
