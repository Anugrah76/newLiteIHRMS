import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '@shared/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface Props {
    children: React.ReactNode;
}

/**
 * Animated Professional Gradient Background
 * Breathing effect - more noticeable pulsing
 * REACTIVE to theme changes - updates when system theme changes
 */
export const AnimatedGradientBackground: React.FC<Props> = ({ children }) => {
    const theme = useTheme(); // This will re-render when theme changes
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        // More noticeable breathing effect: larger scale pulse
        scale.value = withRepeat(
            withTiming(1.15, {
                duration: 3500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1, // Infinite
            true // Reverse (breathe in and out)
        );

        // More noticeable opacity pulse
        opacity.value = withRepeat(
            withTiming(0.9, {
                duration: 3500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    // Memoize colors to avoid unnecessary recalculations, but recalculate when theme changes
    const baseColors = useMemo(() => {
        return [
            theme.colors.gradientStart,
            theme.colors.gradientMiddle,
            theme.colors.gradientEnd,
        ];
    }, [theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]);

    const reversedColors = useMemo(() => {
        return [...baseColors].reverse();
    }, [baseColors]);

    return (
        <View style={styles.container}>
            {/* Static base gradient - updates when theme changes */}
            <LinearGradient
                colors={baseColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Animated breathing overlay - updates when theme changes */}
            <AnimatedLinearGradient
                colors={reversedColors as any}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[StyleSheet.absoluteFillObject, animatedStyle, styles.breathingLayer]}
            />

            {/* Subtle overlay for depth - updates when theme changes */}
            <View style={[
                styles.overlay,
                { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)' }
            ]} />

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    breathingLayer: {
        opacity: 0.4, // More visible overlay
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});
