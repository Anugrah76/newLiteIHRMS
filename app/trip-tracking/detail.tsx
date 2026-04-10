import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator, 
    Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTheme } from '@shared/theme';
import { useTripDetail } from '@/src/features/trip-tracking/hooks';
import { formatDistance, formatDuration, formatSpeed, getBoundingBox } from '@shared/utils/mapHelpers';
import { format } from 'date-fns';
import { OSM_CONFIG } from '@/src/features/trip-tracking/config/mapConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Trip Detail Screen
 * Shows complete trip information with full route on map
 */
export default function TripDetailScreen() {
    const theme = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const mapRef = useRef<MapView>(null);

    const { data: trip, isLoading } = useTripDetail(id || null);

    // Fit map to route when trip loads
    useEffect(() => {
        if (trip?.locations && trip.locations.length > 0 && mapRef.current) {
            const bounds = getBoundingBox(
                trip.locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))
            );

            mapRef.current.fitToCoordinates(
                trip.locations.map(loc => ({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                })),
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );
        }
    }, [trip]);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading trip details...
                    </Text>
                </View>
            </View>
        );
    }

    if (!trip) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.text }]}>
                        Trip not found
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const routeCoordinates = trip.locations?.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
    })) || [];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_DEFAULT}
                        style={styles.map}
                        initialRegion={{
                            latitude: trip.start_location.latitude,
                            longitude: trip.start_location.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        {/* Start Marker */}
                        <Marker
                            coordinate={{
                                latitude: trip.start_location.latitude,
                                longitude: trip.start_location.longitude,
                            }}
                            title="Start"
                            description={trip.start_location.address || 'Starting point'}
                            pinColor={OSM_CONFIG.MARKERS.START_MARKER_COLOR}
                        />

                        {/* End Marker */}
                        {trip.end_location && (
                            <Marker
                                coordinate={{
                                    latitude: trip.end_location.latitude,
                                    longitude: trip.end_location.longitude,
                                }}
                                title="End"
                                description={trip.end_location.address || 'Ending point'}
                                pinColor={OSM_CONFIG.MARKERS.END_MARKER_COLOR}
                            />
                        )}

                        {/* Route */}
                        {routeCoordinates.length > 1 && (
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeColor={OSM_CONFIG.MARKERS.ROUTE_LINE_COLOR}
                                strokeWidth={OSM_CONFIG.MARKERS.ROUTE_LINE_WIDTH}
                            />
                        )}
                    </MapView>

                    {/* Back Button Overlay */}
                    <TouchableOpacity
                        style={[styles.mapBackButton, { backgroundColor: theme.colors.surface }]}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
                    {/* Header */}
                    <View style={styles.headerSection}>
                        <Text style={[styles.purposeText, { color: theme.colors.text }]}>
                            {trip.trip_purpose}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                            <Text style={[styles.statusText, { color: theme.colors.success }]}>
                                {trip.status === 'completed' ? 'Completed' : 'Active'}
                            </Text>
                        </View>
                    </View>

                    {/* Date/Time */}
                    <View style={styles.dateSection}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                            {format(new Date(trip.start_time), 'EEEE, MMMM dd, yyyy • h:mm a')}
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="map-marker-distance" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {formatDistance(trip.total_distance)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Distance
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="clock-outline" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {formatDuration(trip.total_duration)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Duration
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="speedometer" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {formatSpeed(trip.average_speed)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Avg Speed
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="map-marker-multiple" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {trip.total_points}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Points
                            </Text>
                        </View>
                    </View>

                    {/* Route Details */}
                    <View style={[styles.routeSection, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Route Details
                        </Text>

                        {/* Start */}
                        <View style={styles.routePoint}>
                            <View style={[styles.routeDot, { backgroundColor: OSM_CONFIG.MARKERS.START_MARKER_COLOR }]} />
                            <View style={styles.routePointText}>
                                <Text style={[styles.routeLabel, { color: theme.colors.textSecondary }]}>
                                    Start
                                </Text>
                                <Text style={[styles.routeAddress, { color: theme.colors.text }]}>
                                    {trip.start_location.address || `${trip.start_location.latitude.toFixed(6)}, ${trip.start_location.longitude.toFixed(6)}`}
                                </Text>
                                <Text style={[styles.routeTime, { color: theme.colors.textTertiary }]}>
                                    {format(new Date(trip.start_time), 'h:mm a')}
                                </Text>
                            </View>
                        </View>

                        {/* Route Line */}
                        {trip.end_location && (
                            <View style={styles.routeLine}>
                                <View style={[styles.routeLineBar, { backgroundColor: theme.colors.border }]} />
                                <MaterialCommunityIcons name="map-marker-path" size={20} color={theme.colors.textTertiary} />
                            </View>
                        )}

                        {/* End */}
                        {trip.end_location && (
                            <View style={styles.routePoint}>
                                <View style={[styles.routeDot, { backgroundColor: OSM_CONFIG.MARKERS.END_MARKER_COLOR }]} />
                                <View style={styles.routePointText}>
                                    <Text style={[styles.routeLabel, { color: theme.colors.textSecondary }]}>
                                        End
                                    </Text>
                                    <Text style={[styles.routeAddress, { color: theme.colors.text }]}>
                                        {trip.end_location.address || `${trip.end_location.latitude.toFixed(6)}, ${trip.end_location.longitude.toFixed(6)}`}
                                    </Text>
                                    <Text style={[styles.routeTime, { color: theme.colors.textTertiary }]}>
                                        {trip.end_time ? format(new Date(trip.end_time), 'h:mm a') : 'Ongoing'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    mapContainer: {
        height: 300,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    mapBackButton: {
        position: 'absolute',
        top: 48,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    purposeText: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dateText: {
        fontSize: 14,
        marginLeft: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
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
    routeSection: {
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    routeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
    },
    routePointText: {
        flex: 1,
        marginLeft: 12,
    },
    routeLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    routeAddress: {
        fontSize: 14,
        marginBottom: 4,
    },
    routeTime: {
        fontSize: 13,
    },
    routeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 5,
    },
    routeLineBar: {
        width: 2,
        height: 32,
        marginRight: 10,
    },
});
