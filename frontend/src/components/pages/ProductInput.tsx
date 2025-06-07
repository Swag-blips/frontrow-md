import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styling/ProductInput.css';

// Define the shape of a product
interface Product {
    product_id: string;
    product_name: string;
    product_url?: string;
    product_image_url?: string;
    created_time: number;
}

const API_BASE_URL = ''; // Use relative URLs to let Vercel handle routing

const ProductInput: React.FC = () => {
    const [url, setUrl] = useState('');
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true); // For products fetch
    const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    // Function to fetch products
    const fetchProducts = async () => {
        try {
            const response = await fetch('/frontrowmd/products', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const productsArray: Product[] = data.products || [];
            
            // Ensure created_time is a number and sort by most recent first
            const sortedData = productsArray
                .map(product => ({
                    ...product,
                    created_time: typeof product.created_time === 'string' 
                        ? new Date(product.created_time).getTime() 
                        : product.created_time
                }))
                .sort((a, b) => b.created_time - a.created_time)
                .slice(0, 6);
            
            setProducts(sortedData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Failed to fetch products');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchProducts();
    }, []); // Empty dependency array means this runs once on mount

    // Periodic fetch every 5 seconds
    useEffect(() => {
        const intervalId = setInterval(fetchProducts, 5000);
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this runs once on mount

    // Additional fetch when URL parameter changes
    useEffect(() => {
        const shouldFetch = searchParams.get('fetch') === 'true';
        if (shouldFetch) {
            // Add a small delay to ensure backend has processed the new product
            const timeoutId = setTimeout(fetchProducts, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsSubmitting(true); // Use isSubmitting instead of isLoading
        setError(null);

        try {
            // Validate URL format
            let validatedUrl = url.trim();
            try {
                const urlObj = new URL(validatedUrl);
                // Ensure URL has http/https protocol
                if (!urlObj.protocol.startsWith('http')) {
                    validatedUrl = `https://${validatedUrl}`;
                }
            } catch (err) {
                throw new Error('Please enter a valid URL (e.g., https://www.example.com/product)');
            }

            console.log('Submitting URL:', validatedUrl); // Debug log

            // First, try to extract product metadata
            const response = await fetch('/frontrowmd/extract_product_metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    product_url: validatedUrl,
                    timestamp: new Date().toISOString()
                }),
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                let errorMessage = `Failed to process URL (${response.status})`;
                try {
                    const errorData = await response.json();
                    console.log('Error response:', errorData); // Debug log
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Success response:', data); // Debug log
            
            // If successful, navigate to processing page with the product ID
            if (data.product_id) {
                navigate(`/processing?url=${encodeURIComponent(validatedUrl)}&productId=${data.product_id}`);
            } else {
                navigate(`/processing?url=${encodeURIComponent(validatedUrl)}`);
            }
        } catch (err: any) {
            console.error('Error submitting URL:', err);
            setError(err.message || 'Failed to process URL. Please try again.');
            setIsSubmitting(false); // Use isSubmitting instead of isLoading
        }
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
                    <section className="input-section">
                        <div className="input-card">
                            <h1 className="input-card__title">Start a New Review Generation</h1>
                            <p className="input-card__subtitle">Enter a product page URL to begin the analysis and review creation process.</p>
                            <form onSubmit={handleSubmit} className="url-form">
                                <input
                                    type="url"
                                    className="url-input"
                                    placeholder="e.g., https://www.example.com/product/item-123"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    disabled={isSubmitting} // Use isSubmitting instead of isLoading
                                />
                                <button 
                                    type="submit" 
                                    className="generate-btn"
                                    disabled={isSubmitting} // Use isSubmitting instead of isLoading
                                >
                                    {isSubmitting ? 'Processing...' : 'Generate Reviews'}
                                </button>
                            </form>
                            {error && <p className="error-message">{error}</p>}
                        </div>
                    </section>

                    <section className="recents-section">
                        <h2 className="recents-section__title">Recent Analyses</h2>
                        <div className="recents-grid">
                            {!isLoading && error && products.length === 0 ? (
                                <p className="error-message">{error}</p>
                            ) : !isLoading && products.length === 0 ? (
                                <p className="no-products-message">No recent analyses found.</p>
                            ) : (
                                products.map(product => (
                                    <div key={product.product_id} className="product-card">
                                        <div className="product-card__image">
                                            <img 
                                                src={product.product_image_url || 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                                                alt={product.product_name}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                                                }}
                                            />
                                        </div>
                                        <div className="product-card__content">
                                            <h3 className="product-card__title">{product.product_name}</h3>
                                            {product.product_url && (
                                                <>
                                                    <p className="product-card__url">{new URL(product.product_url).hostname}</p>
                                                    <p className="product-card__full-url">{product.product_url}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
            
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
};

export default ProductInput; 