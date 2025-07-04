import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styling/ProcessingFailed.css';

const ProcessingFailed: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    const errorMessage = searchParams.get('error') || 'We couldn\'t process this URL. Please try a different product page.';

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
                <div className="failure-card">
                    <div className="failure-icon">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="48" 
                            height="48" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                    <h1 className="failure-card__title">URL Analysis Failed</h1>
                    <p className="failure-card__text">{errorMessage}</p>
                    
                    <Link to="/product-input" className="button-primary">
                        Try Another Page
                    </Link>
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

export default ProcessingFailed; 