import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '@shared/theme';
import { useTripStore } from '@/src/features/trip-tracking/store/tripStore';
import { useEndTrip, usePauseTrip, useResumeTrip } from '@/src/features/trip-tracking/hooks';
import { formatDistance, formatDuration, formatSpeed, calculateDistance } from '@shared/utils/mapHelpers';
import { OSM_CONFIG } from '@/src/features/trip-tracking/config/mapConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Active Trip Screen
 * Shows live map with route tracking and trip controls
 */
export default function ActiveTripScreen() {
    const theme = useTheme();
    const mapRef = useRef<MapView>(null);

    const { activeTrip, isTracking, currentLocation, updateLocation, updateTripStats } = useTripStore();
    const pauseTripMutation = usePauseTrip();
    const resumeTripMutation = useResumeTrip();
    const endTripMutation = useEndTrip();

    const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
    const [liveStats, setLiveStats] = useState({
        distance: 0,
        duration: 0,
        speed: 0,
    });

    // Location tracking
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;
        const startTime = Date.now();

        const startTracking = async () => {
            if (!isTracking || !activeTrip) return;

            // Request background permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Location permission is needed to track your trip.');
                return;
            }

            // Start tracking
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Update every 5 seconds
                    distanceInterval: 10, // Or when moved 10 meters
                },
                (location) => {
                    const { latitude, longitude, speed, altitude } = location.coords;

                    const newPoint = { latitude, longitude };

                    // Update route
                    setRoute((prev) => {
                        const updated = [...prev, newPoint];

                        // Calculate distance from last point
                        if (prev.length > 0) {
                            const lastPoint = prev[prev.length - 1];
                            const segmentDistance = calculateDistance(
                                lastPoint.latitude,
                                lastPoint.longitude,
                                newPoint.latitude,
                                newPoint.longitude
                            );

                            // Update stats
                            setLiveStats((stats) => ({
                                distance: stats.distance + segmentDistance,
                                duration: Math.floor((Date.now() - startTime) / 1000),
                                speed: speed || 0,
                            }));
                        }

                        return updated;
                    });

                    // Update store
                    updateLocation({
                        latitude,
                        longitude,
                        timestamp: new Date().toISOString(),
                        accuracy: location.coords.accuracy || 10,
                        speed: speed || null,
                        altitude: altitude || null,
                    });

                    // Center map on current location
                    mapRef.current?.animateToRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                }
            );
        };

        startTracking();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isTracking, activeTrip]);

    if (!activeTrip) {
        router.replace('/trip-tracking');
        return null;
    }

    const handlePause = async () => {
        try {
            await pauseTripMutation.mutateAsync(activeTrip.id);
            Alert.alert('Trip Paused', 'Location tracking has been paused.');
        } catch (error) {
            Alert.alert('Error', 'Failed to pause trip');
        }
    };

    const handleResume = async () => {
        try {
            await resumeTripMutation.mutateAsync(activeTrip.id);
            Alert.alert('Trip Resumed', 'Location tracking has been resumed.');
        } catch (error) {
            Alert.alert('Error', 'Failed to resume trip');
        }
    };

    const handleEnd = () => {
        Alert.alert(
            'End Trip?',
            'Are you sure you want to end this trip? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Trip',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!currentLocation) return;

                            await endTripMutation.mutateAsync({
                                tripId: activeTrip.id,
                                lat: currentLocation.latitude,
                                lng: currentLocation.longitude,
                            });

                            router.replace(`/trip-tracking/detail?id=${activeTrip.id}`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to end trip');
                        }
                    },
                },
            ]
        );
    };

    const initialRegion = {
        latitude: activeTrip.start_location.latitude,
        longitude: activeTrip.start_location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                followsUserLocation
                showsMyLocationButton
            >
                {/* Start Marker */}
                <Marker
                    coordinate={{
                        latitude: activeTrip.start_location.latitude,
                        longitude: activeTrip.start_location.longitude,
                    }}
                    title="Start"
                    pinColor={OSM_CONFIG.MARKERS.START_MARKER_COLOR}
                />

                {/* Route Polyline */}
                {route.length > 1 && (
                    <Polyline
                        coordinates={route}
                        strokeColor={OSM_CONFIG.MARKERS.ROUTE_LINE_COLOR}
                        strokeWidth={OSM_CONFIG.MARKERS.ROUTE_LINE_WIDTH}
                    />
                )}
            </MapView>

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {activeTrip.trip_purpose}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: isTracking ? theme.colors.success : theme.colors.warning }]}>
                        <Text style={styles.statusText}>
                            {isTracking ? 'Tracking' : 'Paused'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats Card */}
            <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="map-marker-distance" size={24} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {formatDistance(liveStats.distance)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Distance
                    </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {formatDuration(liveStats.duration)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Duration
                    </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {formatSpeed(liveStats.speed)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Speed
                    </Text>
                </View>
            </View>

            {/* Controls */}
            <View style={[styles.controlsContainer, { backgroundColor: theme.colors.surface }]}>
                {isTracking ? (
                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: theme.colors.warning }]}
                        onPress={handlePause}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="pause" size={24} color="#fff" />
                        <Text style={styles.controlButtonText}>Pause</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: theme.colors.success }]}
                        onPress={handleResume}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="play" size={24} color="#fff" />
                        <Text style={styles.controlButtonText}>Resume</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.controlButton, styles.endButton, { backgroundColor: theme.colors.error }]}
                    onPress={handleEnd}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="stop" size={24} color="#fff" />
                    <Text style={styles.controlButtonText}>End Trip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    statsCard: {
        position: 'absolute',
        top: 120,
        left: 16,
        right: 16,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 8,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 32,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    controlButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    endButton: {
        flex: 1.2,
    },
    controlButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
});

