import "@/styles.css";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
// Change this import
import { type AuthContextType } from "@/context/auth_context";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface MyRouterContext {
	auth: AuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<Outlet />
			{/* Standard Router Devtools */}
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
}
