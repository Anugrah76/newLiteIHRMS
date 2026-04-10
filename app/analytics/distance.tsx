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
import { useDistanceTrends } from '@/src/features/trip-tracking/hooks';
import { formatDistance } from '@shared/utils/mapHelpers';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Distance Trends Screen
 * Shows travel patterns and top travelers
 */
export default function DistanceTrendsScreen() {
    const theme = useTheme();
    const [period, setPeriod] = useState<'week' | 'month'>('month');

    const { data, isLoading } = useDistanceTrends({
        from_date: period === 'week'
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        group_by: 'day',
    });

    if (isLoading || !data) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.colors.textSecondary }}>Loading trends...</Text>
                </View>
            </View>
        );
    }

    const totalDistance = data.trends.reduce((sum, t) => sum + t.total_distance, 0);
    const totalTrips = data.trends.reduce((sum, t) => sum + t.trip_count, 0);
    const avgPerTrip = totalDistance / totalTrips;

    // Get last 7 days for mini chart
    const recentTrends = data.trends.slice(-7);
    const maxDistance = Math.max(...recentTrends.map(t => t.total_distance));

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Distance Trends</Text>
            </View>

            {/* Period Filter */}
            <View style={styles.filtersContainer}>
                {(['week', 'month'] as const).map(p => (
                    <TouchableOpacity
                        key={p}
                        style={[
                            styles.filterButton,
                            period === p && { backgroundColor: theme.colors.primary },
                            { borderColor: theme.colors.border },
                        ]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: period === p ? '#fff' : theme.colors.text }
                        ]}>
                            {p === 'week' ? 'This Week' : 'This Month'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Summary Stats */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="map-marker-distance" size={32} color={theme.colors.primary} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {formatDistance(totalDistance)}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Total Distance
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="counter" size={32} color={theme.colors.primary} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {totalTrips}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Total Trips
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="chart-line" size={32} color={theme.colors.primary} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {formatDistance(avgPerTrip)}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Avg per Trip
                        </Text>
                    </View>
                </View>

                {/* Simple Bar Chart */}
                <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                        Daily Distance (Last 7 Days)
                    </Text>
                    <View style={styles.miniChart}>
                        {recentTrends.map((trend, index) => {
                            const height = (trend.total_distance / maxDistance) * 100;
                            return (
                                <View key={index} style={styles.barContainer}>
                                    <View style={[styles.bar, { height: `${height}%`, backgroundColor: theme.colors.primary }]} />
                                    <Text style={[styles.barLabel, { color: theme.colors.textTertiary }]}>
                                        {format(new Date(trend.date), 'EEE')}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Top Travelers */}
                <View style={[styles.topTravelersCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.topTravelersHeader}>
                        <MaterialCommunityIcons name="trophy" size={24} color="#fbbf24" />
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Top Travelers
                        </Text>
                    </View>

                    {data.top_travelers.map((traveler, index) => (
                        <View key={traveler.employee_id} style={styles.travelerItem}>
                            <View style={styles.travelerRank}>
                                <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>
                                    #{index + 1}
                                </Text>
                            </View>
                            <View style={styles.travelerInfo}>
                                <Text style={[styles.travelerName, { color: theme.colors.text }]}>
                                    {traveler.employee_name}
                                </Text>
                                <Text style={[styles.travelerStats, { color: theme.colors.textSecondary }]}>
                                    {traveler.trip_count} trips • {formatDistance(traveler.avg_per_trip)} avg
                                </Text>
                            </View>
                            <Text style={[styles.travelerDistance, { color: theme.colors.primary }]}>
                                {formatDistance(traveler.total_distance)}
                            </Text>
                        </View>
                    ))}
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        textAlign: 'center',
    },
    chartCard: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    miniChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 120,
        gap: 8,
    },
    barContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
        minHeight: 4,
    },
    barLabel: {
        fontSize: 10,
        marginTop: 4,
    },
    topTravelersCard: {
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        borderRadius: 12,
    },
    topTravelersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    travelerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    travelerRank: {
        width: 40,
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '700',
    },
    travelerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    travelerName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    travelerStats: {
        fontSize: 12,
    },
    travelerDistance: {
        fontSize: 14,
        fontWeight: '600',
    },
});
