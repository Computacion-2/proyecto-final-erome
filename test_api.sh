#!/bin/bash

echo "Testing REST API Endpoints"
echo "========================="

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://localhost:8080/health
echo -e "\n"

# Test 2: Test authentication endpoint
echo "2. Testing authentication endpoint..."
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@u.icesi.edu.co","password":"admin123"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n"

# Test 3: Test registration endpoint
echo "3. Testing registration endpoint..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n"

# Test 4: Test users endpoint (should require authentication)
echo "4. Testing users endpoint (should require authentication)..."
curl -s http://localhost:8080/api/users \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n"

# Test 5: Test roles endpoint
echo "5. Testing roles endpoint..."
curl -s http://localhost:8080/api/roles \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n"

echo "API Testing Complete"
