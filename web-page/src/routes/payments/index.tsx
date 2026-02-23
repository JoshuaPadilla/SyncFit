import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/payments/"!</div>
}
