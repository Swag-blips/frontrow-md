import requests
import json
import time

# --- Configuration ---
# The IP address of your server
BASE_URL = "http://157.180.29.221:5001"

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
    print(">>> Testing POST /frontrowmd/extract_product_metadata")
    endpoint_url = f"{BASE_URL}/frontrowmd/extract_product_metadata"
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
    print(">>> Testing GET /frontrowmd/products")
    endpoint_url = f"{BASE_URL}/frontrowmd/products"
    
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
    
    print("All tests complete.") 