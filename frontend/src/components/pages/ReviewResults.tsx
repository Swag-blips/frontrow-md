import React, { useState, useEffect, useRef } from "react";
import "../styling/ReviewResults.css";

interface ResearchItem {
  title: string;
  source: string;
  url: string;
  excerpt: string;
}

interface ReviewData {
  doctorName: string;
  doctorImg: string;
  reviewTitle: string;
  reviewText: string;
  research: ResearchItem[];
  prompt: string;
}

const ReviewResults: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isRejectSuccessModalOpen, setIsRejectSuccessModalOpen] =
    useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEditSuccessModalOpen, setIsEditSuccessModalOpen] =
    useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(-1);
  const [selectedWordCount, setSelectedWordCount] = useState<number>(100);
  const [editInstructions, setEditInstructions] = useState<string>("");
  const [updatedReviewData, setUpdatedReviewData] = useState<ReviewData | null>(
    null
  );
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const carouselViewportRef = useRef<HTMLDivElement>(null);

  // Demo data - in real app, this would come from API or props
  const reviewsData: ReviewData[] = [
    {
      doctorName: "Dr. Evelyn Reed",
      doctorImg:
        "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400",
      reviewTitle: "A Breakthrough in Photoprotection",
      reviewText: `<p>As a dermatologist, I consistently emphasize the importance of daily sun protection. However, the stability and efficacy of topical antioxidants can be a significant concern. This serum addresses that issue head-on.</p><p>I often recommend this to patients looking to boost their defense against environmental aggressors. The formulation, which combines 15% L-Ascorbic Acid with 1% Vitamin E and 0.5% Ferulic Acid, is supported by strong clinical evidence showing it not only stabilizes the vitamins but also doubles the photoprotection of the skin. It's an excellent addition to any morning skincare routine after cleansing and before moisturizing and sunscreen.</p>`,
      research: [
        {
          title:
            "Ferulic acid stabilizes a solution of vitamins C and E and doubles its photoprotection of skin.",
          source: "Journal of Investigative Dermatology",
          url: "#",
          excerpt:
            "This study demonstrates that a solution of 15% L-ascorbic acid, 1% alpha-tocopherol, and 0.5% ferulic acid provides a significant eight-fold increase in photoprotection against solar-simulated radiation.",
        },
      ],
      prompt: `Generate a review from a dermatologist focusing on the product's photoprotective qualities. Emphasize the stability of the Vitamin C formula due to Ferulic Acid. Mention the key study: "Ferulic acid stabilizes a solution...". Tone: Clinical, reassuring, and educational.`,
    },
    {
      doctorName: "Dr. Marcus Chen",
      doctorImg:
        "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400",
      reviewTitle: "Hydration is Key to Healthy Skin",
      reviewText: `<p>Many of my patients struggle with dehydrated skin, which can exacerbate fine lines and lead to a dull complexion. This product is one of my top recommendations for restoring that crucial moisture barrier.</p><p>The inclusion of Hyaluronic Acid is what makes it so effective. This molecule is a powerhouse of hydration, capable of holding many times its weight in water. By incorporating this serum into your daily regimen, you are actively helping your skin retain the moisture it needs to look plump, healthy, and resilient. It's suitable for most skin types and layers well with other products.</p>`,
      research: [
        {
          title: "The Role of Hyaluronic Acid in Skin Health and Rejuvenation",
          source: "Dermato-Endocrinology",
          url: "#",
          excerpt:
            "Hyaluronic acid's unique capacity to retain water makes it a key component in maintaining skin hydration, elasticity, and volume.",
        },
      ],
      prompt: `Generate a review from a primary care physician focusing on hydration. Explain the role of Hyaluronic Acid in simple terms for a patient. Tone: Warm, approachable, and focused on patient outcomes (plump, healthy skin).`,
    },
    {
      doctorName: "Dr. Anya Sharma",
      doctorImg:
        "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400",
      reviewTitle: "Optimizing Vitamin C Delivery",
      reviewText: `<p>Patients often ask if expensive Vitamin C serums are worth it. My answer always depends on the formulation. For Vitamin C to be effective, it needs to be able to penetrate the skin, and that's where this product excels.</p><p>Clinical studies on percutaneous absorption have shown that an acidic pH is critical for topical L-Ascorbic Acid to be effective. This serum is formulated at an optimal pH, which means you're not just applying a nice ingredient, you're applying one that can actually get to where it needs to go to provide antioxidant benefits. I appreciate the science-first approach to its design.</p>`,
      research: [
        {
          title: "Topical L-Ascorbic Acid: Percutaneous Absorption Studies",
          source: "Dermatologic Surgery",
          url: "#",
          excerpt:
            "Maximum absorption was achieved with a 20% vitamin C concentration... an acidic pH (below 3.5) is required for optimal percutaneous absorption.",
        },
      ],
      prompt: `Generate a review from a scientific, detail-oriented doctor. Focus on the importance of formulation and pH for Vitamin C absorption, referencing the "Percutaneous Absorption Studies". Tone: Technical but clear, precise, and authoritative.`,
    },
    {
      doctorName: "Dr. Ben Carter",
      doctorImg:
        "https://images.pexels.com/photos/8442533/pexels-photo-8442533.jpeg?auto=compress&cs=tinysrgb&w=400",
      reviewTitle: "A Gentle Giant for Skin Health",
      reviewText: `<p>In my practice, I see many patients with sensitive skin who are wary of trying active ingredients. This serum is a product I feel confident recommending for them to try.</p><p>While it is a potent antioxidant cocktail, the formulation is elegant and generally well-tolerated. The combination of ingredients works synergistically not just to protect the skin, but also to calm and support it. Patients report that over time their skin feels less reactive and looks healthier. It's a fantastic, gentle entry point into using targeted serums for long-term skin health.</p>`,
      research: [],
      prompt: `Generate a review from a family doctor for patients with sensitive skin. The focus should be on the product being "well-tolerated" and "gentle" despite being potent. Tone: Caring, gentle, and reassuring.`,
    },
    {
      doctorName: "Dr. Olivia Martinez",
      doctorImg:
        "https://images.pexels.com/photos/5794711/pexels-photo-5794711.jpeg?auto=compress&cs=tinysrgb&w=400",
      reviewTitle: "The Foundation of a Solid Routine",
      reviewText: `<p>When building a skincare routine, there are a few foundational pillars I recommend: cleansing, moisturizing, and sun protection. For those looking to elevate their routine, an antioxidant serum like this is the next logical step.</p><p>It provides a crucial layer of defense that sunscreen alone cannot. By neutralizing free radicals from UV and environmental exposure, it helps prevent the breakdown of collagen and supports the skin's natural repair processes. Think of it as an insurance policy for your skin's future health and appearance. This is a solid, evidence-based choice.</p>`,
      research: [
        {
          title: "Ferulic acid stabilizes a solution of vitamins C and E...",
          source: "Journal of Investigative Dermatology",
          url: "#",
          excerpt:
            "This study demonstrates that a solution of 15% L-ascorbic acid, 1% alpha-tocopherol, and 0.5% ferulic acid provides a significant eight-fold increase in photoprotection against solar-simulated radiation.",
        },
        {
          title: "The Role of Hyaluronic Acid in Skin Health...",
          source: "Dermato-Endocrinology",
          url: "#",
          excerpt:
            "Hyaluronic acid's unique capacity to retain water makes it a key component in maintaining skin hydration, elasticity, and volume.",
        },
      ],
      prompt: `Generate a review from a holistic health practitioner. Frame the product as a "foundational" part of a complete skincare routine, complementing sunscreen. Explain the concept of neutralizing free radicals in a simple, analogy-driven way. Tone: Holistic, preventative, and encouraging.`,
    },
  ];

  const updateCarousel = () => {
    if (!carouselTrackRef.current || !carouselViewportRef.current) return;

    const cards = carouselTrackRef.current.children;
    if (cards.length === 0) return;

    const cardWidth = (cards[0] as HTMLElement).offsetWidth;
    const gap = 20; // Corresponds to margin: 0 10px
    const viewportWidth = carouselViewportRef.current.offsetWidth;
    const offset =
      -currentIndex * (cardWidth + gap) + (viewportWidth / 2 - cardWidth / 2);

    carouselTrackRef.current.style.transform = `translateX(${offset}px)`;
  };

  useEffect(() => {
    updateCarousel();

    const handleResize = () => updateCarousel();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex]);

  const showNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewsData.length);
  };

  const showPrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + reviewsData.length) % reviewsData.length
    );
  };

  const openModal = (index: number) => {
    setSelectedReview(reviewsData[index]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const acceptReview = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedReview(reviewsData[index]);
    setIsAcceptModalOpen(true);
  };

  const rejectReview = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedReview(reviewsData[index]);
    setIsRejectModalOpen(true);
  };

  const editReview = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentEditingIndex(index);
    setSelectedReview(reviewsData[index]);
    setIsEditModalOpen(true);
  };

  const handleRejectSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In real app, send rejection data to API
    setIsRejectModalOpen(false);
    setIsRejectSuccessModalOpen(true);
  };

  const handleEditSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In real app, send edit request to API
    // For demo, simulate generating new content
    const currentReview = reviewsData[currentEditingIndex];
    const wordCount = countWords(currentReview.reviewText);

    // Simulate generating updated content
    const simulatedUpdate = {
      ...currentReview,
      reviewText: `<p>Updated review content with approximately ${selectedWordCount} words...</p><p>This would be the AI-generated content based on your editing instructions: "${editInstructions}"</p>`,
    };

    setUpdatedReviewData(simulatedUpdate);
    setIsEditModalOpen(false);
    setIsEditSuccessModalOpen(true);
  };

  const countWords = (text: string): number => {
    return text
      .replace(/<[^>]*>/g, "")
      .trim()
      .split(/\s+/).length;
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const isAnyModalOpen =
      isModalOpen ||
      isAcceptModalOpen ||
      isRejectModalOpen ||
      isRejectSuccessModalOpen ||
      isEditModalOpen ||
      isEditSuccessModalOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isModalOpen,
    isAcceptModalOpen,
    isRejectModalOpen,
    isRejectSuccessModalOpen,
    isEditModalOpen,
    isEditSuccessModalOpen,
  ]);

  const getShortText = (fullText: string): string => {
    return fullText.split("</p>")[0].replace("<p>", "") + "...";
  };

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsAcceptModalOpen(false);
    setIsRejectModalOpen(false);
    setIsRejectSuccessModalOpen(false);
    setIsEditModalOpen(false);
    setIsEditSuccessModalOpen(false);
    setSelectedReview(null);
    setCurrentEditingIndex(-1);
    setEditInstructions("");
    setUpdatedReviewData(null);
  };

  return (
    <>
      <header className="header">
        <div className="container header__container">
          <a href="/" className="logo">
            <span className="logo__icon">+</span>
            <span>FrontrowMD</span>
          </a>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Generated Review Templates</h1>
          </header>

          <div className="carousel-container">
            <button className="carousel-btn" onClick={showPrev}>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                />
              </svg>
            </button>

            <div className="carousel-viewport" ref={carouselViewportRef}>
              <div className="carousel-track" ref={carouselTrackRef}>
                {reviewsData.map((review, index) => (
                  <div
                    key={index}
                    className={`review-card ${
                      index === currentIndex ? "is-active" : ""
                    }`}
                    onClick={() => openModal(index)}
                  >
                    <div className="card-actions">
                      <button
                        className="edit-icon"
                        onClick={(e) => editReview(index, e)}
                        aria-label="Edit review"
                      >
                        <svg viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M5.92,19.08L5.92,19.08L18.88,6.12"
                          />
                        </svg>
                      </button>
                      <button
                        className="action-btn accept"
                        onClick={(e) => acceptReview(index, e)}
                      >
                        Accept
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={(e) => rejectReview(index, e)}
                      >
                        Reject
                      </button>
                    </div>
                    <div className="doctor-info">
                      <img src={review.doctorImg} alt={review.doctorName} />
                      <span className="name">{review.doctorName}</span>
                    </div>
                    <h2 className="review-card__title">{review.reviewTitle}</h2>
                    <p className="review-card__text">
                      {getShortText(review.reviewText)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button className="carousel-btn" onClick={showNext}>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Main Review Modal */}
      {isModalOpen && selectedReview && (
        <div className="modal is-visible" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
            <div className="modal-body">
              <div className="doctor-info">
                <img
                  src={selectedReview.doctorImg}
                  alt={selectedReview.doctorName}
                />
                <span className="name">{selectedReview.doctorName}</span>
              </div>
              <h2 className="review-card__title">
                {selectedReview.reviewTitle}
              </h2>
              <div
                className="modal-review-text"
                dangerouslySetInnerHTML={{ __html: selectedReview.reviewText }}
              />

              <h3 className="modal-section-title">Supporting Research</h3>
              <ul className="modal-research-list">
                {selectedReview.research.length > 0 ? (
                  selectedReview.research.map((item, index) => (
                    <li key={index}>
                      <div className="modal-research-card">
                        <h4 className="modal-research-card__title">
                          {item.title}
                        </h4>
                        <p className="modal-research-card__source">
                          Source:{" "}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.source}
                          </a>
                        </p>
                        <p className="modal-research-card__excerpt">
                          {item.excerpt}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>No specific studies cited for this review.</li>
                )}
              </ul>

              <h3 className="modal-section-title">Generation Prompt</h3>
              <pre className="prompt-display">{selectedReview.prompt}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {isAcceptModalOpen && (
        <div
          className="modal is-visible"
          onClick={() => setIsAcceptModalOpen(false)}
        >
          <div
            className="modal-content small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsAcceptModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
            <div className="modal-body">
              <div className="success-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" />
                </svg>
              </div>
              <h2 className="success-title">Review Accepted!</h2>
              <p className="success-message">
                This review has been successfully added to your approved content
                library.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div
          className="modal is-visible"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div
            className="modal-content small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsRejectModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
            <div className="modal-body">
              <h2 className="reject-title">Reject Review</h2>
              <form className="reject-form" onSubmit={handleRejectSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Why are you rejecting this review? (Optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Please provide feedback to help improve future generations..."
                    rows={4}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsRejectModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Reject Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Success Modal */}
      {isRejectSuccessModalOpen && (
        <div
          className="modal is-visible"
          onClick={() => setIsRejectSuccessModalOpen(false)}
        >
          <div
            className="modal-content small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsRejectSuccessModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
            <div className="modal-body">
              <div className="success-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" />
                </svg>
              </div>
              <h2 className="success-title">Feedback Submitted</h2>
              <p className="success-message">
                Thank you for your feedback. We'll use this to improve future
                review generations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedReview && (
        <div
          className="modal is-visible"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setIsEditModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
            <div className="modal-body">
              <h2 className="edit-title">Edit Review</h2>

              <h3 className="modal-section-title">Current Review</h3>
              <div className="current-review-content">
                <strong>{selectedReview.reviewTitle}</strong> (
                {countWords(selectedReview.reviewText)} words)
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedReview.reviewText,
                  }}
                />
              </div>

              <form className="edit-form" onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label className="form-label">Target Word Count</label>
                  <div className="word-count-options">
                    {[50, 75, 100, 125, 150].map((count) => (
                      <button
                        key={count}
                        type="button"
                        className={`word-count-btn ${
                          selectedWordCount === count ? "active" : ""
                        }`}
                        onClick={() => setSelectedWordCount(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Editing Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    placeholder="Describe what changes you'd like to make to this review..."
                    rows={4}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Generate Edit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {isEditSuccessModalOpen && updatedReviewData && (
        <div
          className="modal is-visible"
          onClick={() => setIsEditSuccessModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setIsEditSuccessModalOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
            <div className="modal-body">
              <h2 className="edit-title">Review Edit Results</h2>

              <div className="edit-comparison">
                <div className="comparison-section">
                  <h3>Original Review</h3>
                  <div
                    className="review-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedReview?.reviewText || "",
                    }}
                  />
                </div>

                <div className="comparison-section">
                  <h3>
                    Updated Review ({countWords(updatedReviewData.reviewText)}{" "}
                    words)
                  </h3>
                  <div
                    className="review-content"
                    dangerouslySetInnerHTML={{
                      __html: updatedReviewData.reviewText,
                    }}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-secondary" onClick={closeAllModals}>
                  Keep Original
                </button>
                <button className="btn btn-primary" onClick={closeAllModals}>
                  Use Updated Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default ReviewResults;
