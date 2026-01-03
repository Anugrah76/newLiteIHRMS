import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

// Linear Gradient Components
export const SoftFluorescentLinear = ({ style, children, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <LinearGradient id="softLinear" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#f8fafb" stopOpacity="1" />
          <Stop offset="15%" stopColor="#e8f2f5" stopOpacity="1" />
          <Stop offset="30%" stopColor="#d4e8ed" stopOpacity="1" />
          <Stop offset="45%" stopColor="#c2dde4" stopOpacity="1" />
          <Stop offset="60%" stopColor="#b8d6df" stopOpacity="1" />
          <Stop offset="75%" stopColor="#c2dde4" stopOpacity="1" />
          <Stop offset="85%" stopColor="#d4e8ed" stopOpacity="1" />
          <Stop offset="92%" stopColor="#e8f2f5" stopOpacity="1" />
          <Stop offset="100%" stopColor="#f8fafb" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#softLinear)" />
    </Svg>
    {children && <View style={styles.contentContainer}>{children}</View>}
  </View>
);

export const HarshFluorescentLinear = ({ style, children, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <LinearGradient id="harshLinear" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <Stop offset="10%" stopColor="#f0f8ff" stopOpacity="1" />
          <Stop offset="25%" stopColor="#e6f3ff" stopOpacity="1" />
          <Stop offset="40%" stopColor="#ddeeff" stopOpacity="1" />
          <Stop offset="50%" stopColor="#d4e9ff" stopOpacity="1" />
          <Stop offset="60%" stopColor="#ddeeff" stopOpacity="1" />
          <Stop offset="75%" stopColor="#e6f3ff" stopOpacity="1" />
          <Stop offset="90%" stopColor="#f0f8ff" stopOpacity="1" />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#harshLinear)" />
    </Svg>
    {children && <View style={styles.contentContainer}>{children}</View>}
  </View>
);

// Radial Gradient Components
export const SoftFluorescentRadial = ({ style, children, centerX = "50%", centerY = "30%", radius = "70%", ...props }) => (
  <View style={[styles.container, style]} {...props}>
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <RadialGradient id="softRadial" cx={centerX} cy={centerY} r={radius}>
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <Stop offset="15%" stopColor="#f8fcff" stopOpacity="1" />
          <Stop offset="30%" stopColor="#f0f8ff" stopOpacity="1" />
          <Stop offset="45%" stopColor="#e8f4ff" stopOpacity="1" />
          <Stop offset="60%" stopColor="#e0f0ff" stopOpacity="1" />
          <Stop offset="75%" stopColor="#d8ecff" stopOpacity="1" />
          <Stop offset="90%" stopColor="#d0e8ff" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#c8e4ff" stopOpacity="0.7" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#softRadial)" />
    </Svg>
    {children && <View style={styles.contentContainer}>{children}</View>}
  </View>
);

export const HarshFluorescentRadial = ({ style, children, centerX = "50%", centerY = "20%", radius = "80%", ...props }) => (
  <View style={[styles.container, style]} {...props}>
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <RadialGradient id="harshRadial" cx={centerX} cy={centerY} r={radius}>
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <Stop offset="20%" stopColor="#fafeff" stopOpacity="1" />
          <Stop offset="40%" stopColor="#f5fbff" stopOpacity="1" />
          <Stop offset="60%" stopColor="#f0f8ff" stopOpacity="1" />
          <Stop offset="80%" stopColor="#ebf5ff" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#e6f2ff" stopOpacity="0.85" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#harshRadial)" />
    </Svg>
    {children && <View style={styles.contentContainer}>{children}</View>}
  </View>
);

// Multi-source radial gradient
export const MultiSourceFluorescent = ({ style, children, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <RadialGradient id="radialLeft" cx="25%" cy="25%" r="50%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <Stop offset="30%" stopColor="#f0f8ff" stopOpacity="0.7" />
          <Stop offset="60%" stopColor="#e6f3ff" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#ddeeff" stopOpacity="0.2" />
        </RadialGradient>
        <RadialGradient id="radialRight" cx="75%" cy="25%" r="50%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <Stop offset="30%" stopColor="#f0f8ff" stopOpacity="0.7" />
          <Stop offset="60%" stopColor="#e6f3ff" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#ddeeff" stopOpacity="0.2" />
        </RadialGradient>
        <RadialGradient id="radialCenter" cx="50%" cy="60%" r="40%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <Stop offset="40%" stopColor="#f0f8ff" stopOpacity="0.6" />
          <Stop offset="80%" stopColor="#e6f3ff" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#ddeeff" stopOpacity="0.1" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="#e8f2f5" />
      <Rect width="100%" height="100%" fill="url(#radialLeft)" />
      <Rect width="100%" height="100%" fill="url(#radialRight)" />
      <Rect width="100%" height="100%" fill="url(#radialCenter)" />
    </Svg>
    {children && <View style={styles.contentContainer}>{children}</View>}
  </View>
);

// Office Grid Lighting - 2x2 grid of lights
export const OfficeGridLighting = ({ style, children, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <RadialGradient id="gridTopLeft" cx="25%" cy="25%" r="35%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="40%" stopColor="#f5fbff" stopOpacity="0.7" />
          <Stop offset="80%" stopColor="#ebf5ff" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#e1f1ff" stopOpacity="0.1" />
        </RadialGradient>
        <RadialGradient id="gridTopRight" cx="75%" cy="25%" r="35%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="40%" stopColor="#f5fbff" stopOpacity="0.7" />
          <Stop offset="80%" stopColor="#ebf5ff" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#e1f1ff" stopOpacity="0.1" />
        </RadialGradient>
        <RadialGradient id="gridBottomLeft" cx="25%" cy="75%" r="35%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="40%" stopColor="#f5fbff" stopOpacity="0.7" />
          <Stop offset="80%" stopColor="#ebf5ff" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#e1f1ff" stopOpacity="0.1" />
        </RadialGradient>
        <RadialGradient id="gridBottomRight" cx="75%" cy="75%" r="35%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="40%" stopColor="#f5fbff" stopOpacity="0.7" />
          <Stop offset="80%" stopColor="#ebf5ff" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#e1f1ff" stopOpacity="0.1" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="#e8f2f5" />
      <Rect width="100%" height="100%" fill="url(#gridTopLeft)" />
      <Rect width="100%" height="100%" fill="url(#gridTopRight)" />
      <Rect width="100%" height="100%" fill="url(#gridBottomLeft)" />
      <Rect width="100%" height="100%" fill="url(#gridBottomRight)" />
    </Svg>
    {children && <View style={styles.contentContainer}>{children}</View>}
  </View>
);

// Horizontal Linear Strip (like fluorescent tubes)
export const FluorescentStrip = ({ style, children, direction = "horizontal", ...props }) => {
  const gradientProps = direction === "horizontal" 
    ? { x1: "0%", y1: "0%", x2: "100%", y2: "0%" }
    : { x1: "0%", y1: "0%", x2: "0%", y2: "100%" };

  return (
    <View style={[styles.container, style]} {...props}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="strip" {...gradientProps}>
            <Stop offset="0%" stopColor="#e6f3ff" stopOpacity="0.8" />
            <Stop offset="15%" stopColor="#f0f8ff" stopOpacity="0.9" />
            <Stop offset="30%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="70%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="85%" stopColor="#f0f8ff" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#e6f3ff" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#strip)" />
      </Svg>
      {children && <View style={styles.contentContainer}>{children}</View>}
    </View>
  );
};

// Corner lighting effect
export const CornerFluorescent = ({ style, children, corner = "topLeft", ...props }) => {
  const positions = {
    topLeft: { cx: "0%", cy: "0%" },
    topRight: { cx: "100%", cy: "0%" },
    bottomLeft: { cx: "0%", cy: "100%" },
    bottomRight: { cx: "100%", cy: "100%" }
  };

  const { cx, cy } = positions[corner];

  return (
    <View style={[styles.container, style]} {...props}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient id="corner" cx={cx} cy={cy} r="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="25%" stopColor="#f8fcff" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#f0f8ff" stopOpacity="0.7" />
            <Stop offset="75%" stopColor="#e8f4ff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#e0f0ff" stopOpacity="0.1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="#e8f2f5" />
        <Rect width="100%" height="100%" fill="url(#corner)" />
      </Svg>
      {children && <View style={styles.contentContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    zIndex: 2,
  },
});

// Default export with all components
export default {
  SoftFluorescentLinear,
  HarshFluorescentLinear,
  SoftFluorescentRadial,
  HarshFluorescentRadial,
  MultiSourceFluorescent,
  OfficeGridLighting,
  FluorescentStrip,
  CornerFluorescent,
};