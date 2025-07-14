import React from "react";
import { Link } from "react-router-dom";
import "./styles/ProductInput.css";
import { useProductInput } from "./hooks/useProductInput";
import { PRODUCTS_PER_PAGE } from "./utils/constants";

const ProductInput: React.FC = () => {
  const {
    handleNextPage,
    handlePrevPage,
    handleProductClick,
    handleSubmit,
    isLoading,
    isSubmitting,
    paginatedProducts,
    setUrl,
    products,
    currentPage,
    url,
    error,
    totalPages,
  } = useProductInput();
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
                paginatedProducts.map((product) => (
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
         
            {products.length > PRODUCTS_PER_PAGE && (
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
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
