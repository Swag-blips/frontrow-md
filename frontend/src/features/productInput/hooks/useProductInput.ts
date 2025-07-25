import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PRODUCTS_PER_PAGE } from "../utils/constants";

export const useProductInput = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetching = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const getProcessingIds = () => {
    try {
      const stored = sessionStorage.getItem("processingProductIds");
      if (stored) return JSON.parse(stored);
    } catch {
      console.error(error);
    }
    return [];
  };

  const updateProcessingIds = (ids: string[]) => {
    setProcessingIds(ids);
    if (ids.length > 0) {
      sessionStorage.setItem("processingProductIds", JSON.stringify(ids));
    } else {
      sessionStorage.removeItem("processingProductIds");
    }
  };

  const pollForProcessedProducts = (productsList: Product[]) => {
    if (processingIds.length === 0) return;
    let updatedIds = [...processingIds];
    let foundAny = false;
    processingIds.forEach((id) => {
      if (
        productsList.some((p) => {
          return p.product_id === id;
        })
      ) {
        toast.success("Your new product is now live!");
        updatedIds = updatedIds.filter((pid) => pid !== id);
        foundAny = true;
      }
    });
    if (foundAny) {
      updateProcessingIds(updatedIds);
    }

    if (updatedIds.length === 0 && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    const ids = getProcessingIds();
    if (ids.length > 0) {
      setProcessingIds(ids);
    }
  }, []);

  const fetchProducts = async (isPolling: boolean = false) => {
    if (isFetching.current) {
      return;
    }

    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    isFetching.current = true;
    if (!isPolling) setIsLoading(true);

    try {
      const response = await fetch(`/frontrowmd/products?t=${Date.now()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      console.log("DATA", data);

      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("No products found");
      }

      const uniqueProductsMap = new Map<string, Product>();

      // Process each product, keeping only the most recent one for each product_name
      data.products.forEach((product: any) => {
        // Extract product name from either direct property or nested product_info
        const productName =
          product.product_name || product.product_info?.product_name;

        // Skip products without a product_name to prevent frontend errors
        if (!productName) {
          return;
        }

        // Create a normalized product object for the frontend
        const normalizedProduct: Product = {
          product_id: product.product_id,
          product_name: productName,
          product_image_url:
            product.product_image_url ||
            product.product_info?.product_image_url,
          created_time: product.created_time,
        };

        const normalizedName = productName.toLowerCase().trim();
        const existingProduct = uniqueProductsMap.get(normalizedName);
        const currentTime =
          typeof normalizedProduct.created_time === "string"
            ? new Date(normalizedProduct.created_time).getTime()
            : normalizedProduct.created_time;

        if (!existingProduct) {
          uniqueProductsMap.set(normalizedName, normalizedProduct);
        } else {
          const existingTime =
            typeof existingProduct.created_time === "string"
              ? new Date(existingProduct.created_time).getTime()
              : existingProduct.created_time;

          if (currentTime > existingTime) {
            uniqueProductsMap.set(normalizedName, normalizedProduct);
          }
        }
      });

      // Convert map to array and sort by created_time
      const uniqueProducts = Array.from(uniqueProductsMap.values()).sort(
        (a, b) => {
          const timeA =
            typeof a.created_time === "string"
              ? new Date(a.created_time).getTime()
              : a.created_time;
          const timeB =
            typeof b.created_time === "string"
              ? new Date(b.created_time).getTime()
              : b.created_time;
          return timeB - timeA;
        }
      );

      setProducts(uniqueProducts);
      setError(null);

      if (processingIds.length > 0) {
        pollForProcessedProducts(uniqueProducts);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      isFetching.current = false;
      if (!isPolling) setIsLoading(false);
      abortController.current = null;
    }
  };

  useEffect(() => {
    fetchProducts();
    if (getProcessingIds().length > 0 && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchProducts(true);
        toast.loading(
          "We’re processing your new product(s). They’ll appear shortly.",
          { id: "polling" }
        );
      }, 2000);
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      isFetching.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      toast.dismiss("polling");
    };
  }, [processingIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let validatedUrl = url.trim();

      if (!validatedUrl) {
        throw new Error("Please enter a URL");
      }

      try {
        const urlObj = new URL(validatedUrl);
        if (!urlObj.protocol.startsWith("http")) {
          validatedUrl = `https://${validatedUrl}`;
        }
      } catch (err) {
        throw new Error("Please enter a valid URL");
      }

      navigate(`/processing?url=${encodeURIComponent(validatedUrl)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product-data/${productId}`);
  };
  

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  return {
    handleNextPage,
    handlePrevPage,
    paginatedProducts,
    handleProductClick,
    handleSubmit,
    isSubmitting,
    isLoading,
    setUrl,
    url,
    error,
    currentPage,
    products,
    totalPages,
  };
};
