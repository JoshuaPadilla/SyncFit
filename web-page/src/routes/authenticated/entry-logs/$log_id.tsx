import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/authenticated/entry-logs/$log_id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/entry-logs/$log_id"!</div>;
}
