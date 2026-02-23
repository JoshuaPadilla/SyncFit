import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/plans/$plan_id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/plans/$plan_id"!</div>
}
