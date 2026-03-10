#!/usr/bin/env python3
"""
Test script for ML Prediction Service
Tests the ML service with various review examples
"""

import requests
import json
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

ML_SERVICE_URL = "http://localhost:5001"

def print_header(text):
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{text}")
    print(f"{Fore.CYAN}{'='*60}\n")

def print_result(review_text, result):
    print(f"{Fore.YELLOW}Review: {Style.RESET_ALL}{review_text[:80]}...")
    print(f"{Fore.GREEN}Prediction: {Style.RESET_ALL}{result['prediction'].upper()}")
    print(f"{Fore.GREEN}Fake Probability: {Style.RESET_ALL}{result['fake_probability']:.4f}")
    print(f"{Fore.GREEN}Genuine Probability: {Style.RESET_ALL}{result['genuine_probability']:.4f}")
    print(f"{Fore.GREEN}Confidence: {Style.RESET_ALL}{result['confidence']:.4f}")
    print()

def test_health():
    """Test health endpoint"""
    print_header("TEST 1: Health Check")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            print(f"{Fore.GREEN}✅ ML Service is healthy!")
            print(f"{Fore.GREEN}   Model Type: {data['model_type']}")
            print(f"{Fore.GREEN}   Features: {data['features']}")
            return True
        else:
            print(f"{Fore.RED}❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"{Fore.RED}❌ Cannot connect to ML service: {e}")
        print(f"{Fore.YELLOW}   Make sure the service is running: python predict_service.py")
        return False

def test_genuine_reviews():
    """Test with genuine-looking reviews"""
    print_header("TEST 2: Genuine Reviews")
    
    genuine_reviews = [
        "I visited this clinic last week for a routine checkup. The doctor was professional and took time to explain everything. The waiting time was about 20 minutes which was reasonable. The clinic was clean and well-maintained. Overall a good experience.",
        "We rented an apartment through this service for 6 months. The owner was responsive and fixed issues promptly. The location was convenient near the metro station. The rent was fair for the area. Would recommend to others looking for accommodation.",
        "Used this plumbing service when our kitchen sink was clogged. They arrived within 2 hours of calling. The plumber was experienced and fixed the issue in about 30 minutes. The price was reasonable and they cleaned up after the work. Good service."
    ]
    
    for review in genuine_reviews:
        try:
            response = requests.post(
                f"{ML_SERVICE_URL}/predict",
                json={"review_text": review},
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                print_result(review, result)
            else:
                print(f"{Fore.RED}❌ Error: {response.status_code}")
        except Exception as e:
            print(f"{Fore.RED}❌ Request failed: {e}")

def test_fake_reviews():
    """Test with fake-looking reviews"""
    print_header("TEST 3: Fake/Spam Reviews")
    
    fake_reviews = [
        "Best service ever!!! Amazing!!! Must try!!! Call now!!! 100% satisfied!!! Highly recommend!!! Perfect place!!! Awesome!!!",
        "Very good. Nice place. Excellent. Great experience. Wonderful. Fantastic. Amazing. Perfect.",
        "Click here for best deals! Visit our website! Call now! Limited offer! Don't miss out! Best prices guaranteed! Contact us today!",
        "😍😍😍 Amazing service 😍😍😍 Best ever 😍😍😍 Must try 😍😍😍 Perfect 😍😍😍 Highly recommend 😍😍😍"
    ]
    
    for review in fake_reviews:
        try:
            response = requests.post(
                f"{ML_SERVICE_URL}/predict",
                json={"review_text": review},
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                print_result(review, result)
            else:
                print(f"{Fore.RED}❌ Error: {response.status_code}")
        except Exception as e:
            print(f"{Fore.RED}❌ Request failed: {e}")

def test_suspicious_reviews():
    """Test with suspicious reviews"""
    print_header("TEST 4: Suspicious Reviews")
    
    suspicious_reviews = [
        "Very good service. Nice place. Excellent experience.",
        "Great! Highly recommend. Best service.",
        "Good service good price good location good experience"
    ]
    
    for review in suspicious_reviews:
        try:
            response = requests.post(
                f"{ML_SERVICE_URL}/predict",
                json={"review_text": review},
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                print_result(review, result)
            else:
                print(f"{Fore.RED}❌ Error: {response.status_code}")
        except Exception as e:
            print(f"{Fore.RED}❌ Request failed: {e}")

def test_batch_predict():
    """Test batch prediction endpoint"""
    print_header("TEST 5: Batch Prediction")
    
    reviews = [
        "Excellent service with professional staff",
        "Best ever!!! Call now!!! Amazing!!!",
        "The doctor was very helpful and explained everything clearly"
    ]
    
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/batch_predict",
            json={"reviews": reviews},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            results = data['results']
            print(f"{Fore.GREEN}✅ Batch prediction successful!")
            print(f"{Fore.GREEN}   Processed {len(results)} reviews\n")
            
            for i, (review, result) in enumerate(zip(reviews, results), 1):
                print(f"{Fore.CYAN}Review {i}:")
                print_result(review, result)
        else:
            print(f"{Fore.RED}❌ Error: {response.status_code}")
    except Exception as e:
        print(f"{Fore.RED}❌ Request failed: {e}")

def test_edge_cases():
    """Test edge cases"""
    print_header("TEST 6: Edge Cases")
    
    edge_cases = [
        ("Empty review", ""),
        ("Very short", "Good"),
        ("Only emojis", "😍😍😍"),
        ("Numbers only", "12345 67890"),
        ("Special chars", "!@#$%^&*()_+{}[]|\\:;\"'<>,.?/")
    ]
    
    for name, review in edge_cases:
        print(f"{Fore.YELLOW}Testing: {name}")
        try:
            response = requests.post(
                f"{ML_SERVICE_URL}/predict",
                json={"review_text": review},
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                print(f"{Fore.GREEN}   Prediction: {result['prediction']}")
                print(f"{Fore.GREEN}   Fake Prob: {result['fake_probability']:.4f}\n")
            else:
                print(f"{Fore.RED}   Error: {response.status_code} - {response.text}\n")
        except Exception as e:
            print(f"{Fore.RED}   Request failed: {e}\n")

def main():
    print(f"{Fore.MAGENTA}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     ML Fake Review Detection - Test Suite                 ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(Style.RESET_ALL)
    
    # Test health first
    if not test_health():
        print(f"\n{Fore.RED}❌ ML service is not available. Exiting...")
        return
    
    # Run all tests
    test_genuine_reviews()
    test_fake_reviews()
    test_suspicious_reviews()
    test_batch_predict()
    test_edge_cases()
    
    print_header("✅ All Tests Complete!")
    print(f"{Fore.GREEN}The ML service is working correctly.")
    print(f"{Fore.YELLOW}Next steps:")
    print(f"{Fore.YELLOW}1. Integrate with Node.js backend")
    print(f"{Fore.YELLOW}2. Test end-to-end review submission")
    print(f"{Fore.YELLOW}3. Monitor prediction accuracy")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Test interrupted by user")
    except Exception as e:
        print(f"\n{Fore.RED}Unexpected error: {e}")
