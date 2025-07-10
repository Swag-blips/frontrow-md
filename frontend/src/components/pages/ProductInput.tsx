import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styling/ProductInput.css";

// Define the shape of a product
interface Product {
  product_id: string;
  product_name?: string; // Optional for backward compatibility
  product_info?: {
    product_name: string;
    product_image_url?: string;
  };
  product_image_url?: string; // Add back image URL
  created_time: number | string;
}

const API_BASE_URL = ""; // Use relative URLs to let Vercel handle routing

const ProductInput: React.FC = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetching = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Polling state for processing product IDs
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get processing IDs from sessionStorage
  const getProcessingIds = () => {
    try {
      const stored = sessionStorage.getItem("processingProductIds");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  };

  // Helper to update processing IDs in sessionStorage and state
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

      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("No products found");
      }

      // Create a map to store unique products by product_name
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
      const uniqueProducts = Array.from(uniqueProductsMap.values())
        .sort((a, b) => {
          const timeA =
            typeof a.created_time === "string"
              ? new Date(a.created_time).getTime()
              : a.created_time;
          const timeB =
            typeof b.created_time === "string"
              ? new Date(b.created_time).getTime()
              : b.created_time;
          return timeB - timeA;
        })
        .slice(0, 6);

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
    fetchProducts(); // initial mount, show loading

    if (getProcessingIds().length > 0 && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchProducts(true); // polling, don't show loading spinner
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

      // Basic URL validation
      if (!validatedUrl) {
        throw new Error("Please enter a URL");
      }

      // Ensure URL has protocol
      try {
        const urlObj = new URL(validatedUrl);
        if (!urlObj.protocol.startsWith("http")) {
          validatedUrl = `https://${validatedUrl}`;
        }
      } catch (err) {
        throw new Error("Please enter a valid URL");
      }

      // Navigate to Processing page to handle the extraction
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

  return (
    <>
      <Toaster position="top-center" />
      <header className="header">
        <div className="container header__container">
          <Link to="/" className="logo">
            <span className="logo__icon">+</span>
            <span>FrontrowMD</span>
          </Link>
        </div>
      </header>

      <main className="input-main-content">
        <div className="container">
          <section className="input-section">
            <div className="input-card">
              <h1 className="input-card__title">
                Start a New Review Generation
              </h1>
              <p className="input-card__subtitle">
                Enter a product page URL to begin the analysis and review
                creation process.
              </p>
              <form onSubmit={handleSubmit} className="url-form">
                <input
                  type="url"
                  className="url-input"
                  placeholder="https://www.example.com/product/item-123"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="generate-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Generate Reviews"}
                </button>
              </form>
              {error && <p className="error-message">{error}</p>}
            </div>
          </section>

          <section className="recents-section">
            <h2 className="recents-section__title">Recent Products</h2>
            <div className="recents-grid">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading recent products...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p className="error-message">{error}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <p className="no-products-message">
                    No recent analyses found.
                  </p>
                  <p className="empty-state-help">
                    Start by entering a product URL above to generate reviews.
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.product_id}
                    className="product-card"
                    onClick={() => handleProductClick(product.product_id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="product-card__image">
                      <img
                        src={
                          product.product_image_url ||
                          "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                        }
                        alt={product.product_name || "Product"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                        }}
                      />
                    </div>
                    <div className="product-card__content">
                      <h3 className="product-card__title">
                        {product.product_name || "Unnamed Product"}
                      </h3>
                      <p className="product-card__url">
                        {product?.product_image_url}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="product-input-footer">
        <div className="container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default ProductInput;
