import requests
import json
from pprint import pprint

# API base URL
BASE_URL = "http://localhost:5000"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def print_section(title):
    """Print formatted section header"""
    print("\n" + "="*70)
    print(title)
    print("="*70)

def print_response(response):
    """Print formatted API response"""
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response:")
    pprint(response.json(), indent=2)

# ============================================================================
# TEST FUNCTIONS
# ============================================================================

def test_home():
    """Test home endpoint"""
    print_section("1. TEST HOME ENDPOINT")
    response = requests.get(f"{BASE_URL}/")
    print_response(response)

def test_health():
    """Test health check endpoint"""
    print_section("2. TEST HEALTH CHECK")
    response = requests.get(f"{BASE_URL}/api/health")
    print_response(response)

def test_model_info():
    """Test model info endpoint"""
    print_section("3. TEST MODEL INFO")
    response = requests.get(f"{BASE_URL}/api/model/info")
    print_response(response)

def test_single_prediction():
    """Test single property prediction"""
    print_section("4. TEST SINGLE PREDICTION")
    
    # Example property data
    property_data = {
        "kitchen_area": 10.0,
        "bath_area": 5.0,
        "other_area": 50.5,
        "gas": "Yes",
        "hot_water": "Yes",
        "central_heating": "Yes",
        "extra_area": 10.0,
        "extra_area_count": 1,
        "year": 2010,
        "ceil_height": 2.7,
        "floor_max": 10,
        "floor": 5,
        "total_area": 65.0,
        "bath_count": 1,
        "extra_area_type_name": "balcony",
        "district_name": "Centralnyj",
        "rooms_count": 3
    }
    
    print("\nSending property data:")
    pprint(property_data, indent=2)
    
    response = requests.post(
        f"{BASE_URL}/api/predict",
        json=property_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print_response(response)

def test_batch_prediction():
    """Test batch prediction"""
    print_section("5. TEST BATCH PREDICTION")
    
    # Multiple properties
    properties = [
        {
            "kitchen_area": 10.0,
            "bath_area": 5.0,
            "other_area": 50.5,
            "gas": "Yes",
            "hot_water": "Yes",
            "central_heating": "Yes",
            "extra_area": 10.0,
            "extra_area_count": 1,
            "year": 2010,
            "ceil_height": 2.7,
            "floor_max": 10,
            "floor": 5,
            "total_area": 65.0,
            "bath_count": 1,
            "extra_area_type_name": "balcony",
            "district_name": "Centralnyj",
            "rooms_count": 3
        },
        {
            "kitchen_area": 15.0,
            "bath_area": 8.0,
            "other_area": 70.0,
            "gas": "No",
            "hot_water": "Yes",
            "central_heating": "Yes",
            "extra_area": 12.0,
            "extra_area_count": 1,
            "year": 2018,
            "ceil_height": 3.0,
            "floor_max": 15,
            "floor": 10,
            "total_area": 95.0,
            "bath_count": 2,
            "extra_area_type_name": "loggia",
            "district_name": "Petrogradskij",
            "rooms_count": 4
        },
        {
            "kitchen_area": 8.0,
            "bath_area": 4.0,
            "other_area": 30.0,
            "gas": "Yes",
            "hot_water": "No",
            "central_heating": "Yes",
            "extra_area": 5.0,
            "extra_area_count": 1,
            "year": 2005,
            "ceil_height": 2.5,
            "floor_max": 9,
            "floor": 3,
            "total_area": 45.0,
            "bath_count": 1,
            "extra_area_type_name": "balcony",
            "district_name": "Kirovskij",
            "rooms_count": 1
        }
    ]
    
    batch_data = {"properties": properties}
    
    print(f"\nSending {len(properties)} properties for batch prediction...")
    
    response = requests.post(
        f"{BASE_URL}/api/predict/batch",
        json=batch_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print_response(response)

def test_invalid_input():
    """Test with invalid input to verify error handling"""
    print_section("6. TEST INVALID INPUT (ERROR HANDLING)")
    
    # Missing required field
    invalid_data = {
        "kitchen_area": 10.0,
        "bath_area": 5.0,
        # Missing other required fields
    }
    
    print("\nSending incomplete data (should return error):")
    pprint(invalid_data, indent=2)
    
    response = requests.post(
        f"{BASE_URL}/api/predict",
        json=invalid_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print_response(response)

def test_documentation():
    """Test documentation endpoint"""
    print_section("7. TEST DOCUMENTATION ENDPOINT")
    response = requests.get(f"{BASE_URL}/api/docs")
    print_response(response)

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def run_all_tests():
    """Run all API tests"""
    print("="*70)
    print("FLAT PRICE PREDICTION API - TEST SUITE")
    print("="*70)
    print(f"\nTesting API at: {BASE_URL}")
    print("\nMake sure the API server is running:")
    print("  python api_app.py")
    print("\n" + "="*70)
    
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/", timeout=2)
        print("✓ API server is running")
    except requests.exceptions.ConnectionError:
        print("✗ Error: Cannot connect to API server")
        print("\nPlease start the API server first:")
        print("  python api_app.py")
        return
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return
    
    # Run all tests
    try:
        test_home()
        test_health()
        test_model_info()
        test_single_prediction()
        test_batch_prediction()
        test_invalid_input()
        test_documentation()
        
        print("\n" + "="*70)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY")
        print("="*70)
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")

# ============================================================================
# USAGE EXAMPLES
# ============================================================================

def example_single_prediction():
    """Example: Make a single prediction"""
    print("\n" + "="*70)
    print("EXAMPLE: Single Prediction")
    print("="*70)
    
    property_data = {
        "kitchen_area": 12.0,
        "bath_area": 6.0,
        "other_area": 55.0,
        "gas": "Yes",
        "hot_water": "Yes",
        "central_heating": "Yes",
        "extra_area": 8.0,
        "extra_area_count": 1,
        "year": 2015,
        "ceil_height": 2.8,
        "floor_max": 12,
        "floor": 7,
        "total_area": 73.0,
        "bath_count": 1,
        "extra_area_type_name": "balcony",
        "district_name": "Centralnyj",
        "rooms_count": 2
    }
    
    response = requests.post(
        f"{BASE_URL}/api/predict",
        json=property_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✓ Prediction successful!")
        print(f"  Predicted Price: {result['predicted_price']:,.2f} RUB")
        print(f"  Confidence Interval: {result['confidence_interval']['lower']:,.2f} - {result['confidence_interval']['upper']:,.2f} RUB")
        print(f"  Model Accuracy: {result['model_accuracy']}")
    else:
        print(f"\n✗ Prediction failed: {response.json()}")

def example_python_integration():
    """Example: How to integrate API in Python code"""
    print("\n" + "="*70)
    print("EXAMPLE: Python Integration Code")
    print("="*70)
    
    code = '''
import requests

# Your property data
property_data = {
    "kitchen_area": 10.0,
    "bath_area": 5.0,
    "other_area": 50.5,
    "gas": "Yes",
    "hot_water": "Yes",
    "central_heating": "Yes",
    "extra_area": 10.0,
    "extra_area_count": 1,
    "year": 2010,
    "ceil_height": 2.7,
    "floor_max": 10,
    "floor": 5,
    "total_area": 65.0,
    "bath_count": 1,
    "extra_area_type_name": "balcony",
    "district_name": "Centralnyj",
    "rooms_count": 3
}

# Make prediction
response = requests.post(
    "http://localhost:5000/api/predict",
    json=property_data
)

# Get result
if response.status_code == 200:
    result = response.json()
    print(f"Predicted Price: {result['predicted_price']:,.2f} RUB")
else:
    print(f"Error: {response.json()['error']}")
'''
    
    print(code)

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            run_all_tests()
        elif sys.argv[1] == "example":
            example_single_prediction()
        elif sys.argv[1] == "code":
            example_python_integration()
        else:
            print("Usage:")
            print("  python api_test_client.py test      - Run all tests")
            print("  python api_test_client.py example   - Run single prediction example")
            print("  python api_test_client.py code      - Show integration code example")
    else:
        # Default: run all tests
        run_all_tests()
