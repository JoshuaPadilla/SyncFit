import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, SearchX, Users } from "lucide-react";

export function MemberNotFoundState() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 sm:px-6 lg:px-8 dark">
			<div className="w-full max-w-xl rounded-2xl border border-border bg-card/70 backdrop-blur p-6 sm:p-8 text-center shadow-sm">
				<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background">
					<SearchX className="h-7 w-7 text-muted-foreground" />
				</div>

				<h2 className="text-2xl font-header-bold tracking-tight">
					Member not found
				</h2>
				<p className="mt-2 text-sm text-muted-foreground font-body-reg leading-relaxed">
					We could not find a member profile for this ID. The account
					may have been removed, or the link may be outdated.
				</p>

				<div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
					<button
						onClick={() => router.history.back()}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-body-med text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Go Back
					</button>

					<Link
						to="/authenticated/members"
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-body-semibold text-primary-foreground hover:opacity-90 transition-opacity"
					>
						<Users className="h-4 w-4" />
						View Members
					</Link>
				</div>
			</div>
		</div>
	);
}
