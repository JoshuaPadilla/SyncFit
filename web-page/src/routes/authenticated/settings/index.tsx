import NotImplemented from "@/components/custom_components/not_implemented";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/authenticated/settings/")({
component: () => <NotImplemented pageName="Settings" />,
});
