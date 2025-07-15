import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductData from "@/components/pages/ProductData";
import ProcessingFailed from "@/components/pages/ProcessingFailed";
import ProcessingSuccess from "@/components/pages/ProcessingSuccess";
import ReviewConfiguration from "@/components/pages/ReviewConfiguration";
import ReviewResults from "@/components/pages/ReviewResults";
import RejectionFeedback from "@/components/pages/RejectionFeedback";
import Home from "@/features/home";
import ProductInput from "@/features/productInput";
import { Toaster } from "react-hot-toast";
import Processing from "@/features/processing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Consider data fresh for 1 minute
      gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
      refetchOnMount: true, // Refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 1, // Only retry failed requests once
    },
  },
});

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/product-input",
      element: <ProductInput />,
    },
    {
      path: "/processing",
      element: <Processing />,
    },
    {
      path: "/processing-failed",
      element: <ProcessingFailed />,
    },
    {
      path: "/processing-success",
      element: <ProcessingSuccess />,
    },
    {
      path: "/review-configuration",
      element: <ReviewConfiguration />,
    },
    {
      path: "/review-results",
      element: <ReviewResults />,
    },
    {
      path: "/rejection-feedback",
      element: <RejectionFeedback />,
    },
    {
      path: "/product-data/:productId",
      element: <ProductData />,
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
