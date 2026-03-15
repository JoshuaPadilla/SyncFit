import ScreenSkeleton from "@/components/custom_components/screen_skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth_context";
import { EntryStatus } from "@/enums/entry_status.enum";
import { MembershipStatus } from "@/enums/membership_status.enum";
import { formatTime } from "@/helpers/time_formatter";
import { useEntryLogStore } from "@/stores/entryLogStore";
import { useUserStore } from "@/stores/userStore";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import {
	Activity,
	CheckCircle,
	Clock,
	LogIn,
	ShieldAlert,
	Users,
} from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export const Route = createFileRoute("/authenticated/overview/")({
	component: OverviewDashboard,
	pendingComponent: () => <ScreenSkeleton />,
});

function formatHour(hour: number): string {
	if (hour === 0) return "12 AM";
	if (hour < 12) return `${hour} AM`;
	if (hour === 12) return "12 PM";
	return `${hour - 12} PM`;
}

export default function OverviewDashboard() {
	const { user } = useAuth();
	const { fetchInsights, fetchAllLogs } = useEntryLogStore();
	const { fetchUsers } = useUserStore();

	const { data: insights, isPending: insightsPending } = useQuery({
		queryKey: ["entry-log-insights"],
		queryFn: () => fetchInsights(),
		staleTime: 1000 * 60 * 2,
	});

	const { data: allMembers, isPending: totalPending } = useQuery({
		queryKey: ["members-total"],
		queryFn: () => fetchUsers({ limit: 1 }),
		staleTime: 1000 * 60 * 5,
	});

	const { data: activeMembers } = useQuery({
		queryKey: ["members-active"],
		queryFn: () =>
			fetchUsers({ status: MembershipStatus.ACTIVE, limit: 1 }),
		staleTime: 1000 * 60 * 5,
	});

	const { data: expiredMembers } = useQuery({
		queryKey: ["members-expired"],
		queryFn: () =>
			fetchUsers({ status: MembershipStatus.EXPIRED, limit: 1 }),
		staleTime: 1000 * 60 * 5,
	});

	const { data: suspendedMembers } = useQuery({
		queryKey: ["members-suspended"],
		queryFn: () =>
			fetchUsers({ status: MembershipStatus.SUSPENDED, limit: 1 }),
		staleTime: 1000 * 60 * 5,
	});

	const { data: weeklyLogs, isPending: weeklyPending } = useQuery({
		queryKey: ["overview-weekly-logs"],
		queryFn: () =>
			fetchAllLogs({
				startDate: subDays(new Date(), 6),
				endDate: new Date(),
				limit: 500,
				page: 1,
			}),
		staleTime: 1000 * 60 * 5,
	});

	const { data: recentLogsResult, isPending: recentPending } = useQuery({
		queryKey: ["overview-recent-logs"],
		queryFn: () => fetchAllLogs({ limit: 5, page: 1 }),
		staleTime: 1000 * 60 * 2,
	});

	const recentLogs = recentLogsResult?.data ?? [];

	const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
		const day = subDays(new Date(), 6 - i);
		const dayStr = format(day, "yyyy-MM-dd");
		const logs = (weeklyLogs?.data ?? []).filter(
			(log) => format(new Date(log.entryTime), "yyyy-MM-dd") === dayStr,
		);
		return {
			date: format(day, "EEE"),
			fullDate: format(day, "MMM d"),
			granted: logs.filter((l) => l.status === EntryStatus.GRANTED)
				.length,
			denied: logs.filter((l) => l.status === EntryStatus.DENIED).length,
		};
	});

	const membershipStatusData = [
		{
			label: "Active",
			value: activeMembers?.total ?? 0,
			color: "#22c55e",
		},
		{
			label: "Expired",
			value: expiredMembers?.total ?? 0,
			color: "#f59e0b",
		},
		{
			label: "Suspended",
			value: suspendedMembers?.total ?? 0,
			color: "#ef4444",
		},
	];
	const donutData = membershipStatusData.filter((d) => d.value > 0);

	const greeting = (() => {
		const h = new Date().getHours();
		if (h < 12) return "Good morning";
		if (h < 17) return "Good afternoon";
		return "Good evening";
	})();

	const statCards = [
		{
			label: "Total Members",
			value: totalPending ? null : (allMembers?.total ?? 0),
			icon: Users,
			iconColor: "text-blue-400",
			iconBg: "bg-blue-400/10",
			suffix: "registered",
			isString: false,
		},
		{
			label: "Active Members",
			value: insightsPending ? null : (insights?.activeMembers ?? 0),
			icon: CheckCircle,
			iconColor: "text-green-400",
			iconBg: "bg-green-400/10",
			suffix: "currently active",
			isString: false,
		},
		{
			label: "Entries Today",
			value: insightsPending ? null : (insights?.totalEntriesToday ?? 0),
			icon: LogIn,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-400/10",
			suffix: "check-ins today",
			isString: false,
		},
		{
			label: "Denied Attempts",
			value: insightsPending ? null : (insights?.deniedAttempts ?? 0),
			icon: ShieldAlert,
			iconColor: "text-red-400",
			iconBg: "bg-red-400/10",
			suffix: "blocked today",
			isString: false,
		},
		{
			label: "Peak Hour",
			value: insightsPending
				? null
				: insights?.peakHour != null
					? formatHour(insights.peakHour)
					: "—",
			icon: Clock,
			iconColor: "text-amber-400",
			iconBg: "bg-amber-400/10",
			suffix: "busiest time",
			isString: true,
		},
	];

	const tooltipStyle = {
		backgroundColor: "#1c1c1e",
		border: "1px solid rgba(255,255,255,0.1)",
		borderRadius: "8px",
		fontSize: "12px",
		color: "#e5e7eb",
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-8 font-body-reg dark">
			{/* Header */}
			<div className="mb-8">
				<p className="text-muted-foreground text-sm mb-1">
					{format(new Date(), "EEEE, MMMM d, yyyy")}
				</p>
				<h1 className="text-3xl font-header-bold tracking-tight mb-1">
					{greeting}, {user?.firstName ?? "Admin"}
				</h1>
				<p className="text-muted-foreground text-sm">
					Here's what's happening at your gym today.
				</p>
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
				{statCards.map((card) => {
					const Icon = card.icon;
					return (
						<div
							key={card.label}
							className="bg-card border border-border rounded-xl p-5"
						>
							<div className="flex items-start justify-between mb-4">
								<span className="text-muted-foreground text-xs font-body-med uppercase tracking-wide leading-tight">
									{card.label}
								</span>
								<div
									className={`p-2 rounded-lg shrink-0 ${card.iconBg}`}
								>
									<Icon
										className={`w-4 h-4 ${card.iconColor}`}
									/>
								</div>
							</div>
							{card.value == null ? (
								<Skeleton className="h-8 w-16 mb-1" />
							) : (
								<p className="text-3xl font-header-bold mb-1">
									{card.isString
										? String(card.value)
										: Number(card.value).toLocaleString()}
								</p>
							)}
							<p className="text-muted-foreground text-xs">
								{card.suffix}
							</p>
						</div>
					);
				})}
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
				{/* Entry Activity — Area Chart */}
				<div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-sm font-header-bold text-foreground">
								Entry Activity
							</h2>
							<p className="text-xs text-muted-foreground mt-0.5">
								Last 7 days — check-ins by status
							</p>
						</div>
						<div className="flex items-center gap-4 text-xs text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
								Granted
							</span>
							<span className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
								Denied
							</span>
						</div>
					</div>
					{weeklyPending ? (
						<Skeleton className="w-full h-[220px] rounded-lg" />
					) : (
						<ResponsiveContainer width="100%" height={220}>
							<AreaChart
								data={weeklyChartData}
								margin={{
									top: 4,
									right: 4,
									bottom: 0,
									left: -20,
								}}
							>
								<defs>
									<linearGradient
										id="gradGranted"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#a855f7"
											stopOpacity={0.3}
										/>
										<stop
											offset="95%"
											stopColor="#a855f7"
											stopOpacity={0}
										/>
									</linearGradient>
									<linearGradient
										id="gradDenied"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#ef4444"
											stopOpacity={0.2}
										/>
										<stop
											offset="95%"
											stopColor="#ef4444"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.05)"
									vertical={false}
								/>
								<XAxis
									dataKey="date"
									tick={{ fontSize: 12, fill: "#6b7280" }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: "#6b7280" }}
									axisLine={false}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip
									contentStyle={tooltipStyle}
									labelFormatter={(_, payload) =>
										payload?.[0]?.payload?.fullDate ?? ""
									}
									cursor={{
										stroke: "rgba(255,255,255,0.08)",
									}}
								/>
								<Area
									type="monotone"
									dataKey="granted"
									stroke="#a855f7"
									strokeWidth={2}
									fill="url(#gradGranted)"
									dot={false}
									activeDot={{ r: 4, strokeWidth: 0 }}
								/>
								<Area
									type="monotone"
									dataKey="denied"
									stroke="#ef4444"
									strokeWidth={2}
									fill="url(#gradDenied)"
									dot={false}
									activeDot={{ r: 4, strokeWidth: 0 }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Membership Status — Donut Chart */}
				<div className="bg-card border border-border rounded-xl p-6">
					<div className="mb-4">
						<h2 className="text-sm font-header-bold text-foreground">
							Membership Status
						</h2>
						<p className="text-xs text-muted-foreground mt-0.5">
							Current member breakdown
						</p>
					</div>
					{totalPending ? (
						<Skeleton className="w-full h-[220px] rounded-lg" />
					) : (
						<>
							<ResponsiveContainer width="100%" height={180}>
								<PieChart>
									<Pie
										data={
											donutData.length > 0
												? donutData
												: [
														{
															label: "No data",
															value: 1,
															color: "#374151",
														},
													]
										}
										cx="50%"
										cy="50%"
										innerRadius={52}
										outerRadius={78}
										paddingAngle={3}
										dataKey="value"
										nameKey="label"
										stroke="none"
									>
										{(donutData.length > 0
											? donutData
											: [
													{
														label: "No data",
														value: 1,
														color: "#374151",
													},
												]
										).map((entry, i) => (
											<Cell key={i} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={tooltipStyle}
										formatter={(value, name) => [
											value,
											name,
										]}
									/>
								</PieChart>
							</ResponsiveContainer>
							<div className="space-y-2.5 mt-1">
								{membershipStatusData.map(
									({ label, value, color }) => (
										<div
											key={label}
											className="flex items-center justify-between"
										>
											<span className="flex items-center gap-2 text-xs text-muted-foreground">
												<span
													className="w-2 h-2 rounded-full inline-block shrink-0"
													style={{
														backgroundColor: color,
													}}
												/>
												{label}
											</span>
											<span className="text-xs font-body-med text-foreground">
												{value.toLocaleString()}
											</span>
										</div>
									),
								)}
							</div>
						</>
					)}
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-card border border-border rounded-xl overflow-hidden">
				<div className="px-6 py-5 border-b border-border flex items-center justify-between">
					<div>
						<h2 className="text-sm font-header-bold text-foreground">
							Recent Activity
						</h2>
						<p className="text-xs text-muted-foreground mt-0.5">
							Latest entry log events
						</p>
					</div>
					<Activity className="w-4 h-4 text-muted-foreground" />
				</div>
				<div className="divide-y divide-border">
					{recentPending ? (
						Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="px-6 py-4 flex items-center gap-4"
							>
								<Skeleton className="w-9 h-9 rounded-full" />
								<div className="flex-1">
									<Skeleton className="h-3.5 w-36 mb-2" />
									<Skeleton className="h-3 w-24" />
								</div>
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
						))
					) : recentLogs.length === 0 ? (
						<div className="px-6 py-10 text-center text-muted-foreground text-sm">
							No recent activity found.
						</div>
					) : (
						recentLogs.map((log) => {
							const name = log.member
								? `${log.member.user?.firstName ?? ""} ${log.member.user?.lastName ?? ""}`.trim() ||
									"Unknown"
								: "Unknown";
							const initials =
								name !== "Unknown"
									? name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.slice(0, 2)
											.toUpperCase()
									: "?";
							const isGranted =
								log.status === EntryStatus.GRANTED;
							return (
								<div
									key={log.id}
									className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors"
								>
									<Avatar className="w-9 h-9">
										<AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-body-med text-foreground truncate">
											{name}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatTime(log.entryTime)}
										</p>
									</div>
									<Badge
										className={
											isGranted
												? "bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/20"
												: "bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20"
										}
										variant="outline"
									>
										{isGranted ? "Granted" : "Denied"}
									</Badge>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
