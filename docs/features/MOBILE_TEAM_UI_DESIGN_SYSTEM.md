# 🎨 Accounting Buddy - Mobile App UI Design System

**Version:** 1.0  
**Date:** October 30, 2025  
**For:** Mobile App Team (React Native/Expo)  
**Purpose:** Match the exact design theme between webapp and mobile app

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations & Transitions](#animations--transitions)
7. [Glass Morphism Effects](#glass-morphism-effects)
8. [Icons](#icons)
9. [Mobile-Specific Considerations](#mobile-specific-considerations)

---

## 🎯 Design Philosophy

### **Core Principles:**
- **Dark Theme Only** - Pure black background (#000000) with subtle gradients
- **Glass Morphism** - Frosted glass effects with backdrop blur
- **Minimal & Elegant** - Ultra-subtle animations and effects
- **Slow & Smooth** - All animations are intentionally slowed down (0.4s - 0.8s)
- **Accessibility First** - High contrast, readable text, proper touch targets

### **Visual Style:**
- **Background:** Pure black with ultra-subtle smoke/gradient overlays
- **Surfaces:** Semi-transparent white overlays with blur effects
- **Borders:** Very subtle white borders with low opacity (10-20%)
- **Shadows:** Minimal, using white shadows instead of black
- **Glow Effects:** Extremely subtle, barely noticeable

---

## 🎨 Color System

### **Background Colors**

```javascript
// Main background
backgroundColor: '#000000'  // Pure black

// Surface layers (use rgba for transparency)
surface0: '#0B0F14'                      // Darkest surface
surface1: 'rgba(255, 255, 255, 0.03)'   // Lightest surface
surface2: 'rgba(255, 255, 255, 0.06)'   // Medium surface
surface3: 'rgba(255, 255, 255, 0.09)'   // Elevated surface
```

### **Text Colors**

```javascript
textPrimary: '#FFFFFF'      // Main text (white)
textSecondary: '#9CA3AF'    // Secondary text (gray-400)
textTertiary: '#6B7280'     // Tertiary text (gray-500)
```

### **Brand Colors**

```javascript
brandPrimary: '#60A5FA'     // Blue-400 (main brand color)
brandSecondary: '#3B82F6'   // Blue-500 (darker brand)
```

### **Status Colors**

```javascript
statusSuccess: '#10B981'    // Green-500 (success states)
statusWarning: '#F59E0B'    // Amber-500 (warnings)
statusDanger: '#EF4444'     // Red-500 (errors, delete)
statusInfo: '#06B6D4'       // Cyan-500 (info, inbox)
```

### **Border Colors**

```javascript
borderLight: 'rgba(255, 255, 255, 0.10)'    // 10% white
borderMedium: 'rgba(255, 255, 255, 0.15)'   // 15% white
```

### **Slate Palette (for UI elements)**

```javascript
slate300: '#CBD5E1'
slate400: '#94A3B8'
slate500: '#64748B'
slate600: '#475569'
slate700: '#334155'
slate800: '#1E293B'
slate900: '#0F172A'
```

---

## ✍️ Typography

### **Font Family**

```javascript
fontFamily: 'Inter'  // Primary font
// Fallback: System fonts (SF Pro on iOS, Roboto on Android)
```

**Installation (React Native):**
```bash
npx expo install expo-font @expo-google-fonts/inter
```

### **Font Weights**

```javascript
fontWeightRegular: '400'
fontWeightMedium: '500'
fontWeightSemiBold: '600'
fontWeightBold: '700'
fontWeightExtraBold: '800'
```

### **Font Sizes**

```javascript
// Headings
h1: 48,  // Page titles (3xl on mobile, 5xl on tablet)
h2: 36,  // Section headers
h3: 24,  // Card titles
h4: 20,  // Subsection headers

// Body text
textLg: 18,
textBase: 16,  // Default body text (IMPORTANT: minimum 16px for iOS)
textSm: 14,
textXs: 12,

// Labels
labelLg: 14,
labelMd: 13,
labelSm: 12,
```

**⚠️ CRITICAL:** All input fields MUST use minimum 16px font size to prevent iOS Safari auto-zoom!

### **Line Heights**

```javascript
lineHeightTight: 1.25    // For headings
lineHeightNormal: 1.5    // For body text
lineHeightRelaxed: 1.75  // For long-form content
```

### **Letter Spacing**

```javascript
trackingTighter: -0.5,   // For large headings
trackingNormal: 0,       // Default
trackingWide: 0.5,       // For uppercase labels
trackingWider: 1,        // For small uppercase text
```

---

## 📐 Spacing & Layout

### **Spacing Scale**

```javascript
spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
}
```

### **Border Radius**

```javascript
borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  full: 9999,
}
```

### **Container Padding**

```javascript
// Screen edges
paddingHorizontal: 8,   // Mobile (px-2)
paddingHorizontalMd: 24, // Tablet (px-6)

// Vertical spacing
paddingVertical: 32,    // py-8
```

### **Max Width**

```javascript
maxWidth: 1100,  // Max container width for content
```

### **Safe Area**

```javascript
// Use SafeAreaView from react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

// Bottom bar should respect safe area
paddingBottom: 'calc(12px + env(safe-area-inset-bottom))'
```

---

## 🧩 Components

### **1. Card Component**

**Visual Style:**
- Glass morphism effect
- Rounded corners (16-20px)
- Subtle border
- Backdrop blur

```javascript
// React Native StyleSheet
card: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  padding: 32,
  // Note: Backdrop blur requires expo-blur
}
```

**With expo-blur:**
```jsx
import { BlurView } from 'expo-blur';

<BlurView intensity={12} tint="dark" style={styles.card}>
  {/* Card content */}
</BlurView>
```

**Hover State (for pressable cards):**
```javascript
cardHover: {
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
}
```

---

### **2. Button Component**

**Variants:**

**Primary Button:**
```javascript
buttonPrimary: {
  backgroundColor: 'rgba(30, 41, 59, 0.4)',  // slate-800/40
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(59, 130, 246, 0.2)',    // blue-500/20
  paddingVertical: 8,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  // Shadow (iOS)
  shadowColor: 'rgba(59, 130, 246, 0.1)',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 8,
  // Shadow (Android)
  elevation: 4,
}

buttonPrimaryText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '500',
}
```

**Secondary Button:**
```javascript
buttonSecondary: {
  backgroundColor: 'rgba(30, 41, 59, 0.3)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(100, 116, 139, 0.2)',
  paddingVertical: 8,
  paddingHorizontal: 16,
}

buttonSecondaryText: {
  color: '#9CA3AF',
  fontSize: 16,
  fontWeight: '500',
}
```

**Outline Button:**
```javascript
buttonOutline: {
  backgroundColor: 'transparent',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(100, 116, 139, 0.3)',
  paddingVertical: 8,
  paddingHorizontal: 16,
}
```

**Danger Button:**
```javascript
buttonDanger: {
  backgroundColor: 'rgba(30, 41, 59, 0.4)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(239, 68, 68, 0.2)',
  paddingVertical: 8,
  paddingHorizontal: 16,
}

buttonDangerText: {
  color: '#FCA5A5',  // red-300
  fontSize: 16,
  fontWeight: '500',
}
```

**Button Sizes:**
```javascript
buttonSm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14 }
buttonMd: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 16 }
buttonLg: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 18 }
```

**Press Animation:**
```jsx
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

<Pressable
  onPressIn={() => scale.value = withSpring(0.98)}
  onPressOut={() => scale.value = withSpring(1)}
>
  <Animated.View style={[styles.button, animatedStyle]}>
    <Text>Button</Text>
  </Animated.View>
</Pressable>
```

---

### **3. Input Component**

```javascript
input: {
  width: '100%',
  paddingVertical: 10,
  paddingHorizontal: 16,
  backgroundColor: 'rgba(15, 23, 42, 0.3)',  // slate-900/30
  borderWidth: 1,
  borderColor: 'rgba(51, 65, 85, 0.3)',      // slate-700/30
  borderRadius: 12,
  color: '#E2E8F0',                          // slate-200
  fontSize: 16,  // CRITICAL: Minimum 16px for iOS!
  fontWeight: '400',
}

inputFocused: {
  borderColor: 'rgba(100, 116, 139, 0.5)',   // slate-600/50
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
}

inputError: {
  borderColor: 'rgba(239, 68, 68, 0.4)',     // red-500/40
}

inputLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: '#FFFFFF',
  marginBottom: 8,
}

inputHelperText: {
  fontSize: 12,
  color: '#6B7280',
  marginTop: 4,
}

inputErrorText: {
  fontSize: 12,
  color: '#EF4444',
  marginTop: 4,
}
```

---

### **4. Badge Component**

**Variants:**

```javascript
// Success Badge
badgeSuccess: {
  backgroundColor: 'rgba(16, 185, 129, 0.1)',  // emerald-500/10
  borderWidth: 1,
  borderColor: 'rgba(16, 185, 129, 0.2)',
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}
badgeSuccessText: {
  color: 'rgba(52, 211, 153, 0.8)',  // emerald-400/80
  fontSize: 12,
  fontWeight: '500',
}

// Warning Badge
badgeWarning: {
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(245, 158, 11, 0.2)',
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}
badgeWarningText: {
  color: 'rgba(251, 191, 36, 0.8)',  // amber-400/80
  fontSize: 12,
  fontWeight: '500',
}

// Danger Badge
badgeDanger: {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(239, 68, 68, 0.2)',
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}
badgeDangerText: {
  color: 'rgba(248, 113, 113, 0.8)',  // red-400/80
  fontSize: 12,
  fontWeight: '500',
}

// Info Badge
badgeInfo: {
  backgroundColor: 'rgba(100, 116, 139, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(100, 116, 139, 0.2)',
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}
badgeInfoText: {
  color: 'rgba(148, 163, 184, 0.8)',  // slate-400/80
  fontSize: 12,
  fontWeight: '500',
}
```

---

### **5. Toast/Notification**

```javascript
toast: {
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
  zIndex: 100,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 16,
  borderWidth: 1,
  padding: 16,
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
}

toastSuccess: {
  backgroundColor: 'rgba(16, 185, 129, 0.2)',
  borderColor: 'rgba(16, 185, 129, 0.3)',
}

toastError: {
  backgroundColor: 'rgba(239, 68, 68, 0.2)',
  borderColor: 'rgba(239, 68, 68, 0.3)',
}

toastText: {
  flex: 1,
  fontSize: 14,
  color: '#FFFFFF',
  lineHeight: 20,
}
```

---

## 🎬 Animations & Transitions

### **Animation Timing (SLOW & SMOOTH)**

```javascript
// All animations are intentionally slowed down
durationFast: 300,      // 0.3s
durationNormal: 400,    // 0.4s (default)
durationSlow: 600,      // 0.6s
durationVerySlow: 800,  // 0.8s
```

### **Common Animations**

**Installation:**
```bash
npx expo install react-native-reanimated
```

**1. Fade In:**
```jsx
import Animated, { FadeIn } from 'react-native-reanimated';

<Animated.View entering={FadeIn.duration(500)}>
  {/* Content */}
</Animated.View>
```

**2. Slide Up:**
```jsx
import Animated, { SlideInDown } from 'react-native-reanimated';

<Animated.View entering={SlideInDown.duration(600)}>
  {/* Content */}
</Animated.View>
```

**3. Press Scale:**
```jsx
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

<Pressable
  onPressIn={() => scale.value = withSpring(0.98)}
  onPressOut={() => scale.value = withSpring(1)}
>
  <Animated.View style={animatedStyle}>
    {/* Button content */}
  </Animated.View>
</Pressable>
```

---

## 🌫️ Glass Morphism Effects

**Installation:**
```bash
npx expo install expo-blur
```

**Basic Glass Card:**
```jsx
import { BlurView } from 'expo-blur';

<BlurView
  intensity={12}  // Blur strength
  tint="dark"     // Always "dark" for dark theme
  style={styles.glassCard}
>
  {/* Card content */}
</BlurView>

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    overflow: 'hidden',  // Required!
  }
});
```

**Blur Intensity:**
- **12**: Cards, buttons
- **16**: Modals
- **20**: Navigation bars

---

## 🎨 Icons

**Use Lucide React Native:**
```bash
npx expo install lucide-react-native
```

**Common Icons:**
```jsx
import {
  Upload,
  Inbox,
  BarChart3,
  Wallet,
  Settings,
  Sparkles,
  Camera,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react-native';

// Usage
<Upload color="#60A5FA" size={20} />
```

**Icon Sizes:**
- **16**: Small icons (badges)
- **20**: Default icons (buttons, nav)
- **24**: Medium icons (cards)
- **32**: Large icons (page headers)
- **40**: Extra large (empty states)

---

## 📱 Mobile-Specific Considerations

### **1. Safe Area**

```bash
npx expo install react-native-safe-area-context
```

```jsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  {/* Content */}
</SafeAreaView>
```

### **2. Touch Targets**

**Minimum touch target: 44x44 points (iOS HIG)**

```javascript
touchTarget: {
  minWidth: 44,
  minHeight: 44,
  justifyContent: 'center',
  alignItems: 'center',
}
```

### **3. iOS Auto-Zoom Prevention**

**CRITICAL: All inputs must use 16px minimum font size!**

```javascript
input: {
  fontSize: 16,  // Prevents iOS auto-zoom
}
```

### **4. Keyboard Handling**

```bash
npx expo install react-native-keyboard-aware-scroll-view
```

```jsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

<KeyboardAwareScrollView
  enableOnAndroid={true}
  extraScrollHeight={20}
>
  {/* Form content */}
</KeyboardAwareScrollView>
```

### **5. Platform-Specific Styles**

```jsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

---

## 📄 Page-Specific Backgrounds

Each page has a subtle gradient overlay:

```javascript
// Upload page - Slate tint
pageUpload: {
  backgroundColor: '#000000',
  // Add subtle radial gradient overlay
}

// Inbox page - Gray tint
pageInbox: {
  backgroundColor: '#000000',
}

// P&L page - Steel tint
pagePnL: {
  backgroundColor: '#000000',
}

// Balance page - Slate tint
pageBalance: {
  backgroundColor: '#000000',
}
```

**Note:** The webapp uses CSS radial gradients with blur. In React Native, you can use `expo-linear-gradient` for similar effects, but keep them VERY subtle (opacity 0.02-0.03).

---

## ✅ Design Checklist

Before submitting designs, verify:

- [ ] All backgrounds are pure black (#000000)
- [ ] All text is readable (minimum contrast ratio 4.5:1)
- [ ] All touch targets are minimum 44x44 points
- [ ] All inputs use 16px minimum font size
- [ ] All animations are 0.4s - 0.8s duration
- [ ] Glass effects use expo-blur with intensity 12-20
- [ ] All borders use white with 10-20% opacity
- [ ] All shadows use white, not black
- [ ] Safe area insets are respected
- [ ] Icons are from lucide-react-native
- [ ] Font is Inter (with system fallback)

---

## 📦 Required Dependencies

```bash
# Core
npx expo install expo-blur
npx expo install react-native-reanimated
npx expo install react-native-safe-area-context
npx expo install lucide-react-native

# Fonts
npx expo install expo-font @expo-google-fonts/inter

# Utilities
npx expo install react-native-keyboard-aware-scroll-view
npx expo install expo-linear-gradient
```

---

## 🎯 Summary

**Key Principles:**
1. **Pure black background** (#000000)
2. **Glass morphism** everywhere (blur + transparency)
3. **Slow animations** (0.4s - 0.8s)
4. **Subtle effects** (very low opacity)
5. **16px minimum** font size for inputs
6. **44x44 minimum** touch targets
7. **Inter font** with system fallback
8. **White borders** with 10-20% opacity
9. **Safe area** respect on all screens
10. **Lucide icons** for consistency

---

**Questions?** Contact the webapp team for clarification or examples!

**Last Updated:** October 30, 2025


