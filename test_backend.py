import requests
import json
import time

# --- Configuration ---
# The IP address of your server
BASE_URL = "http://65.108.49.212:5002"

# The URL of a product you want to test the extraction with
# I've chosen a product from The Ordinary as an example
TEST_PRODUCT_URL = "https://www.theordinary.com/en-us/natural-moisturizing-factors-ha-100ml-moisturizer-100435.html"

# --- Helper Functions ---

def print_response(response):
    """A helper to neatly print the status and JSON response."""
    print(f"Status Code: {response.status_code}")
    try:
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    except json.JSONDecodeError:
        print("Response Body (not valid JSON):")
        print(response.text)
    print("-" * 50)

# --- Test Functions ---

def test_extract_product_endpoint(product_url):
    """
    Tests the endpoint for submitting a product URL for extraction.
    This sends a task to the background queue.
    """
    print(">>> Testing POST /product_management/extract_product_metadata")
    endpoint_url = f"{BASE_URL}/product_management/extract_product_metadata"
    payload = {"product_url": product_url}
    
    try:
        response = requests.post(endpoint_url, json=payload, timeout=30)
        print("Task submission response:")
        print_response(response)
        # Check if the task was submitted successfully
        if response.status_code == 202 and 'task_id' in response.json():
            print("SUCCESS: Task was submitted to the queue.")
            return True
        else:
            print("FAILURE: Task submission failed or response format was unexpected.")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while calling the API: {e}")
        return False

def test_get_all_products_endpoint():
    """
    Tests the endpoint for retrieving all processed products from the database.
    """
    print(">>> Testing GET /product_management/get_all_products")
    endpoint_url = f"{BASE_URL}/product_management/get_all_products"
    
    try:
        response = requests.get(endpoint_url, timeout=30)
        print("Get all products response:")
        print_response(response)
        if response.status_code == 200:
             print("SUCCESS: Successfully retrieved products list.")
        else:
             print("FAILURE: Could not retrieve products.")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while calling the API: {e}")

def test_add_human_review_endpoint(product_id, is_accurate, context=""):
    """
    Tests the endpoint for adding human review feedback.
    """
    print(">>> Testing POST /product_management/add_human_review")
    endpoint_url = f"{BASE_URL}/product_management/add_human_review"
    payload = {
        "product_id": product_id,
        "is_accurate": is_accurate,
        "context": context
    }
    
    try:
        response = requests.post(endpoint_url, json=payload, timeout=30)
        print("Add human review response:")
        print_response(response)
        if response.status_code == 200:
            print("SUCCESS: Human review added successfully.")
            return True
        else:
            print("FAILURE: Could not add human review.")
            return False

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while calling the API: {e}")
        return False

def test_generate_reviews_async_endpoint(product_id, number_of_reviews=7, review_word_limits=None, selected_review_tones=None, supporting_research_links=None):
    """
    Tests the endpoint for generating reviews asynchronously.
    """
    print(">>> Testing POST /product_metadata_extraction/generate_reviews_async")
    endpoint_url = f"{BASE_URL}/product_metadata_extraction/generate_reviews_async"
    
    # Default values if not provided
    if review_word_limits is None:
        review_word_limits = {"min": 20, "max": 100}
    if selected_review_tones is None:
        selected_review_tones = ["clinical_authority", "due_diligence_expert", "no_nonsense_clinician", "proactive_preventative"]
    if supporting_research_links is None:
        supporting_research_links = [
            "https://pubmed.ncbi.nlm.nih.gov/19447425/",
            "https://pmc.ncbi.nlm.nih.gov/articles/PMC10869131/?utm_source=chatgpt.com"
        ]
    
    payload = {
        "product_id": product_id,
        "number_of_reviews": number_of_reviews,
        "review_word_limits": review_word_limits,
        "selected_review_tones": selected_review_tones,
        "supporting_research_links": supporting_research_links
    }
    
    try:
        response = requests.post(endpoint_url, json=payload, timeout=30)
        print("Generate reviews async response:")
        print_response(response)
        if response.status_code == 200:
            print("SUCCESS: Review generation task submitted successfully.")
            # Check if task_id is in response
            try:
                json_response = response.json()
                if 'task_id' in json_response:
                    print(f"TASK ID: {json_response['task_id']}")
                    return json_response['task_id']
                else:
                    print("WARNING: No task_id in response")
                    return None
            except json.JSONDecodeError:
                print("WARNING: Could not parse JSON response")
                return None
        else:
            print("FAILURE: Could not submit review generation task.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while calling the API: {e}")
        return None

# --- Main Execution ---

if __name__ == "__main__":
    print(f"Starting API tests against {BASE_URL}...")
    
    # 1. Send the task to be processed
    task_submitted = test_extract_product_endpoint(TEST_PRODUCT_URL)
    
    if task_submitted:
        # 2. Wait for a moment before checking for results.
        # Note: The extraction task runs in the background and may take a few minutes.
        # This delay does NOT guarantee the task will be finished.
        # You may need to run the `get_all_products` test again later to see the new result.
        wait_time = 15
        print(f"\nWaiting {wait_time} seconds before checking for products...")
        time.sleep(wait_time)
    
    # 3. Check the list of all products.
    test_get_all_products_endpoint()
    
    # 4. Test add human review endpoint (accept scenario)
    print("\n" + "="*60)
    print("TESTING ADD HUMAN REVIEW ENDPOINT")
    print("="*60)
    
    # Test accept scenario
    test_product_id = "686c667c8d2a8a6f7fbc7159"  # Using the test product ID
    print("\n--- Testing ACCEPT scenario ---")
    test_add_human_review_endpoint(test_product_id, True, "")
    
    # Test reject scenario
    print("\n--- Testing REJECT scenario ---")
    test_add_human_review_endpoint(test_product_id, False, "Test rejection feedback: Product description was incomplete and key ingredients were missed")
    
    # 5. Test generate reviews async endpoint
    print("\n" + "="*60)
    print("TESTING GENERATE REVIEWS ASYNC ENDPOINT")
    print("="*60)
    
    print("\n--- Testing Review Generation ---")
    task_id = test_generate_reviews_async_endpoint(test_product_id)
    
    if task_id:
        print(f"\n✅ Review generation task submitted successfully!")
        print(f"Task ID: {task_id}")
        print("Note: Reviews will be generated asynchronously. Check the database later for results.")
    else:
        print(f"\n❌ Review generation task failed!")
    
    print("All tests complete.") 