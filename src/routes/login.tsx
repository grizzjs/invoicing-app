import LoginPage from "@/features/auth/pages/login";
import { isAuthenticated } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (isAuthenticated()) {
      throw redirect({ to: search.redirect ?? "/dashboard" });
    }
  },
  component: LoginPage,
});
