"""
Comprehensive API Endpoint Testing
"""
import requests
import json
import time

API_BASE = "http://localhost:5000"

print("="*70)
print("TESTING FLASK API ENDPOINTS")
print("="*70)

# Wait for API to be ready
print("\nWaiting for API to be ready...")
time.sleep(2)

# Test 1: Health Check
print("\n1. Testing GET /api/health")
print("-" * 70)
try:
    response = requests.get(f"{API_BASE}/api/health", timeout=5)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2)}")
        print("   ✓ Health check PASSED")
    else:
        print(f"   ✗ Health check FAILED")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 2: Home Page
print("\n2. Testing GET /")
print("-" * 70)
try:
    response = requests.get(f"{API_BASE}/", timeout=5)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Service: {data.get('service')}")
        print(f"   Version: {data.get('version')}")
        print(f"   Status: {data.get('status')}")
        print("   ✓ Home endpoint PASSED")
    else:
        print(f"   ✗ Home endpoint FAILED")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 3: Model Info
print("\n3. Testing GET /api/model/info")
print("-" * 70)
try:
    response = requests.get(f"{API_BASE}/api/model/info", timeout=5)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Model Type: {data.get('model_type')}")
        print(f"   Accuracy: {data.get('accuracy')}")
        print(f"   Components: {data.get('components')}")
        print("   ✓ Model info PASSED")
    else:
        print(f"   ✗ Model info FAILED")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 4: Single Prediction
print("\n4. Testing POST /api/predict")
print("-" * 70)
try:
    sample_data = {
        'kitchen_area': 10.0,
        'bath_area': 5.0,
        'other_area': 50.5,
        'gas': 'Yes',
        'hot_water': 'Yes',
        'central_heating': 'Yes',
        'extra_area': 10.0,
        'extra_area_count': 1,
        'year': 2010,
        'ceil_height': 2.7,
        'floor_max': 10,
        'floor': 5,
        'total_area': 65.0,
        'bath_count': 1,
        'extra_area_type_name': 'balcony',
        'district_name': 'Centralnyj',
        'rooms_count': 3
    }
    
    response = requests.post(
        f"{API_BASE}/api/predict",
        json=sample_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Predicted Price: {data.get('predicted_price'):,.0f} RUB")
        print(f"   Confidence Interval: {data.get('confidence_interval')}")
        print(f"   Status: {data.get('status')}")
        print("   ✓ Single prediction PASSED")
    else:
        print(f"   ✗ Single prediction FAILED")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 5: Batch Prediction
print("\n5. Testing POST /api/predict/batch")
print("-" * 70)
try:
    batch_data = {
        "properties": [
            sample_data,
            {**sample_data, 'total_area': 80.0, 'rooms_count': 4},
            {**sample_data, 'total_area': 50.0, 'rooms_count': 2}
        ]
    }
    
    response = requests.post(
        f"{API_BASE}/api/predict/batch",
        json=batch_data,
        headers={'Content-Type': 'application/json'},
        timeout=15
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Total: {data.get('summary', {}).get('total')}")
        print(f"   Successful: {data.get('summary', {}).get('successful')}")
        print(f"   Failed: {data.get('summary', {}).get('failed')}")
        if data.get('results'):
            print(f"   First prediction: {data['results'][0].get('predicted_price'):,.0f} RUB")
        print("   ✓ Batch prediction PASSED")
    else:
        print(f"   ✗ Batch prediction FAILED")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 6: Documentation
print("\n6. Testing GET /api/docs")
print("-" * 70)
try:
    response = requests.get(f"{API_BASE}/api/docs", timeout=5)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Title: {data.get('title')}")
        print(f"   Endpoints count: {len(data.get('endpoints', []))}")
        print("   ✓ Documentation PASSED")
    else:
        print(f"   ✗ Documentation FAILED")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 7: Error Handling - Missing Fields
print("\n7. Testing Error Handling (Missing Fields)")
print("-" * 70)
try:
    incomplete_data = {'kitchen_area': 10.0}
    response = requests.post(
        f"{API_BASE}/api/predict",
        json=incomplete_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 400:
        data = response.json()
        print(f"   Error message: {data.get('error')[:80]}...")
        print("   ✓ Error handling PASSED")
    else:
        print(f"   ✗ Expected 400, got {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 8: Error Handling - Invalid Values
print("\n8. Testing Error Handling (Invalid Values)")
print("-" * 70)
try:
    invalid_data = {**sample_data, 'total_area': 1000}  # Too large
    response = requests.post(
        f"{API_BASE}/api/predict",
        json=invalid_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 400:
        data = response.json()
        print(f"   Error message: {data.get('error')}")
        print("   ✓ Validation PASSED")
    else:
        print(f"   ✗ Expected 400, got {response.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "="*70)
print("API ENDPOINT TESTING COMPLETE")
print("="*70)
