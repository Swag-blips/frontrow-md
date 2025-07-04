import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "../styling/ProcessingSuccess.css";

interface ProductData {
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  clinicianReviews?: string;
}

const ProcessingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const url = searchParams.get("url") || "";
  const productId = searchParams.get("productId");

  // Demo data - in real implementation this would come from API/state
  const productData: ProductData = {
    name: "Prenatal Gummies For Him + Her",
    image:
      "https://www.mateandme.com/cdn/shop/files/duo_front.webp?v=1715284608&width=1646",
    description:
      "A bundle of goodness, designed for the both of you and your fertility journey. Effective and great tasting with clinically proven ingredients, this perfect prenatal pairing can help boost sperm health and support Mom and baby with key nutrients during preconception and pregnancy. Taking care of each other's health and wellness has never been so sexy.",
    ingredients: [
      "CoQ10",
      "Methylated Folate",
      "Choline",
      "Vitamin D3",
      "Vitamin B12",
      "Vitamin K2",
      "Antioxidants",
    ],
    clinicianReviews: undefined,
  };

  const handleReject = () => {
    // Navigate to rejection feedback page
    navigate("/rejection-feedback");
  };

  const handleAccept = () => {
    // Navigate to review results to see generated reviews
    navigate("/review-configuration");
  };

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
                <p className="product-name">{productData.name}</p>
              </div>

              <div className="section">
                <h2 className="section-title">Product Image</h2>
                <img
                  src={productData.image}
                  alt={productData.name}
                  className="product-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>

              <div className="section">
                <h2 className="section-title">Product Description</h2>
                <p className="product-description">{productData.description}</p>
              </div>

              <div className="section">
                <h2 className="section-title">Key Ingredients & Features</h2>
                <div className="ingredients-list">
                  {productData.ingredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Clinician Reviews</h2>
                {productData.clinicianReviews ? (
                  <p className="product-description">
                    {productData.clinicianReviews}
                  </p>
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
                width="48"
                height="48"
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
            <a
              href={
                url ||
                "https://www.mateandme.com/products/prenatal-gummies-for-him-her"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="external-link-button"
            >
              Open Page in New Tab
            </a>
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
