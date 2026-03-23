import hero_image from "@/assets/images/hero_picture.jpg";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	ArrowRight,
	BadgeCheck,
	BarChart3,
	CheckCircle2,
	CreditCard,
	Fingerprint,
	LockKeyhole,
	MonitorSmartphone,
	PlayCircle,
	Star,
	WalletCards,
} from "lucide-react";
import home_log from "../../public/home_logo.png";

export const Route = createFileRoute("/")({
	component: Home,
	beforeLoad: ({ context }) => {
		if (context.auth.session) {
			throw redirect({
				to: "/authenticated/overview",
			});
		}
	},
});

export default function Home() {
	const navigate = useNavigate();

	const featureCards = [
		{
			icon: Fingerprint,
			title: "Secure RFID Entry",
			description:
				"Grant access in milliseconds and prevent unauthorized entry with member-level credentials.",
		},
		{
			icon: Activity,
			title: "Live Occupancy Tracking",
			description:
				"See real-time check-ins, active members, and peak-hour trends directly from one dashboard.",
		},
		{
			icon: WalletCards,
			title: "Automated Payments",
			description:
				"Handle recurring billing and failed payment recovery without manual follow-ups.",
		},
		{
			icon: MonitorSmartphone,
			title: "Remote Operations",
			description:
				"Open or lock access points remotely and manage your gym from any connected device.",
		},
		{
			icon: BarChart3,
			title: "Actionable Insights",
			description:
				"Measure retention, attendance consistency, and revenue trends with clear visual analytics.",
		},
		{
			icon: LockKeyhole,
			title: "Audit-Ready Logs",
			description:
				"Keep complete entry records for compliance, investigations, and operational transparency.",
		},
	];

	return (
		<div className="min-h-screen bg-background text-foreground font-body-reg dark relative overflow-x-hidden px-8">
			<div className="landing-grid-bg absolute inset-0 pointer-events-none" />

			<header className="sticky top-0 z-30 bg-transparent">
				<div className="container mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
					<img
						src={home_log}
						alt="SyncFit System Logo"
						className="w-36 h-auto object-contain"
					/>

					<div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
						<span className="hover:text-foreground transition-colors cursor-default">
							Features
						</span>
						<span className="hover:text-foreground transition-colors cursor-default">
							Insights
						</span>
						<span className="hover:text-foreground transition-colors cursor-default">
							Pricing
						</span>
					</div>

					<div className="flex items-center gap-3">
						<button
							className="text-sm font-body-med hover:text-primary transition-colors px-3 py-2"
							onClick={() => navigate({ to: "/login" })}
						>
							Login
						</button>
						<button
							onClick={() => navigate({ to: "/login" })}
							className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-body-bold hover:opacity-90 transition-opacity"
						>
							Start Free
						</button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-6 lg:px-8 pb-20 flex flex-col gap-16 relative z-10">
				<section className="lg:pt-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-stretch">
					<div className="flex flex-col gap-7 reveal-up">
						<div className="w-fit flex items-center gap-2 rounded-full border border-border/30 px-4 py-2 text-primary font-body-med text-xs tracking-[0.14em] uppercase">
							<Activity className="w-4 h-4" />
							<span>Built for Modern Gyms</span>
						</div>
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-header-extrabold leading-[1.02] tracking-tighter">
							Professional Gym Operations,
							<span className="text-primary block mt-2">
								From Entry to Payment
							</span>
						</h1>
						<p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
							SyncFit combines RFID access control, live
							occupancy, member lifecycle automation, and billing
							into one reliable platform that helps gyms run
							smoother and grow faster.
						</p>

						<div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
							<button
								onClick={() => navigate({ to: "/login" })}
								className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-body-bold hover:opacity-90 transition-opacity"
							>
								Start Free Trial
								<ArrowRight className="w-4 h-4" />
							</button>
							<button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border/40 font-body-bold hover:bg-card transition-colors">
								<PlayCircle className="w-4 h-4 text-primary" />
								Watch Demo
							</button>
						</div>

						<div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
							<span className="inline-flex items-center gap-1.5">
								<BadgeCheck className="w-3.5 h-3.5 text-primary" />
								99.9% service uptime
							</span>
							<span className="inline-flex items-center gap-1.5">
								<BadgeCheck className="w-3.5 h-3.5 text-primary" />
								Sub-second access validation
							</span>
							<span className="inline-flex items-center gap-1.5">
								<BadgeCheck className="w-3.5 h-3.5 text-primary" />
								Works with your existing workflow
							</span>
						</div>
					</div>

					<div className="relative rounded-3xl border border-border/20 bg-card/50 overflow-hidden h-[90%] min-h-80 shadow-[0_30px_80px_-35px_rgba(0,240,197,0.45)] reveal-up">
						<div className="absolute inset-0 bg-linear-to-tr from-primary/15 via-transparent to-transparent" />
						<img
							src={hero_image}
							alt="SyncFit dashboard preview"
							className="absolute inset-0 w-full h-full object-cover"
						/>
						<div className="absolute top-4 left-4 rounded-xl border border-border/30 bg-background/85 backdrop-blur px-4 py-3">
							<p className="text-[11px] text-muted-foreground">
								Today&apos;s Check-ins
							</p>
							<p className="text-xl font-header-bold">1,248</p>
						</div>
						<div className="absolute bottom-4 right-4 rounded-xl border border-border/30 bg-background/85 backdrop-blur px-4 py-3 max-w-47.5">
							<p className="text-[11px] text-muted-foreground mb-1">
								Payment Recovery
							</p>
							<p className="text-sm leading-snug">
								+18% collections this month
							</p>
						</div>
					</div>
				</section>

				<section className="flex flex-wrap items-center gap-3 md:gap-4 border-y border-border/20 py-6 text-xs md:text-sm text-muted-foreground">
					<span className="uppercase tracking-[0.14em] text-primary font-body-med mr-2">
						Trusted by teams running
					</span>
					<div className="rounded-full border border-border/30 px-4 py-2">
						CrossFit Boxes
					</div>
					<div className="rounded-full border border-border/30 px-4 py-2">
						Strength Studios
					</div>
					<div className="rounded-full border border-border/30 px-4 py-2">
						Boutique Gyms
					</div>
					<div className="rounded-full border border-border/30 px-4 py-2">
						Multi-branch Facilities
					</div>
				</section>

				<section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					<div className="rounded-2xl bg-card/60 border border-border/20 p-5">
						<p className="text-3xl font-header-bold">99.9%</p>
						<p className="text-sm text-muted-foreground mt-1">
							Uptime reliability
						</p>
					</div>
					<div className="rounded-2xl bg-card/60 border border-border/20 p-5">
						<p className="text-3xl font-header-bold">&lt; 0.5s</p>
						<p className="text-sm text-muted-foreground mt-1">
							Door validation speed
						</p>
					</div>
					<div className="rounded-2xl bg-card/60 border border-border/20 p-5">
						<p className="text-3xl font-header-bold">50k+</p>
						<p className="text-sm text-muted-foreground mt-1">
							Daily access logs processed
						</p>
					</div>
					<div className="rounded-2xl bg-card/60 border border-border/20 p-5">
						<p className="text-3xl font-header-bold">24/7</p>
						<p className="text-sm text-muted-foreground mt-1">
							System monitoring support
						</p>
					</div>
				</section>

				<section className="flex flex-col gap-10" id="features">
					<div className="max-w-2xl flex flex-col gap-4">
						<span className="text-primary font-body-med text-sm tracking-[0.14em] uppercase">
							Everything in One Platform
						</span>
						<h2 className="text-4xl font-header-bold tracking-tight">
							Built to Run Operations, Not Just Open Doors
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							Structured like top SaaS landing pages: clear value,
							proof of reliability, and direct action paths.
							SyncFit is designed to be immediately understandable
							for owners and operators.
						</p>
					</div>

					<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
						{featureCards.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="bg-card/60 p-7 rounded-2xl border border-border/20 flex flex-col gap-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
								>
									<Icon className="w-7 h-7 text-primary" />
									<h4 className="text-lg font-header-semibold leading-snug">
										{feature.title}
									</h4>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>
				</section>

				<section className="grid lg:grid-cols-2 gap-10 items-start">
					<div className="rounded-3xl bg-card/60 border border-border/20 p-8 md:p-10">
						<span className="text-primary font-body-med text-xs tracking-[0.14em] uppercase">
							How It Works
						</span>
						<h3 className="text-3xl md:text-4xl font-header-bold tracking-tight mt-3 mb-8">
							Launch in 3 Simple Steps
						</h3>

						<div className="space-y-6">
							<div className="flex gap-4">
								<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-body-bold grid place-content-center shrink-0">
									1
								</div>
								<div>
									<p className="font-header-semibold">
										Connect your access hardware
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										Pair readers and turnstiles in minutes
										with guided setup.
									</p>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-body-bold grid place-content-center shrink-0">
									2
								</div>
								<div>
									<p className="font-header-semibold">
										Import members and plans
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										Bring existing records, configure
										memberships, and automate renewals.
									</p>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-body-bold grid place-content-center shrink-0">
									3
								</div>
								<div>
									<p className="font-header-semibold">
										Go live with full visibility
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										Track entries, alerts, and billing
										health from one modern dashboard.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-5">
						<div className="rounded-3xl bg-card/60 border border-border/20 p-7">
							<CreditCard className="w-7 h-7 text-primary mb-3" />
							<h4 className="text-2xl font-header-semibold mb-2">
								Payment Operations that Scale
							</h4>
							<p className="text-sm text-muted-foreground leading-relaxed mb-5">
								From card payments to local wallets, keep
								collections smooth and reduce delinquent
								memberships.
							</p>
							<ul className="space-y-3">
								<li className="flex gap-3 text-sm">
									<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
									<span>
										Automated recurring invoices and
										reminders
									</span>
								</li>
								<li className="flex gap-3 text-sm">
									<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
									<span>
										Multi-gateway support including cards
										and e-wallets
									</span>
								</li>
								<li className="flex gap-3 text-sm">
									<CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
									<span>
										Revenue and churn indicators updated in
										real-time
									</span>
								</li>
							</ul>
						</div>

						<div className="rounded-2xl border border-border/20 p-6 bg-background/70">
							<p className="text-xs text-primary uppercase tracking-[0.12em] mb-2">
								Customer Highlight
							</p>
							<p className="text-sm text-muted-foreground leading-relaxed">
								"After switching to SyncFit, our front desk
								workload dropped by 40% and failed entries
								became nearly zero."
							</p>
							<div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
								<Star className="w-3.5 h-3.5 text-primary" />
								<span>Operations Manager, MetroFit Club</span>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-border/20 bg-card/70 p-8 md:p-12 text-center relative overflow-hidden">
					<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-95 h-95 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
					<p className="text-primary text-xs font-body-med tracking-[0.14em] uppercase mb-3 relative z-10">
						Ready to Elevate Operations
					</p>
					<h2 className="text-3xl md:text-5xl font-header-bold tracking-tight relative z-10">
						Make Your Gym Feel World-Class
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed relative z-10">
						Launch a professional access and membership experience
						your members trust from day one.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 relative z-10">
						<button
							onClick={() => navigate({ to: "/login" })}
							className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-body-bold hover:opacity-90 transition-opacity"
						>
							Start Free Trial
						</button>
						<button className="px-8 py-3.5 rounded-full bg-background/80 border border-border/40 font-body-bold hover:border-primary transition-colors">
							Book a Demo
						</button>
					</div>
				</section>
			</main>

			<footer className="border-t border-border/20 py-10">
				<div className="container mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<img
							src={home_log}
							alt="SyncFit"
							className="w-28 h-auto object-contain"
						/>
						<span>2026 SyncFit. All rights reserved.</span>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<div className="w-2 h-2 rounded-full bg-primary" />
						<span>All systems operational</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
