import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// 1. Import your context and the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/auth_context";
import { routeTree } from "./routeTree.gen";
import { useUserStore } from "./stores/userStore";

// 2. Create the router instance
// We pass 'auth' as undefined initially in the context type-safety
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: {
		auth: undefined!, // This will be populated by the provider
		user: undefined!,
		queryClient: undefined!,
	},
});

// 3. Register the router for maximum type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient();

// 4. Create a component to wrap the Provider and pass context
function App() {
	const auth = useAuth();
	const user = useUserStore();
	if (auth.isLoading) {
		return <div style={{ color: "white" }}>Loading SyncFit...</div>;
	}
	// We pass the auth state into the router context here
	return (
		<RouterProvider router={router} context={{ auth, user, queryClient }} />
	);
}

const rootElement = document.getElementById("app")!; // Note: usually "root" in Vite, "app" in your snippet

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<App />
				</AuthProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
