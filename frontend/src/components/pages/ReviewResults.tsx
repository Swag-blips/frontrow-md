import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styling/ReviewResults.css";

interface ResearchItem {
  title: string;
  source: string;
  url: string;
  excerpt: string;
}

interface ReviewData {
  reviewer_name: string;
  reviewer_title: string;
  review_title: string;
  review_summary_line: string;
  review_text: string;
  highlights: string[];
  tone_type: string;
  uses_clinical_research: boolean;
  target_word_count: number;
  actual_word_count: number;
  profile_image_url: string;
  referenced_studies: string[];
  review_id: string;
}

const ReviewResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"pending" | "accepted">("pending");
  const [currentPendingIndex, setCurrentPendingIndex] = useState<number>(0);
  const [currentAcceptedIndex, setCurrentAcceptedIndex] = useState<number>(0);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(-1);
  const [updatedReviewData, setUpdatedReviewData] = useState<ReviewData | null>(
    null
  );

  // URL parameters
  const taskId = searchParams.get("taskId");
  const productId = searchParams.get("productId");

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isRejectSuccessModalOpen, setIsRejectSuccessModalOpen] =
    useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEditSuccessModalOpen, setIsEditSuccessModalOpen] =
    useState<boolean>(false);
  const [isAcceptedReviewModalOpen, setIsAcceptedReviewModalOpen] =
    useState<boolean>(false);
  const [selectedAcceptedReview, setSelectedAcceptedReview] =
    useState<ReviewData | null>(null);

  // Form states
  const [selectedWordCount, setSelectedWordCount] = useState<number>(100);
  const [toneAdjustment, setToneAdjustment] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Refs for carousel positioning
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const carouselViewportRef = useRef<HTMLDivElement>(null);

  // Review data state
  const [pendingReviewsData, setPendingReviewsData] = useState<ReviewData[]>(
    []
  );
  const [acceptedReviewsData, setAcceptedReviewsData] = useState<ReviewData[]>(
    []
  );

  // Add new state for regenerated review modal
  const [isRegeneratedModalOpen, setIsRegeneratedModalOpen] = useState(false);
  const [regeneratedReviewText, setRegeneratedReviewText] = useState<
    string | null
  >(null);

  // Fetch reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        setError("Missing productId parameter");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the product by ID and extract reviews
        const response = await fetch(
          `${window.location.origin}/frontrowmd/get_product_by_id/${productId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
        const product = await response.json();

        console.log("product", product);

        const allReviews = product.product.enhanced_generated_reviews || [];
        const acceptedIds = product.product.accepted_review_ids || [];
        const rejectedIds = product.product.rejected_review_ids || [];

        // Remove rejected reviews first
        const notRejected = allReviews.filter(
          (r: any) => !rejectedIds.includes(r.review_id)
        );

        const accepted = notRejected.filter((r: any) =>
          acceptedIds.includes(r.review_id)
        );
        const pending = notRejected.filter(
          (r: any) => !acceptedIds.includes(r.review_id)
        );

        setPendingReviewsData(pending);
        setAcceptedReviewsData(accepted);
      } catch (err) {
        setPendingReviewsData([]);
        setAcceptedReviewsData([]);
        setError("Failed to fetch product or reviews. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Update carousel position when accepted reviews change
  useEffect(() => {
    if (
      carouselTrackRef.current &&
      carouselViewportRef.current &&
      acceptedReviewsData.length > 0
    ) {
      const cards = carouselTrackRef.current.querySelectorAll(".review-card");
      if (cards.length > 0) {
        const cardWidth = cards[0].clientWidth;
        const viewportWidth = carouselViewportRef.current.clientWidth;
        const gap = 20;
        const offset =
          -currentAcceptedIndex * (cardWidth + gap) +
          (viewportWidth / 2 - cardWidth / 2);

        carouselTrackRef.current.style.transform = `translateX(${offset}px)`;
      }
    }
  }, [currentAcceptedIndex, acceptedReviewsData.length]);

  const formatToneType = (toneType: string) => {
    return toneType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderPendingReviews = () => {
    if (pendingReviewsData.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                fill="currentColor"
                d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
              />
            </svg>
          </div>
          <h3 className="empty-state-title">No Pending Reviews</h3>
          <p className="empty-state-message">
            No reviews were generated for this product.
          </p>
        </div>
      );
    }

    return (
      <div className="pending-reviews-list">
        {pendingReviewsData.map((review, index) => {
          const toneTypeFormatted = formatToneType(review.tone_type);
          const highlightTags = review.highlights.map((highlight) => (
            <span key={highlight} className="tag highlight">
              {highlight}
            </span>
          ));
          const toneTag = <span className="tag tone">{toneTypeFormatted}</span>;
          const researchTag = review.uses_clinical_research ? (
            <span className="tag research">Clinical Research</span>
          ) : null;
          const studiesList = review.referenced_studies.map((url, idx) => (
            <li key={idx} className="study-item">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="study-link"
              >
                {url}
              </a>
            </li>
          ));

          if (index !== currentPendingIndex) return null;

          return (
            <div className="pending-review-container" key={index}>
              <div className="pending-review-navigation">
                <div className="review-counter">
                  Review {index + 1} of {pendingReviewsData.length}
                </div>
                <div className="nav-buttons">
                  <button
                    className="nav-btn"
                    disabled={currentPendingIndex === 0}
                    onClick={() =>
                      setCurrentPendingIndex(
                        Math.max(0, currentPendingIndex - 1)
                      )
                    }
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                      />
                    </svg>
                  </button>
                  <button
                    className="nav-btn"
                    disabled={
                      currentPendingIndex === pendingReviewsData.length - 1
                    }
                    onClick={() =>
                      setCurrentPendingIndex(
                        Math.min(
                          pendingReviewsData.length - 1,
                          currentPendingIndex + 1
                        )
                      )
                    }
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="review-content-container">
                <div className="doctor-info">
                  <img
                    src={review.profile_image_url}
                    alt={review.reviewer_name}
                  />
                  <div className="doctor-details">
                    <h3>{review.reviewer_name}</h3>
                    <div className="title">{review.reviewer_title}</div>
                  </div>
                </div>

                <div className="review-header">
                  <h2 className="review-title">{review.review_title}</h2>
                  <p className="review-summary">{review.review_summary_line}</p>

                  <div className="review-tags">
                    {highlightTags}
                    {toneTag}
                    {researchTag}
                  </div>

                  <div className="word-count-display">
                    {review.actual_word_count}/{review.target_word_count} words
                  </div>
                </div>

                <div className="review-text">{review.review_text}</div>

                <div className="referenced-studies-section">
                  <h3 className="section-title">Referenced Clinical Studies</h3>
                  <ul className="studies-list">{studiesList}</ul>
                </div>

                <div className="pending-actions">
                  <button
                    className="action-btn accept"
                    onClick={() => acceptPendingReview(index)}
                  >
                    Accept
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => editPendingReview(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => rejectPendingReview(index)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAcceptedReviews = () => {
    if (acceptedReviewsData.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                fill="currentColor"
                d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
              />
            </svg>
          </div>
          <h3 className="empty-state-title">No Accepted Reviews</h3>
          <p className="empty-state-message">
            No reviews have been accepted yet.
          </p>
        </div>
      );
    }

    const review = acceptedReviewsData[currentAcceptedIndex];
    const toneTypeFormatted = formatToneType(review.tone_type);

    const highlightTags = review.highlights.map((highlight) => (
      <span key={highlight} className="tag highlight">
        {highlight}
      </span>
    ));

    const toneTag = <span className="tag tone">{toneTypeFormatted}</span>;
    const researchTag = review.uses_clinical_research ? (
      <span className="tag research">Clinical Research</span>
    ) : null;

    return (
      <div className="carousel-container">
        <button
          className="carousel-btn"
          onClick={() =>
            setCurrentAcceptedIndex(
              (prevIndex) =>
                (prevIndex - 1 + acceptedReviewsData.length) %
                acceptedReviewsData.length
            )
          }
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
            />
          </svg>
        </button>

        <div className="carousel-viewport" ref={carouselViewportRef}>
          <div className="carousel-track" ref={carouselTrackRef}>
            {acceptedReviewsData.map((review, index) => (
              <div
                key={index}
                className={`review-card ${
                  index === currentAcceptedIndex ? "is-active" : ""
                }`}
                onClick={() => openAcceptedReviewModal(review)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-doctor-info">
                  <img
                    src={review.profile_image_url}
                    alt={review.reviewer_name}
                  />
                  <div>
                    <h3>{review.reviewer_name}</h3>
                    <p>{review.reviewer_title}</p>
                  </div>
                </div>

                <h4 className="card-review-title">{review.review_title}</h4>
                <p className="card-review-summary">
                  {review.review_summary_line}
                </p>

                <div className="card-tags">
                  {highlightTags}
                  {toneTag}
                  {researchTag}
                </div>

                <div className="card-word-count">
                  {review.actual_word_count}/{review.target_word_count} words
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="carousel-btn"
          onClick={() =>
            setCurrentAcceptedIndex(
              (prevIndex) => (prevIndex + 1) % acceptedReviewsData.length
            )
          }
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
            />
          </svg>
        </button>
      </div>
    );
  };

  // Accept review: call backend, then update UI
  const acceptPendingReview = async (index: number) => {
    const review = pendingReviewsData[index];

    if (!productId || !review || !review.review_title) return;
    try {
      const response = await fetch("/product_management/update_review_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          review_id: review.review_id, // fallback if no explicit id
          action: "accept",
        }),
      });
      if (!response.ok) throw new Error("Failed to accept review");
      // Optionally handle response
    } catch (err) {
      // Optionally show error toast
    }
    setAcceptedReviewsData((prev) => [...prev, review]);
    setPendingReviewsData((prev) => prev.filter((_, i) => i !== index));
    if (currentPendingIndex >= pendingReviewsData.length - 1) {
      setCurrentPendingIndex(Math.max(0, pendingReviewsData.length - 2));
    }
    setIsAcceptModalOpen(true);
  };

  // Reject review: open modal to get reason, then call backend on submit
  const rejectPendingReview = (index: number) => {
    setCurrentEditingIndex(index);
    setIsRejectModalOpen(true);
  };

  const editPendingReview = (index: number) => {
    setCurrentEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    const review = pendingReviewsData[currentEditingIndex];
    if (!productId || !review || !review.review_title) return;
    try {
      const response = await fetch("/product_management/update_review_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          review_id: review.review_id, // fallback if no explicit id
          action: "reject",
          reason: rejectReason,
        }),
      });
      if (!response.ok) throw new Error("Failed to reject review");
      // Optionally handle response
    } catch (err) {
      // Optionally show error toast
    }
    setPendingReviewsData((prev) =>
      prev.filter((_, i) => i !== currentEditingIndex)
    );
    if (currentPendingIndex >= pendingReviewsData.length - 1) {
      setCurrentPendingIndex(Math.max(0, pendingReviewsData.length - 2));
    }
    setIsRejectModalOpen(false);
    setIsRejectSuccessModalOpen(true);
    setRejectReason("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toneAdjustment.trim()) {
      alert("Please provide a tone adjustment instruction.");
      return;
    }

    setIsGenerating(true);

    try {
      // Call backend to regenerate review
      const originalReview = pendingReviewsData[currentEditingIndex];
      const response = await fetch(
        "/product_metadata_extraction/regenerate_review",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            review_id: originalReview.review_id,
            target_word_count: selectedWordCount,
            tone_adjustment: toneAdjustment,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to regenerate review");
      const data = await response.json();

      setRegeneratedReviewText(data.regenerated_review_text);
      setIsRegeneratedModalOpen(true);
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Error generating edited review. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Accept regenerated review
  const acceptRegeneratedReview = async () => {
    if (
      regeneratedReviewText &&
      currentEditingIndex >= 0 &&
      productId &&
      pendingReviewsData[currentEditingIndex]
    ) {
      const review = pendingReviewsData[currentEditingIndex];
      try {
        const response = await fetch(
          "/product_metadata_extraction/save_regenerated_review",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: productId,
              review_id: review.review_id,
              regenerated_review_text: regeneratedReviewText,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to save regenerated review");
        // Optionally handle response or show a success message
        setPendingReviewsData((prev) =>
          prev.map((r, idx) =>
            idx === currentEditingIndex
              ? {
                  ...r,
                  review_text: regeneratedReviewText,
                  review_title: r.review_title + " (Edited)",
                  actual_word_count: selectedWordCount,
                  target_word_count: selectedWordCount,
                }
              : r
          )
        );
      } catch (error) {
        alert("Error saving regenerated review. Please try again.");
      }
    }
    setIsRegeneratedModalOpen(false);
    setRegeneratedReviewText(null);
    setCurrentEditingIndex(-1);
    setToneAdjustment("");
  };

  // Reject regenerated review (close modal, keep original)
  const rejectRegeneratedReview = () => {
    setIsRegeneratedModalOpen(false);
    setRegeneratedReviewText(null);
  };

  const useUpdatedVersion = () => {
    if (updatedReviewData && currentEditingIndex >= 0) {
      setPendingReviewsData((prev) =>
        prev.map((review, index) =>
          index === currentEditingIndex ? updatedReviewData : review
        )
      );
      setIsEditSuccessModalOpen(false);
      setUpdatedReviewData(null);
    }
  };

  const openAcceptedReviewModal = (review: ReviewData) => {
    setSelectedAcceptedReview(review);
    setIsAcceptedReviewModalOpen(true);
  };

  const closeAllModals = () => {
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setIsRejectSuccessModalOpen(false);
    setIsEditModalOpen(false);
    setIsEditSuccessModalOpen(false);
    setIsAcceptedReviewModalOpen(false);
    setCurrentEditingIndex(-1);
    setUpdatedReviewData(null);
    setSelectedAcceptedReview(null);
    setToneAdjustment("");
    setRejectReason("");
    setSelectedWordCount(100);
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

      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Generated Review Templates</h1>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab-button ${
                  activeTab === "pending" ? "active" : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending Reviews
              </button>
              <button
                className={`tab-button ${
                  activeTab === "accepted" ? "active" : ""
                }`}
                onClick={() => setActiveTab("accepted")}
              >
                Accepted Reviews
              </button>
            </div>
          </div>

          <div className="tab-content active">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading reviews...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      fill="currentColor"
                      d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
                    />
                  </svg>
                </div>
                <h3 className="error-title">Error Loading Reviews</h3>
                <p className="error-message">{error}</p>
                <button
                  className="retry-button"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : activeTab === "pending" ? (
              renderPendingReviews()
            ) : (
              renderAcceptedReviews()
            )}
          </div>
        </div>
      </main>

      {/* Accept Success Modal */}
      <div className={`modal ${isAcceptModalOpen ? "is-visible" : ""}`}>
        <div className="modal-content small">
          <button className="modal-close" onClick={closeAllModals}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
                />
              </svg>
            </div>
            <h2 className="success-title">Review Accepted!</h2>
            <p className="success-message">
              The review has been moved to the accepted reviews section.
            </p>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <div className={`modal ${isRejectModalOpen ? "is-visible" : ""}`}>
        <div className="modal-content small">
          <button className="modal-close" onClick={closeAllModals}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <form className="reject-form" onSubmit={handleRejectSubmit}>
              <h2 className="reject-title">Reject Review</h2>
              <div className="form-group">
                <label className="form-label">Reason for rejection:</label>
                <textarea
                  className="form-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this review..."
                  required
                />
              </div>
              <button type="submit" className="form-submit">
                Submit Rejection
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Reject Success Modal */}
      <div className={`modal ${isRejectSuccessModalOpen ? "is-visible" : ""}`}>
        <div className="modal-content small">
          <button className="modal-close" onClick={closeAllModals}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
                />
              </svg>
            </div>
            <h2 className="success-title">Review Rejected</h2>
            <p className="success-message">
              The review has been removed from the pending reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <div className={`modal ${isEditModalOpen ? "is-visible" : ""}`}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeAllModals}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <form className="edit-form" onSubmit={handleEditSubmit}>
              <h2 className="edit-title">Edit Review</h2>

              <div className="current-review-preview">
                <div className="preview-title">Current Review:</div>
                <div id="current-review-content">
                  {currentEditingIndex >= 0 &&
                    pendingReviewsData[currentEditingIndex] && (
                      <>
                        <strong>
                          {pendingReviewsData[currentEditingIndex].review_title}
                        </strong>{" "}
                        (
                        {
                          pendingReviewsData[currentEditingIndex]
                            .actual_word_count
                        }{" "}
                        words)
                        <br />
                        <br />
                        {pendingReviewsData[currentEditingIndex].review_text}
                      </>
                    )}
                </div>
                <div className="editing-animation">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <div className="editing-text">
                    Generating updated review...
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target word count:</label>
                <div className="word-count-options">
                  {[60, 80, 100, 120, 150].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={`word-count-btn ${
                        selectedWordCount === count ? "active" : ""
                      }`}
                      onClick={() => setSelectedWordCount(count)}
                    >
                      {count} words
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tone adjustment:</label>
                <input
                  type="text"
                  className="form-input"
                  value={toneAdjustment}
                  onChange={(e) => setToneAdjustment(e.target.value)}
                  placeholder="e.g., make this more formal, casual, scientific, warm, professional..."
                />
              </div>

              <div className="form-row">
                <button
                  type="button"
                  className="form-submit"
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form-submit primary"
                  disabled={isGenerating}
                >
                  {isGenerating && <span className="loading-spinner"></span>}
                  {isGenerating ? "Generating..." : "Generate Edited Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Success Modal */}
      <div className={`modal ${isEditSuccessModalOpen ? "is-visible" : ""}`}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeAllModals}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
                />
              </svg>
            </div>
            <h2 className="success-title">Review Updated!</h2>
            <div className="current-review-preview">
              {updatedReviewData && (
                <>
                  <div className="preview-title">
                    Updated Review ({updatedReviewData.actual_word_count}{" "}
                    words):
                  </div>
                  <strong>{updatedReviewData.review_title}</strong>
                  <br />
                  <br />
                  {updatedReviewData.review_text}
                </>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-md)",
                justifyContent: "center",
                marginTop: "var(--spacing-lg)",
              }}
            >
              <button className="form-submit" onClick={closeAllModals}>
                Keep Original
              </button>
              <button
                className="form-submit primary"
                onClick={useUpdatedVersion}
              >
                Use Updated Version
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accepted Review Modal */}
      <div
        className={`modal ${isAcceptedReviewModalOpen ? "is-visible" : ""}`}
        onClick={closeAllModals}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeAllModals}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <h2 className="modal-title">Accepted Review Details</h2>
            {selectedAcceptedReview && (
              <>
                <div className="doctor-info">
                  <img
                    src={selectedAcceptedReview.profile_image_url}
                    alt={selectedAcceptedReview.reviewer_name}
                  />
                  <div>
                    <h3>{selectedAcceptedReview.reviewer_name}</h3>
                    <p>{selectedAcceptedReview.reviewer_title}</p>
                  </div>
                </div>

                <h4 className="card-review-title">
                  {selectedAcceptedReview.review_title}
                </h4>
                <p className="card-review-summary">
                  {selectedAcceptedReview.review_summary_line}
                </p>

                <div className="card-tags">
                  {selectedAcceptedReview.highlights.map((highlight) => (
                    <span key={highlight} className="tag highlight">
                      {highlight}
                    </span>
                  ))}
                  <span className="tag tone">
                    {formatToneType(selectedAcceptedReview.tone_type)}
                  </span>
                  {selectedAcceptedReview.uses_clinical_research && (
                    <span className="tag research">Clinical Research</span>
                  )}
                </div>

                <div className="card-word-count">
                  {selectedAcceptedReview.actual_word_count}/
                  {selectedAcceptedReview.target_word_count} words
                </div>

                <div className="review-text">
                  {selectedAcceptedReview.review_text}
                </div>

                <div className="referenced-studies-section">
                  <h3 className="section-title">Referenced Clinical Studies</h3>
                  <ul className="studies-list">
                    {selectedAcceptedReview.referenced_studies.map(
                      (url, index) => (
                        <li key={index} className="study-item">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="study-link"
                          >
                            {url}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Regenerated Review Modal */}
      <div className={`modal ${isRegeneratedModalOpen ? "is-visible" : ""}`}>
        <div className="modal-content">
          <button className="modal-close" onClick={rejectRegeneratedReview}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <div className="modal-body">
            <h2 className="modal-title">Regenerated Review</h2>
            <div className="current-review-preview">
              <div className="preview-title">
                Updated Review ({selectedWordCount} words):
              </div>
              <strong>
                {currentEditingIndex >= 0 &&
                  pendingReviewsData[currentEditingIndex]?.review_title +
                    " (Edited)"}
              </strong>
              <br />
              <br />
              {regeneratedReviewText}
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-md)",
                justifyContent: "center",
                marginTop: "var(--spacing-lg)",
              }}
            >
              <button className="form-submit" onClick={rejectRegeneratedReview}>
                Reject
              </button>
              <button
                className="form-submit primary"
                onClick={acceptRegeneratedReview}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default ReviewResults;
