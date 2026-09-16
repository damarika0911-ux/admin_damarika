import { QueryClient } from "@tanstack/react-query";

/** Shared cache policy for the authenticated dashboard. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) =>
        failureCount < 1 && error?.response?.status !== 401,
    },
    mutations: { retry: false },
  },
});
