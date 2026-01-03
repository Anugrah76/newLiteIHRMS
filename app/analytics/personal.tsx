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
import { useEmployeeAnalytics } from '@/src/features/trip-tracking/hooks';
import { formatDistance, formatDuration } from '@shared/utils/mapHelpers';
import { BarChart, PieChart } from 'react-native-gifted-charts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Personal Analytics Dashboard
 * Shows employee's personal trip and attendance analytics
 */
export default function PersonalAnalyticsScreen() {
    const theme = useTheme();
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    const { data: analytics, isLoading } = useEmployeeAnalytics('emp-123', period);

    if (isLoading || !analytics) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.colors.textSecondary }}>Loading analytics...</Text>
                </View>
            </View>
        );
    }

    // Chart data
    const dailyHoursData = analytics.daily_hours
        .filter(d => d.hours > 0)
        .slice(-7)
        .map((day, index) => ({
            value: day.hours,
            label: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            frontColor: theme.colors.primary,
        }));

    const timeDistributionData = [
        { value: analytics.time_distribution.office, color: '#10b981', text: 'Office' },
        { value: analytics.time_distribution.field, color: '#3b82f6', text: 'Field' },
        { value: analytics.time_distribution.remote, color: '#8b5cf6', text: 'Remote' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>My Analytics</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Period Filter */}
                <View style={styles.periodContainer}>
                    {(['week', 'month', 'year'] as const).map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.periodButton,
                                period === p && { backgroundColor: theme.colors.primary },
                                { borderColor: theme.colors.border },
                            ]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[
                                styles.periodText,
                                { color: period === p ? '#fff' : theme.colors.text }
                            ]}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Key Stats */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="clock-outline" size={32} color={theme.colors.primary} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {analytics.total_hours.toFixed(1)}h
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Total Hours
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="map-marker-distance" size={32} color={theme.colors.primary} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {formatDistance(analytics.total_distance)}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Distance
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="counter" size={32} color={theme.colors.primary} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {analytics.trip_count}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Trips
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons name="check-circle" size={32} color={theme.colors.success} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>
                            {analytics.punctuality_score.toFixed(1)}%
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            On Time
                        </Text>
                    </View>
                </View>

                {/* Daily Hours Chart */}
                <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                        Daily Hours (Last 7 Days)
                    </Text>
                    {dailyHoursData.length > 0 ? (
                        <BarChart
                            data={dailyHoursData}
                            width={SCREEN_WIDTH - 80}
                            height={200}
                            barWidth={30}
                            noOfSections={4}
                            barBorderRadius={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            yAxisTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
                        />
                    ) : (
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 20 }}>
                            No data available
                        </Text>
                    )}
                </View>

                {/* Time Distribution */}
                <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                        Work Location Distribution
                    </Text>
                    <View style={styles.pieContainer}>
                        <PieChart
                            data={timeDistributionData}
                            donut
                            radius={80}
                            innerRadius={50}
                            centerLabelComponent={() => (
                                <View style={styles.pieCenter}>
                                    <Text style={[styles.pieCenterValue, { color: theme.colors.text }]}>
                                        {analytics.total_hours.toFixed(0)}h
                                    </Text>
                                    <Text style={[styles.pieCenterLabel, { color: theme.colors.textSecondary }]}>
                                        Total
                                    </Text>
                                </View>
                            )}
                        />
                        <View style={styles.pieLegend}>
                            {timeDistributionData.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.legendText, { color: theme.colors.text }]}>
                                        {item.text}: {item.value.toFixed(1)}h
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Work Locations */}
                <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                        Frequent Work Locations
                    </Text>
                    {analytics.work_locations.map((location, index) => (
                        <View key={index} style={styles.locationItem}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <View style={styles.locationInfo}>
                                <Text style={[styles.locationName, { color: theme.colors.text }]}>
                                    {location.name}
                                </Text>
                                <Text style={[styles.locationStats, { color: theme.colors.textSecondary }]}>
                                    {location.visit_count} visits • {location.total_hours.toFixed(1)}h
                                </Text>
                            </View>
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
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    periodText: {
        fontSize: 13,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        width: (SCREEN_WIDTH - 52) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
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
    pieContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    pieCenter: {
        alignItems: 'center',
    },
    pieCenterValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    pieCenterLabel: {
        fontSize: 12,
    },
    pieLegend: {
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    locationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    locationName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    locationStats: {
        fontSize: 12,
    },
});
