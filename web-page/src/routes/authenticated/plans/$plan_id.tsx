import ScreenSkeleton from "@/components/custom_components/screen_skeleton";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { MembershipType } from "@/enums/membership_type.enum";
import { usePlanStore } from "@/stores/planStore";
import type { MembershipPlan } from "@/types/membership_plan";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import {
	ArrowLeft,
	CalendarDays,
	DollarSign,
	Pencil,
	Tag,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/authenticated/plans/$plan_id")({
	component: PlanDetail,
	pendingComponent: () => <ScreenSkeleton />,
});

const TYPE_COLORS: Record<string, string> = {
	annually: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	monthly: "bg-green-500/10 text-green-400 border-green-500/20",
	prepaid: "bg-purple-500/10 text-purple-400 border-purple-500/20",
	walkin: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

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

type FormState = {
	title: string;
	desc: string;
	type: MembershipType;
	price: string;
	durationDays: string;
	iconName: string;
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

function planToForm(plan: MembershipPlan): FormState {
	return {
		title: plan.title,
		desc: plan.desc,
		type: plan.type,
		price: String(plan.price),
		durationDays:
			plan.durationDays != null ? String(plan.durationDays) : "",
		iconName: plan.iconName,
	};
}

export default function PlanDetail() {
	const { plan_id } = Route.useParams();
	const { fetchPlanById, updatePlan, deletePlan } = usePlanStore();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState<FormState | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const {
		data: plan,
		isPending,
		error,
	} = useQuery({
		queryKey: ["plans", plan_id],
		queryFn: () => fetchPlanById(plan_id),
		staleTime: 1000 * 60 * 5,
	});

	useEffect(() => {
		if (plan && !isEditing) setForm(planToForm(plan));
	}, [plan, isEditing]);

	const updateMutation = useMutation({
		mutationFn: (dto: Parameters<typeof updatePlan>[1]) =>
			updatePlan(plan_id, dto),
		onSuccess: (updated) => {
			queryClient.setQueryData(["plans", plan_id], updated);
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			setIsEditing(false);
		},
		onError: () => setFormError("Failed to update plan. Please try again."),
	});

	const deleteMutation = useMutation({
		mutationFn: () => deletePlan(plan_id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			navigate({ to: "/authenticated/plans" });
		},
	});

	const handleSave = () => {
		if (!form) return;
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

		updateMutation.mutate({
			title: form.title.trim(),
			desc: form.desc.trim(),
			type: form.type,
			price,
			iconName: form.iconName,
			...(durationDays !== undefined && { durationDays }),
		});
	};

	const handleCancelEdit = () => {
		if (plan) setForm(planToForm(plan));
		setIsEditing(false);
		setFormError(null);
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);

	const formatDate = (date: Date | string) =>
		new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	if (isPending) return <ScreenSkeleton />;

	if (error || !plan) {
		return (
			<div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body-reg dark flex flex-col items-center justify-center gap-4">
				<p className="text-muted-foreground">Plan not found.</p>
				<button
					onClick={() => navigate({ to: "/authenticated/plans" })}
					className="flex items-center gap-2 text-sm text-primary hover:underline"
				>
					<ArrowLeft className="w-4 h-4" /> Back to Plans
				</button>
			</div>
		);
	}

	const needsDuration =
		(form?.type ?? plan.type) === MembershipType.MONTHLY ||
		(form?.type ?? plan.type) === MembershipType.PREPAID;

	return (
		<div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body-reg dark">
			{/* Back Nav */}
			<button
				onClick={() => navigate({ to: "/authenticated/plans" })}
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
			>
				<ArrowLeft className="w-4 h-4" /> Back to Plans
			</button>

			<div className="max-w-2xl mx-auto">
				{/* Header Card */}
				<div className="bg-card border border-border rounded-xl p-6 mb-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
								<DynamicIcon
									name={
										isEditing && form
											? form.iconName
											: plan.iconName
									}
									className="w-7 h-7 text-primary"
								/>
							</div>
							<div>
								{isEditing && form ? (
									<input
										type="text"
										value={form.title}
										onChange={(e) =>
											setForm(
												(p) =>
													p && {
														...p,
														title: e.target.value,
													},
											)
										}
										className="text-xl font-header-bold bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring w-full"
									/>
								) : (
									<h1 className="text-xl sm:text-2xl font-header-bold">
										{plan.title}
									</h1>
								)}
								<span
									className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full border font-body-med ${
										TYPE_COLORS[plan.type] ??
										"bg-muted text-muted-foreground border-border"
									}`}
								>
									{plan.type.charAt(0).toUpperCase() +
										plan.type.slice(1)}
								</span>
							</div>
						</div>

						{!isEditing && (
							<div className="flex items-center gap-2 shrink-0">
								<button
									onClick={() => setIsEditing(true)}
									className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
								>
									<Pencil className="w-3.5 h-3.5" /> Edit
								</button>
								<button
									onClick={() => setShowDeleteDialog(true)}
									className="flex items-center gap-2 px-3 py-2 border border-destructive/40 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
								>
									<Trash2 className="w-3.5 h-3.5" /> Delete
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Details / Edit Form */}
				<div className="bg-card border border-border rounded-xl p-6 space-y-5">
					{formError && (
						<p className="text-sm text-destructive">{formError}</p>
					)}

					{/* Description */}
					<div>
						<p className="text-xs font-body-med text-muted-foreground uppercase tracking-wide mb-2">
							Description
						</p>
						{isEditing && form ? (
							<textarea
								value={form.desc}
								onChange={(e) =>
									setForm(
										(p) =>
											p && { ...p, desc: e.target.value },
									)
								}
								rows={3}
								className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
							/>
						) : (
							<p className="text-sm text-foreground leading-relaxed">
								{plan.desc}
							</p>
						)}
					</div>

					<div className="h-px bg-border" />

					{/* Type + Price */}
					<div className="grid grid-cols-2 gap-6">
						<div>
							<p className="text-xs font-body-med text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
								<Tag className="w-3.5 h-3.5" /> Type
							</p>
							{isEditing && form ? (
								<select
									value={form.type}
									onChange={(e) =>
										setForm(
											(p) =>
												p && {
													...p,
													type: e.target
														.value as MembershipType,
												},
										)
									}
									className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								>
									{Object.values(MembershipType).map((t) => (
										<option key={t} value={t}>
											{t.charAt(0).toUpperCase() +
												t.slice(1)}
										</option>
									))}
								</select>
							) : (
								<p className="text-sm font-body-med text-foreground capitalize">
									{plan.type}
								</p>
							)}
						</div>
						<div>
							<p className="text-xs font-body-med text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
								<DollarSign className="w-3.5 h-3.5" /> Price
							</p>
							{isEditing && form ? (
								<input
									type="number"
									min="0"
									step="0.01"
									value={form.price}
									onChange={(e) =>
										setForm(
											(p) =>
												p && {
													...p,
													price: e.target.value,
												},
										)
									}
									className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							) : (
								<p className="text-lg font-header-bold text-foreground">
									{formatCurrency(plan.price)}
								</p>
							)}
						</div>
					</div>

					{/* Duration — shown when editing a type that needs it, or when plan already has it */}
					{(needsDuration || plan.durationDays != null) && (
						<div>
							<p className="text-xs font-body-med text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
								<CalendarDays className="w-3.5 h-3.5" />{" "}
								Duration
							</p>
							{isEditing && form && needsDuration ? (
								<input
									type="number"
									min="1"
									value={form.durationDays}
									onChange={(e) =>
										setForm(
											(p) =>
												p && {
													...p,
													durationDays:
														e.target.value,
												},
										)
									}
									placeholder="e.g. 30"
									className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							) : (
								<p className="text-sm font-body-med text-foreground">
									{plan.durationDays != null
										? `${plan.durationDays} days`
										: "—"}
								</p>
							)}
						</div>
					)}

					{/* Icon picker — edit mode only */}
					{isEditing && form && (
						<div>
							<p className="text-xs font-body-med text-muted-foreground uppercase tracking-wide mb-2">
								Icon
							</p>
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
												setForm(
													(p) =>
														p && { ...p, iconName },
												)
											}
											className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
												isSelected
													? "border-primary bg-primary/10 text-primary"
													: "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
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
					)}

					<div className="h-px bg-border" />

					{/* Created At */}
					<div>
						<p className="text-xs font-body-med text-muted-foreground uppercase tracking-wide mb-1">
							Created
						</p>
						<p className="text-sm text-muted-foreground">
							{formatDate(plan.createdAt)}
						</p>
					</div>

					{/* Edit Actions */}
					{isEditing && (
						<div className="flex justify-end gap-2 pt-2">
							<button
								onClick={handleCancelEdit}
								className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={updateMutation.isPending}
								className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-body-med hover:opacity-90 transition-opacity disabled:opacity-50"
							>
								{updateMutation.isPending
									? "Saving..."
									: "Save Changes"}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Delete Confirmation */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="dark bg-card border-border text-foreground sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="font-header-bold">
							Delete Plan
						</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground py-2">
						Are you sure you want to delete{" "}
						<span className="text-foreground font-body-med">
							"{plan.title}"
						</span>
						? This action cannot be undone.
					</p>
					<DialogFooter className="gap-2">
						<button
							onClick={() => setShowDeleteDialog(false)}
							className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={() => deleteMutation.mutate()}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-body-med hover:opacity-90 transition-opacity disabled:opacity-50"
						>
							{deleteMutation.isPending
								? "Deleting..."
								: "Delete Plan"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
