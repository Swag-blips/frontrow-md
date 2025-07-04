import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styling/RejectionFeedback.css';

type FormState = 'input' | 'saving' | 'success';

const RejectionFeedback: React.FC = () => {
    const [currentState, setCurrentState] = useState<FormState>('input');
    const [feedbackText, setFeedbackText] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // In a real application, you would send feedbackText to the server here
        console.log('Feedback submitted:', feedbackText);
        setCurrentState('saving');

        setTimeout(() => {
            setCurrentState('success');
        }, 2000);
    };

    const renderInputState = () => (
        <div className={`rejection-state-content ${currentState === 'input' ? 'active' : ''}`}>
            <div className="rejection-modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
            </div>
            <h1 className="rejection-modal-title">Rejection Noted</h1>
            <p className="rejection-modal-text">
                Thank you for your diligence. Please provide a brief reason for the rejection so we can improve our extraction process. Your feedback is valuable.
            </p>
            <form onSubmit={handleSubmit} className="rejection-feedback-form">
                <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="rejection-feedback-textarea"
                    placeholder="E.g., The product description was incomplete, or key ingredients were missed..."
                    required
                />
                <button type="submit" className="rejection-submit-button">
                    Submit Feedback
                </button>
            </form>
        </div>
    );

    const renderSavingState = () => (
        <div className={`rejection-state-content ${currentState === 'saving' ? 'active' : ''}`}>
            <div className="rejection-spinner"></div>
            <h1 className="rejection-modal-title">Saving Feedback</h1>
            <p className="rejection-modal-text">Thank you. Your feedback is being recorded...</p>
        </div>
    );

    const renderSuccessState = () => (
        <div className={`rejection-state-content ${currentState === 'success' ? 'active' : ''}`}>
            <div className="rejection-modal-icon rejection-modal-icon--success">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h1 className="rejection-modal-title">Feedback Saved</h1>
            <p className="rejection-modal-text">Your input has been successfully recorded. You will now be redirected.</p>
            <Link to="/product-input" className="rejection-return-button">
                Start a New Review
            </Link>
        </div>
    );

    return (
        <div className="rejection-modal-overlay">
            <div className="rejection-modal">
                {renderInputState()}
                {renderSavingState()}
                {renderSuccessState()}
            </div>
        </div>
    );
};

export default RejectionFeedback; 