type OfflineFallbackProps = {
	onRetry: () => void;
};

export function OfflineFallback({ onRetry }: OfflineFallbackProps) {
	return (
		<div className="min-h-screen bg-background text-foreground px-6 py-10 flex items-center justify-center dark">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm">
				<div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
					<img
						src="/web_logo.png"
						alt="SyncFit"
						className="h-8 w-8"
					/>
				</div>
				<h1 className="text-xl sm:text-2xl font-header-bold tracking-tight">
					You're offline
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					SyncFit can't reach the internet right now. Reconnect and
					try again.
				</p>
				<button
					onClick={onRetry}
					className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-body-semibold text-primary-foreground hover:opacity-90 transition-opacity"
				>
					Try Again
				</button>
				<p className="mt-3 text-xs text-muted-foreground">
					Some previously loaded pages may still work from cache.
				</p>
			</div>
		</div>
	);
}
