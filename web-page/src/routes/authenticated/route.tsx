import { AppSidebar } from "@/components/custom_components/app_sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MqttProvider } from "@/context/mqtt_context";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

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
});

function AuthenticatedRoute() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<MqttProvider>
					<Outlet />
				</MqttProvider>
			</SidebarInset>
		</SidebarProvider>
	);
}
