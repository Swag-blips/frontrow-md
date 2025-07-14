export interface Product {
  product_id: string;
  product_name?: string;
  product_info?: {
    product_name: string;
    product_image_url?: string;
  };
  product_image_url?: string;
  created_time: number | string;
}
