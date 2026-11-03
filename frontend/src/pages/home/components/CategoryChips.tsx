import { cn } from "@/lib/utils";

type Chip = { id: string; name: string };

const CategoryChips = ({ chips, active, onSelect }: { chips: Chip[]; active: string; onSelect: (id: string) => void }) => (
	<div className='flex gap-2 overflow-x-auto pb-2 mb-6 [scrollbar-width:none]'>
		{chips.map((chip) => (
			<button
				key={chip.id}
				onClick={() => onSelect(chip.id)}
				className={cn(
					"shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
					active === chip.id ? "bg-white text-black" : "bg-zinc-800 text-white hover:bg-zinc-700"
				)}
			>
				{chip.name}
			</button>
		))}
	</div>
);
export default CategoryChips;
