import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useTheme } from '@shared/theme';

interface Props {
    children: React.ReactNode;
}

/**
 * Universal Corporate Background - EndGrad Style
 * Creative multi-layer gradient for ALL screens
 * Full light/dark mode support with automatic theme switching
 * 
 * Design Philosophy:
 * - Layer 1: Base color (solid foundation)
 * - Layer 2: Main gradient (top-to-bottom flow)
 * - Layer 3: Accent gradient overlay (adds depth)
 */
export const CorporateBackground: React.FC<Props> = ({ children }) => {
    const theme = useTheme();

    // Main gradient - Creates the primary visual flow
    const mainGradient = theme.isDark ? {
        id: 'main-dark-gradient',
        colors: [
            { color: 'rgba(15, 23, 42, 1)', offset: '0%' },       // Deep slate top
            { color: 'rgba(30, 41, 59, 0.7)', offset: '30%' },    // Lighter slate
            { color: 'rgba(15, 23, 42, 0.5)', offset: '60%' },    // Fade middle
            { color: 'rgba(30, 41, 59, 0.7)', offset: '85%' },    // Return
            { color: 'rgba(15, 23, 42, 1)', offset: '100%' },     // Deep bottom
        ],
        baseColor: '#0f172a',
    } : {
        id: 'main-light-gradient',
        colors: [
            { color: 'rgba(248, 250, 252, 1)', offset: '0%' },    // Light slate top
            { color: 'rgba(226, 232, 240, 0.6)', offset: '30%' }, // Subtle gray
            { color: 'rgba(248, 250, 252, 0.4)', offset: '60%' }, // Fade middle
            { color: 'rgba(226, 232, 240, 0.6)', offset: '85%' }, // Return
            { color: 'rgba(248, 250, 252, 1)', offset: '100%' },  // Light bottom
        ],
        baseColor: '#f8fafc',
    };

    // Accent gradient - Adds subtle blue accent (corporate identity)
    const accentGradient = theme.isDark ? {
        id: 'accent-dark-gradient',
        colors: [
            { color: 'rgba(30, 64, 175, 0.08)', offset: '0%' },   // Subtle blue top
            { color: 'rgba(37, 99, 235, 0.05)', offset: '50%' },  // Lighter middle
            { color: 'rgba(30, 64, 175, 0.08)', offset: '100%' }, // Subtle blue bottom
        ],
    } : {
        id: 'accent-light-gradient',
        colors: [
            { color: 'rgba(37, 99, 235, 0.04)', offset: '0%' },   // Very subtle blue top
            { color: 'rgba(59, 130, 246, 0.03)', offset: '50%' }, // Lighter middle
            { color: 'rgba(37, 99, 235, 0.04)', offset: '100%' }, // Very subtle blue bottom
        ],
    };

    // Texture gradient - Adds professional depth (diagonal)
    const textureGradient = theme.isDark ? {
        id: 'texture-dark-gradient',
        colors: [
            { color: 'rgba(71, 85, 105, 0.03)', offset: '0%' },   // Slate texture
            { color: 'rgba(100, 116, 139, 0.02)', offset: '100%' }, // Lighter texture
        ],
    } : {
        id: 'texture-light-gradient',
        colors: [
            { color: 'rgba(148, 163, 184, 0.03)', offset: '0%' }, // Light texture
            { color: 'rgba(203, 213, 225, 0.02)', offset: '100%' }, // Subtle texture
        ],
    };

    return (
        <View style={styles.container}>
            {/* Layer 1: Base solid color */}
            <View style={[styles.layer, { backgroundColor: mainGradient.baseColor }]} />

            {/* Layer 2: Main gradient (vertical flow) */}
            <Svg style={styles.layer} width="100%" height="100%">
                <Defs>
                    <SvgLinearGradient
                        id={mainGradient.id}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        {mainGradient.colors.map((stop, index) => (
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
                    fill={`url(#${mainGradient.id})`}
                />
            </Svg>

            {/* Layer 3: Accent gradient (subtle corporate blue) */}
            <Svg style={styles.layer} width="100%" height="100%">
                <Defs>
                    <SvgLinearGradient
                        id={accentGradient.id}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        {accentGradient.colors.map((stop, index) => (
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
                    fill={`url(#${accentGradient.id})`}
                />
            </Svg>

            {/* Layer 4: Texture gradient (diagonal depth) */}
            <Svg style={styles.layer} width="100%" height="100%">
                <Defs>
                    <SvgLinearGradient
                        id={textureGradient.id}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        {textureGradient.colors.map((stop, index) => (
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
                    fill={`url(#${textureGradient.id})`}
                />
            </Svg>

            {/* Content layer */}
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
    layer: {
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
