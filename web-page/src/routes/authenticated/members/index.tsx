import { MembersTable } from "@/components/custom_components/members_table";
import ScreenSkeleton from "@/components/custom_components/screen_skeleton";
import { MembershipStatus } from "@/enums/membership_status.enum";
// Assuming you have this exported in a file, adjust the path as needed
import { MembershipType } from "@/enums/membership_type.enum";
import { useUserStore } from "@/stores/userStore";
import type { UserQuery } from "@/types/query_types/member_query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export const Route = createFileRoute("/authenticated/members/")({
	component: Members,
	pendingComponent: () => <ScreenSkeleton />,
	pendingMinMs: 0,
});

const LIMIT = 5;

const STATUS_TABS: { label: string; value: MembershipStatus | "all" }[] = [
	{ label: "All Members", value: "all" },
	{ label: "Active", value: MembershipStatus.ACTIVE },
	{ label: "Expired", value: MembershipStatus.EXPIRED },
	{ label: "Suspended", value: MembershipStatus.SUSPENDED },
];

export default function Members() {
	const { fetchUsers } = useUserStore();

	const [searchInput, setSearchInput] = useState("");
	const [query, setQuery] = useState<Partial<UserQuery>>({
		page: 1,
		limit: LIMIT,
	});

	const [debouncedSearchInput] = useDebounce(searchInput, 500);

	useEffect(() => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			search: debouncedSearchInput || undefined,
		}));
	}, [debouncedSearchInput]);

	const activeStatus = query.status ?? "all";
	// Depending on your UserQuery type, this might be `query.type` instead of `query.membershipType`
	const activeType = (query as any).membershipType ?? "all";

	const handleStatusTab = (value: MembershipStatus | "all") => {
		setQuery((prev) => ({
			...prev,
			page: 1,
			status: value === "all" ? undefined : value,
		}));
	};

	// NEW: Handler for Membership Type changes
	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value as MembershipType | "all";
		setQuery((prev) => ({
			...prev,
			page: 1,
			membershipType: value === "all" ? undefined : value,
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
		queryKey: ["members", query],
		queryFn: () => fetchUsers(query),
		staleTime: 1000 * 60 * 5,
	});

	const members = result.data;
	const total = result.total;
	const currentPage = query.page ?? 1;
	const totalPages = result.totalPages ?? 1;
	const rangeStart = total === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
	const rangeEnd = Math.min(currentPage * LIMIT, total);

	return (
		<div className="min-h-screen bg-background text-foreground p-8 font-body-reg dark">
			<div className="flex justify-between items-start mb-8">
				<div>
					<h1 className="text-3xl font-header-bold tracking-tight mb-2">
						Member Management
					</h1>
					<p className="text-muted-foreground text-sm">
						Manage gym members, access rights, and billing details.
					</p>
				</div>
				<button className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg flex items-center gap-2 font-body-med text-sm hover:opacity-90 transition-opacity">
					<Plus className="w-4 h-4" />
					Add New Member
				</button>
			</div>

			<div className="flex items-center gap-4 mb-8">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search by name, email, or RFID UID"
						className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>

				<div className="flex bg-card border border-border rounded-lg p-1">
					{STATUS_TABS.map((tab) => {
						const isActive = activeStatus === tab.value;
						return (
							<button
								key={tab.value}
								onClick={() => handleStatusTab(tab.value)}
								className={`px-4 py-1.5 rounded-md text-sm font-body-med flex items-center gap-2 transition-colors ${
									isActive
										? "bg-secondary/50 text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{tab.label}
								{tab.value === "all" && isActive && (
									<span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
										{total}
									</span>
								)}
							</button>
						);
					})}
				</div>

				<div className="ml-auto flex items-center gap-3">
					{/* NEW: Membership Type Dropdown Filter */}
					<select
						value={activeType}
						onChange={handleTypeChange}
						className="bg-card border border-border text-muted-foreground hover:text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
					>
						<option value="all">All Plan Types</option>
						<option value={MembershipType.ANNUALLY}>
							Annually
						</option>
						<option value={MembershipType.MONTHLY}>Monthly</option>
						<option value={MembershipType.PREPAID}>Prepaid</option>
					</select>

					<button className="p-2.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground">
						<Filter className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
				<div className="overflow-x-auto">
					<div
						className={`${isFetching ? "opacity-50 pointer-events-none" : ""} px-4 py-6`}
					>
						<MembersTable
							members={members}
							isPending={isPending}
							error={error}
						/>
					</div>
				</div>

				<div className="flex items-center justify-between px-6 py-4 border-t border-border">
					<span className="text-sm text-muted-foreground">
						{total === 0 ? (
							"No members found"
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
								members
							</>
						)}
					</span>
					<div className="flex gap-2">
						<button
							onClick={() => handlePageChange("prev", totalPages)}
							disabled={currentPage <= 1 || isPending}
							className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button
							onClick={() => handlePageChange("next", totalPages)}
							disabled={currentPage >= totalPages || isPending}
							className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
