import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import * as Location from 'expo-location';
import { useStartTrip } from '@/src/features/trip-tracking/hooks';
import { useTripStore } from '@/src/features/trip-tracking/store/tripStore';

/**
 * Start Trip Screen
 * Allows user to input trip purpose and request location permissions
 */
export default function StartTripScreen() {
    const theme = useTheme();
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const startTripMutation = useStartTrip();
    const { startTrip: setActiveTripInStore } = useTripStore();

    const handleStartTrip = async () => {
        if (!purpose.trim()) {
            Alert.alert('Purpose Required', 'Please enter the purpose of your trip');
            return;
        }

        if (purpose.trim().length < 5) {
            Alert.alert('Too Short', 'Please enter a more detailed trip purpose (at least 5 characters)');
            return;
        }

        setIsLoading(true);

        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to track trips. Please enable it in your device settings.',
                    [{ text: 'OK' }]
                );
                setIsLoading(false);
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;

            // Start trip via API
            const tripId = await startTripMutation.mutateAsync({
                purpose: purpose.trim(),
                lat: latitude,
                lng: longitude,
            });

            // Update local store
            const newTrip = {
                id: tripId,
                employee_id: 'emp-123',
                trip_purpose: purpose.trim(),
                start_time: new Date().toISOString(),
                end_time: null,
                status: 'active' as const,
                total_distance: 0,
                total_duration: 0,
                average_speed: 0,
                max_speed: 0,
                total_points: 0,
                start_location: {
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString(),
                    accuracy: location.coords.accuracy || 10,
                    speed: location.coords.speed || 0,
                    altitude: location.coords.altitude || null,
                },
                end_location: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setActiveTripInStore(newTrip);

            // Navigate to active trip screen
            router.replace('/trip-tracking/active');
        } catch (error) {
            console.error('[StartTrip] Error:', error);
            Alert.alert(
                'Error',
                'Failed to start trip. Please check your location settings and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Start New Trip
                    </Text>
                </View>

                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <MaterialCommunityIcons
                        name="map-marker-path"
                        size={80}
                        color={theme.colors.primary}
                    />
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
                        Track Your Field Trip
                    </Text>
                    <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
                        We'll track your location from start to finish to calculate accurate distance and duration.
                    </Text>
                </View>

                {/* Purpose Input */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Trip Purpose <Text style={{ color: theme.colors.error }}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder="e.g., Client meeting, Site visit, Delivery"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={purpose}
                        onChangeText={setPurpose}
                        autoFocus
                        returnKeyType="done"
                        maxLength={200}
                    />
                    <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                        {purpose.length}/200 characters
                    </Text>
                </View>

                {/* Permission Info */}
                <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <MaterialCommunityIcons
                        name="information"
                        size={20}
                        color={theme.colors.primary}
                    />
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                            Location Tracking
                        </Text>
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                            We'll track your location only while this trip is active. You can pause or end anytime.
                        </Text>
                    </View>
                </View>

                {/* Features List */}
                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <MaterialCommunityIcons
                            name="map-marker-distance"
                            size={20}
                            color={theme.colors.success}
                        />
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Automatic distance calculation
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={20}
                            color={theme.colors.success}
                        />
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Duration tracking
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <MaterialCommunityIcons
                            name="wifi-off"
                            size={20}
                            color={theme.colors.success}
                        />
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                            Works offline
                        </Text>
                    </View>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        {
                            backgroundColor: purpose.trim().length >= 5 ? theme.colors.primary : theme.colors.border,
                        },
                    ]}
                    onPress={handleStartTrip}
                    disabled={isLoading || purpose.trim().length < 5}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <Text style={styles.startButtonText}>Starting...</Text>
                    ) : (
                        <>
                            <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
                            <Text style={styles.startButtonText}>Start Tracking</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    instructionsContainer: {
        marginBottom: 24,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    instructionsText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 56,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    featuresList: {
        marginBottom: 32,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 14,
        marginLeft: 12,
    },
    startButton: {
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
});
