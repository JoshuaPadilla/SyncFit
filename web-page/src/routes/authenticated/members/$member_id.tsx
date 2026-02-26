import { RfidRegistrationModal } from "@/components/custom_components/rfid_registration_modal";
import { SpecificEntitySkeleton } from "@/components/custom_components/specific_entity_skeleton";
import { UserEntryLogTable } from "@/components/custom_components/user_entry_log_table";
import { dateFormatter } from "@/helpers/date_formatter";
import { useEntryLogStore } from "@/stores/entryLogStore";
import { useRfidStore } from "@/stores/rfidStore";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Ban,
	Calendar,
	CreditCard,
	Edit2,
	History,
	IdCardIcon,
	Mail,
	Phone,
	User,
	Wallet,
} from "lucide-react";
import { useState } from "react";

// --- Sample Data Injection ---
// Updated to match the exact visual data from the screenshot

// Mock Activity Data

export const Route = createFileRoute("/authenticated/members/$member_id")({
	component: UserProfileScreen,
	loader: async ({ params, context }) => {
		const user = await context.queryClient.ensureQueryData({
			queryKey: ["user", params.member_id],
			queryFn: () => context.user.fetchUserById(params.member_id),
		});
		return { user };
	},
	pendingComponent: () => <SpecificEntitySkeleton />,
	pendingMs: 0,
});

export default function UserProfileScreen() {
	const { registerRfid } = useRfidStore();
	const { fetchLogById } = useEntryLogStore();
	const { user } = Route.useLoaderData();

	const [modalOpen, setModalOpen] = useState(false);

	const handleRegisterRfid = async () => {
		await registerRfid(user!.id);
		setModalOpen(true);
	};

	const {
		data: result = {
			data: [],
			page: 1,
			limit: 8,
		},
		isPending,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["member_entry_log", user?.id],
		queryFn: () => fetchLogById({ memberId: user?.member.id }),
	});

	return (
		<>
			<RfidRegistrationModal
				isOpen={modalOpen}
				onConfirm={() => setModalOpen(false)}
				memberId={user!.id}
			/>
			<div className="min-h-screen bg-background text-foreground p-8 font-body-reg dark">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* --- HEADER SECTION --- */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex items-center gap-5">
							{/* Avatar */}
							<div className="relative">
								<div className="w-16 h-16 md:w-[84px] md:h-[84px] rounded-full bg-[#5b9a8a] flex items-center justify-center border-2 border-card overflow-hidden">
									{/* Fallback icon just in case, but styled to match the teal circle */}
									<User size={44} className="text-white/80" />
								</div>
								<div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-[3px] border-background rounded-full z-10"></div>
							</div>

							{/* Name & ID */}
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-2xl md:text-[32px] font-header-bold">
										{user?.firstName} {user?.lastName}
									</h1>
									<span className="px-2 py-0.5 rounded-full bg-green-900/30 text-[#22c55e] text-[11px] font-body-bold flex items-center gap-1.5 border border-[#22c55e]/20 tracking-wide uppercase">
										<span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
										Active
									</span>
								</div>
								<p className="text-muted-foreground text-xs font-mono mt-1 opacity-60">
									UUID: {user?.id}
								</p>
								<button className="flex items-center gap-1.5 text-sm text-foreground hover:text-foreground/80 transition-colors mt-2 font-body-med">
									<Edit2
										size={14}
										className="text-muted-foreground"
									/>
									Edit Profile
								</button>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center gap-3">
							<button className="bg-[#ff7b00] text-white px-6 py-2.5 rounded-full font-body-semibold transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,123,0,0.25)] hover:bg-[#ff7b00]/90 text-sm">
								Renew Membership
							</button>
							<button className="bg-white/5 border border-white/10 text-foreground px-6 py-2.5 rounded-full font-body-semibold hover:bg-white/10 transition-colors text-sm">
								Freeze Account
							</button>
							<button className="bg-white/5 border border-white/10 text-[#ef4444] p-2.5 rounded-full hover:bg-red-500/10 transition-colors">
								<Ban size={20} />
							</button>
						</div>
					</div>

					{/* --- MAIN GRID --- */}
					<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
						{/* Left Column (Spans 2/3) */}
						<div className="xl:col-span-2 flex flex-col gap-6">
							{/* Top Row: Personal Info & Membership */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Personal Information */}
								<div className="bg-card rounded-radius-2xl p-6 border border-white/5 shadow-sm">
									<div className="flex items-center gap-3 mb-6">
										<div className="bg-blue-500/10 p-2 rounded-lg">
											<User
												className="text-blue-500"
												size={20}
											/>
										</div>
										<h2 className="font-header-semibold text-[17px]">
											Personal Information
										</h2>
									</div>

									<div className="space-y-5">
										<div>
											<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-1">
												Email Address
											</p>
											<div className="flex items-center gap-2 text-[15px] font-body-med">
												<Mail
													size={16}
													className="text-muted-foreground"
												/>
												{user?.email}
											</div>
										</div>
										<div>
											<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-1">
												Phone Number
											</p>
											<div className="flex items-center gap-2 text-[15px] font-body-med">
												<Phone
													size={16}
													className="text-muted-foreground"
												/>
												{user?.phoneNumber}
											</div>
										</div>
										<div>
											<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-1">
												Account Created
											</p>
											<div className="flex items-center gap-2 text-[15px] font-body-med">
												<Calendar
													size={16}
													className="text-muted-foreground"
												/>
												{dateFormatter(user?.createdAt)}
											</div>
										</div>
									</div>
								</div>

								{/* Membership & Access */}
								<div className="bg-card rounded-radius-2xl p-6 border border-white/5 shadow-sm">
									<div className="flex items-center gap-3 mb-6">
										<div className="bg-[#ff7b00]/10 p-2 rounded-lg">
											<CreditCard
												className="text-[#ff7b00]"
												size={20}
											/>
										</div>
										<h2 className="font-header-semibold text-[17px]">
											Membership & Access
										</h2>
									</div>

									<div className="space-y-5">
										<div>
											<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-1">
												Current Plan
											</p>
											<p className="text-xl font-header-bold text-foreground">
												{user?.member?.membershipPlan.type.toLocaleUpperCase()}{" "}
												(
												{
													user?.member?.membershipPlan
														.title
												}
												)
											</p>
										</div>

										<div className="flex items-center justify-between">
											<div>
												<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-1">
													Expires On
												</p>
												<p className="text-[15px] font-body-bold">
													{dateFormatter(
														user?.member
															?.expirationDate,
													)}
												</p>
												<p className="text-xs text-[#ff7b00] mt-0.5 font-body-med">
													28 days remaining
												</p>
											</div>
											<div>
												<p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body-semibold mb-1">
													RFID UID
												</p>
												<span className="bg-white/5 border border-white/10 text-muted-foreground px-2.5 py-1 rounded-md text-xs font-mono">
													{user?.member.rfidUid ||
														"NOT SET YET"}
												</span>
											</div>
										</div>

										{user?.member.rfidUid ? (
											<button className="w-full mt-2 bg-transparent text-muted-foreground border border-white/10 py-2.5 rounded-full text-sm font-body-med hover:bg-white/5 hover:text-foreground transition-colors flex items-center justify-center gap-2">
												<History size={16} />
												Re-assign Key Fob
											</button>
										) : (
											<button
												className="w-full mt-2 bg-transparent text-muted-foreground border border-white/10 py-2.5 rounded-full text-sm font-body-med hover:bg-white/5 hover:text-foreground transition-colors flex items-center justify-center gap-2"
												onClick={handleRegisterRfid}
											>
												<IdCardIcon size={16} />
												Assign Rfid Card
											</button>
										)}
									</div>
								</div>
							</div>

							{/* Financial Overview */}
							<div className="bg-card rounded-radius-2xl p-6 border border-white/5 shadow-sm relative overflow-hidden">
								<div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7b00]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

								<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
									<div>
										<div className="flex items-center gap-3 mb-4">
											<div className="bg-white/10 p-2 rounded-lg">
												<Wallet
													className="text-white"
													size={20}
												/>
											</div>
											<h2 className="font-header-semibold text-[17px]">
												Financial Overview
											</h2>
										</div>
										<p className="text-sm text-muted-foreground font-body-med mb-1">
											Prepaid Balance
										</p>
										<div className="flex items-baseline gap-1.5">
											<span className="text-[40px] leading-none font-header-bold text-[#ff7b00]">
												₱{user?.member.balance}
											</span>
											<span className="text-sm text-muted-foreground font-body-bold">
												PHP
											</span>
										</div>
										<p className="text-xs text-muted-foreground/60 mt-2 font-body-med">
											Last transaction: $25.00 top-up on
											Sep 10, 2023
										</p>
									</div>

									<div className="flex flex-col items-end gap-4 w-full md:w-auto">
										<button className="w-full md:w-auto bg-white text-black px-6 py-2.5 rounded-full font-body-bold transition-transform active:scale-95 hover:bg-white/90 text-sm">
											Load Balance
										</button>
										<button className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
											View Transaction History
										</button>
									</div>
								</div>
							</div>

							{/* Stats Row */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="bg-card border border-white/5 rounded-[20px] p-5 flex flex-col items-center justify-center text-center shadow-sm">
									<span className="text-[28px] font-header-bold">
										142
									</span>
									<span className="text-[11px] text-muted-foreground font-body-semibold mt-1">
										Total Visits
									</span>
								</div>
								<div className="bg-card border border-white/5 rounded-[20px] p-5 flex flex-col items-center justify-center text-center shadow-sm">
									<span className="text-[28px] font-header-bold">
										45m
									</span>
									<span className="text-[11px] text-muted-foreground font-body-semibold mt-1">
										Avg. Duration
									</span>
								</div>
								<div className="bg-card border border-white/5 rounded-[20px] p-5 flex flex-col items-center justify-center text-center shadow-sm">
									<span className="text-[28px] font-header-bold">
										Top 5%
									</span>
									<span className="text-[11px] text-muted-foreground font-body-semibold mt-1">
										Attendance
									</span>
								</div>
								<div className="bg-card border border-white/5 rounded-[20px] p-5 flex flex-col items-center justify-center text-center shadow-sm">
									<span className="text-[28px] font-header-bold">
										0
									</span>
									<span className="text-[11px] text-muted-foreground font-body-semibold mt-1">
										Missed Payments
									</span>
								</div>
							</div>
						</div>

						{/* Right Column: Activity Log */}
						<UserEntryLogTable logs={result.data || []} />
					</div>
				</div>
			</div>
		</>
	);
}
