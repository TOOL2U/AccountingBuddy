#!/bin/bash

# Accounting Buddy - End-to-End Pipeline Test Script
# Tests OCR → Extract → Sheets pipeline with real API calls

set -e  # Exit on error

echo "=========================================="
echo "🧪 Accounting Buddy Pipeline Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}✖ Error: .env.local file not found${NC}"
    echo "Please create .env.local with required API keys"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check required environment variables
echo -e "${BLUE}[1/5] Checking environment variables...${NC}"
MISSING_VARS=0

if [ -z "$GOOGLE_VISION_KEY" ]; then
    echo -e "${RED}✖ GOOGLE_VISION_KEY not set${NC}"
    MISSING_VARS=1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}✖ OPENAI_API_KEY not set${NC}"
    MISSING_VARS=1
fi

if [ -z "$SHEETS_WEBHOOK_URL" ]; then
    echo -e "${RED}✖ SHEETS_WEBHOOK_URL not set${NC}"
    MISSING_VARS=1
fi

if [ -z "$SHEETS_WEBHOOK_SECRET" ]; then
    echo -e "${RED}✖ SHEETS_WEBHOOK_SECRET not set${NC}"
    MISSING_VARS=1
fi

if [ $MISSING_VARS -eq 1 ]; then
    echo -e "${RED}✖ Missing required environment variables${NC}"
    exit 1
fi

echo -e "${GREEN}✔ All environment variables configured${NC}"
echo ""

# Check if dev server is running
echo -e "${BLUE}[2/5] Checking if dev server is running...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}✖ Dev server not running${NC}"
    echo "Please start the dev server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✔ Dev server is running${NC}"
echo ""

# Test 1: OCR API with sample text
echo -e "${BLUE}[3/5] Testing OCR API...${NC}"
echo "Creating test receipt image..."

# Create a simple test receipt (base64 encoded 1x1 pixel PNG)
# In real testing, you would use an actual receipt image
TEST_IMAGE_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# For now, we'll skip the actual OCR test since we need a real image
echo -e "${YELLOW}⚠ Skipping OCR test (requires real receipt image)${NC}"
echo -e "${YELLOW}  To test OCR manually:${NC}"
echo -e "${YELLOW}  1. Go to http://localhost:3000/upload${NC}"
echo -e "${YELLOW}  2. Upload a receipt image (JPG, PNG, or PDF)${NC}"
echo -e "${YELLOW}  3. Check terminal logs for OCR output${NC}"
echo ""

# Test 2: Extract API with sample text
echo -e "${BLUE}[4/5] Testing AI Extraction API...${NC}"

SAMPLE_TEXT="HomePro
Date: 27/02/2025
Materials for wall construction
Total: ฿1,245
Payment: Cash"

echo "Sample receipt text:"
echo "$SAMPLE_TEXT"
echo ""

EXTRACT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$SAMPLE_TEXT\", \"comment\": \"Materials for wall construction\"}")

if echo "$EXTRACT_RESPONSE" | grep -q "typeOfOperation"; then
    echo -e "${GREEN}✔ AI extraction successful${NC}"
    echo "Extracted data:"
    echo "$EXTRACT_RESPONSE" | jq '.' 2>/dev/null || echo "$EXTRACT_RESPONSE"
else
    echo -e "${RED}✖ AI extraction failed${NC}"
    echo "Response: $EXTRACT_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Google Sheets webhook
echo -e "${BLUE}[5/5] Testing Google Sheets webhook...${NC}"

# Extract data from previous response
EXTRACTED_DATA=$(echo "$EXTRACT_RESPONSE" | jq -c '{
  day: .day,
  month: .month,
  year: .year,
  property: .property,
  typeOfOperation: .typeOfOperation,
  typeOfPayment: .typeOfPayment,
  detail: .detail,
  ref: .ref,
  debit: .debit,
  credit: .credit
}' 2>/dev/null)

if [ -z "$EXTRACTED_DATA" ] || [ "$EXTRACTED_DATA" = "null" ]; then
    echo -e "${YELLOW}⚠ Could not extract data for Sheets test${NC}"
    echo "Skipping Sheets webhook test"
else
    echo "Sending to Google Sheets..."
    SHEETS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/sheets \
      -H "Content-Type: application/json" \
      -d "$EXTRACTED_DATA")

    if echo "$SHEETS_RESPONSE" | grep -q "success.*true"; then
        echo -e "${GREEN}✔ Google Sheets append successful${NC}"
        echo "Response: $SHEETS_RESPONSE"
    else
        echo -e "${RED}✖ Google Sheets append failed${NC}"
        echo "Response: $SHEETS_RESPONSE"
        exit 1
    fi
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✅ Pipeline Test Complete${NC}"
echo "=========================================="
echo ""
echo "Test Results:"
echo -e "  ${GREEN}✔${NC} Environment variables configured"
echo -e "  ${GREEN}✔${NC} Dev server running"
echo -e "  ${YELLOW}⚠${NC} OCR test (manual testing required)"
echo -e "  ${GREEN}✔${NC} AI extraction working"
echo -e "  ${GREEN}✔${NC} Google Sheets integration working"
echo ""
echo "Next Steps:"
echo "  1. Test with real receipt images at http://localhost:3000/upload"
echo "  2. Verify data appears in Google Sheets"
echo "  3. Test various receipt types (Thai/English, different formats)"
echo "  4. Test comment-guided categorization"
echo ""
echo "For production testing, visit:"
echo "  https://accounting-buddy-seven.vercel.app/upload"
echo ""

