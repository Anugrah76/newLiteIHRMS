import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const Tend = ({ children }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Static cloudy sky gradient for the top - brighter and more fluorescent blue
  const getCloudySkyGradient = () => {
    return {
      id: 'cloudy-sky-gradient',
      colors: [
        { color: 'rgba(140, 225, 255, 0.95)', offset: '0%' },    // Vibrant fluorescent sky at top
        { color: 'rgba(160, 230, 255, 0.9)', offset: '10%' },    // Electric blue cloud
        { color: 'rgba(180, 235, 255, 0.85)', offset: '25%' },   // Bright fluorescent blue
        { color: 'rgba(150, 210, 255, 0.8)', offset: '40%' },    // Stronger blue middle
        { color: 'rgba(170, 220, 255, 0.7)', offset: '50%' },    // Enhanced blue center
        { color: 'rgba(200, 235, 255, 0.55)', offset: '60%' },   // More blue in middle
        { color: 'rgba(230, 245, 255, 0.3)', offset: '70%' },    // Light blue transition
        { color: 'rgba(255, 255, 255, 0)', offset: '80%' }       // Transparent earlier
      ]
    };
  };

  // Define time periods with gradients for the bottom portion
  const getTimeBasedColors = () => {
    const hour = currentHour;

    if (hour >= 5 && hour < 8) {
      // Early Morning (5-8 AM) - Soft dawn colors
      return {
        gradient: {
          id: 'dawn-gradient',
          colors: [
           // { color: 'rgba(255, 255, 255, 0)', offset: '0%' },     // Transparent at top
            //{ color: 'rgba(255, 255, 255, 0)', offset: '20%' },    // Keep transparent longer
            { color: 'rgba(248, 245, 240, 0.15)', offset: '35%' }, // Subtle cream
            { color: 'rgba(250, 240, 230, 0.3)', offset: '50%' },  // Light warm
            { color: 'rgba(252, 235, 220, 0.5)', offset: '65%' },  // Soft peach
            { color: 'rgba(255, 210, 180, 0.7)', offset: '80%' },  // Gentle orange
            { color: 'rgba(255, 180, 140, 0.85)', offset: '100%' } // Visible dawn orange at bottom
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
           // { color: 'rgba(255, 255, 255, 0)', offset: '0%' },     // Transparent at top
           // { color: 'rgba(255, 255, 255, 0)', offset: '20%' },    // Keep transparent longer
            { color: 'rgba(245, 250, 255, 0.15)', offset: '35%' }, // Light blue tint
            { color: 'rgba(230, 242, 255, 0.4)', offset: '50%' },  // Gentle sky
            { color: 'rgba(215, 235, 255, 0.6)', offset: '65%' },  // Light sky blue
            { color: 'rgba(200, 225, 255, 0.75)', offset: '80%' }, // Soft sky blue
            { color: 'rgba(180, 215, 255, 0.85)', offset: '100%' } // Visible sky blue at bottom
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
           // { color: 'rgba(255, 255, 255, 0)', offset: '0%' },     // Transparent at top
            //{ color: 'rgba(255, 255, 255, 0)', offset: '20%' },    // Keep transparent longer
           { color: 'rgba(255, 252, 245, 0.15)', offset: '35%' }, // Warm white
            { color: 'rgba(255, 242, 220, 0.45)', offset: '50%' }, // Light gold
            { color: 'rgba(255, 235, 200, 0.6)', offset: '65%' },  // Soft gold
            { color: 'rgba(255, 220, 170, 0.75)', offset: '80%' }, // Golden yellow
            { color: 'rgba(255, 200, 130, 0.85)', offset: '100%' } // Visible golden orange at bottom
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
           // { color: 'rgba(255, 255, 255, 0)', offset: '0%' },     // Transparent at top
            // { color: 'rgba(255, 255, 255, 0)', offset: '20%' },    // Keep transparent longer
            { color: 'rgba(255, 248, 235, 0.15)', offset: '35%' }, // Warm cream
            { color: 'rgba(255, 235, 200, 0.45)', offset: '50%' }, // Soft gold
            { color: 'rgba(255, 220, 160, 0.6)', offset: '60%' },  // Golden
            { color: 'rgba(255, 190, 120, 0.7)', offset: '70%' },  // Orange-gold
            { color: 'rgba(255, 160, 90, 0.8)', offset: '85%' },   // Sunset orange
            { color: 'rgba(255, 130, 70, 0.85)', offset: '100%' }  // Visible sunset at bottom
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
           // { color: 'rgba(255, 255, 255, 0)', offset: '0%' },     // Transparent at top
            // { color: 'rgba(255, 255, 255, 0)', offset: '20%' },    // Keep transparent longer
            { color: 'rgba(240, 242, 250, 0.15)', offset: '35%' }, // Light lavender
            { color: 'rgba(200, 210, 240, 0.45)', offset: '50%' }, // Light periwinkle
            { color: 'rgba(175, 190, 230, 0.6)', offset: '65%' },  // Medium blue-purple
            { color: 'rgba(150, 170, 220, 0.75)', offset: '80%' }, // Soft slate blue
            { color: 'rgba(120, 140, 200, 0.85)', offset: '100%' } // Visible night blue at bottom
          ]
        },
        baseColor: '#f0f2f8'
      };
    }
  };

  const timeColors = getTimeBasedColors();
  const skyGradient = getCloudySkyGradient();

  return (
    <View style={styles.container}>
      {/* Base background color */}
      <View style={[styles.baseBackground, { backgroundColor: timeColors.baseColor }]} />
      
      {/* Static cloudy sky gradient at top */}
      <Svg style={styles.svgOverlay} width="100%" height="100%">
        <Defs>
          <SvgLinearGradient
            id={skyGradient.id}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {skyGradient.colors.map((stop, index) => (
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
          fill={`url(#${skyGradient.id})`}
        />
      </Svg>
      
      {/* Time-based gradient overlay at bottom */}
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

export default Tend;