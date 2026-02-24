import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/authenticated/members/$member_id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/members/$member_id"!</div>
}
