import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/authenticated/insights/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/insights/"!</div>;
}
