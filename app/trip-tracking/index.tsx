import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useTrips } from '@/src/features/trip-tracking/hooks';
import { useTripStore } from '@/src/features/trip-tracking/store/tripStore';
import { formatDistance, formatDuration } from '@shared/utils/mapHelpers';
import { format } from 'date-fns';

/**
 * Trip Tracking Hub
 * Main entry point for trip tracking feature
 */
export default function TripTrackingHub() {
    const theme = useTheme();
    const { activeTrip } = useTripStore();

    // Fetch recent trips (last 5)
    const { data: trips, isLoading } = useTrips({
        status: 'completed',
        limit: 5,
    });

    // Calculate this month's stats
    const thisMonthTrips = trips?.filter(trip => {
        const tripDate = new Date(trip.start_time);
        const now = new Date();
        return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    }) || [];

    const totalDistanceThisMonth = thisMonthTrips.reduce((sum, trip) => sum + trip.total_distance, 0);
    const totalTripsThisMonth = thisMonthTrips.length;

    const handleStartTrip = () => {
        router.push('/trip-tracking/start');
    };

    const handleViewHistory = () => {
        router.push('/trip-tracking/history');
    };

    const handleContinueTrip = () => {
        if (activeTrip) {
            router.push('/trip-tracking/active');
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Trip Tracking
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Track field trips and mileage
                </Text>
            </View>

            {/* Active Trip Banner (if exists) */}
            {activeTrip && (
                <TouchableOpacity
                    style={[styles.activeTripBanner, { backgroundColor: theme.colors.primary }]}
                    onPress={handleContinueTrip}
                    activeOpacity={0.8}
                >
                    <View style={styles.activeTripContent}>
                        <MaterialCommunityIcons name="map-marker-path" size={32} color="#fff" />
                        <View style={styles.activeTripText}>
                            <Text style={styles.activeTripTitle}>Trip in Progress</Text>
                            <Text style={styles.activeTripSubtitle}>{activeTrip.trip_purpose}</Text>
                            <Text style={styles.activeTripStats}>
                                {formatDistance(activeTrip.total_distance)} • {formatDuration(activeTrip.total_duration)}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                    </View>
                </TouchableOpacity>
            )}

            {/* Start Trip Button */}
            {!activeTrip && (
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleStartTrip}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
                    <Text style={styles.startButtonText}>Start New Trip</Text>
                </TouchableOpacity>
            )}

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={32}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {formatDistance(totalDistanceThisMonth)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        This Month
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <MaterialCommunityIcons
                        name="counter"
                        size={32}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {totalTripsThisMonth}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Trips
                    </Text>
                </View>
            </View>

            {/* Recent Trips */}
            <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Recent Trips
                    </Text>
                    <TouchableOpacity onPress={handleViewHistory}>
                        <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                            View All
                        </Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : trips && trips.length > 0 ? (
                    trips.slice(0, 5).map(trip => (
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
                                    <Text style={[styles.tripDetails, { color: theme.colors.textSecondary }]}>
                                        {formatDistance(trip.total_distance)} •{' '}
                                        {format(new Date(trip.start_time), 'MMM dd, yyyy')}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color={theme.colors.textTertiary}
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="map-marker-off"
                            size={64}
                            color={theme.colors.textTertiary}
                        />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No trips yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                            Start your first trip to see it here
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    activeTripBanner: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
    },
    activeTripContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeTripText: {
        flex: 1,
        marginLeft: 12,
    },
    activeTripTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    activeTripSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    activeTripStats: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    startButton: {
        marginHorizontal: 20,
        marginBottom: 24,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
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
    recentSection: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    tripCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
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
    tripDetails: {
        fontSize: 13,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyState: {
        paddingVertical: 40,
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
});
