import { isAuthenticated } from "@/lib/auth";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  // Runs for every route: redirect to /login unless the user is signed in.
  beforeLoad: ({ location }) => {
    if (location.pathname !== "/login" && !isAuthenticated()) {
      throw redirect({
        to: "/login",
        // Root route types can't see /login's search schema, hence the cast.
        search: { redirect: location.href } as never,
      });
    }
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
      <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
    </>
  ),
});
