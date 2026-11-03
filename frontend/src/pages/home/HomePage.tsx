import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useDiscoverStore } from "@/stores/useDiscoverStore";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import CategoryChips from "./components/CategoryChips";
import { usePlayerStore } from "@/stores/usePlayerStore";

const UPLOADS = "uploads";
const ROW_LIMIT = 6;

const greeting = () => {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
};

const HomePage = () => {
	const { fetchFeaturedSongs } = useMusicStore();
	const {
		rows,
		librarySongs,
		categorySongs,
		isLoadingRows,
		isLoadingLibrary,
		loadingCategory,
		error,
		fetchRows,
		fetchLibrary,
		fetchCategory,
	} = useDiscoverStore();
	const { initializeQueue } = usePlayerStore();

	const [searchParams, setSearchParams] = useSearchParams();
	const active = searchParams.get("category") || "all";

	const selectCategory = (id: string) => setSearchParams(id === "all" ? {} : { category: id });

	useEffect(() => {
		fetchFeaturedSongs();
		fetchLibrary();
		fetchRows();
	}, [fetchFeaturedSongs, fetchLibrary, fetchRows]);

	useEffect(() => {
		if (active !== "all" && active !== UPLOADS) fetchCategory(active);
	}, [active, fetchCategory]);

	useEffect(() => {
		if (librarySongs.length > 0) initializeQueue(librarySongs);
	}, [initializeQueue, librarySongs]);

	const chips = [
		{ id: "all", name: "All" },
		{ id: UPLOADS, name: "Uploaded by us" },
		...rows.map(({ id, name }) => ({ id, name })),
	];

	const uploadsSection = (limit?: number) => (
		<SectionGrid
			title='Uploaded by us'
			subtitle='Full-length songs from our own library'
			songs={librarySongs}
			isLoading={isLoadingLibrary}
			limit={limit}
			onShowAll={limit ? () => selectCategory(UPLOADS) : undefined}
		/>
	);

	const renderContent = () => {
		if (active === UPLOADS) return uploadsSection();

		if (active !== "all") {
			const row = rows.find((r) => r.id === active);
			return (
				<SectionGrid
					title={row?.name || "Songs"}
					subtitle={`${row?.group ?? ""} · Full songs via YouTube`}
					songs={categorySongs[active] || row?.songs || []}
					isLoading={loadingCategory === active && !row}
				/>
			);
		}

		// "All": our uploads first, then each third-party category, grouped by region
		let lastGroup = "";
		return (
			<>
				<FeaturedSection />
				{uploadsSection(ROW_LIMIT)}

				{isLoadingRows && <SectionGrid title='' songs={[]} isLoading />}
				{rows.map((row) => {
					const showGroup = row.group !== lastGroup;
					lastGroup = row.group;
					return (
						<div key={row.id}>
							{showGroup && (
								<p className='text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2'>
									{row.group}
								</p>
							)}
							<SectionGrid
								title={row.name}
								songs={row.songs}
								isLoading={false}
								limit={ROW_LIMIT}
								onShowAll={() => selectCategory(row.id)}
							/>
						</div>
					);
				})}
			</>
		);
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<h1 className='text-2xl sm:text-3xl font-bold mb-4'>{greeting()}</h1>
					<CategoryChips chips={chips} active={active} onSelect={selectCategory} />
					{error && <p className='text-red-500 mb-4'>{error}</p>}
					{renderContent()}
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
