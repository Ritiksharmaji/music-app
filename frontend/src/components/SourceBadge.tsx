import { cn } from "@/lib/utils";

const SourceBadge = ({ className }: { className?: string }) => (
	<span
		title='Plays through YouTube'
		className={cn(
			"inline-flex items-center rounded-sm bg-red-600/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
			className
		)}
	>
		YouTube
	</span>
);
export default SourceBadge;
