import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style
}) => {
    const theme = useTheme();
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    backgroundColor: theme.isDark ? '#374151' : '#E5E7EB',
                },
                { opacity },
                style,
            ]}
        />
    );
};

export const SkeletonCircle: React.FC<{ size: number; style?: ViewStyle }> = ({ size, style }) => {
    return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
};

export const SkeletonText: React.FC<{ lines?: number; width?: any }> = ({ lines = 3, width = '100%' }) => {
    return (
        <View style={{ width: width as any }}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    height={14}
                    width={index === lines - 1 ? '60%' : '100%'}
                    style={{ marginBottom: 8 }}
                />
            ))}
        </View>
    );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    const theme = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }, style]}>
            <View style={styles.cardHeader}>
                <SkeletonCircle size={50} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width="40%" />
                </View>
            </View>
            <View style={styles.cardContent}>
                <SkeletonText lines={3} />
            </View>
        </View>
    );
};

export const SkeletonProfileHeader: React.FC = () => {
    const theme = useTheme();

    return (
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
            <SkeletonCircle size={120} style={{ marginBottom: 16 }} />
            <Skeleton height={24} width={200} style={{ marginBottom: 8 }} />
            <Skeleton height={16} width={120} />
        </View>
    );
};

export const SkeletonListItem: React.FC = () => {
    const theme = useTheme();

    return (
        <View style={[styles.listItem, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
            <SkeletonCircle size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton height={16} width="70%" style={{ marginBottom: 6 }} />
                <Skeleton height={12} width="50%" />
            </View>
        </View>
    );
};

export const SkeletonStatsCard: React.FC = () => {
    const theme = useTheme();

    return (
        <View style={[styles.statsCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
            <SkeletonCircle size={48} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
                <Skeleton height={28} width="40%" style={{ marginBottom: 4 }} />
                <Skeleton height={14} width="60%" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardContent: {
        gap: 8,
    },
    profileHeader: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        alignItems: 'center',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    statsCard: {
        flex: 1,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderTopWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
});
