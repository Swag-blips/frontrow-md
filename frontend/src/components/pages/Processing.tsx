// UI improvements: Simplified processing screens, added success tick, updated button styles
// Last updated: 2024-03-07
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styling/Processing.css';

type Status = 'analyzing' | 'complete' | 'request_sent' | 'error';

const Processing: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    const productId = searchParams.get('productId');
    
    const [status, setStatus] = useState<Status>('analyzing');
    const [error, setError] = useState<string | null>(null);
    const [showSuccessTick, setShowSuccessTick] = useState(false);

    useEffect(() => {
        if (!url) {
            setStatus('error');
            setError('No product URL was provided.');
            return;
        }

        const processFlow = async () => {
            try {
                // Start with analyzing state
                setStatus('analyzing');

                // Make the API call
                const response = await fetch('/frontrowmd/extract_product_metadata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ product_url: url }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to submit URL for analysis.');
                }
                
                const result = await response.json();
                if (!result.task_id) {
                    throw new Error('Analysis task was not created successfully.');
                }

                // Show success tick under URL
                setShowSuccessTick(true);

                // After successful API call, show complete state
                setStatus('complete');

                // After 1 second, transition to request_sent state
                setTimeout(() => {
                    setStatus('request_sent');
                }, 1000);

            } catch (err: any) {
                setStatus('error');
                setError(err.message || 'An unknown error occurred during processing.');
            }
        };

        processFlow();
    }, [url]);

    const renderScreen = () => {
        switch (status) {
            case 'analyzing':
                return (
                    <div className="processing-screen analyzing-screen">
                        <h1 className="processing-title">Analyzing Product</h1>
                        <p className="processing-subtitle">Extracting clinician reviews...</p>
                        <div className="url-container">
                            <p className="processing-url">{url}</p>
                            {showSuccessTick && (
                                <div className="success-tick">
                                    <span className="tick-icon">✓</span>
                                    <span className="tick-text">Analysis successful</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'complete':
                return (
                    <div className="processing-screen complete-screen">
                        <h1 className="processing-title">Complete</h1>
                        <p className="processing-subtitle">Your product has been successfully analyzed.</p>
                    </div>
                );

            case 'request_sent':
                return (
                    <div className="processing-screen request-sent-screen">
                        <h1 className="processing-title">Request Sent</h1>
                        <p className="processing-subtitle">
                            Your request has been sent. The product analysis will appear on Homepage.
                        </p>
                        <Link to="/product-input?fetch=true" className="button-primary orange">
                            Return to Homepage
                        </Link>
                    </div>
                );

            case 'error':
                return (
                    <div className="processing-screen error-screen">
                        <h1 className="processing-title">Error</h1>
                        <p className="processing-subtitle">{error || 'Something went wrong.'}</p>
                        <Link to="/product-input" className="button-primary orange">
                            Try Again
                        </Link>
                    </div>
                );
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
                <div className="processing-container">
                    {renderScreen()}
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

export default Processing; 