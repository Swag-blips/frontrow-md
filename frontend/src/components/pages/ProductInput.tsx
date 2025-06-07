import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styling/ProductInput.css';

// Define the shape of a product
interface Product {
    product_id: string;
    product_name: string;
    product_url?: string; // Make URL optional as it's not always present
    product_image_url?: string;
    created_time: number;
}

const ProductInput: React.FC = () => {
    const [url, setUrl] = useState('');
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const shouldFetch = searchParams.get('fetch') === 'true';

        if (shouldFetch) {
            const fetchProducts = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // Add a small delay to ensure backend has processed the new product
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const response = await fetch('/frontrowmd/products');
                    if (!response.ok) {
                        throw new Error('Failed to fetch products');
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

                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProducts();
        }
    }, [searchParams]);

    // Add a separate effect to fetch products periodically when on the page
    useEffect(() => {
        const fetchProductsPeriodically = async () => {
            try {
                const response = await fetch('/frontrowmd/products');
                if (!response.ok) return;
                
                const data = await response.json();
                const productsArray: Product[] = data.products || [];
                
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
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };

        // Fetch immediately when component mounts
        fetchProductsPeriodically();

        // Then fetch every 5 seconds
        const intervalId = setInterval(fetchProductsPeriodically, 5000);

        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this runs once on mount

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            navigate(`/processing?url=${encodeURIComponent(url)}`);
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
                                />
                                <button type="submit" className="generate-btn">Generate Reviews</button>
                            </form>
                        </div>
                    </section>

                    <section className="recents-section">
                        <h2 className="recents-section__title">Recent Analyses</h2>
                        <div className="recents-grid">
                           
                            {error && <p className="error-message">{error}</p>}
                            {!isLoading && !error && products.map(product => (
                                <div key={product.product_id} className="product-card">
                                    <div className="product-card__image">
                                        {/* Use a placeholder if no image is available from API */}
                                        <img src={product.product_image_url || 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} alt={product.product_name} />
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
                            ))}
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