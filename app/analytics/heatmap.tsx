import React, { useState, useRef, useEffect } from 'react';
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
import MapView, { Heatmap, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTheme } from '@shared/theme';
import { useHeatmapData } from '@/src/features/trip-tracking/hooks';
import { OSM_CONFIG } from '@/src/features/trip-tracking/config/mapConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Location Heatmap Screen
 * Shows where employees work (density visualization)
 */
export default function LocationHeatmapScreen() {
    const theme = useTheme();
    const mapRef = useRef<MapView>(null);
    const [filter, setFilter] = useState<'week' | 'month' | 'all'>('month');

    const { data: heatmapData, isLoading } = useHeatmapData({
        from_date: filter === 'week'
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            : filter === 'month'
                ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                : undefined,
    });

    // Manual heatmap rendering using opacity circles
    const renderHeatmapPoints = () => {
        if (!heatmapData?.points) return null;

        return heatmapData.points.map((point, index) => {
            // Normalize weight to opacity (0.1 - 0.6)
            const maxWeight = Math.max(...heatmapData.points.map(p => p.weight));
            const opacity = 0.1 + (point.weight / maxWeight) * 0.5;
            const radius = 100 + (point.weight / maxWeight) * 200;

            return (
                <View
                    key={index}
                    style={{
                        position: 'absolute',
                        width: radius,
                        height: radius,
                        borderRadius: radius / 2,
                        backgroundColor: `rgba(239, 68, 68, ${opacity})`,
                        // Convert lat/lng to screen coordinates (approximation)
                        // This is a simplified version - proper implementation would use map projection
                    }}
                />
            );
        });
    };

    return (<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>Location Heatmap</Text>
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

        {/* Map */}
        <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={OSM_CONFIG.MAP_SETTINGS.INITIAL_REGION}
            >
                {/* Display heatmap points as semi-transparent circles */}
                {heatmapData?.points.map((point, index) => {
                    const maxWeight = Math.max(...(heatmapData.points?.map(p => p.weight) || [1]));
                    const size = 0.005 + (point.weight / maxWeight) * 0.02;

                    return (
                        <React.Fragment key={index}>
                            {/* Outer glow */}
                            <MapView.Circle
                                center={{ latitude: point.latitude, longitude: point.longitude }}
                                radius={size * 5000}
                                fillColor={`rgba(239, 68, 68, ${0.1 + (point.weight / maxWeight) * 0.3})`}
                                strokeColor="transparent"
                            />
                            {/* Inner core */}
                            <MapView.Circle
                                center={{ latitude: point.latitude, longitude: point.longitude }}
                                radius={size * 2000}
                                fillColor={`rgba(239, 68, 68, ${0.3 + (point.weight / maxWeight) * 0.4})`}
                                strokeColor="transparent"
                            />
                        </React.Fragment>
                    );
                })}
            </MapView>
        </View>

        {/* Legend */}
        <View style={[styles.legendContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
                Density
            </Text>
            <View style={styles.legendGradient}>
                <View style={[styles.gradientBar, {
                    backgroundColor: '#ef4444'
                }]} />
                <View style={styles.legendLabels}>
                    <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
                        Low
                    </Text>
                    <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
                        High
                    </Text>
                </View>
            </View>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.primary} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                        {heatmapData?.total_points || 0} locations
                    </Text>
                </View>
            </View>
        </View>
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
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    legendContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    legendTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    legendGradient: {
        marginBottom: 12,
    },
    gradientBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fef2f2',
        marginBottom: 4,
    },
    legendLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    legendLabel: {
        fontSize: 11,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 12,
    },
});
