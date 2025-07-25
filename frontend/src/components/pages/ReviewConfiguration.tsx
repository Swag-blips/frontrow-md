import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styling/ReviewConfiguration.css";

interface DataIncorporation {
  product_name?: string;
  ingredients?: string;
  clinical_info_citations?: string;
  reasoning?: string;
  product_description?: string;
  clinical_info_reasoning?: string;
  citations?: string;
  product_name_benefit?: string;
  clinical_info?: string;
}

interface Persona {
  name: string;
  description: string;
  uses_clinical_research: boolean;
  voice_characteristics: string[];
  tone_prompt: string;
  data_incorporation: DataIncorporation;
  example_10_word_summary: string;
  focus_areas: string[];
  imageUrl: string;
}

interface PersonaData {
  [key: string]: Persona;
}

const ReviewConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reviewCount, setReviewCount] = useState<number>(5);
  const [minWords, setMinWords] = useState<number>(80);
  const [maxWords, setMaxWords] = useState<number>(120);
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(
    new Set()
  );
  const [researchLinks, setResearchLinks] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const productId = searchParams.get("productId");

  const personaData: PersonaData = {
    clinical_authority: {
      name: "The Clinical Authority",
      description:
        "Objective, direct, and evidence-forward. The review is presented as a professional recommendation based on clinical data and mechanism of action.",
      uses_clinical_research: true,
      voice_characteristics: [
        "Objective",
        "Direct",
        "Evidence-forward",
        "Professional",
        "Clinical data focused",
      ],
      tone_prompt:
        "Write as a clinician who bases recommendations strictly on scientific evidence. Use measured, professional language. Reference specific research findings when available. Avoid emotional appeals or personal stories. Focus on mechanism of action and clinical outcomes. Use phrases like 'clinical evidence suggests' or 'research demonstrates' rather than personal opinions.",
      data_incorporation: {
        product_name: "Stated clearly but not necessarily at the beginning",
        ingredients:
          "Focuses on the primary active ingredients with scientific context",
        clinical_info_citations:
          "Directly references research findings to establish authority",
        reasoning:
          "Explains the product's value through its scientifically-validated mechanism",
      },
      example_10_word_summary:
        "Provides evidence-based relief using clinically validated active ingredients.",
      focus_areas: [
        "Clinical data",
        "Mechanism of action",
        "Scientific validation",
        "Professional authority",
      ],
      imageUrl:
        "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    empathetic_practitioner: {
      name: "The Empathetic Practitioner",
      description:
        "Warm, reassuring, and patient-centric. Acknowledges patient concerns while maintaining professional credibility without personal anecdotes.",
      uses_clinical_research: false,
      voice_characteristics: [
        "Warm",
        "Reassuring",
        "Patient-centric",
        "Empathetic",
        "Understanding",
      ],
      tone_prompt:
        "Write with genuine warmth and understanding for patient struggles, but maintain professional boundaries. Focus on how the product addresses patient needs without sharing personal stories. Use compassionate but clinical language. Emphasize patient comfort and quality of life improvements. Avoid marketing buzzwords - sound like a caring doctor, not a salesperson.",
      data_incorporation: {
        product_description:
          "Interprets benefits in context of patient comfort and daily life",
        ingredients:
          "Mentions ingredients in the context of providing gentle, effective support",
        reasoning:
          "Core focus is improving patient's quality of life and daily experience",
      },
      example_10_word_summary:
        "A gentle, effective solution to help you reclaim your day.",
      focus_areas: [
        "Patient comfort",
        "Quality of life",
        "Gentle solutions",
        "Daily experience improvement",
      ],
      imageUrl:
        "https://images.pexels.com/photos/5452291/pexels-photo-5452291.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    scientific_educator: {
      name: "The Scientific Educator",
      description:
        "Educational and mechanism-focused. Teaches patients about how and why the product works through scientific explanation.",
      uses_clinical_research: true,
      voice_characteristics: [
        "Educational",
        "Explanatory",
        "Science-focused",
        "Informative",
        "Mechanism-oriented",
      ],
      tone_prompt:
        "Adopt a teaching approach that explains the 'why' behind the product's effectiveness. Use scientific terminology appropriately but keep explanations accessible. Focus on biological mechanisms and pathways. Reference research to support educational points. Avoid condescending language - treat the reader as an intelligent person seeking understanding, not a sales target.",
      data_incorporation: {
        product_name: "Introduced as the subject of scientific explanation",
        clinical_info_reasoning:
          "Core of the review - explains biological pathways behind key ingredients",
        citations: "Used to anchor explanations in established science",
      },
      example_10_word_summary:
        "Understand the science of how this formula supports joint health.",
      focus_areas: [
        "Scientific mechanisms",
        "Biological pathways",
        "Patient education",
        "Research explanation",
      ],
      imageUrl:
        "https://images.pexels.com/photos/4167544/pexels-photo-4167544.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    due_diligence_expert: {
      name: "The Due Diligence Expert",
      description:
        "Thorough, analytical, and methodical. Conveys rigorous evaluation process without personal anecdotes.",
      uses_clinical_research: true,
      voice_characteristics: [
        "Thorough",
        "Analytical",
        "Methodical",
        "Rigorous",
        "Evidence-based",
      ],
      tone_prompt:
        "Write as a meticulous clinician who thoroughly vets every recommendation. Explain your evaluation criteria and process. Reference specific research findings that informed your decision. Use analytical language that demonstrates careful consideration. Avoid emotional appeals - let the systematic evaluation speak for itself. Sound like a careful scientist, not a marketer.",
      data_incorporation: {
        reasoning: "The review walks through the systematic evaluation process",
        clinical_info_citations:
          "Mentions specific research review as basis for recommendation",
        ingredients:
          "Confirms ingredients and dosages align with effective research protocols",
      },
      example_10_word_summary:
        "A rigorously vetted formula with strong evidence for effective support.",
      focus_areas: [
        "Rigorous vetting",
        "Systematic evaluation",
        "Evidence standards",
        "Quality assessment",
      ],
      imageUrl:
        "https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    no_nonsense_clinician: {
      name: "The No-Nonsense Clinician",
      description:
        "Direct, efficient, and results-oriented. Delivers clear, concise recommendations without unnecessary elaboration.",
      uses_clinical_research: false,
      voice_characteristics: [
        "Direct",
        "Efficient",
        "Results-oriented",
        "Concise",
        "Straightforward",
      ],
      tone_prompt:
        "Be brutally efficient and direct. Cut through marketing fluff and give a clear, professional assessment. Use short, declarative sentences. Focus on what works and why, without flowery language. Sound like a busy clinician giving a quick, honest assessment to a colleague. Avoid sales language entirely - your credibility comes from directness, not persuasion.",
      data_incorporation: {
        product_name_benefit: "Stated directly with immediate assessment",
        ingredients:
          "Presented as straightforward list of effective components",
        reasoning:
          "Implicit - it works because it contains the right ingredients in proper amounts",
      },
      example_10_word_summary:
        "It works. A straightforward, effective product that delivers results.",
      focus_areas: [
        "Direct results",
        "Efficiency",
        "Clear outcomes",
        "No-nonsense assessment",
      ],
      imageUrl:
        "https://images.pexels.com/photos/5327653/pexels-photo-5327653.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    holistic_integrator: {
      name: "The Holistic Integrator",
      description:
        "Balanced and focused on systemic wellness. Frames the product as part of comprehensive health approach.",
      uses_clinical_research: false,
      voice_characteristics: [
        "Balanced",
        "Systemic wellness focused",
        "Integrative",
        "Holistic",
        "Lifestyle-oriented",
      ],
      tone_prompt:
        "Approach from a whole-body wellness perspective. Discuss how the product fits into broader health strategies. Use calm, balanced language that reflects integrative medicine principles. Focus on supporting the body's natural processes rather than 'fixing' problems. Avoid new-age terminology - maintain scientific credibility while embracing holistic concepts.",
      data_incorporation: {
        product_description:
          "Interprets in context of supporting body's natural healing processes",
        ingredients:
          "Highlights natural ingredients and their synergistic, body-supporting effects",
        reasoning:
          "Positions as tool that works with the body to promote overall balance",
      },
      example_10_word_summary:
        "Naturally supports your body's own joint healing and wellness.",
      focus_areas: [
        "Systemic wellness",
        "Natural healing",
        "Body balance",
        "Integrative health",
      ],
      imageUrl:
        "https://images.pexels.com/photos/6749779/pexels-photo-6749779.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    safety_first_specialist: {
      name: "The Safety-First Specialist",
      description:
        "Meticulous about safety, purity, and tolerability. Primary focus on product safety profile and quality standards.",
      uses_clinical_research: true,
      voice_characteristics: [
        "Safety-focused",
        "Meticulous",
        "Quality-oriented",
        "Risk-conscious",
        "Purity-minded",
      ],
      tone_prompt:
        "Prioritize safety and tolerability in every statement. Discuss purity, quality standards, and absence of harmful additives. Reference safety data from research when available. Use cautious, measured language that demonstrates thorough safety consideration. Sound like a clinician who puts patient safety above all marketing considerations.",
      data_incorporation: {
        product_description: "Focuses on purity claims and safety profile",
        ingredients:
          "Emphasizes clean, minimal formulation and safety considerations",
        reasoning:
          "Primary recommendation basis is high safety profile and tolerability",
      },
      example_10_word_summary:
        "A safe, pure, and well-tolerated formula for sensitive patients.",
      focus_areas: [
        "Safety profile",
        "Purity standards",
        "Quality assurance",
        "Patient tolerability",
      ],
      imageUrl:
        "https://images.pexels.com/photos/5792911/pexels-photo-5792911.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    proactive_preventative: {
      name: "The Proactive & Preventative Doctor",
      description:
        "Forward-thinking and prevention-focused. Frames the product as investment in long-term health maintenance.",
      uses_clinical_research: false,
      voice_characteristics: [
        "Forward-thinking",
        "Prevention-focused",
        "Strategic",
        "Long-term oriented",
        "Proactive",
      ],
      tone_prompt:
        "Emphasize prevention and long-term health maintenance over symptom treatment. Discuss the product as an investment in future wellness. Use forward-looking language about maintaining function and preventing decline. Avoid fear-based messaging - focus on positive, proactive health strategies. Sound like a preventive medicine specialist, not a marketer.",
      data_incorporation: {
        reasoning: "Built around prevention and maintenance philosophy",
        ingredients:
          "Discusses based on ability to preserve function and structure over time",
        clinical_info:
          "References long-term benefits rather than short-term relief",
      },
      example_10_word_summary:
        "A smart, proactive investment for your long-term joint health.",
      focus_areas: [
        "Prevention",
        "Long-term health",
        "Maintenance",
        "Future wellness",
      ],
      imageUrl:
        "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    formulation_quality_expert: {
      name: "The Formulation Quality Expert",
      description:
        "Technical focus on formulation details, bioavailability, and sourcing quality. Emphasizes superior chemistry and absorption.",
      uses_clinical_research: true,
      voice_characteristics: [
        "Technical",
        "Precise",
        "Quality-focused",
        "Chemistry-oriented",
        "Detail-oriented",
      ],
      tone_prompt:
        "Focus on technical aspects of formulation quality, bioavailability, and absorption. Discuss ingredient forms, sourcing, and manufacturing quality. Use precise, technical language appropriate for discussing pharmaceutical chemistry. Reference research on bioavailability when available. Sound like a formulation scientist or clinical pharmacist, not a marketing representative.",
      data_incorporation: {
        reasoning:
          "Explains superior formulation quality compared to other products",
        ingredients:
          "Discusses specific forms, sources, and bioavailability considerations",
        clinical_info:
          "Connects formulation specifics to clinical trial results",
      },
      example_10_word_summary:
        "A superior formulation for maximum absorption and effective results.",
      focus_areas: [
        "Bioavailability",
        "Formulation quality",
        "Absorption",
        "Manufacturing standards",
      ],
      imageUrl:
        "https://images.pexels.com/photos/7108110/pexels-photo-7108110.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    patient_outcome_focused: {
      name: "The Patient Outcome Specialist",
      description:
        "Results-oriented focus on measurable patient outcomes and functional improvements without personal anecdotes.",
      uses_clinical_research: false,
      voice_characteristics: [
        "Outcome-focused",
        "Results-oriented",
        "Functional improvement focused",
        "Measurable benefits oriented",
        "Practical",
      ],
      tone_prompt:
        "Focus on measurable, functional outcomes that patients can expect. Discuss improvements in daily activities and quality of life metrics. Use practical, results-oriented language. Avoid personal stories - instead focus on documented improvements in function, mobility, and daily activities. Sound like an outcomes researcher or rehabilitation specialist, not a marketer.",
      data_incorporation: {
        reasoning:
          "Based on expected functional improvements and measurable outcomes",
        product_name:
          "Presented as solution for achieving specific functional goals",
        ingredients:
          "Mentioned as components that contribute to measurable improvements",
      },
      example_10_word_summary:
        "Delivers measurable improvements in daily function and life quality.",
      focus_areas: [
        "Functional outcomes",
        "Measurable improvements",
        "Daily activities",
        "Quality of life metrics",
      ],
      imageUrl:
        "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  };

  const handleDecreaseReviews = () => {
    if (reviewCount > 1) {
      setReviewCount(reviewCount - 1);
    }
  };

  const handleIncreaseReviews = () => {
    if (reviewCount < 20) {
      setReviewCount(reviewCount + 1);
    }
  };

  const handleMinWordsChange = (value: number) => {
    if (value < maxWords) {
      setMinWords(value);
    }
  };

  const handleMaxWordsChange = (value: number) => {
    if (value > minWords) {
      setMaxWords(value);
    }
  };

  const handlePersonaClick = (personaKey: string) => {
    const newSelected = new Set(selectedPersonas);
    if (newSelected.has(personaKey)) {
      newSelected.delete(personaKey);
    } else {
      newSelected.add(personaKey);
    }
    setSelectedPersonas(newSelected);
  };

  const handleInfoClick = (personaKey: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPersonaKey(personaKey);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPersonaKey("");
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const addResearchLink = () => {
    setResearchLinks([...researchLinks, ""]);
  };

  const updateResearchLink = (index: number, value: string) => {
    const updated = [...researchLinks];
    updated[index] = value;
    setResearchLinks(updated);
  };

  const removeResearchLink = (index: number) => {
    const filtered = researchLinks.filter((_, i) => i !== index);
    setResearchLinks(filtered);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!productId) {
      alert("Error: No product ID found. Please try again.");
      return;
    }

    if (selectedPersonas.size === 0) {
      alert("Please select at least one review tone.");
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        product_id: productId,
        number_of_reviews: reviewCount,
        review_word_limits: {
          min: minWords,
          max: maxWords,
        },
        selected_review_tones: Array.from(selectedPersonas),
        supporting_research_links: researchLinks.filter(
          (link) => link.trim() !== ""
        ),
      };

      console.log("payload", payload);

      const response = await fetch("/frontrowmd/generate_reviews_async", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("RESULT", result);

      if (result.success && result.task_id) {
        // Store processing productId in sessionStorage for polling on ProductInput
        const processingKey = "processingProductIds";
        let processingIds: string[] = [];
        try {
          const stored = sessionStorage.getItem(processingKey);
          if (stored) {
            processingIds = JSON.parse(stored);
          }
        } catch {}
        if (productId && !processingIds.includes(productId)) {
          processingIds.push(productId);
        }
        sessionStorage.setItem(processingKey, JSON.stringify(processingIds));
        
        navigate("/product-home");
      } else {
        throw new Error("Failed to get task ID from response");
      }
    } catch (error) {
      alert("Failed to generate reviews. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <header className="configuration-header">
        <div className="configuration-container configuration__header__container">
          <a href="/" className="logo">
            <span className="logo__icon">+</span>
            <span>FrontrowMD</span>
          </a>
        </div>
      </header>

      <main className="configuration-main-content">
        <div className="configuration-container">
          <div className="config-card">
            <form onSubmit={handleSubmit}>
              <div className="section-header">
                <h2 className="section-title">Configure Review Generation</h2>
                <p className="section-subtitle">
                  Set the parameters for your AI-generated reviews. Your choices
                  will guide the tone, style, and scientific basis of the
                  output.
                </p>
              </div>

              <div className="section">
                <div className="controls-row">
                  <div className="control-group">
                    <h3 className="section-title">Number of Reviews</h3>
                    <div className="number-stepper">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={handleDecreaseReviews}
                        aria-label="Decrease"
                      >
                        -
                      </button>
                      <div className="stepper-display">{reviewCount}</div>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={handleIncreaseReviews}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <h3 className="section-title">Review Length (Words)</h3>
                    <div className="word-count-container">
                      <div className="word-count-controls">
                        <span className="word-count-label">Min</span>
                        <div className="range-slider-container">
                          <div
                            className="range-track"
                            style={{
                              left: `${((minWords - 10) / (200 - 10)) * 100}%`,
                              width: `${
                                ((maxWords - minWords) / (200 - 10)) * 100
                              }%`,
                            }}
                          ></div>
                          <input
                            type="range"
                            className="range-input"
                            min="10"
                            max="200"
                            step="10"
                            value={minWords}
                            onChange={(e) =>
                              handleMinWordsChange(parseInt(e.target.value))
                            }
                          />
                          <input
                            type="range"
                            className="range-input"
                            min="10"
                            max="200"
                            step="10"
                            value={maxWords}
                            onChange={(e) =>
                              handleMaxWordsChange(parseInt(e.target.value))
                            }
                          />
                        </div>
                        <span className="word-count-label">Max</span>
                      </div>
                      <div className="word-count-display">
                        <span>Range: </span>
                        <span className="word-count-value">{minWords}</span>
                        <span>-</span>
                        <span className="word-count-value">{maxWords}</span>
                        <span>words</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h3 className="section-title">Select Review Tones</h3>
                <div className="persona-grid-container">
                  <div className="persona-grid">
                    {Object.entries(personaData).map(([key, persona]) => (
                      <div
                        key={key}
                        className={`persona-card ${
                          selectedPersonas.has(key) ? "selected" : ""
                        }`}
                        onClick={() => handlePersonaClick(key)}
                      >
                        <div
                          className="persona-visual"
                          style={{
                            backgroundImage: `url('${persona.imageUrl}')`,
                          }}
                        ></div>
                        <div className="persona-content">
                          <h4 className="persona-title">{persona.name}</h4>
                          <span
                            className={`research-tag ${
                              persona.uses_clinical_research
                                ? "with-research"
                                : "without-research"
                            }`}
                          >
                            {persona.uses_clinical_research
                              ? "Research-Based"
                              : "Experience-Based"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="info-button"
                          onClick={(e) => handleInfoClick(key, e)}
                          aria-label={`More info on ${persona.name}`}
                        >
                          i
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="section">
                <h3 className="section-title">
                  Add Supporting Research (Optional)
                </h3>
                <div className="research-links-container">
                  {researchLinks.map((link, index) => (
                    <div key={index} className="research-input-group">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
                      </svg>
                      <input
                        type="url"
                        className="research-input"
                        placeholder="https://www.example.com/clinical-study"
                        value={link}
                        onChange={(e) =>
                          updateResearchLink(index, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="remove-research-btn"
                        onClick={() => removeResearchLink(index)}
                        aria-label="Remove URL"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="add-research-button"
                  onClick={addResearchLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Research URL
                </button>
              </div>

              <button
                type="submit"
                className="generate-button"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating Reviews..." : "Generate Reviews"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {isModalOpen && selectedPersonaKey && (
        <div className="modal-overlay active" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-content-body">
              <div className="modal-section">
                <h3>{personaData[selectedPersonaKey].name}</h3>
                <span
                  className={`modal-tag ${
                    personaData[selectedPersonaKey].uses_clinical_research
                      ? "with-research"
                      : "without-research"
                  }`}
                >
                  {personaData[selectedPersonaKey].uses_clinical_research
                    ? "Incorporates Clinical Research"
                    : "Experience-Based Approach"}
                </span>
                <p>{personaData[selectedPersonaKey].description}</p>
              </div>
              <div className="modal-section">
                <h3>Voice Characteristics</h3>
                <ul>
                  {personaData[selectedPersonaKey].voice_characteristics.map(
                    (char, index) => (
                      <li key={index}>{char}</li>
                    )
                  )}
                </ul>
              </div>
              <div className="modal-section">
                <h3>Tone-Specific Instructions</h3>
                <p>{personaData[selectedPersonaKey].tone_prompt}</p>
              </div>
              <div className="modal-section">
                <h3>Data Incorporation Strategy</h3>
                <ul>
                  {Object.entries(
                    personaData[selectedPersonaKey].data_incorporation
                  ).map(([key, value]) => (
                    <li key={key}>
                      <strong>
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                        :
                      </strong>{" "}
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-section">
                <h3>Focus Areas</h3>
                <ul>
                  {personaData[selectedPersonaKey].focus_areas.map(
                    (area, index) => (
                      <li key={index}>{area}</li>
                    )
                  )}
                </ul>
              </div>
              <div className="modal-section modal-example-review">
                <h3>Example 10-Word Summary</h3>
                <p>
                  <em>
                    "{personaData[selectedPersonaKey].example_10_word_summary}"
                  </em>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewConfiguration;
