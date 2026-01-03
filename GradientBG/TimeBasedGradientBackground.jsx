import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const TimeBasedRadialGradientBackground = ({ children }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Define time periods with subtle but visible gradients
  const getTimeBasedColors = () => {
    const hour = currentHour;

    if (hour >= 5 && hour < 8) {
      // Early Morning (5-8 AM) - Soft dawn colors
      return {
        gradient: {
          id: 'dawn-gradient',
          colors: [
            { color: 'rgba(248, 245, 240, 0.15)', offset: '0%' },   // Subtle cream at top
            { color: 'rgba(250, 240, 230, 0.25)', offset: '20%' },  // Light warm
            { color: 'rgba(252, 235, 220, 0.4)', offset: '40%' },   // Soft peach
            { color: 'rgba(255, 230, 205, 0.55)', offset: '65%' },  // Warm peach
            { color: 'rgba(255, 210, 180, 0.7)', offset: '85%' },   // Gentle orange
            { color: 'rgba(255, 180, 140, 0.8)', offset: '100%' }   // Visible dawn orange
          ]
        },
        baseColor: '#faf8f5'
      };
    } else if (hour >= 8 && hour < 12) {
      // Morning (8-12 PM) - Soft sky blues
      return {
        gradient: {
          id: 'morning-gradient',
          colors: [
            { color: 'rgba(245, 250, 255, 0.2)', offset: '0%' },    // Light blue tint at top
            { color: 'rgba(240, 248, 255, 0.3)', offset: '15%' },   // Soft blue
            { color: 'rgba(230, 242, 255, 0.4)', offset: '35%' },   // Gentle sky
            { color: 'rgba(215, 235, 255, 0.55)', offset: '60%' },  // Light sky blue
            { color: 'rgba(200, 225, 255, 0.7)', offset: '80%' },   // Soft sky blue
            { color: 'rgba(180, 215, 255, 0.8)', offset: '100%' }   // Visible sky blue
          ]
        },
        baseColor: '#f8fcff'
      };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon (12-5 PM) - Warm golden tones
      return {
        gradient: {
          id: 'afternoon-gradient',
          colors: [
            { color: 'rgba(255, 252, 245, 0.2)', offset: '0%' },    // Warm white at top
            { color: 'rgba(255, 248, 235, 0.3)', offset: '15%' },   // Cream
            { color: 'rgba(255, 242, 220, 0.4)', offset: '35%' },   // Light gold
            { color: 'rgba(255, 235, 200, 0.55)', offset: '60%' },  // Soft gold
            { color: 'rgba(255, 220, 170, 0.7)', offset: '82%' },   // Golden yellow
            { color: 'rgba(255, 200, 130, 0.8)', offset: '100%' }   // Visible golden orange
          ]
        },
        baseColor: '#fffbf0'
      };
    } else if (hour >= 17 && hour < 20) {
      // Evening (5-8 PM) - Warm sunset colors
      return {
        gradient: {
          id: 'evening-gradient',
          colors: [
            { color: 'rgba(255, 248, 235, 0.15)', offset: '0%' },   // Warm cream at top
            { color: 'rgba(255, 245, 225, 0.25)', offset: '10%' },  // Light warm
            { color: 'rgba(255, 235, 200, 0.4)', offset: '30%' },   // Soft gold
            { color: 'rgba(255, 220, 160, 0.55)', offset: '55%' },  // Golden
            { color: 'rgba(255, 190, 120, 0.65)', offset: '75%' },  // Orange-gold
            { color: 'rgba(255, 160, 90, 0.75)', offset: '88%' },   // Sunset orange
            { color: 'rgba(255, 130, 70, 0.8)', offset: '100%' }    // Visible sunset
          ]
        },
        baseColor: '#fff5e8'
      };
    } else {
      // Night (8 PM - 5 AM) - Cool night tones
      return {
        gradient: {
          id: 'night-gradient',
          colors: [
            { color: 'rgba(240, 242, 250, 0.2)', offset: '0%' },    // Light lavender at top
            { color: 'rgba(220, 225, 245, 0.3)', offset: '15%' },   // Soft purple
            { color: 'rgba(200, 210, 240, 0.4)', offset: '35%' },   // Light periwinkle
            { color: 'rgba(175, 190, 230, 0.55)', offset: '60%' },  // Medium blue-purple
            { color: 'rgba(150, 170, 220, 0.7)', offset: '80%' },   // Soft slate blue
            { color: 'rgba(120, 140, 200, 0.8)', offset: '100%' }   // Visible night blue
          ]
        },
        baseColor: '#f0f2f8'
      };
    }
  };

  const timeColors = getTimeBasedColors();

  return (
    <View style={styles.container}>
      {/* Base background color */}
      <View style={[styles.baseBackground, { backgroundColor: timeColors.baseColor }]} />
      
      {/* Subtle linear gradient */}
      <Svg style={styles.svgOverlay} width="100%" height="100%">
        <Defs>
          <SvgLinearGradient
            id={timeColors.gradient.id}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {timeColors.gradient.colors.map((stop, index) => (
              <Stop
                key={index}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </SvgLinearGradient>
        </Defs>
        
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${timeColors.gradient.id})`}
        />
      </Svg>
      
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
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default TimeBasedRadialGradientBackground;