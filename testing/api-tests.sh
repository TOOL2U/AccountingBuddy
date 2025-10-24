#!/bin/bash

# API Testing Script for Accounting Buddy
# Tests various API endpoints and scenarios

BASE_URL="http://localhost:3002"
echo "🧪 Starting API Tests for Accounting Buddy"
echo "Base URL: $BASE_URL"
echo "=========================================="
echo ""

# Test 1: Health check - Upload page
echo "Test 1: Upload page accessibility"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/upload")
if [ "$response" = "200" ]; then
    echo "✅ Upload page accessible (HTTP $response)"
else
    echo "❌ Upload page failed (HTTP $response)"
fi
echo ""

# Test 2: Review page accessibility
echo "Test 2: Review page accessibility"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/review/test-123")
if [ "$response" = "200" ]; then
    echo "✅ Review page accessible (HTTP $response)"
else
    echo "❌ Review page failed (HTTP $response)"
fi
echo ""

# Test 3: Inbox page accessibility
echo "Test 3: Inbox page accessibility"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/inbox")
if [ "$response" = "200" ]; then
    echo "✅ Inbox page accessible (HTTP $response)"
else
    echo "❌ Inbox page failed (HTTP $response)"
fi
echo ""

# Test 4: Extract API with empty text
echo "Test 4: Extract API validation (empty text)"
response=$(curl -s -X POST "$BASE_URL/api/extract" \
  -H "Content-Type: application/json" \
  -d '{"text":""}')
echo "Response: $response"
if echo "$response" | grep -q "error"; then
    echo "✅ Extract API correctly rejects empty text"
else
    echo "❌ Extract API should reject empty text"
fi
echo ""

# Test 5: Extract API with valid text
echo "Test 5: Extract API with valid text"
response=$(curl -s -X POST "$BASE_URL/api/extract" \
  -H "Content-Type: application/json" \
  -d '{"text":"HomePro Samui\nDate: 10/23/2025\nAmount: 1245 THB\nConstruction materials"}')
echo "Response: $response"
if echo "$response" | grep -q "date\|vendor\|amount\|category"; then
    echo "✅ Extract API returns structured data"
else
    echo "⚠️  Extract API response format unexpected"
fi
echo ""

# Test 6: Sheets API validation (missing fields)
echo "Test 6: Sheets API validation (missing fields)"
response=$(curl -s -X POST "$BASE_URL/api/sheets" \
  -H "Content-Type: application/json" \
  -d '{"date":"10/23/2025"}')
echo "Response: $response"
if echo "$response" | grep -q "error\|required"; then
    echo "✅ Sheets API correctly validates required fields"
else
    echo "❌ Sheets API should validate required fields"
fi
echo ""

# Test 7: Sheets API validation (empty vendor)
echo "Test 7: Sheets API validation (empty vendor)"
response=$(curl -s -X POST "$BASE_URL/api/sheets" \
  -H "Content-Type: application/json" \
  -d '{"date":"10/23/2025","vendor":"","amount":"100","category":"Test"}')
echo "Response: $response"
if echo "$response" | grep -q "error"; then
    echo "✅ Sheets API correctly rejects empty vendor"
else
    echo "❌ Sheets API should reject empty vendor"
fi
echo ""

# Test 8: Sheets API validation (invalid amount)
echo "Test 8: Sheets API validation (invalid amount)"
response=$(curl -s -X POST "$BASE_URL/api/sheets" \
  -H "Content-Type: application/json" \
  -d '{"date":"10/23/2025","vendor":"Test Vendor","amount":"not-a-number","category":"Test"}')
echo "Response: $response"
if echo "$response" | grep -q "error"; then
    echo "✅ Sheets API correctly rejects invalid amount"
else
    echo "❌ Sheets API should reject invalid amount"
fi
echo ""

# Test 9: Sheets API validation (negative amount)
echo "Test 9: Sheets API validation (negative amount)"
response=$(curl -s -X POST "$BASE_URL/api/sheets" \
  -H "Content-Type: application/json" \
  -d '{"date":"10/23/2025","vendor":"Test Vendor","amount":"-100","category":"Test"}')
echo "Response: $response"
if echo "$response" | grep -q "error"; then
    echo "✅ Sheets API correctly rejects negative amount"
else
    echo "❌ Sheets API should reject negative amount"
fi
echo ""

echo "=========================================="
echo "🎯 API Tests Complete"
echo ""

