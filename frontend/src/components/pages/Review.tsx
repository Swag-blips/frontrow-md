import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '@/components/styling/Review.css';

// Define interfaces for our data structures
interface ClinicianReview {
    review_text: string;
    reviewer_name: string;
    reviewer_title: string;
    research_citations?: ResearchCitation[];
    methodology?: string;
    prompt?: string;
}

interface ResearchCitation {
    title: string;
    source: string;
    source_url: string;
    excerpt: string;
}

interface Product {
    product_id: string;
    product_name: string;
    product_description: string;
    clinician_reviews: ClinicianReview[];
    created_time: number;
}

// Placeholder data
const placeholderProduct: Product = {
    product_id: "placeholder-1",
    product_name: "Example Medical Product",
    product_description: "A revolutionary medical device designed to improve patient outcomes.",
    created_time: Date.now(),
    clinician_reviews: [
        {
            reviewer_name: "Dr. Sarah Johnson",
            reviewer_title: "Cardiologist",
            review_text: "This innovative product represents a significant advancement in patient care. The clinical trials demonstrate remarkable efficacy, with a 40% improvement in patient outcomes compared to standard treatments. The safety profile is excellent, and the ease of use makes it particularly valuable in clinical settings. I've observed consistent positive results in my practice, especially in cases where traditional approaches were limited.",
            research_citations: [
                {
                    title: "Clinical Efficacy Study 2023",
                    source: "Journal of Medical Innovation",
                    source_url: "#",
                    excerpt: "A comprehensive study involving 500 patients showed significant improvement in treatment outcomes..."
                },
                {
                    title: "Safety Analysis Report",
                    source: "Medical Device Safety Journal",
                    source_url: "#",
                    excerpt: "Long-term safety analysis over 24 months demonstrated excellent tolerability..."
                }
            ],
            methodology: "The review was generated using a comprehensive analysis of clinical trial data, real-world evidence, and expert clinical experience. The methodology included evaluation of safety profiles, efficacy metrics, and practical implementation considerations.",
            prompt: "Generate a detailed clinical review of [Product Name] focusing on efficacy, safety, and practical applications in clinical settings. Include specific data points from recent studies and real-world experience."
        },
        {
            reviewer_name: "Dr. Michael Chen",
            reviewer_title: "Neurologist",
            review_text: "As a practicing neurologist, I find this product to be a game-changer in our field. The precision and reliability it offers have transformed how we approach certain conditions. The integration of advanced technology with clinical practice has been seamless, and patient feedback has been overwhelmingly positive. The supporting research is robust, with multiple studies confirming its effectiveness.",
            research_citations: [
                {
                    title: "Neurological Applications Study",
                    source: "Neurology Today",
                    source_url: "#",
                    excerpt: "Study of 300 neurological cases showed improved diagnostic accuracy and treatment outcomes..."
                }
            ],
            methodology: "This review was developed through analysis of peer-reviewed studies, clinical trial data, and practical implementation experience. Special attention was given to neurological applications and patient outcomes.",
            prompt: "Create a clinical review of [Product Name] from a neurological perspective, emphasizing practical applications and patient outcomes in neurological care."
        }
    ]
};

const Review: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedReview, setSelectedReview] = useState<ClinicianReview | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    
    const product = placeholderProduct;
    const reviews = product.clinician_reviews;

    const handlePrev = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : reviews.length - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
    };

    const openModal = (review: ClinicianReview) => {
        setSelectedReview(review);
    };

    const closeModal = () => {
        setSelectedReview(null);
    };

    // Update carousel position when active index changes
    React.useEffect(() => {
        if (trackRef.current && trackRef.current.children.length > 0) {
            const cardWidth = trackRef.current.children[0].clientWidth;
            const gap = 20; // as in margin: 0 10px;
            trackRef.current.style.transform = `translateX(-${activeIndex * (cardWidth + gap)}px)`;
        }
    }, [activeIndex, reviews]);

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
                        <h1 className="page-title">Generated Reviews for {product.product_name}</h1>
                    </div>
                    <div className="carousel-container">
                        <button onClick={handlePrev} className="carousel-btn" disabled={reviews.length <= 1}>
                            &lt;
                        </button>
                        <div className="carousel-viewport">
                            <div className="carousel-track" ref={trackRef}>
                                {reviews.map((review, index) => (
                                    <div key={index} className={`review-card ${index === activeIndex ? 'is-active' : ''}`} onClick={() => openModal(review)}>
                                        <div className="doctor-info">
                                            <img src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt={review.reviewer_name} />
                                            <span className="name">{review.reviewer_name}, {review.reviewer_title}</span>
                                        </div>
                                        <p className="review-card__text">{review.review_text.substring(0, 150)}...</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleNext} className="carousel-btn" disabled={reviews.length <= 1}>
                            &gt;
                        </button>
                    </div>
                </div>
            </main>

            {selectedReview && (
                <div className="modal is-visible">
                    <div className="modal-content">
                        <button onClick={closeModal} className="modal-close">&times;</button>
                        <div className="modal-body">
                            <div className="doctor-info">
                                <img src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt={selectedReview.reviewer_name} />
                                <span className="name">{selectedReview.reviewer_name}, {selectedReview.reviewer_title}</span>
                            </div>

                            <h2 className="modal-section-title">Full Review</h2>
                            <div id="modal-review-text">
                                <p>{selectedReview.review_text}</p>
                            </div>

                            {selectedReview.research_citations && selectedReview.research_citations.length > 0 && (
                                <>
                                    <h2 className="modal-section-title">Supporting Research</h2>
                                    <ul id="modal-research-list">
                                        {selectedReview.research_citations.map((citation, index) => (
                                            <li key={index} className="modal-research-card">
                                                <h3 className="modal-research-card__title">{citation.title}</h3>
                                                <div className="modal-research-card__source">
                                                    Source: <a href={citation.source_url} target="_blank" rel="noopener noreferrer">{citation.source}</a>
                                                </div>
                                                <p className="modal-research-card__excerpt">{citation.excerpt}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {selectedReview.methodology && (
                                <>
                                    <h2 className="modal-section-title">Methodology</h2>
                                    <div className="methodology-section">
                                        <p>{selectedReview.methodology}</p>
                                    </div>
                                </>
                            )}

                            {selectedReview.prompt && (
                                <>
                                    <h2 className="modal-section-title">Review Generation Prompt</h2>
                                    <div className="prompt-display">
                                        <pre>{selectedReview.prompt}</pre>
                                    </div>
                                </>
                            )}
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

export default Review; 