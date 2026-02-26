import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SpecificEntitySkeleton() {
	return (
		<div className="flex flex-col gap-6 p-6 w-full animate-pulse dark">
			{/* 1. Profile Header Section */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					{/* Circle using muted/border color for depth */}
					<Skeleton className="h-16 w-16 rounded-full bg-muted/50" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48 bg-muted" />
						<Skeleton className="h-4 w-64 bg-muted/60" />
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-10 w-32 rounded-lg bg-muted" />
					<Skeleton className="h-10 w-32 rounded-lg bg-muted" />
					<Skeleton className="h-10 w-10 rounded-full bg-muted" />
				</div>
			</div>

			{/* 2. Main Grid: Using your Theme's Card and Border colors */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Personal Info Placeholder */}
				<Card className="bg-card border-border shadow-none">
					<CardHeader>
						<Skeleton className="h-6 w-32 bg-muted" />
					</CardHeader>
					<CardContent className="space-y-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-3 w-24 bg-muted-foreground/20" />
								<Skeleton className="h-5 w-40 bg-muted/60" />
							</div>
						))}
					</CardContent>
				</Card>

				{/* Membership & Access Placeholder */}
				<Card className="bg-card border-border shadow-none">
					<CardHeader>
						<Skeleton className="h-6 w-40 bg-muted" />
					</CardHeader>
					<CardContent className="space-y-8">
						<div className="space-y-2">
							<Skeleton className="h-3 w-24 bg-muted-foreground/20" />
							<Skeleton className="h-7 w-32 bg-muted/60" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-3 w-24 bg-muted-foreground/20" />
							<Skeleton className="h-5 w-48 bg-muted/60" />
						</div>
						{/* The Action Button placeholder */}
						<Skeleton className="h-10 w-full rounded-full mt-4 bg-muted" />
					</CardContent>
				</Card>

				{/* Entry Logs Placeholder */}
				<Card className="bg-card border-border shadow-none h-full">
					<CardHeader className="flex flex-row justify-between items-center">
						<Skeleton className="h-6 w-24 bg-muted" />
						<Skeleton className="h-4 w-12 bg-muted-foreground/30" />
					</CardHeader>
					<CardContent className="space-y-6">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex gap-3">
								<Skeleton className="h-3 w-3 rounded-full mt-1 bg-primary/30" />{" "}
								{/* Slight neon hint */}
								<div className="space-y-2 flex-1">
									<Skeleton className="h-3 w-32 bg-muted-foreground/20" />
									<Skeleton className="h-4 w-24 bg-muted/60" />
									<Skeleton className="h-3 w-40 bg-muted-foreground/20" />
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* 3. Bottom Row: Financial and Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card className="md:col-span-2 bg-card border-border shadow-none">
					<CardContent className="p-6 flex justify-between items-center">
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 bg-muted-foreground/20" />
							<Skeleton className="h-10 w-48 bg-muted" />
						</div>
						<Skeleton className="h-10 w-28 rounded-md bg-muted" />
					</CardContent>
				</Card>

				{/* Stats Placeholders */}
				{[1, 2].map((i) => (
					<Card
						key={i}
						className="bg-card border-border shadow-none flex flex-col items-center justify-center p-6 space-y-2"
					>
						<Skeleton className="h-8 w-16 bg-muted" />
						<Skeleton className="h-3 w-20 bg-muted-foreground/20" />
					</Card>
				))}
			</div>
		</div>
	);
}
