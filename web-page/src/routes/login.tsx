import { useAuth } from "@/context/auth_context";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dumbbell, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		// If the user is ALREADY logged in, send them to the dashboard/overview
		if (context.auth.session) {
			throw redirect({
				to: "/authenticated/overview", // Adjust this to your default landing page
			});
		}
	},
});

function RouteComponent() {
	const { signIn } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSignin = async () => {
		await signIn(email, password);
	};
	return (
		// Wrapping in 'dark' to activate your custom dark mode CSS variables
		<div className="dark flex min-h-screen w-full bg-background text-foreground font-[var(--font-body-reg)]">
			{/* LEFT PANEL - Branding (Hidden on smaller screens) */}
			<div className="hidden lg:flex lg:w-[400px] xl:w-[480px] flex-col justify-between bg-card p-10 border-r border-border/50">
				{/* Logo */}
				<div className="flex items-center gap-2 text-primary">
					<Dumbbell className="h-6 w-6" />
					<span className="text-foreground font-[var(--font-header-bold)] text-xl tracking-wide">
						Smart Gym
					</span>
				</div>

				{/* Welcome Message */}
				<div className="space-y-6">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
						<ShieldCheck className="h-6 w-6" />
					</div>

					<div className="space-y-1 leading-none">
						<h1 className="text-5xl font-[var(--font-header-bold)] text-foreground tracking-tight">
							Welcome
						</h1>
						<h1 className="text-5xl font-[var(--font-header-bold)] text-primary tracking-tight">
							Back
						</h1>
					</div>

					<p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
						Securely manage members, access controls, and gym
						analytics from one central hub.
					</p>
				</div>

				{/* Footer */}
				<div className="text-xs text-muted-foreground">
					© 2024 Smart Gym Systems Inc.
				</div>
			</div>

			{/* RIGHT PANEL - Login Form */}
			<div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
				<div className="w-full max-w-[420px] space-y-8">
					{/* Mobile Logo (Visible only on mobile) */}
					<div className="flex lg:hidden items-center gap-2 text-primary mb-12">
						<Dumbbell className="h-6 w-6" />
						<span className="text-foreground font-[var(--font-header-bold)] text-xl tracking-wide">
							Smart Gym
						</span>
					</div>

					{/* Form Header */}
					<div className="space-y-2">
						<h2 className="text-3xl font-[var(--font-header-bold)] tracking-tight">
							Sign in to your account
						</h2>
						<p className="text-muted-foreground text-sm">
							Enter your credentials to access the admin panel
						</p>
					</div>

					{/* Login Form */}
					<div className="space-y-5">
						{/* Email Field */}
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-[var(--font-body-semibold)]"
							>
								Email address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
									<Mail className="h-4 w-4" />
								</div>
								<input
									id="email"
									type="email"
									placeholder="admin@smartgym.com"
									className="w-full bg-card border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="text-sm font-[var(--font-body-semibold)]"
								>
									Password
								</label>
								<a
									href="#"
									className="text-sm text-primary hover:underline font-[var(--font-body-med)]"
								>
									Forgot password?
								</a>
							</div>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
									<Lock className="h-4 w-4" />
								</div>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									className="w-full bg-card border border-border rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
									required
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
								>
									{showPassword ? (
										<Eye className="h-4 w-4" />
									) : (
										<EyeOff className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							className="w-full bg-primary text-primary-foreground font-[var(--font-body-semibold)] rounded-lg py-2.5 mt-2 hover:bg-primary/90 transition-colors"
							onClick={handleSignin}
						>
							Sign In
						</button>
					</div>

					{/* Security Badge */}
					<div className="pt-6 flex flex-col items-center space-y-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-[var(--font-body-med)]">
							<Lock className="h-3 w-3" />
							<span>
								Secure System Access • 256-bit Encryption
							</span>
						</div>

						<p className="text-sm text-muted-foreground">
							Not an admin?{" "}
							<a
								href="#"
								className="text-foreground font-[var(--font-body-semibold)] hover:text-primary transition-colors"
							>
								Contact Support
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
