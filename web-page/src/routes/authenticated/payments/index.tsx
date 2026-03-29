import { PaymentsTable } from "@/components/custom_components/payments_table";
import ScreenSkeleton from "@/components/custom_components/screen_skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/enums/payment_status.enum";
import { usePaymentStore } from "@/stores/paymentStore";
import type { PaymentSummary } from "@/types/payment_summary";
import type { PaymentQuery } from "@/types/query_types/payment_query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Clock3,
	FilterX,
	Search,
	Wallet,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export const Route = createFileRoute("/authenticated/payments/")({
	validateSearch: (search: Record<string, unknown>) => ({
		memberId:
			typeof search.memberId === "string" ? search.memberId : undefined,
		memberName:
			typeof search.memberName === "string"
				? search.memberName
				: undefined,
	}),
	component: Payments,
	pendingComponent: () => <ScreenSkeleton />,
	pendingMinMs: 0,
});

const LIMIT = 10;

const STATUS_TABS: { label: string; value: PaymentStatus | "all" }[] = [
	{ label: "All Payments", value: "all" },
	{ label: "Paid", value: PaymentStatus.PAID },
	{ label: "Pending", value: PaymentStatus.PENDING },
	{ label: "Failed", value: PaymentStatus.FAILED },
];

const EMPTY_SUMMARY: PaymentSummary = {
	totalPayments: 0,
	totalRevenue: 0,
	statusCounts: {
		[PaymentStatus.PAID]: 0,
		[PaymentStatus.PENDING]: 0,
		[PaymentStatus.FAILED]: 0,
	},
	paymentMethods: [],
};

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 2,
	}).format(amount);
}

function Payments() {
	const navigate = useNavigate();
	const routeSearch = Route.useSearch();
	const { fetchPayments, fetchPaymentSummary } = usePaymentStore();
	const [searchInput, setSearchInput] = useState("");
	const [query, setQuery] = useState<Partial<PaymentQuery>>({
		page: 1,
		limit: LIMIT,
		memberId: routeSearch.memberId,
	});
	const [debouncedSearchInput] = useDebounce(searchInput, 500);

	useEffect(() => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			search: debouncedSearchInput || undefined,
		}));
	}, [debouncedSearchInput]);

	useEffect(() => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			memberId: routeSearch.memberId,
		}));
	}, [routeSearch.memberId]);

	const activeStatus = query.status ?? "all";
	const activeMethod = query.paymentMethod ?? "all";
	const summaryQuery = {
		search: query.search,
		status: query.status,
		paymentMethod: query.paymentMethod,
		memberId: query.memberId,
	};

	const {
		data: result = {
			data: [],
			total: 0,
			page: 1,
			limit: LIMIT,
			totalPages: 1,
		},
		isPending,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["payments", query],
		queryFn: () => fetchPayments(query),
		staleTime: 1000 * 60 * 2,
	});

	const { data: summary = EMPTY_SUMMARY, isPending: summaryPending } =
		useQuery({
			queryKey: ["payments-summary", summaryQuery],
			queryFn: () => fetchPaymentSummary(summaryQuery),
			staleTime: 1000 * 60 * 2,
		});

	const handleStatusTab = (value: PaymentStatus | "all") => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			status: value === "all" ? undefined : value,
		}));
	};

	const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setQuery((prev) => ({
			...prev,
			page: 1,
			paymentMethod: value === "all" ? undefined : value,
		}));
	};

	const handlePageChange = (
		direction: "prev" | "next",
		totalPages: number,
	) => {
		setQuery((prev) => ({
			...prev,
			page:
				direction === "prev"
					? Math.max(1, (prev.page ?? 1) - 1)
					: Math.min(totalPages, (prev.page ?? 1) + 1),
		}));
	};

	const clearMemberFilter = () => {
		navigate({ to: "/authenticated/payments", search: {} });
	};

	const payments = result.data;
	const total = result.total;
	const currentPage = query.page ?? 1;
	const totalPages = result.totalPages ?? 1;
	const rangeStart = total === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
	const rangeEnd = Math.min(currentPage * LIMIT, total);
	const hasMemberFilter = Boolean(routeSearch.memberId);
	const paymentMethods = summary.paymentMethods;

	const statCards = [
		{
			label: "Revenue Collected",
			value: summaryPending
				? "..."
				: formatCurrency(summary.totalRevenue),
			icon: Wallet,
			accent: "text-[#ff7b00]",
			iconBg: "bg-[#ff7b00]/10",
			helper: "Successful payment volume",
		},
		{
			label: "Total Payments",
			value: summaryPending ? "..." : summary.totalPayments.toString(),
			icon: AlertCircle,
			accent: "text-sky-300",
			iconBg: "bg-sky-500/10",
			helper: "Matching the current filters",
		},
		{
			label: "Paid",
			value: summaryPending
				? "..."
				: summary.statusCounts[PaymentStatus.PAID].toString(),
			icon: CheckCircle2,
			accent: "text-emerald-300",
			iconBg: "bg-emerald-500/10",
			helper: "Completed checkouts",
		},
		{
			label: "Pending",
			value: summaryPending
				? "..."
				: summary.statusCounts[PaymentStatus.PENDING].toString(),
			icon: Clock3,
			accent: "text-amber-300",
			iconBg: "bg-amber-500/10",
			helper: "Awaiting completion",
		},
		{
			label: "Failed",
			value: summaryPending
				? "..."
				: summary.statusCounts[PaymentStatus.FAILED].toString(),
			icon: XCircle,
			accent: "text-red-300",
			iconBg: "bg-red-500/10",
			helper: "Failed checkout attempts",
		},
	];

	return (
		<div className="min-h-screen bg-background p-4 font-body-reg text-foreground dark sm:p-6 lg:p-8">
			<div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="mb-2 text-2xl font-header-bold tracking-tight sm:text-3xl">
						Payments
					</h1>
					<p className="text-sm text-muted-foreground">
						Monitor completed checkouts, pending payments, and
						member billing activity.
					</p>
				</div>
				{hasMemberFilter ? (
					<Button variant="outline" onClick={clearMemberFilter}>
						<FilterX className="h-4 w-4" />
						Clear Member Filter
					</Button>
				) : null}
			</div>

			<div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 md:grid-cols-3 lg:grid-cols-5">
				{statCards.map((card) => {
					const Icon = card.icon;

					return (
						<div
							key={card.label}
							className="rounded-xl border border-border bg-card p-4"
						>
							<div className="mb-4 flex items-start justify-between">
								<span className="text-xs uppercase tracking-wide text-muted-foreground">
									{card.label}
								</span>
								<div
									className={`rounded-lg p-2 ${card.iconBg}`}
								>
									<Icon
										className={`h-4 w-4 ${card.accent}`}
									/>
								</div>
							</div>
							<p
								className={`mb-1 text-2xl font-header-bold ${card.accent}`}
							>
								{card.value}
							</p>
							<p className="text-xs text-muted-foreground">
								{card.helper}
							</p>
						</div>
					);
				})}
			</div>

			<div className="mb-6 flex flex-col gap-3 sm:mb-8">
				{hasMemberFilter ? (
					<div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
						<span>Viewing payment history for</span>
						<Badge variant="secondary" className="text-foreground">
							{routeSearch.memberName ?? routeSearch.memberId}
						</Badge>
					</div>
				) : null}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="relative flex-1 sm:max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Search by member, email, reference, or method"
							className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<select
						value={activeMethod}
						onChange={handleMethodChange}
						className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:w-52"
					>
						<option value="all">All Methods</option>
						{paymentMethods.map((method) => (
							<option
								key={method.paymentMethod}
								value={method.paymentMethod}
							>
								{method.paymentMethod.toUpperCase()} (
								{method.count})
							</option>
						))}
					</select>
				</div>

				<div className="overflow-x-auto">
					<div className="flex min-w-max rounded-lg border border-border bg-card p-1">
						{STATUS_TABS.map((tab) => {
							const isActive = activeStatus === tab.value;
							const count =
								tab.value === "all"
									? summary.totalPayments
									: summary.statusCounts[tab.value];

							return (
								<button
									key={tab.value}
									onClick={() => handleStatusTab(tab.value)}
									className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-body-med transition-colors sm:px-4 ${
										isActive
											? "bg-secondary text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{tab.label}
									{isActive ? (
										<Badge className="h-4 px-1.5 text-[10px]">
											{count}
										</Badge>
									) : null}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
				<div className="overflow-x-auto px-4 py-6">
					<div
						className={
							isFetching ? "pointer-events-none opacity-50" : ""
						}
					>
						<PaymentsTable
							payments={payments}
							isPending={isPending}
							error={error as Error | null}
						/>
					</div>
				</div>

				<div className="flex flex-col justify-between gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:px-6">
					<span className="text-sm text-muted-foreground">
						{total === 0 ? (
							"No payments found"
						) : (
							<>
								Showing{" "}
								<span className="font-body-med text-foreground">
									{rangeStart}
								</span>{" "}
								to{" "}
								<span className="font-body-med text-foreground">
									{rangeEnd}
								</span>{" "}
								of{" "}
								<span className="font-body-med text-foreground">
									{total}
								</span>{" "}
								payments
							</>
						)}
					</span>
					<div className="flex gap-2">
						<button
							onClick={() => handlePageChange("prev", totalPages)}
							disabled={currentPage <= 1 || isPending}
							className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40"
						>
							Previous
						</button>
						<button
							onClick={() => handlePageChange("next", totalPages)}
							disabled={currentPage >= totalPages || isPending}
							className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
