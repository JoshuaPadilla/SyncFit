import { Skeleton } from "@/components/ui/skeleton";

export default function ScreenSkeleton() {
	return (
		// Uses your deep background (--background)
		<div className="flex min-h-screen w-full flex-col bg-background p-6 md:p-8 lg:p-10">
			{/* --- HEADER SKELETON --- */}
			<div className="flex items-center justify-between pb-8">
				<div className="space-y-3">
					{/* Title */}
					<Skeleton className="h-10 w-[200px] md:w-[300px]" />
					{/* Subtitle */}
					<Skeleton className="h-4 w-[150px] md:w-[250px]" />
				</div>
				{/* Profile Avatar / Action Button */}
				<Skeleton className="h-12 w-12 rounded-full" />
			</div>

			{/* --- MAIN CONTENT SKELETON --- */}
			<div className="flex-1 space-y-8">
				{/* Top Banner / Hero Card */}
				{/* Uses your --card background and --border for depth */}
				<div className="overflow-hidden rounded-2xl border bg-card p-6">
					<Skeleton className="h-[200px] w-full rounded-xl" />
				</div>

				{/* Grid Area (e.g., Stats, Features, or Dashboard Cards) */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="flex flex-col space-y-3 rounded-xl border bg-card p-5">
						<Skeleton className="h-[120px] w-full rounded-lg" />
						<Skeleton className="h-4 w-3/4" />
					</div>
					<div className="flex flex-col space-y-3 rounded-xl border bg-card p-5">
						<Skeleton className="h-[120px] w-full rounded-lg" />
						<Skeleton className="h-4 w-3/4" />
					</div>
					<div className="flex flex-col space-y-3 rounded-xl border bg-card p-5 hidden md:flex">
						<Skeleton className="h-[120px] w-full rounded-lg" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>

				{/* Bottom List Area (e.g., Table rows, Feed, or Settings list) */}
				<div className="space-y-4 pt-4">
					<Skeleton className="h-14 w-full rounded-lg" />
					<Skeleton className="h-14 w-full rounded-lg" />
					<Skeleton className="h-14 w-full rounded-lg" />
				</div>
			</div>
		</div>
	);
}
