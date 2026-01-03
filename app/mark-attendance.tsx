import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useMarkAttendance } from '@features/attendance/hooks';
import { useAuthStore } from '@shared/store';
import { MapPin, Clock, User } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

/**
 * Mark Attendance Screen - Simplified MVP
 * Location-based attendance marking with professional UI
 */
export default function MarkAttendanceScreen() {
    const theme = useTheme();
    const toast = useToast();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const { mutate: markAttendance, isPending } = useMarkAttendance();

    // Get location on mount
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    toast.show('error', 'Permission Denied', 'Location permission is required');
                    setLoadingLocation(false);
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);

                const geocode = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });

                if (geocode.length > 0) {
                    const place = geocode[0];
                    setAddress(`${place.street || ''} ${place.district || ''}`);
                    setCity(place.city || '');
                }
            } catch (error) {
                console.error('Location error:', error);
                toast.show('error', 'Location Error', 'Unable to get your location');
            } finally {
                setLoadingLocation(false);
            }
        })();
    }, []);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleMarkAttendance = () => {
        if (!location) {
            toast.show('error', 'No Location', 'Please enable location services');
            return;
        }

        if (!user) {
            toast.show('error', 'User Error', 'User information not available');
            return;
        }

        // Get app version (you can add this to constants)
        const appVersion = '1.0.0'; // TODO: Get from expo-constants

        markAttendance({
            mode: '1', // "1" for normal punch
            email: user.username || user.email || '',
            lat: location.coords.latitude.toString(),
            long: location.coords.longitude.toString(), // Note: "long" not "longitude"!
            address: address || 'Unknown Area',
            city: city || 'Unknown City',
            state: '', // Optional: add state if available
            remarks: `iHRMS Lite V-${appVersion}`,
        }, {
            onSuccess: (data) => {
                console.log('Mark Attendance Success:', data);
                if (data.status === 200 || data.status === 2 || data.status === 3 || data.status === 22) {
                    toast.show('success', 'Success', data.message || 'Attendance marked successfully');
                    setTimeout(() => router.back(), 1500);
                } else {
                    toast.show('error', 'Failed', data.message || 'Unable to mark attendance');
                }
            },
            onError: (error) => {
                console.error('Mark Attendance Error:', error);
                toast.show('error', 'Network Error', 'Unable to connect to server');
            },
        });
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Mark Attendance"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.container}>
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.profileSection}>
                            <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                                <User width={32} height={32} color={theme.colors.primary} />
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: theme.colors.text }]}>
                                    {user?.fullName || 'Employee Name'}
                                </Text>
                                <Text style={[styles.userCode, { color: theme.colors.textSecondary }]}>
                                    {user?.emp_code || 'EMP-CODE'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Time & Location Cards */}
                    {loadingLocation ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                                Getting your location...
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Current Time */}
                            <View style={[styles.infoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.infoHeader}>
                                    <Clock width={20} height={20} color={theme.colors.primary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        Current Time
                                    </Text>
                                </View>
                                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                    {formatTime(currentTime)}
                                </Text>
                            </View>

                            {/* Current Location */}
                            <View style={[styles.infoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.infoHeader}>
                                    <MapPin width={20} height={20} color={theme.colors.primary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        Current Location
                                    </Text>
                                </View>
                                {location ? (
                                    <>
                                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                            {address || 'Location found'}
                                        </Text>
                                        <Text style={[styles.coordinates, { color: theme.colors.textTertiary }]}>
                                            {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={[styles.infoValue, { color: theme.colors.error }]}>
                                        Location unavailable
                                    </Text>
                                )}
                            </View>

                            {/* Mark Attendance Button */}
                            <TouchableOpacity
                                style={[
                                    styles.markButton,
                                    { backgroundColor: theme.colors.primary },
                                    (!location || isPending) && styles.markButtonDisabled
                                ]}
                                onPress={handleMarkAttendance}
                                disabled={!location || isPending}
                                activeOpacity={0.8}
                            >
                                {isPending ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <>
                                        <Clock width={24} height={24} color="#ffffff" />
                                        <Text style={styles.markButtonText}>Mark Attendance</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    container: {
        flex: 1,
    },
    profileCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    userCode: {
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    coordinates: {
        fontSize: 12,
    },
    markButton: {
        flexDirection: 'row',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    markButtonDisabled: {
        opacity: 0.5,
    },
    markButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
