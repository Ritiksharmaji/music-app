import { playerEngine } from "@/lib/playerEngine";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
	interface Window {
		YT: any;
		onYouTubeIframeAPIReady?: () => void;
	}
}

let apiPromise: Promise<void> | null = null;
const loadYouTubeApi = () => {
	if (!apiPromise) {
		apiPromise = new Promise((resolve) => {
			if (window.YT?.Player) return resolve();
			window.onYouTubeIframeAPIReady = () => resolve();
			const script = document.createElement("script");
			script.src = "https://www.youtube.com/iframe_api";
			document.body.appendChild(script);
		});
	}
	return apiPromise;
};

// YouTube's terms require the embedded player to stay visible (at least 200x200),
// so third-party songs play in this mini player above the playback bar.
const YouTubePlayer = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<any>(null);
	const [ready, setReady] = useState(false);
	const [minimized, setMinimized] = useState(false);

	const { currentSong, isPlaying } = usePlayerStore();
	const youtubeId = currentSong?.source === "youtube" ? currentSong.youtubeId : undefined;

	// create the player once
	useEffect(() => {
		let cancelled = false;
		loadYouTubeApi().then(() => {
			if (cancelled || !containerRef.current) return;
			playerRef.current = new window.YT.Player(containerRef.current, {
				width: "100%",
				height: "100%",
				playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
				events: {
					onReady: () => {
						playerEngine.registerYouTube(playerRef.current);
						setReady(true);
					},
					onStateChange: (event: any) => {
						const { ENDED, PLAYING, PAUSED } = window.YT.PlayerState;
						const { currentSong, isPlaying, playNext } = usePlayerStore.getState();
						// we pause YouTube ourselves when switching to an uploaded song; ignore that
						if (currentSong?.source !== "youtube") return;
						if (event.data === ENDED) playNext();
						// keep our play/pause state in sync if the user clicks the video itself
						if (event.data === PLAYING && !isPlaying) usePlayerStore.setState({ isPlaying: true });
						if (event.data === PAUSED && isPlaying) usePlayerStore.setState({ isPlaying: false });
					},
					// video removed / not embeddable in this region: skip it
					onError: () => usePlayerStore.getState().playNext(),
				},
			});
		});
		return () => {
			cancelled = true;
			playerRef.current?.destroy();
			playerEngine.registerYouTube(null);
		};
	}, []);

	// load the new song
	useEffect(() => {
		if (!ready) return;
		if (!youtubeId) {
			playerRef.current.pauseVideo();
			return;
		}
		playerEngine.setActive("youtube");
		const { isPlaying } = usePlayerStore.getState();
		if (isPlaying) playerRef.current.loadVideoById(youtubeId);
		else playerRef.current.cueVideoById(youtubeId);
		setMinimized(false);
	}, [ready, youtubeId]);

	// play / pause
	useEffect(() => {
		if (!ready || !youtubeId) return;
		if (isPlaying) playerRef.current.playVideo();
		else playerRef.current.pauseVideo();
	}, [ready, youtubeId, isPlaying]);

	return (
		<div
			className={`fixed right-4 bottom-28 z-50 overflow-hidden rounded-lg border border-zinc-800 bg-black shadow-2xl transition-all ${
				youtubeId ? "" : "pointer-events-none invisible"
			} ${minimized ? "w-[200px] h-[200px] opacity-90" : "w-[320px] h-[200px]"}`}
		>
			<div className='absolute top-0 inset-x-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-2 py-1 text-[11px] text-zinc-300'>
				<span>Playing via YouTube</span>
				<button
					onClick={() => setMinimized((m) => !m)}
					className='rounded p-0.5 hover:bg-white/10'
					title={minimized ? "Expand" : "Shrink"}
				>
					{minimized ? <Maximize2 className='size-3' /> : <Minimize2 className='size-3' />}
				</button>
			</div>
			<div ref={containerRef} />
		</div>
	);
};
export default YouTubePlayer;
