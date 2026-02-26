import { EntryStatus } from "@/enums/entry_status.enum";
import { dateFormatter } from "@/helpers/date_formatter";
import { formatTime } from "@/helpers/time_formatter";
import type { EntryLog } from "@/types/entry_log";
import { Clock } from "lucide-react";
import React from "react";

// Assuming these enums match your backend

interface EntryLogTableProps {
	logs: EntryLog[];
	onViewAll?: () => void;
	onDownloadReport?: () => void;
}

export const UserEntryLogTable: React.FC<EntryLogTableProps> = ({
	logs,
	onViewAll,
	onDownloadReport,
}) => {
	// Helper function to derive UI presentation from the EntryLog data
	const getLogDisplayDetails = (log: EntryLog) => {
		const isGranted = log.status === EntryStatus.GRANTED;

		// Determine the dot color
		const color = isGranted ? "bg-neon" : "bg-red-500";

		// Determine the title
		const title = isGranted ? "Entry Granted" : "Entry Denied";

		// Determine the descriptive text

		if (!isGranted && log.deniedReason) {
			// Clean up enum strings (e.g., INSUFFICIENT_FUNDS -> Insufficient Funds)
			const cleanReason = log.deniedReason
				.replace(/_/g, " ")
				.toLowerCase();
			` • ${cleanReason.charAt(0).toUpperCase() + cleanReason.slice(1)}`;
		} else if (isGranted && log.deductedAmount && log.deductedAmount > 0) {
			` • Deducted ₱${log.deductedAmount}`;
		} else if (isGranted) {
			` • Access Granted`;
		}

		return {
			color,
			title,
			time: `${dateFormatter(log.entryTime)} ${formatTime(log.entryTime)}`,
		};
	};

	return (
		<div className="xl:col-span-1 bg-card rounded-radius-2xl p-6 border border-white/5 flex flex-col shadow-sm">
			{/* Header section */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-3">
					<div className="bg-purple-500/10 p-2 rounded-lg">
						<Clock className="text-[#a855f7]" size={20} />
					</div>
					<h2 className="font-header-semibold text-[17px] text-foreground">
						Entry Logs
					</h2>
				</div>
				<button
					onClick={onViewAll}
					className="text-[#ff7b00] text-xs font-body-bold hover:underline"
				>
					View All
				</button>
			</div>

			{/* Timeline section */}
			<div className="flex-1 relative pl-3 space-y-7 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-[1px] before:bg-white/10">
				{logs.length === 0 ? (
					<p className="text-sm text-muted-foreground font-body-reg italic pl-4">
						No recent activity.
					</p>
				) : (
					logs.map((log) => {
						const { color, title, time } =
							getLogDisplayDetails(log);
						return (
							<div
								key={log.id}
								className="relative flex items-start gap-4"
							>
								{/* Timeline Dot */}
								<div
									className={`absolute -left-[20.5px] w-2.5 h-2.5 rounded-full ${color} ring-[6px] ring-card z-10 top-1.5`}
								/>

								{/* Content */}
								<div>
									<p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body-semibold mb-0.5">
										{time}
									</p>
									<h3
										className={`text-[13px] font-header-semibold ${log.status === EntryStatus.GRANTED ? "text-foreground" : "text-red-400"}`}
									>
										{title}
									</h3>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Footer action */}
			<button
				onClick={onDownloadReport}
				className="w-full mt-8 bg-[#222] hover:bg-[#333] text-muted-foreground hover:text-white text-[11px] font-body-bold py-3.5 rounded-full transition-colors tracking-widest uppercase"
			>
				Download Full Report
			</button>
		</div>
	);
};
