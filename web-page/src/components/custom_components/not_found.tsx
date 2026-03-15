import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Dumbbell, SearchX } from "lucide-react";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 dark">
			<div className="flex flex-col items-center text-center max-w-md">
				{/* Icon cluster */}
				<div className="relative mb-8">
					<div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center">
						<SearchX className="w-10 h-10 text-muted-foreground" />
					</div>
					<div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-primary/10 border border-border flex items-center justify-center">
						<Dumbbell className="w-4 h-4 text-primary" />
					</div>
				</div>

				{/* Error code */}
				<p className="text-8xl font-header-bold text-border select-none leading-none mb-4">
					404
				</p>

				<h1 className="text-2xl font-header-bold tracking-tight mb-2">
					Page Not Found
				</h1>
				<p className="text-muted-foreground text-sm leading-relaxed mb-8">
					The page you're looking for doesn't exist or has been moved.
					Make sure the URL is correct.
				</p>

				<div className="flex items-center gap-3">
					<button
						onClick={() => router.history.back()}
						className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors font-body-med"
					>
						<ArrowLeft className="w-4 h-4" />
						Go Back
					</button>
					<a
						href="/authenticated/overview"
						className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-body-med hover:opacity-90 transition-opacity"
					>
						Go to Dashboard
					</a>
				</div>
			</div>
		</div>
	);
}
