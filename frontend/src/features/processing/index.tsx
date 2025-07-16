import React from "react";
import { Link } from "react-router-dom";
import "./styles/Processing.css";
import { stages } from "./utils";
import { useProcessing } from "./hooks/useProcessing";

const Processing: React.FC = () => {
  const {
    getStageClassName,
    renderStageIcon,
    showStages,
    statusMessage,
    status,
  } = useProcessing();
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
      <main className="processing-main-content">
        <div className="processing-card">
          <h1 className="processing-card__title">
            {status === "complete" ? "Analysis Complete" : "Analyzing Product"}
          </h1>

          {(status === "analyzing" || status === "complete") && showStages && (
            <div className="stages-container">
              {stages.map((stage, index) => (
                <div
                  key={stage.stage}
                  className={getStageClassName(index)}
                  data-stage={stage.stage}
                >
                  <div className="stage-icon">{renderStageIcon(index)}</div>
                  <span className="stage-text">{stage.text}</span>
                </div>
              ))}
            </div> 
          )}

          {(status === "analyzing" || status === "complete") && (
            <p className="status-text">{statusMessage}</p>
          )}
        </div>
      </main>
      <footer className="processing-footer">
        <div className="container">
          <p>&copy; 2024 FrontrowMD. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Processing;
