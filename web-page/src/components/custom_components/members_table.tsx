import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { User } from "@/types/user";
import { useNavigate } from "@tanstack/react-router";
import { IdCard, MoreHorizontal } from "lucide-react";

type Props = {
	members: User[];
	isPending: boolean;
	error: Error | null;
};

export function MembersTable({ members, isPending, error }: Props) {
	const navigate = useNavigate();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateString: string | undefined | Date | null) => {
		if (!dateString) return "—";
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const handleViewProfile = (userId: string) => {
		navigate({
			to: "/authenticated/members/$member_id",
			params: {
				member_id: userId,
			},
		});
	};

	const handleViewPaymentHistory = (user: User) => {
		navigate({
			to: "/authenticated/payments",
			search:
				user.member?.id != null
					? {
							memberId: user.member.id,
							memberName: `${user.firstName} ${user.lastName}`,
						}
					: {},
		});
	};

	const handleSuspendAccount = (userId: string) => {
		console.log("Suspending user ", userId);
	};

	if (isPending) {
		return (
			<div className="p-10 text-center text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-10 text-center text-destructive">
				Failed to load members.
			</div>
		);
	}

	if (members.length === 0) {
		return (
			<div className="p-10 text-center text-muted-foreground">
				No members found.
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3 md:hidden">
				{members.map((user) => (
					<div
						key={user.id}
						className="rounded-xl border border-border bg-card p-4"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-body-bold bg-primary/60 shrink-0">
										{user.firstName[0]}
										{user.lastName[0]}
									</div>
									<div className="min-w-0">
										<p className="font-body-med text-foreground truncate">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{user.email}
										</p>
									</div>
								</div>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0 shrink-0"
									>
										<span className="sr-only">
											Open menu
										</span>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() =>
											handleViewProfile(user.id)
										}
									>
										View Profile
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleViewPaymentHistory(user)
										}
									>
										View Payment History
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-destructive"
										onClick={() =>
											handleSuspendAccount(user.id)
										}
									>
										Suspend Account
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="mt-3 grid grid-cols-2 gap-3 text-xs">
							<div>
								<p className="text-muted-foreground">
									RFID UID
								</p>
								<div className="inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border/50 text-xs text-muted-foreground font-mono">
									<IdCard className="w-3 h-3" />
									{user.member?.rfidUid || "NOT SET YET"}
								</div>
							</div>
							<div>
								<p className="text-muted-foreground">Plan</p>
								<p className="mt-1 text-foreground font-body-med">
									{user.member?.membershipPlan?.type.toUpperCase() ??
										"—"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Balance</p>
								<p
									className={`mt-1 font-body-med ${(user.member?.balance ?? 0) < 0 ? "text-destructive" : "text-foreground"}`}
								>
									{formatCurrency(user.member?.balance ?? 0)}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Expires</p>
								<p className="mt-1 text-foreground font-body-med">
									{formatDate(user.member?.expirationDate)}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="hidden md:block">
				<Table>
					<TableHeader className="bg-background/20">
						<TableRow className="border-border/50 hover:bg-transparent">
							<TableHead>Member Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>RFID UID</TableHead>
							<TableHead>Membership Plan</TableHead>
							<TableHead>Balance</TableHead>
							<TableHead>Expiration Date</TableHead>
							<TableHead className="text-right">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{members.map((user) => (
							<TableRow
								key={user.id}
								className="m-2 hover:bg-secondary/20 transition-colors group "
							>
								<TableCell className="py-4">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-body-bold bg-primary/60">
											{user.firstName[0]}
											{user.lastName[0]}
										</div>
										<span className="font-body-med text-foreground">
											{user.firstName} {user.lastName}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{user.email}
								</TableCell>
								<TableCell>
									<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border/50 text-xs text-muted-foreground font-mono">
										<IdCard className="w-3 h-3" />
										{user.member?.rfidUid || "NOT SET YET"}
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{user.member?.membershipPlan?.type.toUpperCase() ??
										"—"}
								</TableCell>
								<TableCell className="font-body-med">
									<span
										className={
											(user.member?.balance ?? 0) < 0
												? "text-destructive"
												: "text-foreground"
										}
									>
										{formatCurrency(
											user.member?.balance ?? 0,
										)}
									</span>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDate(user.member?.expirationDate)}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0"
											>
												<span className="sr-only">
													Open menu
												</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() =>
													handleViewProfile(user.id)
												}
											>
												View Profile
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													handleViewPaymentHistory(
														user,
													)
												}
											>
												View Payment History
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={() =>
													handleSuspendAccount(
														user.id,
													)
												}
											>
												Suspend Account
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
