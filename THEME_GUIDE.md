# Theme System Usage Guide

## Overview
The ModernIHRMS app now supports **light mode**, **dark mode**, and **auto mode** (follows system preference).

## How to Use Themes in Your Components

### 1. Import the theme hook
```typescript
import { useTheme } from '@shared/theme';
import { createCommonStyles } from '@shared/styles/commonStyles';
```

### 2. Use in your component
```typescript
export default function MyScreen() {
  const theme = useTheme(); // Get current theme
  const commonStyles = createCommonStyles(theme.isDark); // Get themed common styles
  
  return (
    <View style={[commonStyles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.text }}>Hello!</Text>
    </View>
  );
}
```

### 3. Available Theme Properties

#### Colors
```typescript
theme.colors.primary          // Main brand color
theme.colors.background       // Main background
theme.colors.surface          // Card/surface background
theme.colors.text             // Primary text
theme.colors.textSecondary    // Secondary text
theme.colors.border           // Border color
theme.colors.success          // Success green
theme.colors.error            // Error red
// ... and more
```

#### Spacing
```typescript
theme.spacing.xs    // 4
theme.spacing.sm    // 8
theme.spacing.md    // 12
theme.spacing.lg    // 16
theme.spacing.xl    // 20
theme.spacing.xxl   // 24
theme.spacing.xxxl  // 32
```

#### Typography
```typescript
theme.typography.fontSize.sm      // 14
theme.typography.fontSize.md      // 16
theme.typography.fontSize.lg      // 18
theme.typography.fontWeight.bold  // '700'
```

### 4. Common Styles Available

Use `createCommonStyles(theme.isDark)` to get:
- `commonStyles.container` - Full screen container
- `commonStyles.card` - Card style
- `commonStyles.button` - Primary button
- `commonStyles.input` - Text input
- `commonStyles.sectionTitle` - Section heading
- And many more! (See commonStyles.ts for full list)

### 5. Theme Switcher Component

Already implemented in Profile screen:
```typescript
import { ThemeSwitcher } from '@shared/components/ThemeSwitcher';

<ThemeSwitcher /> // Renders a nice toggle for light/dark/auto
```

## Benefits

✅ **Automatic dark mode** - Respects user preference  
✅ **Consistent styling** - Reuse common styles  
✅ **Cross-platform** - Works on Android & iOS  
✅ **Type-safe** - Full TypeScript support  
✅ **Persistent** - Theme preference saved to AsyncStorage
