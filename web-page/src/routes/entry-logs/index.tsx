import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entry-logs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/entry-logs/"!</div>
}
