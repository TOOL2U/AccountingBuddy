# 🖼️ Visual Design Examples - Accounting Buddy Mobile App

**Companion to:** `MOBILE_TEAM_UI_DESIGN_SYSTEM.md`  
**Date:** October 30, 2025

This document shows actual examples from the webapp to help you visualize the design.

---

## 📸 Screenshot References

### **1. Upload Page**

**Key Visual Elements:**
- Large gradient icon at top (Upload icon with rotating glow ring)
- Gradient text heading: "Upload Receipt"
- Glass morphism drag-and-drop area
- Subtle blue glow on hover
- Bottom action buttons with glass effect

**Heading Style:**
```jsx
<Text style={styles.pageTitle}>
  Upload Receipt
</Text>

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 48,  // 3xl on mobile, 5xl on tablet
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    // Gradient text (requires react-native-linear-gradient + MaskedView)
  }
});
```

**Drag Area:**
```jsx
<BlurView intensity={12} tint="dark" style={styles.uploadArea}>
  <Upload color="#60A5FA" size={32} />
  <Text style={styles.uploadText}>
    Drag & drop or tap to upload
  </Text>
  <Text style={styles.uploadSubtext}>
    JPG, PNG, or PDF (max 10MB)
  </Text>
</BlurView>

const styles = StyleSheet.create({
  uploadArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderStyle: 'dashed',
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
  }
});
```

---

### **2. Inbox Page**

**Key Visual Elements:**
- Animated icon with rotating glow ring
- Gradient text: "Inbox"
- Receipt cards with glass effect
- Delete button (red, subtle)
- Empty state with icon

**Receipt Card:**
```jsx
<BlurView intensity={12} tint="dark" style={styles.receiptCard}>
  <View style={styles.receiptHeader}>
    <Text style={styles.receiptDate}>Oct 30, 2025</Text>
    <Badge variant="success" text="Sent" />
  </View>
  
  <Text style={styles.receiptDetail}>
    7-Eleven - Snacks
  </Text>
  
  <View style={styles.receiptFooter}>
    <Text style={styles.receiptAmount}>฿450.00</Text>
    <Pressable onPress={handleDelete}>
      <Trash2 color="#EF4444" size={20} />
    </Pressable>
  </View>
</BlurView>

const styles = StyleSheet.create({
  receiptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 12,
    gap: 12,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  receiptDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#60A5FA',
  }
});
```

---

### **3. P&L Page**

**Key Visual Elements:**
- Period toggle (MTD / YTD) with glass effect
- KPI cards with glass morphism
- Currency values with ฿ symbol
- Trend indicators (up/down arrows)
- Clickable cards show eye icon

**KPI Card:**
```jsx
<Pressable onPress={handleCardPress}>
  <BlurView intensity={12} tint="dark" style={styles.kpiCard}>
    {/* Period Badge */}
    <View style={styles.kpiHeader}>
      <Text style={styles.periodBadge}>MTD</Text>
      <DollarSign color="#60A5FA" size={16} />
    </View>
    
    {/* Title */}
    <Text style={styles.kpiTitle}>Revenue</Text>
    
    {/* Value */}
    <View style={styles.kpiValueRow}>
      <Text style={styles.kpiValue}>฿125,450.00</Text>
      <TrendingUp color="#10B981" size={20} />
    </View>
    
    {/* Trend */}
    <Text style={styles.kpiTrend}>
      +12.5% vs last month
    </Text>
  </BlurView>
</Pressable>

const styles = StyleSheet.create({
  kpiCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    gap: 12,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kpiTrend: {
    fontSize: 12,
    color: '#10B981',
  }
});
```

---

### **4. Balance Page**

**Key Visual Elements:**
- Bank account cards with glass effect
- Balance amount (large, bold)
- Last updated timestamp
- Add balance button (primary style)

**Balance Card:**
```jsx
<BlurView intensity={12} tint="dark" style={styles.balanceCard}>
  <View style={styles.balanceHeader}>
    <Wallet color="#F59E0B" size={24} />
    <Text style={styles.bankName}>
      Bangkok Bank - Shaun Ducker
    </Text>
  </View>
  
  <Text style={styles.balanceAmount}>
    ฿50,000.00
  </Text>
  
  <Text style={styles.balanceDate}>
    Updated: Oct 30, 2025 10:00 AM
  </Text>
</BlurView>

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    gap: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#60A5FA',
  },
  balanceDate: {
    fontSize: 12,
    color: '#6B7280',
  }
});
```

---

## 🎨 Color Usage Examples

### **Success States**
```jsx
// Success badge
<View style={{
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  borderColor: 'rgba(16, 185, 129, 0.2)',
  borderWidth: 1,
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}}>
  <Text style={{ color: 'rgba(52, 211, 153, 0.8)', fontSize: 12 }}>
    ✓ Sent
  </Text>
</View>

// Success icon
<CheckCircle2 color="#10B981" size={20} />

// Success text
<Text style={{ color: '#10B981' }}>
  Transaction successful
</Text>
```

### **Error States**
```jsx
// Error badge
<View style={{
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  borderColor: 'rgba(239, 68, 68, 0.2)',
  borderWidth: 1,
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}}>
  <Text style={{ color: 'rgba(248, 113, 113, 0.8)', fontSize: 12 }}>
    ✗ Failed
  </Text>
</View>

// Error icon
<AlertCircle color="#EF4444" size={20} />

// Error text
<Text style={{ color: '#EF4444' }}>
  Invalid input
</Text>
```

### **Warning States**
```jsx
// Warning badge
<View style={{
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  borderColor: 'rgba(245, 158, 11, 0.2)',
  borderWidth: 1,
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
}}>
  <Text style={{ color: 'rgba(251, 191, 36, 0.8)', fontSize: 12 }}>
    ⚠ Pending
  </Text>
</View>
```

---

## 🎭 Animation Examples

### **Page Enter Animation**
```jsx
import Animated, { FadeInUp } from 'react-native-reanimated';

<Animated.View 
  entering={FadeInUp.duration(800)}
  style={styles.page}
>
  {/* Page content */}
</Animated.View>
```

### **Card Stagger Animation**
```jsx
import Animated, { FadeInDown } from 'react-native-reanimated';

{receipts.map((receipt, index) => (
  <Animated.View
    key={receipt.id}
    entering={FadeInDown.delay(index * 100).duration(600)}
  >
    <ReceiptCard receipt={receipt} />
  </Animated.View>
))}
```

### **Button Press Animation**
```jsx
import { Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

function AnimatedButton({ children, onPress }) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  return (
    <Pressable
      onPressIn={() => scale.value = withSpring(0.98)}
      onPressOut={() => scale.value = withSpring(1)}
      onPress={onPress}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

### **Loading Skeleton**
```jsx
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';

function SkeletonCard() {
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 3000 }),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));
  
  return (
    <Animated.View style={[styles.skeleton, animatedStyle]}>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  }
});
```

---

## 📱 Layout Examples

### **Screen Container**
```jsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

function UploadScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 8,  // px-2
    paddingVertical: 32,   // py-8
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  }
});
```

### **Grid Layout (2 columns)**
```jsx
<View style={styles.grid}>
  {kpis.map((kpi) => (
    <View key={kpi.id} style={styles.gridItem}>
      <KPICard {...kpi} />
    </View>
  ))}
</View>

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '48%',  // 2 columns with gap
  }
});
```

---

## 🎯 Quick Reference

**Most Common Styles:**

```javascript
// Glass card
glass: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  padding: 24,
}

// Primary button
buttonPrimary: {
  backgroundColor: 'rgba(30, 41, 59, 0.4)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(59, 130, 246, 0.2)',
  paddingVertical: 8,
  paddingHorizontal: 16,
}

// Input field
input: {
  backgroundColor: 'rgba(15, 23, 42, 0.3)',
  borderWidth: 1,
  borderColor: 'rgba(51, 65, 85, 0.3)',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 16,
  fontSize: 16,
  color: '#E2E8F0',
}

// Heading
heading: {
  fontSize: 48,
  fontWeight: '800',
  color: '#FFFFFF',
  textAlign: 'center',
}

// Body text
bodyText: {
  fontSize: 16,
  fontWeight: '400',
  color: '#9CA3AF',
  lineHeight: 24,
}

// Label
label: {
  fontSize: 14,
  fontWeight: '500',
  color: '#FFFFFF',
}
```

---

**Need more examples?** Check the webapp source code or ask the webapp team! 🚀



