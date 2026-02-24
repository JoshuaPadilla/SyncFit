import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/authenticated/entry-logs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/entry-logs/"!</div>
}
