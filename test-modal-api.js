#!/bin/bash

echo "🧪 Testing Property/Person Modal API Endpoints"
echo ""

echo "📊 Testing month period..."
MONTH_RESPONSE=$(curl -s "http://localhost:3000/api/pnl/property-person?period=month")
if echo "$MONTH_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Month period: Success!"
  MONTH_COUNT=$(echo "$MONTH_RESPONSE" | grep -o '"data":\[.*\]' | grep -o '{"name"' | wc -l)
  MONTH_TOTAL=$(echo "$MONTH_RESPONSE" | grep -o '"totalExpense":[0-9]*' | grep -o '[0-9]*')
  echo "   - Total items: $MONTH_COUNT"
  echo "   - Total expense: \$$MONTH_TOTAL"
else
  echo "❌ Month period: Failed!"
  echo "   Response: $MONTH_RESPONSE"
fi
echo ""

echo "📊 Testing year period..."
YEAR_RESPONSE=$(curl -s "http://localhost:3000/api/pnl/property-person?period=year")
if echo "$YEAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Year period: Success!"
  YEAR_COUNT=$(echo "$YEAR_RESPONSE" | grep -o '"data":\[.*\]' | grep -o '{"name"' | wc -l)
  YEAR_TOTAL=$(echo "$YEAR_RESPONSE" | grep -o '"totalExpense":[0-9]*' | grep -o '[0-9]*')
  echo "   - Total items: $YEAR_COUNT"
  echo "   - Total expense: \$$YEAR_TOTAL"
else
  echo "❌ Year period: Failed!"
  echo "   Response: $YEAR_RESPONSE"
fi
echo ""

echo "🎉 Modal API testing complete!"
echo ""
echo "📝 To test the full modal:"
echo "1. Open http://localhost:3000/pnl"
echo "2. Click on the 'Property/Person' card"
echo "3. Verify the modal opens with expense breakdown"
echo "4. Test both month/year toggle buttons"