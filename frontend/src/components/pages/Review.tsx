import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '@/components/styling/Review.css';

// Define interfaces for our data structures
interface ClinicianReview {
    review_text: string;
    reviewer_name: string;
    reviewer_title: string;
}

interface GeneratedReview {
    highlights: string[];
    rating: number;
    review_text: string;
    review_title: string;
    reviewer_name: string;
    reviewer_title: string;
}

interface Product {
    product_id: string;
    product_name: string;
    product_description: string;
    product_image_url: string;
    product_url?: string;
    clinician_reviews: ClinicianReview[];
    generated_reviews: GeneratedReview[];
    created_time: number;
}

const Review: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedReview, setSelectedReview] = useState<ClinicianReview | GeneratedReview | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'clinician' | 'generated'>('clinician');
    const trackRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            try {
                console.log('Fetching all products to find product:', productId);
                const allProductsResponse = await fetch('/frontrowmd/products', {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!allProductsResponse.ok) {
                    throw new Error(`Failed to fetch products: ${allProductsResponse.status}`);
                }
                
                const allProductsData = await allProductsResponse.json();
                console.log('All products data:', allProductsData);
                
                // Check if products array exists and is not empty
                if (!allProductsData.products || !Array.isArray(allProductsData.products) || allProductsData.products.length === 0) {
                    throw new Error('No products found in the database. The database may have been cleared.');
                }
                
                // Find the specific product
                const product = allProductsData.products.find((p: any) => p.product_id === productId);
                if (product) {
                    console.log('Found product:', product);
                    console.log('Clinician reviews:', product.clinician_reviews);
                    console.log('Generated reviews:', product.generated_reviews);
                    setProduct(product);
                    setError(null);
                } else {
                    throw new Error(`Product with ID ${productId} not found. It may have been removed from the database.`);
                }
            } catch (err: any) {
                console.error('Error fetching product:', err);
                setError(err.message || 'Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handlePrev = () => {
        const reviewsLength = activeTab === 'clinician' 
            ? product?.clinician_reviews?.length || 0
            : product?.generated_reviews?.length || 0;
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : reviewsLength - 1));
    };

    const handleNext = () => {
        const reviewsLength = activeTab === 'clinician'
            ? product?.clinician_reviews?.length || 0
            : product?.generated_reviews?.length || 0;
        setActiveIndex((prev) => (prev < reviewsLength - 1 ? prev + 1 : 0));
    };

    const openModal = (review: ClinicianReview | GeneratedReview) => {
        setSelectedReview(review);
    };

    const closeModal = () => {
        setSelectedReview(null);
    };

    // Update carousel position when active index changes
    useEffect(() => {
        if (trackRef.current && trackRef.current.children.length > 0) {
            const cardWidth = trackRef.current.children[0].clientWidth;
            const gap = 20; // as in margin: 0 10px;
            trackRef.current.style.transform = `translateX(-${activeIndex * (cardWidth + gap)}px)`;
        }
    }, [activeIndex, product, activeTab]);

    const isGeneratedReview = (review: ClinicianReview | GeneratedReview): review is GeneratedReview => {
        return 'rating' in review && 'highlights' in review && 'review_title' in review;
    };

    // Function to get a consistent but different image for each reviewer
    const getReviewerImage = (reviewerName: string) => {
        // Use a hash of the reviewer name to select from a set of doctor images
        const images = [
            'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/3845811/pexels-photo-3845811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/3845812/pexels-photo-3845812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            'https://images.pexels.com/photos/3845813/pexels-photo-3845813.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ];
        
        // Create a simple hash of the reviewer name
        const hash = reviewerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return images[hash % images.length];
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading review data...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="error-screen">
                <div className="error-content">
                    <h1>Oops! Something went wrong</h1>
                    <p className="error-message">{error || 'Product not found'}</p>
                    <p className="error-help">
                        {error?.includes('database') || error?.includes('cleared') 
                            ? 'The database has been cleared. Please generate new reviews for this product.'
                            : 'The product you\'re looking for may have been removed or is no longer available.'}
                    </p>
                    <div className="error-actions">
                        <Link to="/product-input" className="button-primary orange">
                            Return to Homepage
                        </Link>
                        {error?.includes('database') || error?.includes('cleared') ? (
                            <Link to={`/product-input?url=${encodeURIComponent(product?.product_url || '')}`} className="button-secondary">
                                Generate New Reviews
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    const reviews = activeTab === 'clinician' ? product.clinician_reviews : product.generated_reviews;

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
                        <h1 className="page-title">Reviews for {product.product_name}</h1>
                        <div className="review-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'clinician' ? 'active' : ''}`}
                                onClick={() => setActiveTab('clinician')}
                            >
                                Clinician Reviews
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'generated' ? 'active' : ''}`}
                                onClick={() => setActiveTab('generated')}
                            >
                                Generated Reviews
                            </button>
                        </div>
                    </div>

                    <div className="carousel-container">
                        <button onClick={handlePrev} className="carousel-btn" disabled={reviews.length <= 1}>
                            &lt;
                        </button>
                        <div className="carousel-viewport">
                            <div className="carousel-track" ref={trackRef}>
                                {reviews.map((review, index) => (
                                    <div 
                                        key={index} 
                                        className={`review-card ${index === activeIndex ? 'is-active' : ''}`} 
                                        onClick={() => openModal(review)}
                                    >
                                        <div className="doctor-info">
                                            <img 
                                                src={getReviewerImage(review.reviewer_name)}
                                                alt={review.reviewer_name} 
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                                                }}
                                            />
                                            <span className="name">
                                                {review.reviewer_name}, {review.reviewer_title}
                                                {isGeneratedReview(review) && (
                                                    <span className="rating">
                                                        {'★'.repeat(Math.floor(review.rating))}
                                                        {'☆'.repeat(5 - Math.floor(review.rating))}
                                                        <span className="rating-number">{review.rating}</span>
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {isGeneratedReview(review) && (
                                            <h3 className="review-title">{review.review_title}</h3>
                                        )}
                                        <p className="review-card__text">
                                            {review.review_text.substring(0, 150)}...
                                        </p>
                                        {isGeneratedReview(review) && review.highlights.length > 0 && (
                                            <div className="review-highlights">
                                                {review.highlights.map((highlight, i) => (
                                                    <span key={i} className="highlight-tag">{highlight}</span>
                                                ))}
                                            </div>
                                        )}
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
                                <img 
                                    src={getReviewerImage(selectedReview.reviewer_name)}
                                    alt={selectedReview.reviewer_name}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                                    }}
                                />
                                <span className="name">
                                    {selectedReview.reviewer_name}, {selectedReview.reviewer_title}
                                    {isGeneratedReview(selectedReview) && (
                                        <span className="rating">
                                            {'★'.repeat(Math.floor(selectedReview.rating))}
                                            {'☆'.repeat(5 - Math.floor(selectedReview.rating))}
                                            <span className="rating-number">{selectedReview.rating}</span>
                                        </span>
                                    )}
                                </span>
                            </div>

                            {isGeneratedReview(selectedReview) && (
                                <h2 className="modal-review-title">{selectedReview.review_title}</h2>
                            )}

                            <div className="modal-review-text">
                                <p>{selectedReview.review_text}</p>
                            </div>

                            {isGeneratedReview(selectedReview) && selectedReview.highlights.length > 0 && (
                                <div className="modal-highlights">
                                    <h3 className="modal-section-title">Key Highlights</h3>
                                    <div className="highlights-list">
                                        {selectedReview.highlights.map((highlight, index) => (
                                            <span key={index} className="highlight-tag">{highlight}</span>
                                        ))}
                                    </div>
                                </div>
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