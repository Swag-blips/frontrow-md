export type ProductType = {
  created_time: number;
  is_draft: boolean;
  product_id: string;

  product_info: {
    clinician_reviews: any[]; // you can replace `any` if you later define a review structure
    error?: string;
    health_claims: Array<{
      category: string;
      claim: string;
      claim_location: string[];
      claim_type: string;
      original_text: string;
    }>;
    ingredients: any[]; // replace `any` if ingredient structure is known
    key_terms: Array<{
      term: string;
      term_location: string[];
    }>;
    product_description: string;
    product_image_url: string;
    product_name: string;
    raw_product_text: string;
    source_url: string;
  };
  product_url: string;
};
