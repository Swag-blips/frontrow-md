import { useState } from "react";
import "./styles/ProductHome.css";

export default function ProductHome() {
  const [activeTab, setActiveTab] = useState("generated");

  return (
    <>
      <header className="product-home-header">
        <div className="product-home-container product-home-header__container">
          <a href="/" className="product-home-logo">
            <span className="product-home-logo__icon">+</span>
            <span>FrontrowMD</span>
          </a>
          <a href="product_input.html" className="product-home-add-product-btn">
            Add New Product
          </a>
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
                {/* Repeat product-card */}
                <a
                  href="product_data.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Vitamin C Serum"
                    />
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Vitamin C Brightening Serum
                    </h3>
                    <p className="product-home-product-card__url">
                      sephora.com/product/vitamin-c-serum
                    </p>
                  </div>
                </a>

                <a
                  href="product_data.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/7262911/pexels-photo-7262911.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Retinol Night Cream"
                    />
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Retinol Night Renewal Cream
                    </h3>
                    <p className="product-home-product-card__url">
                      amazon.com/product/retinol-cream
                    </p>
                  </div>
                </a>
                <a
                  href="product_data.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/3735782/pexels-photo-3735782.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Hyaluronic Acid"
                    />
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Hyaluronic Acid Hydrating Serum
                    </h3>
                    <p className="product-home-product-card__url">
                      theordinary.com/product/hyaluronic-acid
                    </p>
                  </div>
                </a>
                <a
                  href="product_data.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/6621328/pexels-photo-6621328.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Niacinamide"
                    />
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Niacinamide 10% + Zinc Serum
                    </h3>
                    <p className="product-home-product-card__url">
                      paulaschoice.com/product/niacinamide
                    </p>
                  </div>
                </a>

                <a
                  href="product_data.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/6620943/pexels-photo-6620943.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Gentle Cleanser"
                    />
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Gentle Foaming Cleanser
                    </h3>
                    <p className="product-home-product-card__url">
                      cerave.com/product/gentle-cleanser
                    </p>
                  </div>
                </a>

                <a
                  href="product_data.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/6621472/pexels-photo-6621472.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Daily Moisturizer"
                    />
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Daily Moisturizer SPF 30
                    </h3>
                    <p className="product-home-product-card__url">
                      ultabeauty.com/product/moisturizer-spf30
                    </p>
                  </div>
                </a>

                {/* More cards omitted for brevity */}
              </div>
            </div>
          )}

          {activeTab === "drafts" && (
            <div className="product-home-tab-content active" id="drafts-tab">
              <div className="product-home-products-grid">
                <a
                  href="processing_success.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/8134857/pexels-photo-8134857.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Collagen Supplement"
                    />
                    <span className="product-home-status-tag product-home-status-tag--success">
                      Success
                    </span>
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Marine Collagen Peptides
                    </h3>
                    <p className="product-home-product-card__url">
                      vitalnaturals.com/marine-collagen
                    </p>
                  </div>
                </a>

                <a
                  href="processing_failed.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/5938567/pexels-photo-5938567.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Omega-3 Supplement"
                    />
                    <span className="product-home-status-tag product-home-status-tag--error">
                      Failed
                    </span>
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Omega-3 Fish Oil Capsules
                    </h3>
                    <p className="product-home-product-card__url">
                      nordicnaturals.com/omega-3
                    </p>
                  </div>
                </a>
                <a
                  href="processing_success.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://images.pexels.com/photos/6620945/pexels-photo-6620945.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Probiotic"
                    />
                    <span className="product-home-status-tag product-home-status-tag--success">
                      Success
                    </span>
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      Daily Probiotic 50 Billion CFU
                    </h3>
                    <p className="product-home-product-card__url">
                      gardenoflife.com/probiotic-daily
                    </p>
                  </div>
                </a>
                <a
                  href="processing_success.html"
                  className="product-home-product-card"
                >
                  <div className="product-home-product-card__image">
                    <img
                      src="https://www.leiamoon.com/product/order-leiamoon-steam-seat/"
                      alt="LEIAMOON Steam Seat"
                    />
                    <span className="product-home-status-tag product-home-status-tag--success">
                      Success
                    </span>
                  </div>
                  <div className="product-home-product-card__content">
                    <h3 className="product-home-product-card__title">
                      LEIAMOON Steam Seat
                    </h3>
                    <p className="product-home-product-card__url">
                      leiamoon.com/product/order-leiamoon-steam-seat
                    </p>
                  </div>
                </a>
              </div>
            </div>
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
