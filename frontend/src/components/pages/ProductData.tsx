import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '@/components/styling/ProductData.css';

interface Product {
    product_id: string;
    product_name: string;
    product_description: string;
    product_image_url: string;
    product_url?: string;
    ingredients: Array<string | { ingredient_name: string; ingredient_location: string[] }>;
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

const ProductData: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [productData, setProductData] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedResearch, setSelectedResearch] = useState<number | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const hasFetched = React.useRef(false);
    const [isSearchTermsOpen, setIsSearchTermsOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    useEffect(() => {
        const fetchProductData = async () => {
            if (!productId || hasFetched.current) return;
            hasFetched.current = true;

            // Check localStorage first
            const cachedProducts = localStorage.getItem('frontrow_products');
            const cachedTimestamp = localStorage.getItem('frontrow_products_timestamp');
            const now = Date.now();
            
            // Use cache if it's less than 5 seconds old
            if (cachedProducts && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 5000) {
                const products = JSON.parse(cachedProducts);
                const product = products.find((p: any) => p.product_id === productId);
                if (product) {
                    // Normalize the product data to handle nested structure
                    const normalizedProduct: Product = {
                        product_id: product.product_id,
                        product_name: product.product_info?.product_name || product.product_name || 'Unnamed Product',
                        product_description: product.product_info?.product_description || product.product_description || '',
                        product_image_url: product.product_info?.product_image_url || product.product_image_url || '',
                        product_url: product.product_url || product.product_info?.source_url || '',
                        ingredients: product.product_info?.ingredients?.map((ing: any) => ing.ingredient_name || ing) || product.ingredients || [],
                        search_queries: product.search_queries || product.search_terms || [],
                        clinical_research: product.combined_research_studies || product.clinical_research || [],
                        clinician_reviews: product.product_info?.clinician_reviews || product.clinician_reviews || []
                    };
                    
                    setProductData(normalizedProduct);
                    setError(null);
                    setIsLoading(false);
                    return;
                }
            }

            try {
                const response = await fetch('/frontrowmd/products', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status}`);
                }
                
                const data = await response.json();
                if (!data.products || !Array.isArray(data.products)) {
                    throw new Error('No products found in the database.');
                }
                
                const product = data.products.find((p: any) => p.product_id === productId);
                if (product) {
                    // Normalize the product data to handle nested structure
                    const normalizedProduct: Product = {
                        product_id: product.product_id,
                        product_name: product.product_info?.product_name || product.product_name || 'Unnamed Product',
                        product_description: product.product_info?.product_description || product.product_description || '',
                        product_image_url: product.product_info?.product_image_url || product.product_image_url || '',
                        product_url: product.product_url || product.product_info?.source_url || '',
                        ingredients: product.product_info?.ingredients?.map((ing: any) => ing.ingredient_name || ing) || product.ingredients || [],
                        search_queries: product.search_queries || product.search_terms || [],
                        clinical_research: product.combined_research_studies || product.clinical_research || [],
                        clinician_reviews: product.product_info?.clinician_reviews || product.clinician_reviews || []
                    };
                    
                    setProductData(normalizedProduct);
                    setError(null);
                } else {
                    throw new Error(`Product with ID ${productId} not found.`);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, [productId]);

    const toggleSearchTerms = () => {
        setIsSearchTermsOpen(!isSearchTermsOpen);
    };

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isSearchTermsOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSearchTermsOpen]);

    // Add ESC key functionality to close modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isSearchTermsOpen) {
                setIsSearchTermsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchTermsOpen]);

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
        <div className="product-data-wrapper">
            <header className="header">
                <div className="container header__container">
                    <Link to="/" className="logo">
                        <span className="logo__icon">+</span>
                        <span>FrontrowMD</span>
                    </Link>
                    <button 
                        className="header-review-button"
                        onClick={() => navigate(`/review-results?productId=${productId}`)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                        View AI Reviews
                    </button>
                    <Link to="/" className="home-link" aria-label="Go to homepage">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                <h1 className="product-title">{productData.product_name || "Unnamed Product"}</h1>
                                <img 
                                    src={productData.product_image_url} 
                                    alt={productData.product_name || "Product"}
                                    className="product-image"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                                    }}
                                />
                                <div className="product-description-container">
                                    <p className={`product-description ${!showFullDescription ? 'truncated' : ''}`}>
                                        {productData.product_description || 'No description available'}
                                    </p>
                                    {(productData.product_description?.length || 0) > 200 && (
                                        <button onClick={toggleDescription} className="show-more-button">
                                            {showFullDescription ? 'Show Less' : 'Show More'}
                                        </button>
                                    )}
                                </div>
                                <div className="ingredients-section">
                                    <h3 className="section-title">Key Ingredients</h3>
                                    <div className="ingredients-list">
                                        {(productData.ingredients || []).map((ingredient, index) => {
                                            // Handle both string and object formats
                                            const ingredientName = typeof ingredient === 'string' ? ingredient : (ingredient as any).ingredient_name || ingredient;
                                            const ingredientSources = typeof ingredient === 'object' && (ingredient as any).ingredient_location ? (ingredient as any).ingredient_location : ['description'];
                                            
                                            return (
                                                <div key={index} className="ingredient-item">
                                                    <span className="ingredient-tag">{ingredientName}</span>
                                                    <span className="ingredient-sources">{ingredientSources.join(', ')}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <button onClick={toggleSearchTerms} className="methodology-button">
                                View Search Terms → 
                            </button>
                        </div>

                        {/* Research List Panel */}
                        <div className="panel research-list-panel">
                            <h2 className="section-title">Clinical Research</h2>
                            <div className="research-cards">
                                {(productData.clinical_research || []).map((research, index) => (
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
                            {selectedResearch !== null && productData.clinical_research && productData.clinical_research[selectedResearch] ? (
                                <div className="detail-content">
                                    <h2 className="detail-title">
                                        {productData.clinical_research[selectedResearch].title}
                                    </h2>
                                    <div className="detail-metadata">
                                        <span><strong>Authors:</strong> {Array.isArray(productData.clinical_research[selectedResearch].metadata.authors)
                                            ? productData.clinical_research[selectedResearch].metadata.authors.join(', ')
                                            : productData.clinical_research[selectedResearch].metadata.authors}</span>
                                        <span><strong>Journal:</strong> {productData.clinical_research[selectedResearch].metadata.journal}, {productData.clinical_research[selectedResearch].metadata.publication_date}</span>
                                    </div>
                                    <h3 className="section-title">Summary</h3>
                                    <p className="detail-summary">{productData.clinical_research[selectedResearch].product_related_summary}</p>
                                    <h3 className="section-title">Supporting Statements</h3>
                                    <ul className="detail-statements">
                                        {(productData.clinical_research[selectedResearch].supporting_statements || []).map((statement, index) => (
                                            <li key={index}>{statement}</li>
                                        ))}
                                    </ul>
                                    <a 
                                        href={productData.clinical_research[selectedResearch].source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Read Full Study →
                                    </a>
                                </div>
                            ) : (
                                <div className="detail-placeholder">
                                    <p>Select a clinical study from the list to view its details here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {isSearchTermsOpen && (
                <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setIsSearchTermsOpen(false)}>
                    <div className="modal-content">
                        <button onClick={toggleSearchTerms} className="modal-close-btn">&times;</button>
                        <h2 className="modal-title">Search Term Methodology</h2>
                        <div className="modal-body">
                            {(productData.search_queries || []).map((query, index) => (
                                <div key={index} className="query-card">
                                    <div className="query-term-container">
                                        <div className="query-term">{query.term}</div>
                                        <button 
                                            className="copy-btn" 
                                            onClick={(event) => {
                                                navigator.clipboard.writeText(query.term);
                                                const btn = event?.target as HTMLButtonElement;
                                                if (btn) {
                                                    btn.textContent = 'Copied!';
                                                    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
                                                }
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="query-rationale">{query.rationale}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductData;
