import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/helpers/currency_formatter";
import { dateFormatter } from "@/helpers/date_formatter";
import { formatTime } from "@/helpers/time_formatter";
import { useEntryLogStore } from "@/stores/entryLogStore";
import type { EntryLogQuery } from "@/types/query_types/entry_log_query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Download, Filter, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export const Route = createFileRoute("/authenticated/entry-logs/")({
	component: RealTimeEntryLogs,
});

export default function RealTimeEntryLogs() {
	const { fetchAllLogs } = useEntryLogStore();

	const [searchInput, setSearchInput] = useState("");
	const [query, setQuery] = useState<Partial<EntryLogQuery>>({
		page: 1,
	});

	const [debouncedSearchInput] = useDebounce(searchInput, 500);

	useEffect(() => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			search: debouncedSearchInput || undefined,
		}));
	}, [debouncedSearchInput]);

	const {
		data: result = { data: [], total: 0, page: 1 },
		isPending,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["entry-logs", query],
		queryFn: () => fetchAllLogs(query),
		staleTime: 1000 * 60 * 5,
	});

	console.log(result);

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
					<Button variant="outline" className="gap-2 font-body-med">
						<Calendar size={16} />
						Oct 24, 2023 - Today
					</Button>
					<Button className="gap-2 font-body-bold shadow-lg shadow-primary/20">
						<Download size={16} />
						Export CSV
					</Button>
				</div>
			</div>

			{/* --- Stats Grid --- */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: "Total Entries Today", value: "1,248" },
					{ label: "Active Members", value: "142" },
					{ label: "Denied Attempts", value: "12", isDanger: true },
					{ label: "Peak Hour", value: "6:00 PM" },
				].map((stat, idx) => (
					<Card key={idx} className="border-border shadow-none">
						<CardContent className="p-5 flex flex-col justify-center">
							<p className="text-muted-foreground font-body-med text-sm mb-1">
								{stat.label}
							</p>
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
				<div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground"
						>
							<Filter size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground"
						>
							<RefreshCw size={18} />
						</Button>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
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
							{result.data.map((log: any) => {
								const isGranted = log.status === "granted";
								return (
									<TableRow
										key={log.id}
										className="border-border/50 hover:bg-background/30 transition-colors group"
									>
										<TableCell className="text-muted-foreground font-mono text-xs py-4">
											{dateFormatter(log.createdAt)}{" "}
											{formatTime(log.createdAt)}
										</TableCell>

										<TableCell className="flex items-center gap-3">
											{log.member ? (
												<>
													<Avatar className="h-8 w-8">
														<AvatarFallback className="bg-secondary text-secondary-foreground font-header-bold text-xs uppercase">
															{
																log.member.user
																	.firstName[0]
															}
															{
																log.member.user
																	.lastName[0]
															}
														</AvatarFallback>
													</Avatar>
													<span className="text-foreground font-body-semibold">
														{
															log.member.user
																.firstName
														}{" "}
														{
															log.member.user
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
											{log.member?.membershipPlan
												?.title || "N/A"}
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
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground font-body-reg">
					<div>
						Showing{" "}
						<span className="text-foreground font-body-bold">
							1
						</span>{" "}
						to{" "}
						<span className="text-foreground font-body-bold">
							6
						</span>{" "}
						of{" "}
						<span className="text-foreground font-body-bold">
							1248
						</span>{" "}
						results
					</div>
					<Pagination className="mx-0 w-auto">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									className="h-8 px-3 text-xs"
								/>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink
									href="#"
									isActive
									className="h-8 w-8 text-xs font-body-bold border-primary text-primary bg-primary/10 hover:bg-primary/20"
								>
									1
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink
									href="#"
									className="h-8 w-8 text-xs"
								>
									2
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink
									href="#"
									className="h-8 w-8 text-xs"
								>
									3
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationEllipsis className="h-8 w-8" />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink
									href="#"
									className="h-8 w-8 text-xs"
								>
									10
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationNext
									href="#"
									className="h-8 px-3 text-xs"
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</Card>
		</div>
	);
}
