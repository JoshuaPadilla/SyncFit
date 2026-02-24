import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	CheckCircle2,
	CreditCard,
	Fingerprint,
	Heart,
	MonitorSmartphone,
	Play,
	Share2,
	Star,
	Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: Home,
	beforeLoad: ({ context }) => {
		// If the user is ALREADY logged in, send them to the dashboard/overview
		if (context.auth.session) {
			throw redirect({
				to: "/authenticated/overview", // Adjust this to your default landing page
			});
		}
	},
});

export default function Home() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen bg-background text-foreground font-body-reg dark">
			<div className="flex items-center justify-between px-8 py-6 border-b border-border/10">
				<div className="flex items-center gap-2">
					<div className="w-6 h-6 bg-primary rounded-sm" />
					<span className="font-header-bold text-xl tracking-tight">
						Smart Gym
					</span>
				</div>

				<div className="flex items-center gap-6">
					<button
						className="text-sm font-body-med hover:text-primary transition-colors"
						onClick={() => navigate({ to: "/login" })}
					>
						Login
					</button>
					<button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-body-bold hover:opacity-90 transition-opacity">
						Get Started
					</button>
				</div>
			</div>

			<main className="container mx-auto px-8 pt-20 pb-16 flex flex-col gap-32">
				<section className="grid lg:grid-cols-2 gap-12 items-center">
					<div className="flex flex-col gap-6">
						<div className="flex items-center gap-2 text-primary font-body-med text-sm tracking-wide uppercase">
							<Activity className="w-4 h-4" />
							<span>Next-Gen Tech</span>
						</div>
						<h1 className="text-5xl lg:text-7xl font-header-extrabold leading-tight tracking-tighter">
							THE FUTURE OF <br />
							<span className="text-primary">GYM ACCESS</span>
						</h1>
						<p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
							Revolutionize your gym management with our
							cutting-edge RFID access control, MQTT integration,
							and unified membership platform
						</p>
						<div className="flex items-center gap-4 pt-4">
							<button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-body-bold hover:opacity-90 transition-opacity">
								Get Started
							</button>
							<button className="flex items-center gap-2 px-6 py-3 rounded-full border border-border/50 font-body-bold hover:bg-card transition-colors">
								<Play className="w-4 h-4 text-primary" />
								Watch Demo
							</button>
						</div>
						<div className="flex items-center gap-4 pt-8">
							<div className="flex -space-x-3">
								<div className="w-10 h-10 rounded-full bg-card border-2 border-background" />
								<div className="w-10 h-10 rounded-full bg-card border-2 border-background" />
								<div className="w-10 h-10 rounded-full bg-card border-2 border-background" />
							</div>
							<span className="text-sm text-muted-foreground font-body-med">
								Trusted by 500+ Gyms
							</span>
						</div>
					</div>
					<div className="relative aspect-[4/3] rounded-2xl bg-card border border-border/10 overflow-hidden flex items-center justify-center">
						<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
						<div className="text-muted-foreground">
							Replace with Hardware Image
						</div>
					</div>
				</section>

				<section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-border/10">
					<div className="flex flex-col gap-2 text-center md:text-left">
						<h3 className="text-4xl font-header-bold tracking-tight">
							99.9%
						</h3>
						<p className="text-sm text-muted-foreground">
							Uptime Reliability
						</p>
					</div>
					<div className="flex flex-col gap-2 text-center md:text-left">
						<h3 className="text-4xl font-header-bold tracking-tight">
							&lt;0.5s
						</h3>
						<p className="text-sm text-muted-foreground">
							Access Speed
						</p>
					</div>
					<div className="flex flex-col gap-2 text-center md:text-left">
						<h3 className="text-4xl font-header-bold tracking-tight">
							50k+
						</h3>
						<p className="text-sm text-muted-foreground">
							Daily Check-ins
						</p>
					</div>
					<div className="flex flex-col gap-2 text-center md:text-left">
						<h3 className="text-4xl font-header-bold tracking-tight">
							24/7
						</h3>
						<p className="text-sm text-muted-foreground">Support</p>
					</div>
				</section>

				<section className="flex flex-col gap-12">
					<div className="flex flex-col gap-4 max-w-2xl">
						<span className="text-primary font-body-med text-sm tracking-wide uppercase">
							Why Choose Smart Gym
						</span>
						<h2 className="text-4xl font-header-bold tracking-tight">
							Smart Access Control
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							Secure and automated entry management using advanced
							RFID and MQTT technology designed for modern fitness
							centers
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="bg-card p-8 rounded-2xl border border-border/10 flex flex-col gap-4">
							<Fingerprint className="w-8 h-8 text-primary" />
							<h4 className="text-xl font-header-semibold">
								RFID Integration
							</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Keyless entry with keycards or fobs. Assign
								unique IDs to members instantly
							</p>
						</div>
						<div className="bg-card p-8 rounded-2xl border border-border/10 flex flex-col gap-4">
							<Activity className="w-8 h-8 text-primary" />
							<h4 className="text-xl font-header-semibold">
								Real-time Monitoring
							</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Monitor gym occupancy, peak hours, and access
								logs instantly from your dashboard
							</p>
						</div>
						<div className="bg-card p-8 rounded-2xl border border-border/10 flex flex-col gap-4">
							<MonitorSmartphone className="w-8 h-8 text-primary" />
							<h4 className="text-xl font-header-semibold">
								Remote Management
							</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Control turnstiles from anywhere. Lock or unlock
								doors remotely via the cloud
							</p>
						</div>
					</div>
				</section>

				<section className="grid lg:grid-cols-2 gap-16 items-center">
					<div className="flex flex-col gap-6">
						<span className="text-primary font-body-med text-sm tracking-wide uppercase">
							Drive Bus. Growth
						</span>
						<h2 className="text-4xl font-header-bold tracking-tight">
							Simple Payments & Billing
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							Integrated payment solutions for hassle-free
							membership renewals. Stop chasing payments and let
							the system handle it automatically
						</p>

						<div className="flex flex-col gap-6">
							<div className="flex gap-4">
								<CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
								<div>
									<h5 className="font-header-semibold mb-1">
										Automated Billing
									</h5>
									<p className="text-sm text-muted-foreground">
										Recurring payments made easy for monthly
										or yearly memberships
									</p>
								</div>
							</div>
							<div className="flex gap-4">
								<CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
								<div>
									<h5 className="font-header-semibold mb-1">
										Multiple Gateways
									</h5>
									<p className="text-sm text-muted-foreground">
										Support for PayMongo, GCash, GrabPay,
										and major Credit Cards
									</p>
								</div>
							</div>
						</div>

						<button className="mt-4 w-fit flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border/10 font-body-med hover:border-primary transition-colors">
							View Payment Options
						</button>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div className="bg-card p-6 rounded-2xl border border-border/10 aspect-square flex flex-col justify-between">
								<CreditCard className="w-8 h-8 text-primary" />
								<div>
									<h6 className="font-header-semibold text-lg">
										Credit Card
									</h6>
									<p className="text-xs text-muted-foreground">
										Safe & secure payments
									</p>
								</div>
							</div>
							<div className="bg-card rounded-2xl border border-border/10 aspect-square overflow-hidden relative">
								<div className="absolute inset-0 bg-muted/50" />
								<div className="absolute bottom-4 left-4">
									<h6 className="font-header-semibold text-lg">
										E-Wallets
									</h6>
									<p className="text-xs text-muted-foreground">
										GCash & PayMongo
									</p>
								</div>
							</div>
						</div>
						<div className="bg-card rounded-2xl border border-border/10 flex flex-col overflow-hidden">
							<div className="h-48 bg-muted/20 flex items-center justify-center border-b border-border/10">
								<div className="w-32 h-24 bg-background rounded-lg shadow-lg border border-border/10 flex flex-col p-2 gap-2">
									<div className="h-2 w-16 bg-muted rounded" />
									<div className="flex gap-2">
										<div className="h-8 w-8 bg-primary/20 rounded-full" />
										<div className="h-8 flex-1 bg-muted rounded" />
									</div>
								</div>
							</div>
							<div className="p-6">
								<Wallet className="w-8 h-8 text-primary mb-4" />
								<h6 className="font-header-semibold text-lg">
									Dashboards
								</h6>
								<p className="text-xs text-muted-foreground">
									Track all transactions
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="bg-card rounded-3xl p-12 text-center flex flex-col items-center gap-6 border border-border/10 relative overflow-hidden">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
					<h2 className="text-4xl font-header-bold tracking-tight">
						Ready to Modernize Your Gym
					</h2>
					<p className="text-muted-foreground max-w-xl leading-relaxed">
						Join hundreds of gym owners who have automated their
						access control and increased revenue with Smart Gym
						System
					</p>
					<div className="flex items-center gap-4 mt-4">
						<button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-body-bold hover:opacity-90 transition-opacity">
							Get Started Now
						</button>
						<button className="px-8 py-4 rounded-full bg-background border border-border/50 font-body-bold hover:border-primary transition-colors">
							Schedule Demo
						</button>
					</div>
				</section>
			</main>

			<footer className="border-t border-border/10 py-12">
				<div className="container mx-auto px-8 grid md:grid-cols-4 gap-12">
					<div className="col-span-2 flex flex-col gap-6">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 bg-primary rounded-sm" />
							<span className="font-header-bold text-xl tracking-tight">
								Smart Gym System
							</span>
						</div>
						<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
							The most advanced access control and management
							platform for modern fitness centers. Secure,
							scalable, and simple
						</p>
						<div className="flex items-center gap-4 text-muted-foreground">
							<Star className="w-5 h-5 hover:text-primary cursor-pointer" />
							<Heart className="w-5 h-5 hover:text-primary cursor-pointer" />
							<Share2 className="w-5 h-5 hover:text-primary cursor-pointer" />
						</div>
					</div>
					<div className="flex flex-col gap-4">
						<h6 className="font-header-semibold">Product</h6>
						<a
							href="#features"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Features
						</a>
						<a
							href="#hardware"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Hardware
						</a>
						<a
							href="#pricing"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Pricing
						</a>
						<a
							href="#integrations"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Integrations
						</a>
					</div>
					<div className="flex flex-col gap-4">
						<h6 className="font-header-semibold">Company</h6>
						<a
							href="#about"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							About
						</a>
						<a
							href="#blog"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Blog
						</a>
						<a
							href="#careers"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Careers
						</a>
						<a
							href="#contact"
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Contact
						</a>
					</div>
				</div>
				<div className="container mx-auto px-8 mt-12 pt-8 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
					<p>2026 Smart Gym Systems. All rights reserved.</p>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-primary" />
						<span>All Systems Operational</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
