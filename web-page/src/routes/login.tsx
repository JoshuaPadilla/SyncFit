import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth_context";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import homeLogo from "../../public/home_logo.png";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		if (context.auth.session) {
			throw redirect({ to: "/authenticated/overview" });
		}
	},
});

function RouteComponent() {
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [isSigningIn, setIsSigningIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || !password) {
			setErrorMessage("Enter both email and password to continue.");
			return;
		}
		setErrorMessage(null);
		setIsSigningIn(true);
		try {
			await signIn(normalizedEmail, password);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Unable to sign in right now. Please try again.",
			);
		} finally {
			setIsSigningIn(false);
		}
	};

	return (
		<div className="dark relative flex min-h-screen w-full flex-col bg-background text-foreground font-(--font-body-reg) overflow-hidden">
			{/* Ambient background */}
			<div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_15%_10%,rgba(0,240,197,0.22),transparent_34%),radial-gradient(circle_at_85%_88%,rgba(0,240,197,0.14),transparent_30%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(136,153,153,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(136,153,153,0.06)_1px,transparent_1px)] bg-size-[48px_48px] mask-[linear-gradient(to_bottom,rgba(0,0,0,0.5),transparent_80%)]" />

			{/* HEADER */}
			<header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-border/30 bg-transparent backdrop-blur-md">
				<img
					src={homeLogo}
					alt="SyncFit"
					className="h-15 w-auto object-contain"
				/>
				<Button
					onClick={() => navigate({ to: "/" })}
					variant={"ghost"}
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-(--font-body-med) transition-colors "
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Homepage
				</Button>
			</header>

			{/* MAIN — centered form */}
			<div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10">
				<div className="w-full max-w-md flex flex-col gap-7 rounded-2xl border border-border/40 bg-card/55 backdrop-blur-xl p-7 sm:p-9 shadow-[0_30px_80px_-40px_rgba(0,240,197,0.35)]">
					<div>
						<h1 className="text-3xl sm:text-4xl font-(--font-header-bold) tracking-tight">
							Sign in
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Access your admin dashboard
						</p>
					</div>

					<form
						className="flex flex-col gap-4"
						onSubmit={handleSignin}
					>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-sm font-(--font-body-semibold)"
							>
								Email address
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
								<input
									id="email"
									type="email"
									placeholder="admin@syncfit.com"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isSigningIn}
									className="w-full bg-background/70 border border-border/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground disabled:opacity-50"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="text-sm font-(--font-body-semibold)"
								>
									Password
								</label>
								<a
									href="#"
									className="text-xs text-primary hover:underline font-(--font-body-med)"
								>
									Forgot password?
								</a>
							</div>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									disabled={isSigningIn}
									className="w-full bg-background/70 border border-border/60 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground disabled:opacity-50"
								/>
								<button
									type="button"
									aria-label={
										showPassword
											? "Hide password"
											: "Show password"
									}
									onClick={() =>
										setShowPassword(!showPassword)
									}
									disabled={isSigningIn}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								>
									{showPassword ? (
										<Eye className="h-4 w-4" />
									) : (
										<EyeOff className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{errorMessage && (
							<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
								{errorMessage}
							</div>
						)}

						<button
							type="submit"
							disabled={isSigningIn}
							className="w-full bg-primary text-primary-foreground font-(--font-body-semibold) rounded-xl py-2.5 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
						>
							{isSigningIn ? "Signing in..." : "Sign In"}
						</button>
					</form>

					<div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
						<p>
							Not an admin?{" "}
							<a
								href="#"
								className="text-foreground font-(--font-body-semibold) hover:text-primary transition-colors"
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
