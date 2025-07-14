import React from "react";
import { Link } from "react-router-dom";
import "./styles/Home.css";
import { useParallaxHoverEffect } from "./hooks/useParallaxHoverEffect";
import { Graph } from "@/components/icons/Graph";
import { Shield } from "@/components/icons/Shield";

const Home: React.FC = () => {
  useParallaxHoverEffect();

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
                AI-Powered <span className="highlight">Doctor-Vetted</span>{" "}
                Review Generation
              </h1>
              <p className="hero__subtitle">
                Transform product pages into authentic, clinically-informed
                reviews that build trust and drive conversions.
              </p>
              <Link to="/product-input" className="hero__cta">
                Get Started
              </Link>
            </div>
            <div className="hero__visual-content">
              <div id="visual-container">
                <div className="visual-element image-bubble" data-depth="0.1">
                  <img
                    src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="A friendly, professional doctor in a modern setting"
                  />
                </div>
                <div
                  className="visual-element icon-bubble icon-bubble--graph"
                  data-depth="0.3"
                >
                  <Graph />
                </div>
                <div className="visual-element text-bubble" data-depth="0.4">
                  Evidence-Based
                </div>
                <div
                  className="visual-element icon-bubble icon-bubble--shield"
                  data-depth="0.2"
                >
                 <Shield />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="footer">
        <div className="container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
