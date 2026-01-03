import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useTrips } from '@/src/features/trip-tracking/hooks';
import { formatDistance, formatDuration } from '@shared/utils/mapHelpers';
import { format } from 'date-fns';

/**
 * Trip History Screen
 * Lists all completed trips with filters
 */
export default function TripHistoryScreen() {
    const theme = useTheme();
    const [filter, setFilter] = useState<'all' | 'week' | 'month'>('month');

    const { data: trips, isLoading, refetch, isRefetching } = useTrips({
        status: 'completed',
        limit: 100,
    });

    // Filter trips by date
    const filteredTrips = trips?.filter(trip => {
        const tripDate = new Date(trip.start_time);
        const now = new Date();

        if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return tripDate >= weekAgo;
        } else if (filter === 'month') {
            return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
        }
        return true;
    }) || [];

    // Group by date
    const groupedTrips = filteredTrips.reduce((groups, trip) => {
        const date = format(new Date(trip.start_time), 'yyyy-MM-dd');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(trip);
        return groups;
    }, {} as Record<string, typeof filteredTrips>);

    const sortedDates = Object.keys(groupedTrips).sort((a, b) => b.localeCompare(a));

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Trip History</Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === 'week' && { backgroundColor: theme.colors.primary },
                        { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setFilter('week')}
                >
                    <Text style={[
                        styles.filterText,
                        { color: filter === 'week' ? '#fff' : theme.colors.text }
                    ]}>
                        This Week
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === 'month' && { backgroundColor: theme.colors.primary },
                        { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setFilter('month')}
                >
                    <Text style={[
                        styles.filterText,
                        { color: filter === 'month' ? '#fff' : theme.colors.text }
                    ]}>
                        This Month
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filter === 'all' && { backgroundColor: theme.colors.primary },
                        { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[
                        styles.filterText,
                        { color: filter === 'all' ? '#fff' : theme.colors.text }
                    ]}>
                        All Time
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Trip List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : filteredTrips.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="map-marker-off"
                            size={64}
                            color={theme.colors.textTertiary}
                        />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No trips found
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                            Try selecting a different filter
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                                    {filteredTrips.length}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                    Trips
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                                    {formatDistance(
                                        filteredTrips.reduce((sum, trip) => sum + trip.total_distance, 0)
                                    )}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                    Total Distance
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                                    {formatDuration(
                                        filteredTrips.reduce((sum, trip) => sum + trip.total_duration, 0)
                                    )}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                    Total Time
                                </Text>
                            </View>
                        </View>

                        {/* Grouped Trips */}
                        {sortedDates.map(date => (
                            <View key={date} style={styles.dateGroup}>
                                <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>
                                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                                </Text>
                                {groupedTrips[date].map(trip => (
                                    <TouchableOpacity
                                        key={trip.id}
                                        style={[styles.tripCard, { backgroundColor: theme.colors.surface }]}
                                        onPress={() => router.push(`/trip-tracking/detail?id=${trip.id}`)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.tripCardContent}>
                                            <MaterialCommunityIcons
                                                name="map-marker-circle"
                                                size={24}
                                                color={theme.colors.primary}
                                            />
                                            <View style={styles.tripCardText}>
                                                <Text style={[styles.tripPurpose, { color: theme.colors.text }]}>
                                                    {trip.trip_purpose}
                                                </Text>
                                                <Text style={[styles.tripTime, { color: theme.colors.textSecondary }]}>
                                                    {format(new Date(trip.start_time), 'h:mm a')} -{' '}
                                                    {trip.end_time ? format(new Date(trip.end_time), 'h:mm a') : 'Ongoing'}
                                                </Text>
                                                <View style={styles.tripStats}>
                                                    <View style={styles.statChip}>
                                                        <MaterialCommunityIcons
                                                            name="map-marker-distance"
                                                            size={14}
                                                            color={theme.colors.textTertiary}
                                                        />
                                                        <Text style={[styles.statChipText, { color: theme.colors.textSecondary }]}>
                                                            {formatDistance(trip.total_distance)}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.statChip}>
                                                        <MaterialCommunityIcons
                                                            name="clock-outline"
                                                            size={14}
                                                            color={theme.colors.textTertiary}
                                                        />
                                                        <Text style={[styles.statChipText, { color: theme.colors.textSecondary }]}>
                                                            {formatDuration(trip.total_duration)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <MaterialCommunityIcons
                                                name="chevron-right"
                                                size={20}
                                                color={theme.colors.textTertiary}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </>
                )}
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
        paddingVertical: 16,
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
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
    scrollContent: {
        paddingBottom: 24,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
    },
    summaryCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
    },
    dateGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        paddingHorizontal: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tripCard: {
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
    },
    tripCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tripCardText: {
        flex: 1,
        marginLeft: 12,
    },
    tripPurpose: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    tripTime: {
        fontSize: 13,
        marginBottom: 8,
    },
    tripStats: {
        flexDirection: 'row',
        gap: 12,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statChipText: {
        fontSize: 12,
    },
});

