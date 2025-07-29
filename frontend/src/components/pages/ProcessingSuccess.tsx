import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "../styling/ProcessingSuccess.css";

interface HealthClaim {
  category: string;
  claim: string;
  claim_location: string[];
  claim_type: string;
  original_text: string;
}
interface KeyTerm {
  term: string;
  term_location: string[];
}

interface ProductData {
  product_name: string;
  product_image_url: string;
  product_description: string;
  ingredients: Array<{
    ingredient_name: string;
    ingredient_location?: string[];
    sources?: string;
    source?: string;
    sources_text?: string;
  }>;
  clinician_reviews?: Array<{
    review_text: string;
    reviewer_name: string;
    reviewer_title: string;
  }>;
  health_claims?: HealthClaim[];
  key_terms?: KeyTerm[];
  product_url: string;
}

const ProcessingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [hasMinimalData, setHasMinimalData] = useState(false);

  const url = searchParams.get("url") || "";
  const productId = searchParams.get("productId");

  // Helper function to check if product data is minimal
  const checkDataCompleteness = (data: ProductData) => {
    const hasName =
      data.product_name &&
      data.product_name.trim() !== "" &&
      data.product_name !== "Unknown Product";
    const hasDescription =
      data.product_description && data.product_description.trim() !== "";
    const hasIngredients = data.ingredients && data.ingredients.length > 0;
    const hasImage =
      data.product_image_url && data.product_image_url.trim() !== "";

    return hasName || hasDescription || hasIngredients || hasImage;
  };

  useEffect(() => {
    const fetchProductData = async () => {
      const MAX_RETRIES = 5;
      const RETRY_DELAY = 3000; // 3 seconds

      if (!productId) {
        setError("No prodwuct ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/frontrowmd/get_product_by_id/${productId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
        const data = await response.json();

        if (!data.product || !data.product.product_info) {
          throw new Error("Product not found in database.");
        }

        const product = data.product;

        console.log("product from api", product);
        console.log("product", product.product_info.health_claims);

        setProductData({
          product_name: product.product_info.product_name || "Unknown Product",
          product_image_url: product.product_info.product_image_url || "",
          product_description: product.product_info.product_description || "",
          ingredients: product.product_info.ingredients || [],
          clinician_reviews: product.product_info.clinician_reviews || [],
          health_claims: product.product_info.health_claims || [],
          key_terms: product.product_info.key_terms || [],
          product_url: product.product_url,
        });

        // Check if the data is minimal
        // const finalProductData = {
        //   product_name: product.product_info.product_name || "Unknown Product",
        //   product_image_url: product.product_info.product_image_url || "",
        //   product_description: product.product_info.product_description || "",
        //   ingredients: product.product_info.ingredients || [],
        //   clinician_reviews: product.product_info.clinician_reviews || [],
        // };

        // setProductData(finalProductData);
        // setHasMinimalData(!checkDataCompleteness(finalProductData));

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load product data");
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  console.log(productData);
  const handleReject = () => {
    // Navigate to rejection feedback page with productId
    navigate(`/rejection-feedback?productId=${productId}`);
  };

  const handleAccept = async () => {
    if (!productId) {
      return;
    }

    try {
      // Call the add_human_review endpoint with is_accurate: true and empty context
      const response = await fetch(`/frontrowmd/add_human_review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          is_accurate: true,
          context: "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Navigate to review results to see generated reviews
      navigate(`/review-configuration?productId=${productId}`);
    } catch (error) {
      alert("Failed to accept product. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="processing-success-wrapper">
        <header className="header">
          <div className="container header__container">
            <Link to="/" className="logo">
              <span className="logo__icon">+</span>
              <span>FrontrowMD</span>
            </Link>
          </div>
        </header>
        <div className="container page-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>
              {retryAttempt > 0
                ? `Loading product data... (Retry attempt ${retryAttempt}/5)`
                : "Loading product data..."}
            </p>
            {retryAttempt > 0 && (
              <p className="retry-info">
                The product is still being processed. Please wait while we fetch
                the latest data.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="processing-success-wrapper">
        <header className="header">
          <div className="container header__container">
            <Link to="/" className="logo">
              <span className="logo__icon">+</span>
              <span>FrontrowMD</span>
            </Link>
          </div>
        </header>
        <div className="container page-content">
          <div className="error-state">
            <h1>Error Loading Product Data</h1>
            <p className="error-message">{error || "Product data not found"}</p>
            <Link to="/product-input" className="button-primary">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log("product data", productData);
  return (
    <div className="processing-success-wrapper">
      <header className="header">
        <div className="container header__container">
          <Link to="/" className="logo">
            <span className="logo__icon">+</span>
            <span>FrontrowMD</span>
          </Link>
        </div>
      </header>
      <div className="container page-content">
        <div className="page-title-section">
          <h1 className="success-page-title">Confirm Product Details</h1>
          <p className="success-page-subtitle">
            Review the extracted data on the left against the product page on
            the right. Accept if it's accurate, or reject to try again.
          </p>
        </div>
        <main className="validation-container">
          {/* Left Panel: Extracted Data */}
          <div className="panel left-panel">
            <div className="panel-scrollable">
              <div className="section">
                <h2 className="section-title">Product Name</h2>
                <p className="product-name">{productData.product_name}</p>
              </div>
              <div className="section">
                <h2 className="section-title">Product Image</h2>
                <img
                  src={productData.product_image_url}
                  alt={productData.product_name}
                  className="product-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <div className="section">
                <h2 className="section-title">Product Description</h2>
                <p className="product-description">
                  {productData.product_description}
                </p>
              </div>
              <div className="section">
                <h2 className="section-title">Key Ingredients & Features</h2>
                <div className="ingredients-list">
                  {productData.ingredients.map((ingredient, index) => {
                    const sources = Array.isArray(
                      ingredient.ingredient_location
                    )
                      ? ingredient.ingredient_location.join(", ")
                      : ingredient.sources ||
                        ingredient.source ||
                        ingredient.sources_text ||
                        "";
                    return (
                      <div key={index} className="ingredient-item">
                        <span className="ingredient-tag">
                          {ingredient.ingredient_name}
                        </span>
                        {sources && sources.trim() && (
                          <span className="ingredient-sources">{sources}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="section">
                <h2 className="section-title">Key Terms & Features</h2>
                <div className="key-terms-grid">
                  {productData.key_terms && productData.key_terms.length > 0 ? (
                    productData.key_terms.map((term, idx) => (
                      <div key={idx} className="key-term-item">
                        <span className="key-term-tag">{term.term}</span>
                        <span className="key-term-sources">
                          {Array.isArray(term.term_location)
                            ? term.term_location.join(", ")
                            : term.term_location}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-placeholder">
                      No data found for key terms.
                    </div>
                  )}
                </div>
              </div>
              <div className="section">
                <h2 className="section-title">Health Claims</h2>
                <div className="health-claims-list">
                  {productData.health_claims &&
                  productData.health_claims.length > 0 ? (
                    productData.health_claims.map((claim, idx) => (
                      <div key={idx} className="health-claim-item">
                        <div className="health-claim-header">
                          <span className="health-claim-text">
                            {claim.claim}
                          </span>
                          <span className="health-claim-category">
                            {claim.category}
                          </span>
                        </div>
                        <div className="health-claim-meta">
                          <span className="health-claim-type">
                            {claim.claim_type}
                          </span>
                          <span className="health-claim-locations">
                            {Array.isArray(claim.claim_location)
                              ? claim.claim_location.join(", ")
                              : claim.claim_location}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-placeholder">
                      No data found for health claims.
                    </div>
                  )}
                </div>
              </div>
              <div className="section">
                <h2 className="section-title">Clinician Reviews</h2>
                {productData.clinician_reviews &&
                productData.clinician_reviews.length > 0 ? (
                  <div className="clinician-reviews-list">
                    {productData.clinician_reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <p className="review-text">"{review.review_text}"</p>
                        <p className="reviewer-info">
                          {review.reviewer_name} ({review.reviewer_title})
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-placeholder">
                    No data found for clinician reviews.
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Panel: External Link */}
          <div className="panel right-panel">
            <div className="external-link-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
            <h2 className="external-link-title">Verify Original Page</h2>
            <p className="external-link-text">
              Click the button below to open the original product page in a new
              tab. Compare it with the extracted data on the left to ensure
              accuracy.
            </p>
            <Link
              to={productData.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link-button"
            >
              Open Page in New Tab
            </Link>
          </div>
        </main>
      </div>
      <footer className="validation-footer">
        <button className="action-button reject-button" onClick={handleReject}>
          Reject & Retry
        </button>
        <button className="action-button accept-button" onClick={handleAccept}>
          Accept & Continue
        </button>
      </footer>
    </div>
  );
};

export default ProcessingSuccess;
