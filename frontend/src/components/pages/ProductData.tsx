import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '@/components/styling/ProductData.css';

interface Product {
    product_id: string;
    product_name: string;
    product_description: string;
    product_image_url: string;
    product_url?: string;
    ingredients: string[];
    search_queries: Array<{
        term: string;
        rationale: string;
    }>;
    clinical_research: Array<{
        is_relevant: boolean;
        metadata: {
            article_title: string;
            authors: string | string[];
            journal: string;
            publication_date: string;
        };
        product_related_summary: string;
        relevance_reason: string;
        supporting_statements: string[];
        title: string;
        source_url: string;
    }>;
    clinician_reviews: Array<{
        review_text: string;
        reviewer_name: string;
        reviewer_title: string;
    }>;
}

const API_BASE_URL = ''; // Use relative URLs to let Vercel handle routing

const ProductData: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [productData, setProductData] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSearchTerms, setShowSearchTerms] = useState(false);
    const [selectedResearch, setSelectedResearch] = useState<number | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
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
                    setProductData(product);
                    setError(null);
                } else {
                    throw new Error(`Product with ID ${productId} not found. It may have been removed from the database.`);
                }
            } catch (err: any) {
                console.error('Error fetching product data:', err);
                setError(err.message || 'Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, [productId]);

    const toggleSearchTerms = () => {
        setShowSearchTerms(!showSearchTerms);
    };

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const handleGenerateReviews = () => {
        navigate(`/review/${productId}`);
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading product data...</p>
            </div>
        );
    }

    if (error || !productData) {
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
                            <Link to={`/product-input?url=${encodeURIComponent(productData?.product_url || '')}`} className="button-secondary">
                                Generate New Reviews
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="header">
                <div className="container header__container">
                    <Link to="/" className="logo">
                        <span className="logo__icon">+</span>
                        <span>FrontrowMD</span>
                    </Link>
                    <Link to="/product-input" className="home-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </Link>
                </div>
            </header>

            <main className="main-content">
                <div className="container">
                    <div className="dashboard-container">
                        {/* Product Info Panel */}
                        <div className="panel product-info-panel">
                            <div className="product-header">
                                <h1 className="product-title">{productData.product_name}</h1>
                                <img 
                                    src={productData.product_image_url} 
                                    alt={productData.product_name}
                                    className="product-image"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                                    }}
                                />
                                <div className="product-description-container">
                                    <p className={`product-description ${!showFullDescription ? 'truncated' : ''}`}>
                                        {productData.product_description}
                                    </p>
                                    {productData.product_description.length > 200 && (
                                        <button onClick={toggleDescription} className="show-more-button">
                                            {showFullDescription ? 'Show Less' : 'Show More'}
                                        </button>
                                    )}
                                </div>
                                <div className="ingredients-section">
                                    <h3 className="section-title">Key Features</h3>
                                    <div className="ingredients-list">
                                        {productData.ingredients.map((ingredient, index) => (
                                            <span key={index} className="ingredient-tag">{ingredient}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="search-terms-section">
                                    <button onClick={toggleSearchTerms} className="search-terms-button">
                                        {showSearchTerms ? 'Hide Search Terms' : 'View Search Terms'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Research List Panel */}
                        <div className="panel research-list-panel">
                            <h2 className="section-title">Clinical Research</h2>
                            <div className="research-cards">
                                {productData.clinical_research.map((research, index) => (
                                    <div
                                        key={index}
                                        className={`research-card ${selectedResearch === index ? 'selected' : ''}`}
                                        onClick={() => setSelectedResearch(index)}
                                    >
                                        <div className="research-card-header">
                                            <h3 className="research-title">{research.title}</h3>
                                        </div>
                                        {research.is_relevant && (
                                            <div className="relevance-container">
                                                <span className="relevance-label">Relevant</span>
                                                <span className="relevance-reason">{research.relevance_reason}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Research Detail Panel */}
                        <div className="panel research-detail-panel">
                            {selectedResearch !== null ? (
                                <div className="research-detail">
                                    <h2 className="research-detail-title">
                                        {productData.clinical_research[selectedResearch].title}
                                    </h2>
                                    <div className="authors-section">
                                        <span className="authors-label">Authors:</span>
                                        <span className="research-authors">
                                            {Array.isArray(productData.clinical_research[selectedResearch].metadata.authors)
                                                ? productData.clinical_research[selectedResearch].metadata.authors.join(', ')
                                                : productData.clinical_research[selectedResearch].metadata.authors}
                                        </span>
                                    </div>
                                    <div className="research-summary">
                                        <span className="quote-mark">"</span>
                                        <p>{productData.clinical_research[selectedResearch].product_related_summary}</p>
                                    </div>
                                    <h3 className="section-title">Supporting Evidence</h3>
                                    <ul className="supporting-statements">
                                        {productData.clinical_research[selectedResearch].supporting_statements.map((statement, index) => (
                                            <li key={index}>{statement}</li>
                                        ))}
                                    </ul>
                                    <a 
                                        href={productData.clinical_research[selectedResearch].source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="read-full-story"
                                    >
                                        Read Full Study
                                        <span className="arrow">→</span>
                                    </a>
                                </div>
                            ) : (
                                <div className="no-research-selected">
                                    Select a research study to view details
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <div className="generate-reviews-section">
                <div className="container">
                    <button 
                        onClick={handleGenerateReviews}
                        className="generate-reviews-button"
                    >
                        See Reviews
                    </button>
                </div>
            </div>

            {showSearchTerms && (
                <div className="modal is-visible">
                    <div className="modal-content">
                        <button onClick={toggleSearchTerms} className="modal-close">&times;</button>
                        <div className="modal-body">
                            <h2 className="modal-section-title">Search Terms Used</h2>
                            <div className="search-terms-list">
                                {productData.search_queries.map((query, index) => (
                                    <div key={index} className="search-term-card">
                                        <div className="search-term">{query.term}</div>
                                    </div>
                                ))}
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

export default ProductData;
