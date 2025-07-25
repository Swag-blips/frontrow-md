import { useEffect, useState } from "react";
import "./styles/ProductHome.css";
import { useProductInput } from "../productInput/hooks/useProductInput";
import type { ProductType } from "./types/types";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProductHome() {
  const [activeTab, setActiveTab] = useState("generated");
  const [draft, setDraft] = useState<ProductType[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const {
    products,
    paginatedProducts,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    isLoading,
  } = useProductInput();

  console.log(isLoading);

  const fetchProductDrafts = async () => {
    try {
      const response = await fetch(
        "/product_management/get_all_product_drafts",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      const data = await response.json();
      setDraft(data.product_drafts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `/product_management/delete_product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setDraft((prevDrafts) =>
          prevDrafts.filter((item) => item.product_id !== productId)
        );
        setOpenDropdown(null);
        console.log("Product deleted successfully");
      } else {
        console.error("Failed to delete product");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
      }
    } catch (error: any) {
      console.error("Error deleting product:", error.message);
    }
  };

  const toggleDropdown = (productId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link navigation
    e.stopPropagation();
    setOpenDropdown(openDropdown === productId ? null : productId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  useEffect(() => {
    fetchProductDrafts();
  }, []);

  console.log(draft);

  return (
    <>
      <header className="product-home-header">
        <div className="product-home-container product-home-header__container">
          <Link to="/" className="product-home-logo">
            <span className="product-home-logo__icon">+</span>
            <span>FrontrowMD</span>
          </Link>
          <Link
            to={"/product-input-v2"}
            className="product-home-add-product-btn"
          >
            Add New Product
          </Link>
        </div>
      </header>

      <main className="product-home-main-content">
        <div className="product-home-container">
          <div className="product-home-page-header">
            <h1 className="product-home-page-title">Product Dashboard</h1>
            <p className="product-home-page-subtitle">
              Manage your analyzed products and generated reviews
            </p>
          </div>

          <div className="product-home-tabs-container">
            <div className="product-home-tabs">
              <button
                className={`product-home-tab-button ${
                  activeTab === "generated" ? "active" : ""
                }`}
                onClick={() => setActiveTab("generated")}
              >
                Generated
              </button>
              <button
                className={`product-home-tab-button ${
                  activeTab === "drafts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("drafts")}
              >
                Drafts
              </button>
            </div>
          </div>

          {activeTab === "generated" && (
            <div className="product-home-tab-content active" id="generated-tab">
              <div className="product-home-products-grid">
                {paginatedProducts.map((product) => (
                  <Link
                    to={`/product-data/${product.product_id}`}
                    key={product.product_id}
                    className="product-home-product-card"
                  >
                    <div className="product-home-product-card__image">
                      <img
                        src={
                          product.product_image_url ||
                          "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                        }
                        alt={product.product_name || "Product"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg";
                        }}
                      />
                    </div>
                    <div className="product-home-product-card__content">
                      <h3 className="product-home-product-card__title">
                        {product.product_name || "Unnamed Product"}
                      </h3>
                      <p className="product-home-product-card__url">
                        {product.product_image_url}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {products.length > 9 && (
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
            </div>
          )}

          {activeTab === "drafts" && (
            <>
              <div className="product-home-tab-content active" id="drafts-tab">
                <div className="product-home-products-grid">
                  {draft.length > 0 &&
                    draft.map((item) => (
                      <Link
                        to={
                          item.product_info.error
                            ? `/processing-failed?productId=${item.product_id}`
                            : `/processing-success?productId=${item.product_id}`
                        }
                        key={item.product_id}
                        className="product-home-product-card"
                        style={{ position: "relative" }}
                      >
                        <div className="product-home-product-card__image">
                          <img
                            src={item.product_info.product_image_url}
                            alt="Collagen Supplement"
                          />

                          {item.product_info.error ? (
                            <span className="product-home-status-tag product-home-status-tag--error">
                              Failed
                            </span>
                          ) : (
                            <span className="product-home-status-tag product-home-status-tag--success">
                              Success
                            </span>
                          )}
                        </div>
                        <div className="product-home-product-card__content">
                          <h3 className="product-home-product-card__title">
                            {item.product_info.product_name ||
                              item.product_info.raw_product_text}
                          </h3>
                          <p className="product-home-product-card__url">
                            {item.product_url}
                          </p>
                        </div>

                        {/* Three-dot menu */}
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            zIndex: 10,
                          }}
                        >
                          <button
                            style={{
                              background: "rgba(255, 255, 255, 0.9)",
                              border: "none",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#666",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={(e) => toggleDropdown(item.product_id, e)}
                          >
                            ⋮
                          </button>

                          {openDropdown === item.product_id && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                right: "0",
                                background: "white",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                minWidth: "140px",
                                zIndex: 1000,
                                overflow: "hidden",
                              }}
                            >
                              <button
                                style={{
                                  width: "100%",
                                  padding: "12px 16px",
                                  border: "none",
                                  background: "none",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  color: "#dc3545",
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteProduct(item.product_id);
                                }}
                              >
                                Delete Product
                              </button>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="product-home-footer">
        <div className="product-home-container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
