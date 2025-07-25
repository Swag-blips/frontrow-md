import { useState, useEffect, useRef } from "react";
import "./styles/ProductInputV2.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
type Product = {
  product_url: string;
  raw_product_text: string;
};

export default function ProductInputV2() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      urlInputRef.current?.focus();
    }, 300);
  }, []);

  const formatUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    rawUrl = rawUrl.trim();
    return rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;
  };

  const resetForm = () => {
    setUrl("");
    setText("");
    setShowSuccess(false);
    setTimeout(() => {
      urlInputRef.current?.focus();
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) {
      urlInputRef.current?.focus();
      return;
    }

    const formattedUrl = formatUrl(url);
    const product: Product = {
      product_url: formattedUrl,
      raw_product_text: text,
    };

    setSavedProducts((prev) => [...prev, product]);
    setShowSuccess(true);
  };

  console.log(savedProducts);

  async function batchExtractProductInfo() {
    console.log("Saved proucts here", savedProducts);
    if (!savedProducts.length) return;
    toast.loading("sending data for processing", {
      id: "124",
    });
    try {
      const response = await fetch("/frontrowmd/batch_extract_product_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_metadata_list: [...savedProducts],
        }),
      });

      const data = await response.json();

      console.log(data);
      if (data.success) {
        toast.dismiss("124");
        handleDone();
      } else {
        toast.dismiss("124");
        toast.error(data.error_message || "an error occured please try again");
      }
    } catch (error: any) {
      toast.dismiss("124");
      console.error(error);
      toast.error(error.message);
    }
  }

  const handleDone = () => {
    setShowSuccess(false);
    setConfirmationVisible(true);
  };

  const goToDashboard = () => {
    console.log("Sending products for processing:", savedProducts);
    navigate("/product-home");
  };

  const closeModal = () => {
    navigate("/product-home");
  };

  const handleOverlayClick = (
    e: React.MouseEvent<HTMLElement>,
    type: "product" | string
  ) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains("modal-overlay")
    ) {
      type === "product" ? closeModal() : setConfirmationVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      confirmationVisible ? setConfirmationVisible(false) : closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", () => handleKeyDown);
    return () => document.removeEventListener("keydown", () => handleKeyDown);
  }, [confirmationVisible]);

  return (
    <>
      <header className="product-input-v2-header">
        <div className="product-input-v2-container product-input-v2-header__container">
          <a href="product_homepage.html" className="product-input-v2-logo">
            <span className="product-input-v2-logo__icon">+</span>
            <span>FrontrowMD</span>
          </a>
        </div>
      </header>

      <div
        className="product-input-v2-modal-overlay"
        id="product-modal"
        onClick={(e) => handleOverlayClick(e, "product")}
      >
        <div className="product-input-v2-modal-content">
          <button className="product-input-v2-modal-close" onClick={closeModal}>
            &times;
          </button>

          <h2 className="product-input-v2-modal-title">
            Add Product Information
          </h2>
          <p className="product-input-v2-modal-subtitle">
            Enter the product URL and optionally paste the raw product page text
            for better analysis.
          </p>

          {!showSuccess ? (
            <form id="product-form" onSubmit={handleSubmit}>
              <div className="product-input-v2-form-group">
                <label
                  htmlFor="product-url"
                  className="product-input-v2-form-label product-input-v2-required"
                >
                  Product URL
                </label>
                <input
                  type="text"
                  id="product-url"
                  className="product-input-v2-form-input"
                  placeholder="www.example.com/product/item-123"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  ref={urlInputRef}
                />
                <p className="product-input-v2-form-help">
                  Enter the product page URL (https:// will be added
                  automatically if needed)
                </p>
              </div>

              <div className="product-input-v2-form-group">
                <label
                  htmlFor="product-text"
                  className="product-input-v2-form-label"
                >
                  Raw Product Text (Optional)
                </label>
                <textarea
                  id="product-text"
                  className="product-input-v2-form-input product-input-v2-form-textarea"
                  placeholder="Paste the raw text content from the product page here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <p className="product-input-v2-form-help">
                  Providing raw text can improve analysis accuracy, especially
                  for complex product pages
                </p>
              </div>

              <div className="product-input-v2-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Product
                </button>
              </div>
            </form>
          ) : (
            <div
              className="product-input-v2-success-actions"
              id="success-actions"
            >
              <div className="product-input-v2-success-message">
                Product information saved successfully!
              </div>
              <div className="product-input-v2-success-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Add Another
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={batchExtractProductInfo}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmationVisible && (
        <div
          className="product-input-v2-modal-overlay product-input-v2-confirmation-modal"
          id="confirmation-modal"
          onClick={(e) => handleOverlayClick(e, "confirmation")}
          style={{ display: "flex" }}
        >
          <div className="product-input-v2-modal-content">
            <div className="product-input-v2-confirmation-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="product-input-v2-modal-title">
              Products Sent for Processing
            </h2>
            <p className="product-input-v2-modal-subtitle">
              Your products are being sent for extraction and analysis. You’ll
              be able to view the results in your dashboard.
            </p>
            <div className="product-input-v2-modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={goToDashboard}
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
