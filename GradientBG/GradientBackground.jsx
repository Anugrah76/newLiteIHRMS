import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const GradientBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Base background color */}
      <View style={styles.baseBackground} />
      
      {/* Layer 1: Yellow-green gradient (top left) - reduced opacity */}
      <LinearGradient
        colors={['rgba(155, 221, 240, 0.5)', 'rgba(155, 221, 240, 0.2)', 'transparent']}
        style={[styles.gradientLayer, styles.topLeft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Layer 2: Gray gradient (top right) */}
      <LinearGradient
        colors={['rgba(155, 221, 240, 0.5)', 'rgba(155, 221, 240, 0.2)', 'transparent']}
        style={[styles.gradientLayer, styles.topRight]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />
      
      {/* Layer 3: Pink gradient (bottom right) */}
      <LinearGradient
        colors={['rgba(155, 221, 240, 0.5)', 'rgba(155, 221, 240, 0.2)', 'transparent']}
        style={[styles.gradientLayer, styles.bottomRight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Layer 4: Light blue gradient (top right) */}
      <LinearGradient
        colors={['rgba(155, 221, 240, 0.5)', 'rgba(155, 221, 240, 0.2)', 'transparent']}
        style={[styles.gradientLayer, styles.topRightBlue]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Layer 5: Orange/Red gradient (bottom center) - reduced intensity */}
      <LinearGradient
        colors={['rgba(155, 221, 240, 0.5)', 'rgba(155, 221, 240, 0.2)', 'transparent']}
        style={[styles.gradientLayer, styles.bottomCenter]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:'#fff',
    //backgroundColor: '#c5b99e',
  },
  gradientLayer: {
    position: 'absolute',
  },
  topLeft: {
    top: 0,
    left: 0,
    width: width ,
    height: height ,
  },
  topRight: {
    top: 0,
    right: 0,
    width: width ,
    height: height ,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    width: width ,
    height: height ,
  },
  topRightBlue: {
    top: 0,
    right: 0,
    width: width,
    height: height ,
  },
  bottomCenter: {
    bottom: 0,
   /*  left: width * 0.25,
    right: width * 0.25, */
    height: height,
    width: width
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default GradientBackground;

// Usage Example:
// import GradientBackground from './GradientBackground';
//
// const App = () => {
//   return (
//     <GradientBackground>
//       {/* Your app content here */}
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text style={{ fontSize: 24, color: 'white' }}>Your App Content</Text>
//       </View>
//     </GradientBackground>
//   );
// };