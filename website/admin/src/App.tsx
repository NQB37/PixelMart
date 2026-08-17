import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router } from "@/router";
import { useAuthStore } from "@/features/auth/stores/auth.store";

import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: Error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function InnerApp() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <RouterProvider
      router={router}
      context={{ auth: { user, isAuthenticated } }}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer position='top-right' autoClose={3000} hideProgressBar />
      <InnerApp />
    </QueryClientProvider>
  );
}

export default App;
