import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import PreviewBadge from "@/components/PreviewBadge";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
	subtitle?: string;
	// show only the first `limit` songs and a "Show all" link
	limit?: number;
	onShowAll?: () => void;
};
const SectionGrid = ({ songs, title, isLoading, subtitle, limit, onShowAll }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	const visibleSongs = limit ? songs.slice(0, limit) : songs;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<div>
					<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
					{subtitle && <p className='text-sm text-zinc-400'>{subtitle}</p>}
				</div>
				{onShowAll && (
					<Button variant='link' className='text-sm text-zinc-400 hover:text-white' onClick={onShowAll}>
						Show all
					</Button>
				)}
			</div>

			<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
				{visibleSongs.map((song) => (
					<div
						key={song._id}
						className='bg-zinc-800/40 p-3 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'
					>
						<div className='relative mb-3'>
							<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
								<img
									src={song.imageUrl}
									alt={song.title}
									loading='lazy'
									className='w-full h-full object-cover transition-transform duration-300 
									group-hover:scale-105'
								/>
							</div>
							{song.source && <PreviewBadge className='absolute top-2 left-2' />}
							<PlayButton song={song} queue={songs} />
						</div>
						<h3 className='font-medium mb-1 truncate'>{song.title}</h3>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
				))}
			</div>
		</div>
	);
};
export default SectionGrid;
