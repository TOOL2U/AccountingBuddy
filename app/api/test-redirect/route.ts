import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test URL from a recent redirect
    const testUrl = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgygPxOvIMmRJh3KDU60hwSY4yKKbHb-ZNb4VkUwwViyW-jhjO6qkk7QJbU_phQ-j_OVKdzXQKI1j89lSdrY8TClfkLcRpNKqT8aF5Tc3gZ0k-itLuky8PalQNyUIfls3pSErjOHrW9r89JvsGn3RM-ItdI3_mq2R-HiBgrsHQs4ajgjK30_Fyybh8NQHEYvLTreCqWbpIs0KRMp4E_ItxoT-6xIrj-O3KV0bG-x9ZQCG_Rk8_Hd33_mEMEZQmLFYepKZONSfxe46sQkYQTCqnLDxg3uA&lib=MM5FYNOcMZJ4k-q58RzHX64FpGDg2vV9V";
    
    console.log('Testing redirect URL fetch...');
    const response = await fetch(testUrl);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({
        ok: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        body: text.substring(0, 500)
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      ok: true,
      message: 'Successfully fetched redirect URL',
      data
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      stack: error.stack
    });
  }
}

