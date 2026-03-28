import ScreenSkeleton from "@/components/custom_components/screen_skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MembershipType } from "@/enums/membership_type.enum";
import { usePlanStore } from "@/stores/planStore";
import type { MembershipPlan } from "@/types/membership_plan";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/authenticated/plans/")({
	component: Plans,
	pendingComponent: () => <ScreenSkeleton />,
	pendingMinMs: 0,
});

const TYPE_TABS: { label: string; value: MembershipType | "all" }[] = [
	{ label: "All Plans", value: "all" },
	{ label: "Annually", value: MembershipType.ANNUALLY },
	{ label: "Monthly", value: MembershipType.MONTHLY },
	{ label: "Prepaid", value: MembershipType.PREPAID },
	{ label: "Walk-in", value: MembershipType.WALKIN },
];

const ICON_OPTIONS = [
	"Dumbbell",
	"Star",
	"Crown",
	"Zap",
	"Shield",
	"Timer",
	"Flame",
	"Target",
	"CalendarDays",
	"Infinity",
	"Trophy",
	"Award",
	"Heart",
	"Activity",
	"TrendingUp",
	"Bike",
];

const TYPE_BADGE_CLASS: Record<string, string> = {
	annually:
		"bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10",
	monthly:
		"bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/10",
	prepaid:
		"bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/10",
	walkin:
		"bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/10",
};

type FormState = {
	title: string;
	desc: string;
	type: MembershipType;
	price: string;
	durationDays: string;
	iconName: string;
};

const EMPTY_FORM: FormState = {
	title: "",
	desc: "",
	type: MembershipType.MONTHLY,
	price: "",
	durationDays: "",
	iconName: "Dumbbell",
};

function DynamicIcon({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	const Icon = (
		LucideIcons as unknown as Record<
			string,
			LucideIcons.LucideIcon | undefined
		>
	)[name];
	const Fallback = LucideIcons.Star;
	return Icon ? (
		<Icon className={className} />
	) : (
		<Fallback className={className} />
	);
}

export default function Plans() {
	const { fetchPlans, createPlan, updatePlan, deletePlan } = usePlanStore();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [activeType, setActiveType] = useState<MembershipType | "all">("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
	const [deletingPlan, setDeletingPlan] = useState<MembershipPlan | null>(
		null,
	);
	const [form, setForm] = useState<FormState>(EMPTY_FORM);
	const [formError, setFormError] = useState<string | null>(null);

	const {
		data: plans = [],
		isPending,
		error,
	} = useQuery({
		queryKey: ["plans"],
		queryFn: fetchPlans,
		staleTime: 1000 * 60 * 5,
	});

	const filtered = plans.filter((plan) => {
		const matchesType = activeType === "all" || plan.type === activeType;
		const q = search.toLowerCase();
		const matchesSearch =
			!q ||
			plan.title.toLowerCase().includes(q) ||
			plan.desc.toLowerCase().includes(q);
		return matchesType && matchesSearch;
	});

	const createMutation = useMutation({
		mutationFn: (dto: Parameters<typeof createPlan>[0]) => createPlan(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			setIsModalOpen(false);
		},
		onError: () => setFormError("Failed to save plan. Please try again."),
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			dto,
		}: {
			id: string;
			dto: Parameters<typeof updatePlan>[1];
		}) => updatePlan(id, dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			setIsModalOpen(false);
		},
		onError: () => setFormError("Failed to update plan. Please try again."),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deletePlan(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			setDeletingPlan(null);
		},
	});

	const openCreate = () => {
		setEditingPlan(null);
		setForm(EMPTY_FORM);
		setFormError(null);
		setIsModalOpen(true);
	};

	const openEdit = (plan: MembershipPlan, e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingPlan(plan);
		setForm({
			title: plan.title,
			desc: plan.desc,
			type: plan.type,
			price: String(plan.price),
			durationDays:
				plan.durationDays != null ? String(plan.durationDays) : "",
			iconName: plan.iconName,
		});
		setFormError(null);
		setIsModalOpen(true);
	};

	const openDelete = (plan: MembershipPlan, e: React.MouseEvent) => {
		e.stopPropagation();
		setDeletingPlan(plan);
	};

	const handleSubmit = () => {
		setFormError(null);
		const price = parseFloat(form.price);
		if (!form.title.trim()) return setFormError("Title is required.");
		if (!form.desc.trim()) return setFormError("Description is required.");
		if (isNaN(price) || price < 0)
			return setFormError("Enter a valid price.");

		const needsDuration =
			form.type === MembershipType.MONTHLY ||
			form.type === MembershipType.PREPAID;
		const durationDays =
			needsDuration && form.durationDays
				? parseInt(form.durationDays, 10)
				: undefined;

		const dto = {
			title: form.title.trim(),
			desc: form.desc.trim(),
			type: form.type,
			price,
			iconName: form.iconName,
			...(durationDays !== undefined && { durationDays }),
		};

		if (editingPlan) {
			updateMutation.mutate({ id: editingPlan.id, dto });
		} else {
			createMutation.mutate(dto);
		}
	};

	const isMutating = createMutation.isPending || updateMutation.isPending;
	const needsDuration =
		form.type === MembershipType.MONTHLY ||
		form.type === MembershipType.PREPAID;

	return (
		<div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body-reg dark">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
				<div>
					<h1 className="text-2xl sm:text-3xl font-header-bold tracking-tight mb-1">
						Membership Plans
					</h1>
					<p className="text-muted-foreground text-sm">
						Manage and configure your gym's membership tiers.
					</p>
				</div>
				<Button onClick={openCreate} className="w-full sm:w-auto">
					<Plus className="w-4 h-4" />
					Add New Plan
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-3 mb-6 sm:mb-8">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search plans by name or description..."
						className="pl-9"
					/>
				</div>
				<div className="overflow-x-auto">
					<div className="flex bg-card border border-border rounded-lg p-1 min-w-max">
						{TYPE_TABS.map((tab) => {
							const isActive = activeType === tab.value;
							const count =
								tab.value === "all"
									? plans.length
									: plans.filter((p) => p.type === tab.value)
											.length;
							return (
								<button
									key={tab.value}
									onClick={() => setActiveType(tab.value)}
									className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-body-med flex items-center gap-2 transition-colors ${
										isActive
											? "bg-secondary text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{tab.label}
									{isActive && (
										<Badge className="text-[10px] px-1.5 py-0 h-4">
											{count}
										</Badge>
									)}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Grid */}
			{isPending ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="h-52 bg-card border border-border rounded-xl animate-pulse"
						/>
					))}
				</div>
			) : error ? (
				<div className="p-10 text-center text-destructive">
					Failed to load plans.
				</div>
			) : filtered.length === 0 ? (
				<div className="p-10 text-center text-muted-foreground">
					{plans.length === 0
						? "No plans yet. Add your first membership plan."
						: "No plans match your filters."}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filtered.map((plan) => (
						<PlanCard
							key={plan.id}
							plan={plan}
							onEdit={(e) => openEdit(plan, e)}
							onDelete={(e) => openDelete(plan, e)}
							onClick={() =>
								navigate({
									to: "/authenticated/plans/$plan_id",
									params: { plan_id: plan.id },
								})
							}
						/>
					))}
				</div>
			)}

			{/* Create / Edit Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="dark bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="font-header-bold">
							{editingPlan ? "Edit Plan" : "Add New Plan"}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 py-1">
						{formError && (
							<p className="text-sm text-destructive">
								{formError}
							</p>
						)}

						<div className="space-y-1.5">
							<label className="text-sm font-body-med text-muted-foreground">
								Title
							</label>
							<Input
								value={form.title}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										title: e.target.value,
									}))
								}
								placeholder="e.g. Gold Monthly"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-sm font-body-med text-muted-foreground">
								Description
							</label>
							<textarea
								value={form.desc}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										desc: e.target.value,
									}))
								}
								placeholder="Describe what this plan includes..."
								rows={3}
								className="w-full bg-input/30 border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none transition-[color,box-shadow]"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label className="text-sm font-body-med text-muted-foreground">
									Type
								</label>
								<Select
									value={form.type}
									onValueChange={(v) =>
										setForm((p) => ({
											...p,
											type: v as MembershipType,
										}))
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(MembershipType).map(
											(t) => (
												<SelectItem key={t} value={t}>
													{t.charAt(0).toUpperCase() +
														t.slice(1)}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-body-med text-muted-foreground">
									Price
								</label>
								<Input
									type="number"
									min="0"
									step="0.01"
									value={form.price}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											price: e.target.value,
										}))
									}
									placeholder="0.00"
								/>
							</div>
						</div>

						{needsDuration && (
							<div className="space-y-1.5">
								<label className="text-sm font-body-med text-muted-foreground">
									Duration (days)
								</label>
								<Input
									type="number"
									min="1"
									value={form.durationDays}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											durationDays: e.target.value,
										}))
									}
									placeholder="e.g. 30"
								/>
							</div>
						)}

						<div className="space-y-1.5">
							<label className="text-sm font-body-med text-muted-foreground">
								Icon
							</label>
							<div className="grid grid-cols-8 gap-2">
								{ICON_OPTIONS.map((iconName) => {
									const isSelected =
										form.iconName === iconName;
									return (
										<button
											key={iconName}
											type="button"
											title={iconName}
											onClick={() =>
												setForm((p) => ({
													...p,
													iconName,
												}))
											}
											className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
												isSelected
													? "border-primary bg-primary/10 text-primary"
													: "border-border bg-background text-muted-foreground hover:border-ring hover:text-foreground"
											}`}
										>
											<DynamicIcon
												name={iconName}
												className="w-4 h-4"
											/>
										</button>
									);
								})}
							</div>
						</div>
					</div>

					<Separator />

					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setIsModalOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={isMutating}>
							{isMutating
								? "Saving..."
								: editingPlan
									? "Save Changes"
									: "Create Plan"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<Dialog
				open={!!deletingPlan}
				onOpenChange={(open) => !open && setDeletingPlan(null)}
			>
				<DialogContent className="dark bg-card border-border sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="font-header-bold">
							Delete Plan
						</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Are you sure you want to delete{" "}
						<span className="text-foreground font-body-med">
							"{deletingPlan?.title}"
						</span>
						? This action cannot be undone.
					</p>
					<Separator />
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setDeletingPlan(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() =>
								deletingPlan &&
								deleteMutation.mutate(deletingPlan.id)
							}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending
								? "Deleting..."
								: "Delete Plan"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

type PlanCardProps = {
	plan: MembershipPlan;
	onEdit: (e: React.MouseEvent) => void;
	onDelete: (e: React.MouseEvent) => void;
	onClick: () => void;
};

function PlanCard({ plan, onEdit, onDelete, onClick }: PlanCardProps) {
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);

	return (
		<div
			onClick={onClick}
			className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-ring/40 transition-all group cursor-pointer"
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
						<DynamicIcon
							name={plan.iconName}
							className="w-5 h-5 text-primary"
						/>
					</div>
					<div>
						<h3 className="font-body-med text-foreground leading-tight">
							{plan.title}
						</h3>
						<Badge
							className={`mt-1 ${TYPE_BADGE_CLASS[plan.type] ?? "border-border"}`}
						>
							{plan.type.charAt(0).toUpperCase() +
								plan.type.slice(1)}
						</Badge>
					</div>
				</div>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground hover:text-foreground"
						onClick={onEdit}
						title="Edit plan"
					>
						<Pencil className="w-3.5 h-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground hover:text-destructive"
						onClick={onDelete}
						title="Delete plan"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</Button>
				</div>
			</div>

			<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
				{plan.desc}
			</p>

			<Separator className="opacity-50" />

			<div className="flex items-end justify-between">
				<div>
					<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-0.5">
						Price
					</p>
					<p className="text-lg font-header-bold text-foreground">
						{formatCurrency(plan.price)}
					</p>
				</div>
				{plan.durationDays != null && (
					<div className="text-right">
						<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-0.5">
							Duration
						</p>
						<p className="text-sm font-body-med text-foreground">
							{plan.durationDays} days
						</p>
					</div>
				)}
			</div>
		</div>
	);
}


export const Route = createFileRoute("/authenticated/plans/")({
	component: Plans,
	pendingComponent: () => <ScreenSkeleton />,
