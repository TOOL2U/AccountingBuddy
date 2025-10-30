/**
 * Mobile Viewport Test Helper
 * 
 * Run this in your browser's DevTools console to verify
 * mobile viewport settings are working correctly.
 */

console.log('\n' + '═'.repeat(70));
console.log('📱 MOBILE VIEWPORT VERIFICATION TEST');
console.log('═'.repeat(70) + '\n');

// 1. Check Viewport Meta Tag
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (viewportMeta) {
  console.log('✅ Viewport Meta Tag Found:');
  console.log(`   Content: ${viewportMeta.getAttribute('content')}`);
  
  const content = viewportMeta.getAttribute('content');
  const checks = {
    hasDeviceWidth: content.includes('width=device-width'),
    hasInitialScale: content.includes('initial-scale=1'),
    hasMaxScale: content.includes('maximum-scale=1'),
    hasUserScalable: content.includes('user-scalable=no') || content.includes('user-scalable=0'),
    hasViewportFit: content.includes('viewport-fit=cover'),
  };
  
  console.log('\n   Settings:');
  console.log(`   ${checks.hasDeviceWidth ? '✅' : '❌'} width=device-width`);
  console.log(`   ${checks.hasInitialScale ? '✅' : '❌'} initial-scale=1`);
  console.log(`   ${checks.hasMaxScale ? '✅' : '❌'} maximum-scale=1`);
  console.log(`   ${checks.hasUserScalable ? '✅' : '❌'} user-scalable=no`);
  console.log(`   ${checks.hasViewportFit ? '✅' : '❌'} viewport-fit=cover`);
} else {
  console.log('❌ Viewport Meta Tag NOT FOUND!');
}

// 2. Check Theme Color
const themeColor = document.querySelector('meta[name="theme-color"]');
if (themeColor) {
  console.log(`\n✅ Theme Color: ${themeColor.getAttribute('content')}`);
} else {
  console.log('\n⚠️  Theme Color meta tag not found');
}

// 3. Check Manifest Link
const manifest = document.querySelector('link[rel="manifest"]');
if (manifest) {
  console.log(`✅ PWA Manifest: ${manifest.getAttribute('href')}`);
} else {
  console.log('⚠️  PWA Manifest link not found');
}

// 4. Check Apple Web App Meta Tags
const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');

if (appleCapable || appleStatusBar || appleTitle) {
  console.log('\n✅ Apple Web App Meta Tags:');
  if (appleCapable) console.log(`   Capable: ${appleCapable.getAttribute('content')}`);
  if (appleStatusBar) console.log(`   Status Bar: ${appleStatusBar.getAttribute('content')}`);
  if (appleTitle) console.log(`   Title: ${appleTitle.getAttribute('content')}`);
}

// 5. Check Input Font Sizes
console.log('\n📝 Input Font Size Check:');
const inputs = document.querySelectorAll('input, select, textarea');
let allInputsCorrect = true;
let sampleChecked = 0;

inputs.forEach((input, index) => {
  if (index < 5) { // Check first 5 inputs
    const fontSize = window.getComputedStyle(input).fontSize;
    const fontSizeValue = parseFloat(fontSize);
    const isCorrect = fontSizeValue >= 16;
    
    console.log(`   ${isCorrect ? '✅' : '❌'} ${input.tagName.toLowerCase()}: ${fontSize}`);
    
    if (!isCorrect) allInputsCorrect = false;
    sampleChecked++;
  }
});

if (sampleChecked === 0) {
  console.log('   ℹ️  No inputs found on this page');
} else if (allInputsCorrect) {
  console.log(`   ✅ All sampled inputs (${sampleChecked}) have font-size >= 16px`);
}

// 6. Check Computed Viewport Width
console.log('\n📐 Viewport Dimensions:');
console.log(`   Window Width: ${window.innerWidth}px`);
console.log(`   Window Height: ${window.innerHeight}px`);
console.log(`   Device Pixel Ratio: ${window.devicePixelRatio}x`);
console.log(`   Screen Width: ${window.screen.width}px`);
console.log(`   Screen Height: ${window.screen.height}px`);

// 7. Check if Mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);

console.log('\n📱 Device Detection:');
console.log(`   Mobile: ${isMobile ? 'Yes' : 'No'}`);
console.log(`   iOS: ${isIOS ? 'Yes' : 'No'}`);
console.log(`   Android: ${isAndroid ? 'Yes' : 'No'}`);
console.log(`   User Agent: ${navigator.userAgent}`);

// 8. Test Touch Action
const html = document.documentElement;
const htmlTouchAction = window.getComputedStyle(html).touchAction;
console.log(`\n✅ HTML touch-action: ${htmlTouchAction}`);

// 9. Overall Status
console.log('\n' + '═'.repeat(70));
const hasViewport = viewportMeta !== null;
const hasCorrectSettings = viewportMeta && viewportMeta.getAttribute('content').includes('width=device-width');

if (hasViewport && hasCorrectSettings) {
  console.log('🎉 MOBILE VIEWPORT FIX: ✅ WORKING');
  console.log('\nThe app should:');
  console.log('  ✅ Load at 100% zoom (no zoom-in)');
  console.log('  ✅ Fit full screen width on mobile');
  console.log('  ✅ NOT zoom when focusing on inputs (iOS)');
  console.log('  ✅ Display edge-to-edge on modern iPhones');
} else {
  console.log('⚠️  MOBILE VIEWPORT FIX: INCOMPLETE');
  console.log('\nMissing or incorrect viewport configuration.');
}
console.log('═'.repeat(70) + '\n');

// 10. Mobile-specific tests
if (isMobile) {
  console.log('💡 MOBILE DEVICE DETECTED - Additional Tests:');
  console.log('\n   Manual Tests:');
  console.log('   1. Tap on any input field');
  console.log('   2. Page should NOT zoom in');
  console.log('   3. Try double-tapping - should NOT zoom');
  console.log('   4. Check if page fits full width (no horizontal scroll)');
  console.log('\n   PWA Test:');
  console.log('   1. Open browser menu (Safari/Chrome)');
  console.log('   2. Look for "Add to Home Screen"');
  console.log('   3. Icon should show as "Accounting Buddy"');
  console.log('   4. When opened from home screen, should have no browser chrome');
  console.log('');
}
