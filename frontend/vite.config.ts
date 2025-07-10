// ...existing code...
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Correctly resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/product_management/update_review_status": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the full path
      },
      // Updated to new backend
      "/frontrowmd/products": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/products",
            "/product_management/get_all_products"
          ),
      },
      "/frontrowmd/product_metadata_extraction": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/product_metadata_extraction",
            "/product_metadata_extraction"
          ),
      },
      "/frontrowmd/extract_product_metadata": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/extract_product_metadata",
            "/product_management/extract_product_metadata"
          ),
      },
      "/frontrowmd/add_human_review": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/add_human_review",
            "/product_management/add_human_review"
          ),
      },
      "/frontrowmd/generate_reviews_async": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/generate_reviews_async",
            "/product_metadata_extraction/generate_reviews_async"
          ),
      },
      "/product_management/get_product_by_id": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the full path including the product ID
      },
      "/frontrowmd/get_product_by_id": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/get_product_by_id",
            "/product_management/get_product_by_id"
          ),
      },
      "/frontrowmd/get_reviews_by_task": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            "/frontrowmd/get_reviews_by_task",
            "/product_metadata_extraction/get_reviews_by_task"
          ),
      },
      "/product_metadata_extraction/regenerate_review": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the full path
      },
      "/product_metadata_extraction/save_regenerated_review": {
        target: "https://65.108.49.212/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the full path
      },
    },
  },
});
