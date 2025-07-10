// UI improvements: Simplified processing screens, added success tick, updated button styles
// Last updated: 2024-03-07
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "../styling/Processing.css";

type Status = "analyzing" | "complete" | "error";
type Stage = "fetch" | "extract" | "analyze" | "finalize";

interface StageInfo {
  stage: Stage;
  icon: string;
  text: string;
  message: string;
}

const API_BASE_URL = ""; // Use relative URLs to avoid CORS issues

const Processing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url") || "";
  const productId = searchParams.get("productId");

  const [status, setStatus] = useState<Status>("analyzing");
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [completedStages, setCompletedStages] = useState<Set<number>>(
    new Set()
  );
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [showStages, setShowStages] = useState(true);
  const [showUrlInfo, setShowUrlInfo] = useState(true);
  const [extractionResult, setExtractionResult] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiCallMade = useRef(false);

  const stages: StageInfo[] = [
    {
      stage: "fetch",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 17l4 4 4-4M12 12v9"></path><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>',
      text: "Fetching URL Content",
      message: "Gathering information from the provided URL...",
    },
    {
      stage: "extract",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      text: "Extracting Product Info",
      message: "Scanning the page for product name, images, and description...",
    },
    {
      stage: "analyze",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      text: "Analyzing Key Details",
      message: "Identifying the core features and benefits...",
    },
    {
      stage: "finalize",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      text: "Finalizing Analysis",
      message: "Wrapping up the analysis and preparing the results...",
    },
  ];

  const STAGE_DURATION = 3000; // 3 seconds per stage - more realistic for actual processing

  useEffect(() => {
    if (!url) {
      navigate(
        `/processing-failed?error=${encodeURIComponent(
          "No product URL was provided."
        )}`
      );
      return;
    }

    // Prevent multiple executions
    if (apiCallMade.current) {
      return;
    }

    const processFlow = async () => {
      try {
        // Start the visual stage progression
        startStageProgression();

        // Make the API call
        const payload = { 
            product_url: url
        };
        
        const startTime = Date.now();
        const response = await fetch(`${API_BASE_URL}/frontrowmd/product_metadata_extraction/extract_product_info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(payload),
        });
        const endTime = Date.now();

        if (!response.ok) {
            let errorText = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorText = errorData.error_message || errorData.message || errorData.detail || errorText;
            } catch (e) {
                // If response is not JSON, get text
                try {
                    const textError = await response.text();
                    if (textError && textError.trim()) {
                        errorText = textError;
                    } else {
                        errorText = `Server error (${response.status}): ${response.statusText}`;
                    }
                } catch (e2) {
                    errorText = `Server error (${response.status}): ${response.statusText}`;
                }
            }
            throw new Error(errorText);
        }
        
        const result = await response.json();
        
        // Check if extraction was successful
        if (!result.product_extraction_succeed) {
          const errorMsg = result.error_message || 'Product extraction failed';
          navigate(`/processing-failed?url=${encodeURIComponent(url)}&error=${encodeURIComponent(errorMsg)}`);
          return;
        }
        
        // Check if we have a valid product ID
        if (!result.product_metadata?.product_id) {
          const errorMsg = 'Product extraction completed but no product ID was generated. Please try again.';
          navigate(`/processing-failed?url=${encodeURIComponent(url)}&error=${encodeURIComponent(errorMsg)}`);
          return;
        }
        
        // Check if we have meaningful product data (not just empty fields)
        const productInfo = result.product_metadata?.product_info;
        const hasMeaningfulData = productInfo && (
          (productInfo.product_name && productInfo.product_name.trim() !== "" && productInfo.product_name !== "Unknown Product") ||
          (productInfo.product_description && productInfo.product_description.trim() !== "") ||
          (productInfo.ingredients && productInfo.ingredients.length > 0) ||
          (productInfo.product_image_url && productInfo.product_image_url.trim() !== "")
        );
        
        if (!hasMeaningfulData) {
          const errorMsg = 'Product extraction completed but no meaningful product data was found. This might be due to the website\'s structure or anti-bot protection. Please try a different product URL.';
          navigate(`/processing-failed?url=${encodeURIComponent(url)}&error=${encodeURIComponent(errorMsg)}`);
          return;
        }
        
        // Set the extraction result and mark as complete
        setExtractionResult(result.product_metadata);
        setStatus("complete");
        setStatusMessage("Analysis complete! Redirecting to review page...");
        
        // Mark all stages as completed
        setCompletedStages(new Set([0, 1, 2, 3]));
        setCurrentStageIndex(-1);
        
        // Stop the stage progression
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Automatically redirect to ProcessingSuccess after a short delay
        setTimeout(() => {
          navigate(`/processing-success?url=${encodeURIComponent(url)}&productId=${result.product_metadata.product_id}`);
        }, 2000); // 2 second delay to show completion

      } catch (err: any) {
        // Clear any running intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Redirect to ProcessingFailed instead of showing error internally
        const errorMsg = err.message || 'An unexpected error occurred during processing';
        navigate(`/processing-failed?url=${encodeURIComponent(url)}&error=${encodeURIComponent(errorMsg)}`);
      }
    };

    // Mark as started to prevent multiple executions
    apiCallMade.current = true;

    // Add a delay before starting the stages for testing
    const timeoutId = setTimeout(() => {
      processFlow();
    }, 2000); // 2 second initial delay

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearTimeout(timeoutId);
      // Reset the flag when component unmounts
      apiCallMade.current = false;
    };
  }, [url]); // Remove navigate from dependencies to prevent re-runs

  const startStageProgression = () => {
    // Prevent multiple executions
    if (intervalRef.current) {
      return;
    }

    let stageIndex = 0;

    // Start first stage immediately
    setCurrentStageIndex(0);
    setStatusMessage(stages[0].message);

    intervalRef.current = setInterval(() => {
      // Mark current stage as done
      setCompletedStages((prev) => new Set(prev).add(stageIndex));

      stageIndex++;

      if (stageIndex < stages.length) {
        // Move to next stage
        setCurrentStageIndex(stageIndex);
        setStatusMessage(stages[stageIndex].message);
      } else {
        // All stages complete - don't navigate here since API call handles navigation
        setCurrentStageIndex(-1);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Don't navigate here - let the API call handle navigation
        // navigate(`/processing-success?url=${encodeURIComponent(url)}&productId=demo`);
      }
    }, STAGE_DURATION);
  };

  const renderStageIcon = (stageIndex: number) => {
    if (completedStages.has(stageIndex)) {
      // Completed stage - show checkmark
      return (
        <svg
          className="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--success-color)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
    } else if (currentStageIndex === stageIndex) {
      // Current stage - show spinner
      return <div className="spinner"></div>;
    } else {
      // Future stage - show icon
      return (
        <div dangerouslySetInnerHTML={{ __html: stages[stageIndex].icon }} />
      );
    }
  };

  const getStageClassName = (stageIndex: number) => {
    let className = "stage";
    if (currentStageIndex === stageIndex) {
      className += " processing";
    } else if (completedStages.has(stageIndex)) {
      className += " done";
    }
    return className;
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
