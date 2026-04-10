import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useTheme } from '@shared/theme';

interface Props {
    children: React.ReactNode;
}

/**
 * Time-Aware Welcome Card Background
 * Professional gradients that change based on time of day
 * Inspired by Tend but more corporate and refined
 */
export const WelcomeCardGradient: React.FC<Props> = ({ children }) => {
    const theme = useTheme();
    const [currentHour, setCurrentHour] = useState(new Date().getHours());

    useEffect(() => {
        // Update time every minute
        const interval = setInterval(() => {
            setCurrentHour(10);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Get time-based gradient
    const getTimeGradient = () => {
        const hour = currentHour;

        if (theme.isDark) {
            // DARK MODE - Refined, professional
            if (hour >= 5 && hour < 8) {
                // Early Morning - Deep dawn blues
                return {
                    id: 'dark-early-morning',
                    colors: [
                        { color: 'rgba(30, 58, 95, 1)', offset: '0%' },     // Deep dawn
                        { color: 'rgba(26, 47, 77, 0.95)', offset: '40%' },  // Darker blue
                        { color: 'rgba(21, 33, 56, 0.9)', offset: '100%' },  // Very dark
                    ],
                };
            } else if (hour >= 8 && hour < 12) {
                // Morning - Professional dark blue
                return {
                    id: 'dark-morning',
                    colors: [
                        { color: 'rgba(30, 64, 175, 1)', offset: '0%' },     // Corporate blue
                        { color: 'rgba(26, 58, 138, 0.95)', offset: '40%' },  // Darker corporate
                        { color: 'rgba(23, 47, 111, 0.9)', offset: '100%' },  // Deep blue
                    ],
                };
            } else if (hour >= 12 && hour < 17) {
                // Afternoon - Neutral dark grays
                return {
                    id: 'dark-afternoon',
                    colors: [
                        { color: 'rgba(55, 65, 81, 1)', offset: '0%' },      // Dark gray
                        { color: 'rgba(45, 55, 72, 0.95)', offset: '40%' },   // Charcoal
                        { color: 'rgba(31, 41, 55, 0.9)', offset: '100%' },   // Deep gray
                    ],
                };
            } else if (hour >= 17 && hour < 20) {
                // Evening - Warm dark teal
                return {
                    id: 'dark-evening',
                    colors: [
                        { color: 'rgba(17, 94, 89, 1)', offset: '0%' },      // Dark teal
                        { color: 'rgba(15, 76, 71, 0.95)', offset: '40%' },   // Deeper teal
                        { color: 'rgba(10, 56, 53, 0.9)', offset: '100%' },   // Very dark teal
                    ],
                };
            } else {
                // Night - Deep midnight
                return {
                    id: 'dark-night',
                    colors: [
                        { color: 'rgba(30, 41, 59, 1)', offset: '0%' },      // Midnight slate
                        { color: 'rgba(23, 32, 51, 0.95)', offset: '40%' },   // Deeper midnight
                        { color: 'rgba(15, 23, 42, 0.9)', offset: '100%' },   // Almost black
                    ],
                };
            }
        } else {
            // LIGHT MODE - Refined, vibrant but professional
            if (hour >= 5 && hour < 8) {
                // Early Morning - Cool dawn
                return {
                    id: 'light-early-morning',
                    colors: [
                        { color: 'rgba(227, 242, 253, 1)', offset: '0%' },    // Dawn blue
                        { color: 'rgba(187, 222, 251, 0.95)', offset: '40%' }, // Light blue
                        { color: 'rgba(144, 202, 249, 0.9)', offset: '100%' }, // Sky blue
                    ],
                };
            } else if (hour >= 8 && hour < 12) {
                // Morning - Corporate blue
                return {
                    id: 'light-morning',
                    colors: [
                        { color: 'rgba(37, 99, 235, 1)', offset: '0%' },      // Corporate blue
                        { color: 'rgba(29, 78, 216, 0.95)', offset: '40%' },   // Darker blue
                        { color: 'rgba(30, 64, 175, 0.9)', offset: '100%' },   // Deep blue
                    ],
                };
            } else if (hour >= 12 && hour < 17) {
                // Afternoon - Neutral slates
                return {
                    id: 'light-afternoon',
                    colors: [
                        { color: 'rgba(100, 116, 139, 1)', offset: '0%' },    // Slate
                        { color: 'rgba(71, 85, 105, 0.95)', offset: '40%' },   // Darker slate
                        { color: 'rgba(51, 65, 85, 0.9)', offset: '100%' },    // Deep slate
                    ],
                };
            } else if (hour >= 17 && hour < 20) {
                // Evening - Professional teal
                return {
                    id: 'light-evening',
                    colors: [
                        { color: 'rgba(15, 118, 110, 1)', offset: '0%' },     // Teal
                        { color: 'rgba(13, 86, 80, 0.95)', offset: '40%' },    // Deep teal
                        { color: 'rgba(6, 78, 59, 0.9)', offset: '100%' },     // Dark emerald
                    ],
                };
            } else {
                // Night - Cool indigo
                return {
                    id: 'light-night',
                    colors: [
                        { color: 'rgba(79, 70, 229, 1)', offset: '0%' },      // Indigo
                        { color: 'rgba(67, 56, 202, 0.95)', offset: '40%' },   // Darker indigo
                        { color: 'rgba(55, 48, 163, 0.9)', offset: '100%' },   // Deep indigo
                    ],
                };
            }
        }
    };

    const gradient = getTimeGradient();

    return (
        <View style={styles.container}>
            {/* SVG gradient - endGrad inspired */}
            <Svg style={styles.svgOverlay} width="100%" height="100%">
                <Defs>
                    <SvgLinearGradient
                        id={gradient.id}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        {gradient.colors.map((stop, index) => (
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
                    fill={`url(#${gradient.id})`}
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
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    svgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        zIndex: 10,
    },
});
