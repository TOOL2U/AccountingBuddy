/**
 * Test script to debug the property/person API endpoint
 * Run this with: node test-property-person.js
 */

require('dotenv').config({ path: '.env.local' });

async function testPropertyPersonAPI() {
  const scriptUrl = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_WEBHOOK_SECRET;
  
  console.log('📍 Testing Property/Person API');
  console.log('Script URL:', scriptUrl ? 'SET' : 'NOT SET');
  console.log('Secret:', secret ? 'SET' : 'NOT SET');
  
  if (!scriptUrl || !secret) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const payload = {
    action: 'getPropertyPersonDetails',
    period: 'month',
    secret: secret
  };
  
  console.log('📤 Sending payload:', {
    ...payload,
    secret: '[REDACTED]'
  });
  
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📊 Response status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPropertyPersonAPI();