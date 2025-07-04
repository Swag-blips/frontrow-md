import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styling/Home.css';

const Home: React.FC = () => {
  useEffect(() => {
    const visualContainer = document.querySelector('.hero__visual-content');
    if (visualContainer && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const heroRect = visualContainer.getBoundingClientRect();
        const x = (clientX - heroRect.left - heroRect.width / 2) / (heroRect.width / 2);
        const y = (clientY - heroRect.top - heroRect.height / 2) / (heroRect.height / 2);

        const elements = document.querySelectorAll('.visual-element');
        elements.forEach(el => {
          const depth = parseFloat(el.getAttribute('data-depth') || '0');
          const moveX = -x * (depth * 25);
          const moveY = -y * (depth * 25);
          const htmlElement = el as HTMLElement;
          if (htmlElement.classList.contains('image-bubble')) {
            htmlElement.style.transform = `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`;
          } else {
            htmlElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
          }
        });
      };
      visualContainer.addEventListener('mousemove', handleMouseMove as EventListener);

      return () => {
        visualContainer.removeEventListener('mousemove', handleMouseMove as EventListener);
      };
    }
  }, []);

  return (
    <div className="home-wrapper">
      <header className="header">
        <div className="container header__container">
          <a href="/" className="logo">
            <span className="logo__icon">+</span>
            <span>FrontrowMD</span>
          </a>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="hero-grid">
            <div className="hero__text-content">
              <h1 className="hero__title">
                AI-Powered <span className="highlight">Doctor-Vetted</span> Review Generation
              </h1>
              <p className="hero__subtitle">Transform product pages into authentic, clinically-informed reviews that build trust and drive conversions.</p>
              <Link to="/product-input" className="hero__cta">Get Started</Link>
            </div>
            <div className="hero__visual-content">
              <div id="visual-container">
                <div className="visual-element image-bubble" data-depth="0.1">
                  <img src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="A friendly, professional doctor in a modern setting" />
                </div>
                <div className="visual-element icon-bubble icon-bubble--graph" data-depth="0.3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                </div>
                <div className="visual-element text-bubble" data-depth="0.4">
                  Evidence-Based
                </div>
                <div className="visual-element icon-bubble icon-bubble--shield" data-depth="0.2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 