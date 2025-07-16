import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Status } from "../types";
import { stages } from "../utils";
import DOMPurify from "dompurify";

const API_BASE_URL = "";
export const useProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url") || "";
  const [status, setStatus] = useState<Status>("analyzing");
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [completedStages, setCompletedStages] = useState<Set<number>>(
    new Set()
  );
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [showStages, setShowStages] = useState(true);

  const [extractionResult, setExtractionResult] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiCallMade = useRef(false);

  const STAGE_DURATION = 3000;
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
          product_url: url,
        };

        const startTime = Date.now();
        const response = await fetch(
          `${API_BASE_URL}/frontrowmd/product_metadata_extraction/extract_product_info`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
            body: JSON.stringify(payload),
          }
        );
        const endTime = Date.now();

        if (!response.ok) {
          let errorText = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorText =
              errorData.error_message ||
              errorData.message ||
              errorData.detail ||
              errorText;
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
          const errorMsg = result.error_message || "Product extraction failed";
          navigate(
            `/processing-failed?url=${encodeURIComponent(
              url
            )}&error=${encodeURIComponent(errorMsg)}`
          );
          return;
        }

        // Check if we have a valid product ID
        if (!result.product_metadata?.product_id) {
          const errorMsg =
            "Product extraction completed but no product ID was generated. Please try again.";
          navigate(
            `/processing-failed?url=${encodeURIComponent(
              url
            )}&error=${encodeURIComponent(errorMsg)}`
          );
          return;
        }

        // Check if we have meaningful product data (not just empty fields)
        const productInfo = result.product_metadata?.product_info;
        const hasMeaningfulData =
          productInfo &&
          ((productInfo.product_name &&
            productInfo.product_name.trim() !== "" &&
            productInfo.product_name !== "Unknown Product") ||
            (productInfo.product_description &&
              productInfo.product_description.trim() !== "") ||
            (productInfo.ingredients && productInfo.ingredients.length > 0) ||
            (productInfo.product_image_url &&
              productInfo.product_image_url.trim() !== ""));

        if (!hasMeaningfulData) {
          const errorMsg =
            "Product extraction completed but no meaningful product data was found. This might be due to the website's structure or anti-bot protection. Please try a different product URL.";
          navigate(
            `/processing-failed?url=${encodeURIComponent(
              url
            )}&error=${encodeURIComponent(errorMsg)}`
          );
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
          navigate(
            `/processing-success?url=${encodeURIComponent(url)}&productId=${
              result.product_metadata.product_id
            }`
          );
        }, 2000); // 2 second delay to show completion
      } catch (err: any) {
        // Clear any running intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Redirect to ProcessingFailed instead of showing error internally
        const errorMsg =
          err.message || "An unexpected error occurred during processing";
        navigate(
          `/processing-failed?url=${encodeURIComponent(
            url
          )}&error=${encodeURIComponent(errorMsg)}`
        );
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
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(stages[stageIndex].icon),
          }}
        />
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
  return {
    getStageClassName,
    renderStageIcon,
    showStages,
    statusMessage,
    status,
  };
};
