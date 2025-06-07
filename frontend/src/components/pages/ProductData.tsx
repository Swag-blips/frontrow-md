import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styling/ProductData.css';

interface Query {
  term: string;
  rationale: string;
}

interface ClinicalResearch {
  is_relevant: boolean;
  relevance_reason: string;
  title: string;
  product_related_summary: string;
  supporting_statements: string[];
  source_url: string;
  metadata: {
    authors: string[];
    article_title: string;
    publication_date: string;
    journal: string;
    doi: string;
    clinical_research_id: string;
  };
}

interface Product {
  product_name: string;
  product_description: string;
  product_image_url: string;
  ingredients: string[];
  clinician_reviews: any[];
  product_id: string;
  search_queries: Query[];
  clinical_research: ClinicalResearch[];
}

const ProductData: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [productData, setProductData] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [selectedResearch, setSelectedResearch] = useState<ClinicalResearch | null>(null);
    const [showSearchTerms, setShowSearchTerms] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            // In a real app, you would fetch this data from an API
            // For now, we're using the mock data provided.
            const mockData: Product = {
              "product_name": "Propolis Throat Spray 2-Pack",
              "product_description": "The Propolis Throat Spray 2-Pack offers a highly concentrated formula designed to support immune health and soothe scratchy throats. It delivers the market's highest concentration of bioactive polyphenols and flavonoids, along with essential compounds like Vitamin C, iron, and B vitamins. This spray utilizes propolis, a natural hive defender, to combat free radical damage and nourish gut bacteria. Each serving contains 85mg of highly concentrated bee propolis extract, purified water, non-GMO vegetable glycerin, and wildflower honey. For daily immune support, spray 4 times in the mouth; increase to 8 sprays if symptoms are present. The product is free from refined sugars, GMOs, glyphosate, artificial flavors, dyes, antibiotics, and is drug-free.",
              "product_image_url": "https://www.beekeepersnaturals.com/cdn/shop/files/MAIN_TS-T.png?v=1744737054&width=2000",
              "ingredients": [
                "Bee Propolis extract",
                "Vegetable Glycerin",
                "Purified Water",
                "Wildflower Honey",
                "Polyphenols",
                "Flavonoids",
                "Vitamin C",
                "Iron",
                "B vitamins",
                "Zinc",
                "Antioxidants"
              ],
              "clinician_reviews": [],
              "product_id": "68432014f0335bcae8e5d2bf",
              "search_queries": [
                {
                  "term": "Propolis extract immunomodulatory effect respiratory infection",
                  "rationale": "This term targets the primary ingredient (propolis extract) and its claimed mechanism (immunomodulatory effect) in the context of common conditions it aims to alleviate, such as respiratory tract infections and associated throat symptoms."
                },
                {
                  "term": "Bee propolis polyphenols antioxidant activity",
                  "rationale": "This search term focuses on the specific bioactive compounds highlighted in the product (polyphenols and flavonoids within bee propolis) and their scientifically verifiable mechanism of action (antioxidant activity, combating free radical damage)."
                },
                {
                  "term": "Propolis gut microbiome modulation",
                  "rationale": "This term addresses a unique and less common claim for a throat spray – the ability of propolis to nourish gut bacteria – using precise scientific terminology for its potential influence on the gut microbiome."
                }
              ],
              "clinical_research": [
                {
                  "is_relevant": true,
                  "relevance_reason": "This study investigates the antioxidant activity of polyphenols derived from propolis, which directly relates to the product's key ingredient and advertised benefits.",
                  "title": "Research Highlights Antioxidant Power of Propolis, Supporting Throat Spray's Immune-Boosting Claims",
                  "product_related_summary": "This study confirms the potent antioxidant activity of polyphenols found in propolis, a primary ingredient in our Propolis Throat Spray.  The research demonstrates how these polyphenols, including flavonoids and phenolic acids, effectively scavenge free radicals, offering crucial support for immune health and protection against cellular damage. This aligns perfectly with our product's focus on immune support and its high concentration of bioactive polyphenols and flavonoids to combat free radical damage.",
                  "supporting_statements": [
                    "\"Propolis is a potential source of natural antioxidants such as phenolic acids and flavonoids.\"",
                    "\"Its wide biological effects have been known and used since antiquity.\"",
                    "\"Phenolic compounds constitute the most numerous group of propolis components with respect to the quantity and type.\"",
                    "\"The antioxidative activity of phenolic acids depends on the number of hydroxyl groups in their molecules and on the steric effects.\"",
                    "\"Flavonoids are characterized by powerful antioxidative properties.\"",
                    "\"The antioxidative activity of polyphenols is one of their most appreciated properties.\""
                  ],
                  "metadata": {
                    "article_title": "Structure and Antioxidant Activity of Polyphenols Derived from Propolis",
                    "authors": [
                      "Anna Kurek-Górecka",
                      "Anna Rzepecka-Stojko",
                      "Michał Górecki",
                      "Jerzy Stojko",
                      "Marian Sosada",
                      "Grażyna Świerczek-Zięba"
                    ],
                    "publication_date": "2013 Dec 20",
                    "journal": "Molecules",
                    "doi": "10.3390/molecules19010078",
                    "clinical_research_id": "68432032f0335bcae8e5d2c0"
                  },
                  "source_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6271064/"
                },
                {
                  "is_relevant": true,
                  "relevance_reason": "This research investigates the antioxidant and antimicrobial activity of propolis extracts, aligning with the product's description and its focus on immune support and soothing throat irritation.",
                  "title": "Research Shows Propolis Extracts Boost Antioxidant and Antimicrobial Activity, Supporting Immune Health and Throat Soothing Benefits",
                  "product_related_summary": "This study explored the impact of different extraction methods on the bioactivity of propolis, a key ingredient in our Propolis Throat Spray.  The findings confirm that propolis extracts exhibit substantial antioxidant and antimicrobial properties, which are crucial for immune defense and addressing throat discomfort.  The research highlights the importance of propolis' polyphenols and flavonoids in contributing to these beneficial effects, aligning with our product's high concentration of these compounds.  Furthermore, the study's exploration of aqueous and ethanolic extractions provides insights into optimizing propolis' bioactivity, informing our formulation strategy for maximum efficacy.",
                  "supporting_statements": [
                    "\"All extracts, even the aqueous ones, demonstrated antibacterial and antifungal activity.\"",
                    "\"50% ethanolic extracts provide a rich polyphenolics profile and ensure a good antioxidant capacity.\"",
                    "\"Propolis antimicrobial activities begin to be documented against different bacteria, yeasts, viruses, and parasites.\"",
                    "\"In vitro, propolis may act directly on microorganisms, and in vivo it may stimulate the immune system, activating the mechanisms involved in the microorganisms killing.\"",
                    "\"Most of the propolis antioxidant properties were attributed to galangin and pinocembrin.\"",
                    "\"Phenolic compounds in propolis donate hydrogen ions to free radicals, thus hindering lipids, proteins, and nucleic acids oxidation.\""
                  ],
                  "metadata": {
                    "article_title": "Polyphenolics profile effects upon the antioxidant and antimicrobial activity of propolis extracts",
                    "authors": ["Mădălina Maria Nichitoi", "Ana Maria Josceanu", "Raluca Daniela Isopescu", "Gabriela Olimpia Isopencu", "Elisabeta-Irina Geana", "Corina Teodora Ciucure", "Vasile Lavric"],
                    "publication_date": "11 October 2021",
                    "journal": "Scientific Reports",
                    "doi": "https://doi.org/10.1038/s41598-021-97130-9",
                    "clinical_research_id": "68432040f0335bcae8e5d2c1"
                  },
                  "source_url": "https://www.nature.com/articles/s41598-021-97130-9"
                },
                {
                  "is_relevant": true,
                  "relevance_reason": "This study investigates propolis's positive effects on gut microbiota and intestinal mucosal health, aligning with the product's claim of nourishing gut bacteria.",
                  "title": "Research Shows Propolis Supports Gut Health and Microbiome Balance",
                  "product_related_summary": "A study published in Biomed Pharmacother demonstrated that propolis supplementation improved gut microbiota composition and intestinal mucosal barrier function in diabetic rats.  These findings corroborate the Propolis Throat Spray's claim of nourishing gut bacteria, suggesting potential benefits for gut health beyond its throat-soothing properties.  The research indicates that propolis may contribute to a balanced gut microbiome, which is essential for overall well-being.",
                  "supporting_statements": [
                    "Propolis treatment improved gut microbiota composition in diabetic rats.",
                    "Propolis repaired intestinal mucosal damage in diabetic rats.",
                    "Propolis increased levels of beneficial short-chain fatty acids (SCFAs) in diabetic rats.",
                    "Propolis exerted hypoglycemic effects in diabetic rats.",
                    "Propolis increased the levels of tight junction proteins in the ileum, improving intestinal barrier function."
                  ],
                  "metadata": {
                    "article_title": "Propolis modulates the gut microbiota and improves the intestinal mucosal barrier function in diabetic rats",
                    "authors": ["Meilan Xue", "Ying Liu", "Hongwei Xu", "Zhitong Zhou", "Yan Ma", "Ting Sun", "Man Liu", "Huaqi Zhang", "Hui Liang"],
                    "publication_date": "2019 Oct",
                    "journal": "Biomed Pharmacother",
                    "doi": "10.1016/j.biopha.2019.109393",
                    "clinical_research_id": "6843204df0335bcae8e5d2c2"
                  },
                  "source_url": "https://pubmed.ncbi.nlm.nih.gov/31545258/"
                }
              ]
            };
            setProductData(mockData);
            setIsLoading(false);
        };

        fetchData();
    }, []);

    if (isLoading || !productData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <header className="header">
                <div className="container header__container">
                    <Link to="/" className="logo">
                        <span className="logo__icon">+</span>
                        <span>FrontrowMD</span>
                    </Link>
                    <Link to="/product-input" className="home-button" aria-label="Home">
                        <FaHome size={26} />
                    </Link>
                </div>
            </header>

            <main className="main-content">
                <div className="dashboard-container">
                    {/* Left Panel - Product Info */}
                    <div className="panel product-info-panel">
                        <div className="product-header">
                            <h1 className="product-title">{productData.product_name}</h1>
                            <img 
                                src={productData.product_image_url} 
                                alt={productData.product_name} 
                                className="product-image"
                            />
                        </div>

                        <div className="product-description-container">
                            <p className={`product-description ${showFullDescription ? 'expanded' : ''}`}>
                                {productData.product_description}
                            </p>
                            <button 
                                className="action-button"
                                onClick={() => setShowFullDescription(!showFullDescription)}
                            >
                                {showFullDescription ? 'Show Less' : 'Show More'}
                            </button>
                        </div>

                        <h4 className="section-title">Key Ingredients</h4>
                        <ul className="ingredients-list">
                            {productData.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient}</li>
                            ))}
                        </ul>

                        <div className="search-terms-container">
                            <button 
                                className="action-button"
                                onClick={() => setShowSearchTerms(!showSearchTerms)}
                            >
                                View Search Terms
                            </button>
                            {showSearchTerms && (
                                <div className="search-terms-list">
                                    {productData.search_queries.map((query, index) => (
                                        <div key={index} className="search-term-item">
                                            <p className="search-term">{query.term}</p>
                                            <p className="search-rationale">{query.rationale}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Panel - Clinical Research List */}
                    <div className="panel research-list-panel">
                        <h1 className="section-title">Clinical Research</h1>
                        <div className="research-cards">
                            {productData.clinical_research.map((research, index) => (
                                <div 
                                    key={index}
                                    className={`research-card ${selectedResearch === research ? 'selected' : ''}`}
                                    onClick={() => setSelectedResearch(research)}
                                >
                                    <div className="research-card-header">
                                        <h5 className="research-title">{research.title}</h5>
                                    </div>
                                    {research.is_relevant && (
                                        <div className="relevance-container">
                                            <span className="relevance-indicator">✓</span>
                                            <span className="relevance-label">Relevant:</span>
                                            <p className="relevance-reason">{research.relevance_reason}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Selected Research Details */}
                    <div className="panel research-detail-panel">
                        {selectedResearch ? (
                            <div className="research-detail">
                                <h3 className="research-detail-title">{selectedResearch.metadata.article_title}</h3>
                                <div className="authors-section">
                                    <span className="authors-label">Authors:</span>
                                    <p className="research-authors">
                                        {selectedResearch.metadata.authors.join(', ')}
                                    </p>
                                </div>
                                <div className="research-summary">
                                    <div className="quote-mark">"</div>
                                    <p>{selectedResearch.product_related_summary}</p>
                                </div>
                                <ul className="supporting-statements">
                                    {selectedResearch.supporting_statements.map((statement, index) => (
                                        <li key={index}>
                                            {statement.replace(/^"|"$/g, '')}
                                        </li>
                                    ))}
                                </ul>
                                <a 
                                    href={selectedResearch.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="read-full-story"
                                >
                                    Read Full Story
                                    <span className="arrow">→</span>
                                </a>
                            </div>
                        ) : (
                            <div className="no-research-selected">
                                Select a research article to view details
                            </div>
                        )}
                    </div>
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

export default ProductData;
