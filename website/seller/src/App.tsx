import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/router";
import { useAuthStore } from "@/features/auth/stores/auth.store";

const queryClient = new QueryClient();

function InnerApp() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <RouterProvider router={router} context={{ auth: { user, isAuthenticated } }} />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );
}

export default App;
