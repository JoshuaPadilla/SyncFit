import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { EntryStatus } from "@/enums/entry_status.enum";
import { formatCurrency } from "@/helpers/currency_formatter";
import { dateFormatter } from "@/helpers/date_formatter";
import { formatTime } from "@/helpers/time_formatter";
import { cn } from "@/lib/utils";
import { useEntryLogStore } from "@/stores/entryLogStore";
import type { EntryLogQuery } from "@/types/query_types/entry_log_query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	CalendarIcon,
	Clock,
	Download,
	LogIn,
	RefreshCw,
	Search,
	ShieldAlert,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebounce } from "use-debounce";

export const Route = createFileRoute("/authenticated/entry-logs/")({
	component: RealTimeEntryLogs,
	loader: async ({ context }) => {
		const insights = await context.queryClient.ensureQueryData({
			queryKey: ["entry-log-insights"],
			queryFn: () => context.entry_log.fetchInsights(),
		});
		return { insights };
	},
});

export default function RealTimeEntryLogs() {
	const { insights } = Route.useLoaderData();
	const { fetchAllLogs } = useEntryLogStore();

	const [searchInput, setSearchInput] = useState("");
	const [query, setQuery] = useState<Partial<EntryLogQuery>>({
		page: 1,
	});

	const [statusFilter, setStatusFilter] = useState<EntryStatus | "all">(
		"all",
	);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(
		undefined,
	);

	const [debouncedSearchInput] = useDebounce(searchInput, 500);

	useEffect(() => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			search: debouncedSearchInput || undefined,
			status: statusFilter === "all" ? undefined : statusFilter,
			// Map the shadcn DateRange object to your query params
			startDate: dateRange?.from ? new Date(dateRange.from) : undefined,
			endDate: dateRange?.to ? new Date(dateRange.to) : undefined,
		}));
	}, [debouncedSearchInput, statusFilter, dateRange]);

	const {
		data: result = { data: [], total: 0, page: 1, totalPages: 1, limit: 5 },
		isPending,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["entry-logs", query],
		queryFn: () => fetchAllLogs(query),
		staleTime: 1000 * 60 * 5,
	});

	const isnightsItems = [
		{
			label: "Total Entries Today",
			value: insights.totalEntriesToday,
			icon: LogIn,
		},
		{
			label: "Active Members",
			value: insights.activeMembers,
			icon: Users,
		},
		{
			label: "Denied Attempts",
			value: insights.deniedAttempts,
			isDanger: true,
			icon: ShieldAlert,
		},
		{
			label: "Peak Hour",
			value: insights.peakHour,
			icon: Clock,
		},
	];

	const currentPage = result.page || 1;
	const totalPages = result.totalPages || 1;
	const totalItems = result.total || 0;
	const limit = result.limit || 5;

	// Calculate the "Showing X to Y" values
	const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
	const endItem = Math.min(currentPage * limit, totalItems);

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setQuery((prev) => ({ ...prev, page: newPage }));
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-8 flex flex-col gap-8 font-body-reg dark">
			{/* --- Header Section --- */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-3 mb-1">
						<h1 className="text-3xl font-header-bold tracking-tight text-foreground">
							Real-time Entry Logs
						</h1>
						<Badge
							variant="outline"
							className="gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-body-semibold border-primary/20"
						>
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
							</span>
							Live Connection
						</Badge>
					</div>
					<p className="text-muted-foreground font-body-reg text-sm">
						Monitoring access points via MQTT protocol securely.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button className="gap-2 font-body-bold shadow-lg shadow-primary/20">
						<Download size={16} />
						Export CSV
					</Button>
				</div>
			</div>

			{/* --- Stats Grid --- */}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{isnightsItems.map((stat, idx) => (
					<Card key={idx} className="border-border shadow-none">
						<CardContent>
							<div className="flex items-center justify-between mb-2">
								<p className="text-muted-foreground font-body-med text-sm">
									{stat.label}
								</p>
								{/* Icon with dynamic color based on isDanger */}
								<stat.icon
									className={`h-6 w-6 ${stat.isDanger ? "text-destructive" : "text-muted-foreground"}`}
								/>
							</div>
							<p
								className={`text-3xl font-header-bold ${
									stat.isDanger
										? "text-destructive"
										: "text-foreground"
								}`}
							>
								{stat.value}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* --- Table Section --- */}
			<Card className="flex flex-col overflow-hidden shadow-none border-border">
				{/* Toolbar */}
				<div className="px-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="relative w-full max-w-md flex items-center">
						<Search
							className="absolute left-3 text-muted-foreground"
							size={18}
						/>
						<Input
							type="text"
							placeholder="Search by member name or Card UID..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-10 font-body-reg bg-background/50 border-border h-10"
						/>
					</div>
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						{/* Status Filter */}
						<Select
							value={statusFilter}
							onValueChange={(value) =>
								setStatusFilter(value as EntryStatus | "all")
							}
						>
							<SelectTrigger className="w-[160px] h-10 bg-background/50">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Statuses
								</SelectItem>
								<SelectItem value={EntryStatus.GRANTED}>
									Granted
								</SelectItem>
								<SelectItem value={EntryStatus.DENIED}>
									Denied
								</SelectItem>
							</SelectContent>
						</Select>

						{/* Date Range Filters */}
						<div className="grid gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										id="date"
										variant={"outline"}
										className={cn(
											"w-[260px] justify-start text-left font-normal bg-background/50",
											!dateRange &&
												"text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange?.from ? (
											dateRange.to ? (
												<>
													{format(
														dateRange.from,
														"LLL dd, y",
													)}{" "}
													-{" "}
													{format(
														dateRange.to,
														"LLL dd, y",
													)}
												</>
											) : (
												format(
													dateRange.from,
													"LLL dd, y",
												)
											)
										) : (
											<span>Pick a date range</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="end"
								>
									<Calendar
										autoFocus
										mode="range"
										defaultMonth={dateRange?.from}
										selected={dateRange}
										onSelect={(range) =>
											setDateRange(range)
										}
										numberOfMonths={2}
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Clear Filters Button (Shows only if a filter is active) */}
						{(statusFilter !== "all" || dateRange?.from) && (
							<Button
								variant="ghost"
								onClick={() => {
									setStatusFilter("all");
									setDateRange(undefined); // Reset the date range
								}}
								className="text-muted-foreground hover:text-foreground px-2"
							>
								Clear
							</Button>
						)}

						{/* Existing Refresh Button */}
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground"
							onClick={() => {
								// Optional: trigger manual refetch here if needed
								// refetch();
							}}
						>
							<RefreshCw size={18} />
						</Button>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto px-4">
					<Table>
						<TableHeader className="bg-background/20">
							<TableRow className="border-border/50 hover:bg-transparent">
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Timestamp
								</TableHead>
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Member Name
								</TableHead>
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Card UID
								</TableHead>
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Membership
								</TableHead>
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Deducted
								</TableHead>
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Status
								</TableHead>
								<TableHead className="font-header-semibold text-xs tracking-wider uppercase">
									Reason
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="font-body-reg text-sm divide-border/50">
							{/* 1. LOADING STATE */}
							{isPending ? (
								Array.from({ length: 5 }).map((_, idx) => (
									<TableRow
										key={`skeleton-${idx}`}
										className="border-border/50"
									>
										<TableCell className="py-4">
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<Skeleton className="h-8 w-8 rounded-full" />
												<Skeleton className="h-4 w-32" />
											</div>
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16 rounded-full" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-24" />
										</TableCell>
									</TableRow>
								))
							) : (
								/* 2. ACTUAL DATA ROWS */
								<>
									{result.data.map((log) => {
										const isGranted =
											log.status === "granted";
										return (
											<TableRow
												key={log.id}
												className="border-border/50 hover:bg-background/30 transition-colors group"
											>
												<TableCell className="text-muted-foreground font-mono text-xs py-4">
													{dateFormatter(
														log.createdAt,
													)}{" "}
													{formatTime(log.createdAt)}
												</TableCell>

												<TableCell className="flex items-center gap-3">
													{log.member ? (
														<>
															<Avatar className="h-8 w-8">
																<AvatarFallback className="bg-secondary text-secondary-foreground font-header-bold text-xs uppercase">
																	{
																		log
																			.member
																			.user
																			.firstName[0]
																	}
																	{
																		log
																			.member
																			.user
																			.lastName[0]
																	}
																</AvatarFallback>
															</Avatar>
															<span className="text-foreground font-body-semibold">
																{
																	log.member
																		.user
																		.firstName
																}{" "}
																{
																	log.member
																		.user
																		.lastName
																}
															</span>
														</>
													) : (
														<>
															<Avatar className="h-8 w-8 border border-border">
																<AvatarFallback className="bg-background text-muted-foreground font-header-bold text-xs">
																	?
																</AvatarFallback>
															</Avatar>
															<span className="text-muted-foreground italic font-body-reg">
																Unknown Card
															</span>
														</>
													)}
												</TableCell>

												<TableCell>
													<Badge
														variant="outline"
														className="bg-background text-muted-foreground font-mono text-[11px] rounded font-normal"
													>
														{log.rfidUid}
													</Badge>
												</TableCell>

												<TableCell className="text-muted-foreground">
													{log.member?.membershipPlan?.type.toLocaleUpperCase() ||
														"N/A"}
												</TableCell>

												<TableCell
													className={`font-body-semibold ${
														log.deductedAmount
															? "text-primary"
															: "text-muted-foreground"
													}`}
												>
													{log.deductedAmount
														? `- ₱ ${formatCurrency(log.deductedAmount)}`
														: "-"}
												</TableCell>

												<TableCell>
													<Badge
														variant="outline"
														className={`font-body-bold tracking-wide uppercase ${
															isGranted
																? "bg-primary/10 text-primary border-primary/20"
																: "bg-destructive/10 text-destructive border-destructive/20"
														}`}
													>
														{log.status}
													</Badge>
												</TableCell>

												<TableCell
													className={
														isGranted
															? "text-muted-foreground"
															: "text-destructive font-body-med"
													}
												>
													{log.deniedReason ||
														"Access Allowed"}
												</TableCell>
											</TableRow>
										);
									})}

									{/* 3. EMPTY PADDING ROWS TO MAINTAIN 5 ROW HEIGHT */}
									{Array.from({
										length: Math.max(
											0,
											5 - result.data.length,
										),
									}).map((_, idx) => (
										<TableRow
											key={`empty-${idx}`}
											className="border-border/50 hover:bg-transparent pointer-events-none"
										>
											{/* h-[73px] represents the approximate height of your standard populated row */}
											<TableCell
												colSpan={7}
												className="h-[73px] py-4"
											></TableCell>
										</TableRow>
									))}
								</>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-body-reg">
					<div>
						Showing{" "}
						<span className="text-foreground font-body-bold">
							{startItem}
						</span>{" "}
						to{" "}
						<span className="text-foreground font-body-bold">
							{endItem}
						</span>{" "}
						of{" "}
						<span className="text-foreground font-body-bold">
							{totalItems}
						</span>{" "}
						results
					</div>

					<Pagination className="mx-0 w-auto">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handlePageChange(currentPage - 1);
									}}
									className={`h-8 px-3 text-xs ${
										currentPage <= 1
											? "pointer-events-none opacity-50"
											: ""
									}`}
								/>
							</PaginationItem>

							{[...Array(totalPages)].map((_, idx) => {
								const pageNum = idx + 1;
								return (
									<PaginationItem key={pageNum}>
										<PaginationLink
											href="#"
											isActive={pageNum === currentPage}
											onClick={(e) => {
												e.preventDefault();
												handlePageChange(pageNum);
											}}
											className={`h-8 w-8 text-xs ${
												pageNum === currentPage
													? "font-body-bold border-primary text-primary bg-primary/10 hover:bg-primary/20"
													: ""
											}`}
										>
											{pageNum}
										</PaginationLink>
									</PaginationItem>
								);
							})}

							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handlePageChange(currentPage + 1);
									}}
									className={`h-8 px-3 text-xs ${
										currentPage >= totalPages
											? "pointer-events-none opacity-50"
											: ""
									}`}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</Card>
		</div>
	);
}
