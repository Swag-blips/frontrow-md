import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styling/ProductInput.css";

// Define the shape of a product
interface Product {
  product_id: string;
  product_name: string;
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

  const fetchProducts = async () => {
    if (isFetching.current) {
      console.log("Already fetching, skipping...");
      return;
    }

    // Cancel any existing fetch
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();
    isFetching.current = true;
    setIsLoading(true);

    try {
      console.log("Fetching fresh products...");
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
      console.log("Received products:", data.products?.length || 0);

      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("No products found");
      }

      // Create a map to store unique products by product_name
      const uniqueProductsMap = new Map<string, Product>();

      // Process each product, keeping only the most recent one for each product_name
      data.products.forEach((product: Product) => {
        const normalizedName = product.product_name.toLowerCase().trim();
        const existingProduct = uniqueProductsMap.get(normalizedName);
        const currentTime =
          typeof product.created_time === "string"
            ? new Date(product.created_time).getTime()
            : product.created_time;

        if (!existingProduct) {
          uniqueProductsMap.set(normalizedName, product);
        } else {
          const existingTime =
            typeof existingProduct.created_time === "string"
              ? new Date(existingProduct.created_time).getTime()
              : existingProduct.created_time;

          if (currentTime > existingTime) {
            uniqueProductsMap.set(normalizedName, product);
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

      console.log("Processed unique products:", {
        total: data.products.length,
        unique: uniqueProducts.length,
        products: uniqueProducts.map((p) => ({
          name: p.product_name,
          time: p.created_time,
        })),
      });

      setProducts(uniqueProducts);
      setError(null);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error fetching products:", err);
        setError(err.message);
      }
    } finally {
      isFetching.current = false;
      setIsLoading(false);
      abortController.current = null;
    }
  };

  // Fetch on mount and when returning to the page
  useEffect(() => {
    console.log("Component mounted or returned to page, fetching products...");
    fetchProducts();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      isFetching.current = false;
    };
  }, []); // Empty dependency array for mount only

  console.log(products);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const inputUrl = url.trim();
      let validatedUrl = inputUrl;
      try {
        const urlObj = new URL(validatedUrl);
        if (!urlObj.protocol.startsWith("http")) {
          validatedUrl = `https://${validatedUrl}`;
        }
      } catch (err) {
        throw new Error("Please enter a valid URL");
      }

      const payload = {
        product_url: validatedUrl,
        timestamp: new Date().toISOString(),
      };

      console.log("ProductInput: Making API call with payload:", payload);
      console.log("ProductInput: Original URL:", inputUrl);
      console.log("ProductInput: Validated URL:", validatedUrl);

      // COMMENTED OUT: API call for UI testing
      /*
            const response = await fetch('/frontrowmd/extract_product_metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorText = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    console.error('ProductInput: Backend error response:', errorData);
                    errorText = errorData.message || errorData.detail || errorText;
                } catch (e) {
                    // If response is not JSON, get text
                    try {
                        const textError = await response.text();
                        console.error('ProductInput: Backend error text:', textError);
                        errorText = textError || errorText;
                    } catch (e2) {
                        console.error('ProductInput: Could not read error response');
                    }
                }
                throw new Error(errorText);
            }

            const data = await response.json();
            
            // Fetch products immediately after successful submission
            console.log('Product submitted successfully, fetching updated list...');
            fetchProducts();
            
            if (data.product_id) {
                navigate(`/processing?url=${encodeURIComponent(validatedUrl)}&productId=${data.product_id}`);
            } else {
                navigate(`/processing?url=${encodeURIComponent(validatedUrl)}`);
            }
            */

      // UI DEMO MODE: Direct redirect to processing page
      console.log(
        "🎨 ProductInput: UI demo mode - redirecting to processing page"
      );

      // Simulate a brief loading delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate a demo product ID
      const demoProductId = "demo-" + Date.now();

      // Navigate directly to processing page
      navigate(
        `/processing?url=${encodeURIComponent(
          validatedUrl
        )}&productId=${demoProductId}`
      );
    } catch (err: any) {
      console.error("Error:", err);
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
                        alt={product.product_name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                        }}
                      />
                    </div>
                    <div className="product-card__content">
                      <h3 className="product-card__title">
                        {product.product_name}
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
