import { cn } from "@/lib/utils";

const PreviewBadge = ({ className }: { className?: string }) => (
	<span
		title='30-second preview from iTunes'
		className={cn(
			"inline-flex items-center rounded-sm bg-zinc-700/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-200",
			className
		)}
	>
		Preview
	</span>
);
export default PreviewBadge;
