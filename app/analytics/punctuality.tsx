import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { usePunctualityData } from '@/src/features/trip-tracking/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Punctuality Analytics Screen
 * Shows on-time rates by office location
 */
export default function PunctualityAnalyticsScreen() {
    const theme = useTheme();
    const [filter, setFilter] = useState<'week' | 'month' | 'all'>('month');

    const { data: punctualityData, isLoading } = usePunctualityData({
        from_date: filter === 'week'
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            : filter === 'month'
                ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                : undefined,
    });

    const getStatusColor = (percentage: number) => {
        if (percentage >= 90) return theme.colors.success;
        if (percentage >= 75) return theme.colors.warning;
        return theme.colors.error;
    };

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 90) return 'check-circle';
        if (percentage >= 75) return 'alert-circle';
        return 'close-circle';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Punctuality Analytics</Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                {(['week', 'month', 'all'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterButton,
                            filter === f && { backgroundColor: theme.colors.primary },
                            { borderColor: theme.colors.border },
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filter === f ? '#fff' : theme.colors.text }
                        ]}>
                            {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All Time'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Overall Summary */}
                {punctualityData && punctualityData.length > 0 && (
                    <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                            Company Average
                        </Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                            {(
                                punctualityData.reduce((sum, item) => sum + item.on_time_percentage, 0) /
                                punctualityData.length
                            ).toFixed(1)}%
                        </Text>
                        <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                            On-time arrival rate
                        </Text>
                    </View>
                )}

                {/* Location List */}
                <View style={styles.locationsContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        By Office Location
                    </Text>

                    {isLoading ? (
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>
                            Loading...
                        </Text>
                    ) : punctualityData && punctualityData.length > 0 ? (
                        punctualityData
                            .sort((a, b) => b.on_time_percentage - a.on_time_percentage)
                            .map((location, index) => (
                                <View
                                    key={location.location_id}
                                    style={[styles.locationCard, { backgroundColor: theme.colors.surface }]}
                                >
                                    <View style={styles.locationHeader}>
                                        <View style={styles.locationInfo}>
                                            <Text style={[styles.locationName, { color: theme.colors.text }]}>
                                                {location.location_name}
                                            </Text>
                                            <Text style={[styles.locationStats, { color: theme.colors.textSecondary }]}>
                                                {location.total_count} employees
                                            </Text>
                                        </View>
                                        <View style={styles.locationBadge}>
                                            <MaterialCommunityIcons
                                                name={getStatusIcon(location.on_time_percentage) as any}
                                                size={20}
                                                color={getStatusColor(location.on_time_percentage)}
                                            />
                                            <Text
                                                style={[
                                                    styles.locationPercentage,
                                                    { color: getStatusColor(location.on_time_percentage) },
                                                ]}
                                            >
                                                {location.on_time_percentage.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Progress Bar */}
                                    <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${location.on_time_percentage}%`,
                                                    backgroundColor: getStatusColor(location.on_time_percentage),
                                                },
                                            ]}
                                        />
                                    </View>

                                    {/* Details */}
                                    <View style={styles.locationDetails}>
                                        <View style={styles.detailItem}>
                                            <MaterialCommunityIcons
                                                name="clock-alert"
                                                size={16}
                                                color={theme.colors.textTertiary}
                                            />
                                            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                                                {location.late_count} late arrivals
                                            </Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <MaterialCommunityIcons
                                                name="clock-outline"
                                                size={16}
                                                color={theme.colors.textTertiary}
                                            />
                                            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                                                {location.avg_delay_minutes.toFixed(0)} min avg delay
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Rank Badge */}
                                    {index < 3 && (
                                        <View
                                            style={[
                                                styles.rankBadge,
                                                {
                                                    backgroundColor:
                                                        index === 0
                                                            ? '#fbbf24'
                                                            : index === 1
                                                                ? '#d1d5db'
                                                                : '#cd7f32',
                                                },
                                            ]}
                                        >
                                            <Text style={styles.rankText}>#{index + 1}</Text>
                                        </View>
                                    )}
                                </View>
                            ))
                    ) : (
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>
                            No data available
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    summaryCard: {
        marginHorizontal: 20,
        marginVertical: 16,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 48,
        fontWeight: '700',
        marginBottom: 4,
    },
    summarySubtext: {
        fontSize: 13,
    },
    locationsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    locationCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        position: 'relative',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationStats: {
        fontSize: 12,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationPercentage: {
        fontSize: 18,
        fontWeight: '700',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    locationDetails: {
        flexDirection: 'row',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 12,
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
});
