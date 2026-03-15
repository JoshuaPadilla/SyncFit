import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";

type Props = {
	pageName?: string;
};

export default function NotImplemented({ pageName }: Props) {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 dark">
			<div className="flex flex-col items-center text-center max-w-md">
				{/* Icon cluster */}
				<div className="relative mb-8">
					<div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center">
						<Construction className="w-10 h-10 text-amber-400" />
					</div>
					<div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-amber-400/10 border border-border flex items-center justify-center">
						<Sparkles className="w-4 h-4 text-amber-400" />
					</div>
				</div>

				{/* Badge */}
				<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-body-med mb-4">
					<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
					Coming Soon
				</span>

				<h1 className="text-2xl font-header-bold tracking-tight mb-2">
					{pageName ? pageName : "This Page"} is Under Construction
				</h1>
				<p className="text-muted-foreground text-sm leading-relaxed mb-8">
					We're working hard to bring this feature to life. Check back
					soon — it won't be long.
				</p>

				<button
					onClick={() => router.history.back()}
					className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors font-body-med"
				>
					<ArrowLeft className="w-4 h-4" />
					Go Back
				</button>
			</div>
		</div>
	);
}
