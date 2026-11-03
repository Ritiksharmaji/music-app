import { cn } from "@/lib/utils";

export type CatalogSource = "ours" | "youtube" | "jamendo";

const LABELS: Record<CatalogSource, { text: string; className: string; title: string }> = {
	ours: { text: "Ours", className: "border-emerald-500/40 text-emerald-400", title: "Uploaded by us" },
	youtube: { text: "YouTube", className: "border-red-500/40 text-red-400", title: "Plays through YouTube" },
	jamendo: { text: "Jamendo", className: "border-amber-500/40 text-amber-400", title: "Free Creative Commons music from Jamendo" },
};

// small pill next to a category title showing where its songs come from
// (renders nothing for data from an older server without `source`)
const SourceLabel = ({ source, className }: { source?: CatalogSource; className?: string }) => {
	const label = source && LABELS[source];
	if (!label) return null;
	return (
		<span
			title={label.title}
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide align-middle",
				label.className,
				className
			)}
		>
			{label.text}
		</span>
	);
};
export default SourceLabel;
