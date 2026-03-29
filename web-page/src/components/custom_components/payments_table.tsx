import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PaymentStatus } from "@/enums/payment_status.enum";
import type { Payment } from "@/types/payment";
import { CreditCard, ReceiptText, Wallet } from "lucide-react";

type Props = {
	payments: Payment[];
	isPending: boolean;
	error: Error | null;
};

const STATUS_STYLES: Record<PaymentStatus, string> = {
	[PaymentStatus.PAID]:
		"bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
	[PaymentStatus.PENDING]:
		"bg-amber-500/10 text-amber-300 border border-amber-500/20",
	[PaymentStatus.FAILED]:
		"bg-red-500/10 text-red-300 border border-red-500/20",
};

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 2,
	}).format(Number(amount ?? 0));
}

function formatDate(date: Date | string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(date));
}

function formatMethod(method?: string) {
	if (!method) return "Unknown";
	return method
		.split(/[_\s-]+/)
		.filter(Boolean)
		.map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
		.join(" ");
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
	return (
		<Badge variant="outline" className={STATUS_STYLES[status]}>
			{status[0].toUpperCase() + status.slice(1)}
		</Badge>
	);
}

export function PaymentsTable({ payments, isPending, error }: Props) {
	if (isPending) {
		return (
			<div className="p-10 text-center text-muted-foreground">
				Loading payments...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-10 text-center text-destructive">
				Failed to load payments.
			</div>
		);
	}

	if (payments.length === 0) {
		return (
			<div className="p-10 text-center text-muted-foreground">
				No payments matched the current filters.
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3 md:hidden">
				{payments.map((payment) => {
					const memberName = payment.member?.user
						? `${payment.member.user.firstName} ${payment.member.user.lastName}`
						: "Unknown member";
					const planName =
						payment.member?.membershipPlan?.title ??
						payment.member?.membershipPlan?.type ??
						"No active plan";

					return (
						<div
							key={payment.id}
							className="rounded-xl border border-border bg-card p-4"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="font-body-med text-foreground truncate">
										{memberName}
									</p>
									<p className="text-xs text-muted-foreground truncate">
										{planName}
									</p>
								</div>
								<PaymentStatusBadge status={payment.status} />
							</div>

							<div className="mt-4 grid grid-cols-2 gap-3 text-xs">
								<div>
									<p className="text-muted-foreground">
										Amount
									</p>
									<p className="mt-1 text-foreground font-body-med">
										{formatCurrency(payment.amount)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">
										Method
									</p>
									<p className="mt-1 text-foreground font-body-med">
										{formatMethod(payment.paymentMethod)}
									</p>
								</div>
								<div className="col-span-2">
									<p className="text-muted-foreground">
										Reference
									</p>
									<div className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/50 bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground">
										<ReceiptText className="h-3 w-3 shrink-0" />
										<span className="truncate">
											{payment.paymongoReference}
										</span>
									</div>
								</div>
								<div className="col-span-2">
									<p className="text-muted-foreground">
										Paid at
									</p>
									<p className="mt-1 text-foreground font-body-med">
										{formatDate(payment.createdAt)}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="hidden md:block">
				<Table>
					<TableHeader className="bg-background/20">
						<TableRow className="border-border/50 hover:bg-transparent">
							<TableHead>Member</TableHead>
							<TableHead>Plan</TableHead>
							<TableHead>Reference</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead>Paid At</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{payments.map((payment) => {
							const memberName = payment.member?.user
								? `${payment.member.user.firstName} ${payment.member.user.lastName}`
								: "Unknown member";

							return (
								<TableRow
									key={payment.id}
									className="group transition-colors hover:bg-secondary/20"
								>
									<TableCell className="py-4">
										<div className="min-w-0">
											<p className="font-body-med text-foreground">
												{memberName}
											</p>
											<p className="text-xs text-muted-foreground truncate">
												{payment.member?.user?.email ??
													"No email"}
											</p>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{payment.member?.membershipPlan
											?.title ??
											payment.member?.membershipPlan
												?.type ??
											"No active plan"}
									</TableCell>
									<TableCell>
										<div className="inline-flex max-w-55 items-center gap-1.5 rounded-md border border-border/50 bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground">
											<ReceiptText className="h-3 w-3 shrink-0" />
											<span className="truncate">
												{payment.paymongoReference}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										<div className="inline-flex items-center gap-1.5">
											<CreditCard className="h-3.5 w-3.5" />
											{formatMethod(
												payment.paymentMethod,
											)}
										</div>
									</TableCell>
									<TableCell>
										<PaymentStatusBadge
											status={payment.status}
										/>
									</TableCell>
									<TableCell className="text-right font-body-med text-foreground">
										{formatCurrency(payment.amount)}
									</TableCell>
									<TableCell className="text-muted-foreground">
										<div className="inline-flex items-center gap-1.5">
											<Wallet className="h-3.5 w-3.5" />
											{formatDate(payment.createdAt)}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
