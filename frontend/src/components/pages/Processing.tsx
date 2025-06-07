import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styling/Processing.css';

type Status = 'idle' | 'initializing' | 'analyzing' | 'complete' | 'error';

const statusMap = {
    idle: { title: 'Preparing...', text: 'Getting ready to analyze.', step: 0 },
    initializing: { title: 'Analyzing Product', text: 'Initializing analysis...', step: 1 },
    analyzing: { title: 'Analyzing Product', text: 'Extracting clinician reviews...', step: 2 },
    complete: { title: 'Request Sent', text: 'Your request has been sent. The product analysis will appear on Homepage.', step: 3 },
    error: { title: 'Error', text: 'Something went wrong.', step: 0 },
};

const Processing: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);
    const [showGreenCircle, setShowGreenCircle] = useState(false);

    useEffect(() => {
        if (status === 'complete') {
            // First show the green circle
            setShowGreenCircle(true);
            
            // After 1.5 seconds, transition to completion screen
            const timer = setTimeout(() => {
                setShowCompletionScreen(true);
            }, 1500);

            return () => clearTimeout(timer);
        } else {
            setShowGreenCircle(false);
            setShowCompletionScreen(false);
        }
    }, [status]);

    useEffect(() => {
        if (!url) {
            setStatus('error');
            setError('No product URL was provided.');
            return;
        }

        const processFlow = async () => {
            try {
                // -> Step 1: Request Sent
                setStatus('initializing');
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

                // -> Step 2: Analyzing
                setStatus('analyzing');
                // Give the backend time to process before declaring completion.
                // A more robust solution would be to poll a status endpoint.
                await new Promise(resolve => setTimeout(resolve, 10000)); 

                // -> Step 3: Complete
                setStatus('complete');

            } catch (err: any) {
                setStatus('error');
                setError(err.message || 'An unknown error occurred during processing.');
            }
        };

        processFlow();

    }, [url]);

    const { title, text, step } = statusMap[status];

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
                <div className="processing-card">
                    {!showCompletionScreen && (
                        <>
                            {status !== 'complete' && status !== 'error' && <div className="spinner"></div>}
                            
                            <h1 className="processing-card__title">{title}</h1>
                            
                            <p className="processing-card__url-label">Analyzing URL</p>
                            <p className="processing-card__url">{url}</p>
                            
                            <div className="status-steps">
                                <div className={`step ${step >= 1 ? 'completed' : ''}`}>
                                    <div className="step__icon"></div>
                                    <span>Request Sent</span>
                                </div>
                                <div className={`step ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>
                                    <div className="step__icon"></div>
                                    <span>Analyzing</span>
                                </div>
                                <div className={`step ${step >= 3 ? 'completed' : ''}`}>
                                    <div className="step__icon"></div>
                                    <span>Complete</span>
                                </div>
                            </div>

                            <p className="status-text">
                                {error ? error : text}
                            </p>
                        </>
                    )}

                    {showCompletionScreen && (
                        <>
                            <h1 className="processing-card__title">Request Sent</h1>
                            <p className="status-text">
                                Your request has been sent. The product analysis will appear on Homepage.
                            </p>
                            <Link to="/product-input?fetch=true" className="button-primary">
                                Back to Homepage
                            </Link>
                        </>
                    )}
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