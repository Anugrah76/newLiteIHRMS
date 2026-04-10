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

    // Main gradient - Minimal, professional base
    const mainGradient = theme.isDark ? {
        id: 'main-dark-gradient',
        colors: [
            { color: 'rgba(15, 23, 42, 1)', offset: '0%' },
            { color: 'rgba(30, 41, 59, 0.98)', offset: '50%' },
            { color: 'rgba(15, 23, 42, 1)', offset: '100%' },
        ],
        baseColor: '#0f172a',
    } : {
        id: 'main-light-gradient',
        colors: [
            { color: 'rgba(249, 250, 251, 1)', offset: '0%' },
            { color: 'rgba(243, 244, 246, 0.99)', offset: '50%' },
            { color: 'rgba(249, 250, 251, 1)', offset: '100%' },
        ],
        baseColor: '#f9fafb',
    };

    // Accent gradient - Extremely subtle depth
    const accentGradient = theme.isDark ? {
        id: 'accent-dark-gradient',
        colors: [
            { color: 'rgba(71, 85, 105, 0.04)', offset: '0%' },
            { color: 'rgba(100, 116, 139, 0.02)', offset: '100%' },
        ],
    } : {
        id: 'accent-light-gradient',
        colors: [
            { color: 'rgba(148, 163, 184, 0.015)', offset: '0%' },
            { color: 'rgba(203, 213, 225, 0.01)', offset: '100%' },
        ],
    };

    // Texture gradient - Barely visible professional depth
    const textureGradient = theme.isDark ? {
        id: 'texture-dark-gradient',
        colors: [
            { color: 'rgba(51, 65, 85, 0.015)', offset: '0%' },
            { color: 'rgba(71, 85, 105, 0.01)', offset: '100%' },
        ],
    } : {
        id: 'texture-light-gradient',
        colors: [
            { color: 'rgba(226, 232, 240, 0.015)', offset: '0%' },
            { color: 'rgba(241, 245, 249, 0.01)', offset: '100%' },
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
