import { AppSidebar } from "@/components/custom_components/app_sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { MqttProvider } from "@/context/mqtt_context";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import web_logo from "../../../public/web_logo.png";

export const Route = createFileRoute("/authenticated")({
	component: AuthenticatedRoute,
	beforeLoad: ({ context }) => {
		// If the user is not logged in, kick them to login
		if (!context.auth.isLoading && !context.auth.session) {
			throw redirect({
				to: "/login",
			});
		}
	},
	pendingMs: 0,
});

function AuthenticatedRoute() {
	return (
		<SidebarProvider className="dark">
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 md:hidden">
					<div className="flex items-center gap-3">
						<SidebarTrigger className="size-8 text-foreground" />
						<img src={web_logo} alt="SyncFit" className="h-6 w-6" />
						<span className="font-header-bold text-sm text-foreground">
							SyncFit
						</span>
					</div>
				</header>
				<MqttProvider>
					<Outlet />
				</MqttProvider>
			</SidebarInset>
		</SidebarProvider>
	);
}
