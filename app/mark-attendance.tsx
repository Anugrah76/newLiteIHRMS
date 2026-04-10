import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Image,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useMarkAttendance } from '@features/attendance/hooks';
import { markAttendance as markAttendanceApi } from '@features/attendance/api/attendanceApi';
import { useAuthStore, usePunchOptionStore } from '@shared/store';
import { MapPin, Clock, User, Fingerprint, QrCode, AlertTriangle, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

/**
 * Mark Attendance Screen
 * Full-featured attendance marking with:
 * - Biometric authentication (empOption=2)
 * - QR code scanning (empOption=3)
 * - Both biometric + QR (empOption=4)
 * - Normal punch (empOption=1)
 * - New location detection & save prompt (status=1)
 * - Remarks modal before punch
 * - Comprehensive punch response handling
 * - Location permission modal
 * - Check-in/Check-out details display
 */
export default function MarkAttendanceScreen() {
    const theme = useTheme();
    const toast = useToast();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const empOption = usePunchOptionStore((state) => state.empOption);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [geocodeData, setGeocodeData] = useState<Location.LocationGeocodedAddress | null>(null);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Attendance result after successful punch
    const [attendanceResult, setAttendanceResult] = useState<any>(null);

    // Modal states
    const [remarksModalVisible, setRemarksModalVisible] = useState(false);
    const [userRemarksInput, setUserRemarksInput] = useState('');
    const [pendingBiometric, setPendingBiometric] = useState(false);

    // New location modal
    const [newLocationModalVisible, setNewLocationModalVisible] = useState(false);
    const [newLocationData, setNewLocationData] = useState<any>(null);

    // Location permission modal
    const [locationPermissionModal, setLocationPermissionModal] = useState(false);

    const appVersion = Constants.expoConfig?.version || '1.0.0';

    // Get location on mount
    useEffect(() => {
        fetchLocation();
    }, []);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Show location permission modal if no location
    useEffect(() => {
        if (!loadingLocation && !location) {
            setLocationPermissionModal(true);
        } else {
            setLocationPermissionModal(false);
        }
    }, [loadingLocation, location]);

    const fetchLocation = async () => {
        setLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
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
                setGeocodeData(place);
                setAddress(`${place.street || ''} ${place.district || ''}`);
                setCity(place.city || place.district || '');
                setState(place.region || '');
            }
        } catch (error) {
            console.error('Location error:', error);
            toast.show('error', 'Location Error', 'Unable to get your location');
        } finally {
            setLoadingLocation(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // ============ BIOMETRIC AUTHENTICATION ============
    const handleBiometricAuthentication = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                // No biometric hardware — proceed without fingerprint
                showRemarksModal(false);
                return;
            }

            const enrolled = await LocalAuthentication.isEnrolledAsync();
            if (!enrolled) {
                showRemarksModal(false);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to Mark Attendance',
                disableDeviceFallback: false,
            });

            if (result.success) {
                showRemarksModal(true);
            } else {
                toast.show('error', 'Authentication Failed', 'Unable to authenticate using biometrics.');
            }
        } catch (error) {
            console.error('Biometric Authentication Error:', error);
            showRemarksModal(false);
        }
    };

    // ============ REMARKS MODAL ============
    const showRemarksModal = (isBiometric: boolean) => {
        setPendingBiometric(isBiometric);
        setUserRemarksInput('');
        setRemarksModalVisible(true);
    };

    const handleSubmitRemarks = async () => {
        const fullRemarks = userRemarksInput.trim()
            ? `${userRemarksInput.trim()} iHRMS Lite V-${appVersion}`
            : `iHRMS Lite V-${appVersion}`;
        setRemarksModalVisible(false);
        const isNotFingerprintSupport = !pendingBiometric;
        await doMarkAttendance(isNotFingerprintSupport, fullRemarks);
    };

    // ============ HANDLE MARK BUTTON PRESS ============
    const handleMark = () => {
        if (empOption === 2) {
            handleBiometricAuthentication();
        } else {
            showRemarksModal(false);
        }
    };

    // ============ MARK ATTENDANCE API CALL ============
    const doMarkAttendance = async (isNotFingerprintSupport = false, customRemarks?: string) => {
        if (!location || !location.coords) {
            toast.show('error', 'Location Error', 'Unable to get your location. Please check location settings.');
            return;
        }

        setLoading(true);
        try {
            let remarks: string;
            if (customRemarks) {
                remarks = customRemarks;
            } else {
                remarks = `IHRMS LITE APP VERSION ${appVersion}`;
                if (isNotFingerprintSupport) {
                    remarks += ' (punch without fingerprint)';
                }
            }

            const response = await markAttendanceApi({
                mode: '1',
                email: user?.username || user?.email || '',
                lat: location.coords.latitude.toString(),
                long: location.coords.longitude.toString(),
                address: address || 'Unknown Area',
                city: city || 'Unknown City',
                state: state || '',
                remarks,
            });

            await handlePunchResponse(response);
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.show('error', 'Network Error', 'Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // ============ PUNCH RESPONSE HANDLER ============
    const handlePunchResponse = async (result: any) => {
        const status = result.status;

        switch (status) {
            case 1: // New location — prompt to save
                setNewLocationData({
                    address: address || 'Unknown Area',
                    city: city || 'Unknown City',
                    lat: location!.coords.latitude.toString(),
                    long: location!.coords.longitude.toString(),
                });
                setNewLocationModalVisible(true);
                break;

            case 2: // Roster Shift not assigned
                toast.show('error', 'Roster Shift', 'Roster Shift Not Assigned');
                break;

            case 3: // Successful punch
                handleSuccessfulPunch(result);
                break;

            case 4: // Distance error
                toast.show('error', 'Location Error', 'Distance Error: Not Your Office Location!');
                break;

            case 22: // New location saved successfully
                handleSuccessfulPunch(result);
                setAttendanceResult((prev: any) => ({
                    ...prev,
                    check_in: new Date().toLocaleTimeString('en-GB', { hour12: false }),
                    check_out: new Date().toLocaleTimeString('en-GB', { hour12: false }),
                }));
                toast.show('success', 'Location Saved', 'Your attendance has been marked and location saved.');
                break;

            case 23: // Punch limit exceeded
                toast.show('error', 'Limit Exceeded', 'Punch Limit Exceeded!');
                break;

            case 24: // Database error
                toast.show('error', 'System Error', 'Error! Attempt To Add Punch Type 3 To Database!');
                break;

            case 99999: // Invalid API key
                toast.show('error', 'Authentication Error', 'Invalid API Key. Please contact administrator.');
                break;

            case 39999: // User does not exist
                toast.show('error', 'Account Issue', result.message || 'User does not exist!');
                break;

            default:
                toast.show('error', 'Unknown Status', `Unknown status code: ${status}`);
        }
    };

    // ============ SUCCESSFUL PUNCH ============
    const handleSuccessfulPunch = (result: any) => {
        setAttendanceResult(result);

        if (result.status === 22) {
            setAttendanceResult((prev: any) => ({
                ...prev,
                check_in: new Date().toLocaleTimeString('en-GB', { hour12: false }),
                check_out: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            }));
        }

        toast.show('success', 'Punch Successful!', `Address: ${address}, ${city}`);

        // Handle geo tracking
        if (result.geo_tracking_status === '1') {
            console.log('Geo tracking enabled');
        }
    };

    // ============ SAVE NEW LOCATION ============
    const handleSaveNewLocation = async () => {
        if (!newLocationData) return;

        setLoading(true);
        try {
            const response = await markAttendanceApi({
                mode: '2', // mode 2 = save new location
                email: user?.username || user?.email || '',
                lat: newLocationData.lat,
                long: newLocationData.long,
                address: newLocationData.address,
                city: newLocationData.city,
                remarks: `iHRMS Lite V-${appVersion}`,
            });

            if (response.status === 22 || response.status === 3) {
                handleSuccessfulPunch(response);
                toast.show('success', 'Success', 'Location saved and attendance marked!');
            } else {
                toast.show('error', 'Save Failed', 'Failed to save location. Please try again.');
            }
        } catch (error) {
            console.error('Error saving location:', error);
            toast.show('error', 'Network Error', 'Failed to save location.');
        } finally {
            setLoading(false);
            setNewLocationModalVisible(false);
            setNewLocationData(null);
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Mark Attendance"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.profileSection}>
                            <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                                {user?.profile_photo ? (
                                    <Image
                                        source={{ uri: user.profile_photo }}
                                        style={styles.profileImage}
                                    />
                                ) : (
                                    <User width={32} height={32} color={theme.colors.primary} />
                                )}
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

                    {/* Time & Location (shown when no attendance result yet) */}
                    {!attendanceResult && (
                        <>
                            {loadingLocation ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                                        Getting your location...
                                    </Text>
                                </View>
                            ) : location ? (
                                <>
                                    {/* Current Time */}
                                    <View style={[styles.infoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                        <View style={styles.infoHeader}>
                                            <Clock width={20} height={20} color={theme.colors.primary} />
                                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                                Current Time
                                            </Text>
                                        </View>
                                        <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
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
                                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                            {address || 'Location found'}
                                        </Text>
                                        <Text style={[styles.coordinates, { color: theme.colors.textTertiary }]}>
                                            {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                                        </Text>
                                    </View>
                                </>
                            ) : null}
                        </>
                    )}

                    {/* Check-in Details (shown after successful punch) */}
                    {attendanceResult && (
                        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Check-In Details</Text>
                            <View style={styles.timeCardsContainer}>
                                <View style={[styles.timeCard, { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success + '30' }]}>
                                    <Text style={[styles.timeCardLabel, { color: theme.colors.success }]}>CHECK-IN</Text>
                                    <Text style={[styles.timeCardValue, { color: theme.colors.text }]}>
                                        {attendanceResult.check_in || '--:--'}
                                    </Text>
                                </View>
                                <View style={[styles.timeCard, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '30' }]}>
                                    <Text style={[styles.timeCardLabel, { color: theme.colors.error }]}>CHECK-OUT</Text>
                                    <Text style={[styles.timeCardValue, { color: theme.colors.text }]}>
                                        {attendanceResult.check_out || '--:--'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons — based on empOption */}
                    {!loadingLocation && location && (
                        <View style={styles.actionSection}>
                            {empOption === 1 ? (
                                /* Normal punch */
                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={handleMark}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Clock width={20} height={20} color="#fff" />
                                            <Text style={styles.primaryButtonText}>Mark Attendance</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : empOption === 2 ? (
                                /* Biometric punch */
                                <TouchableOpacity
                                    style={[styles.biometricButton]}
                                    onPress={handleBiometricAuthentication}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Fingerprint width={20} height={20} color="#fff" />
                                            <Text style={styles.primaryButtonText}>Authenticate & Mark</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : empOption === 3 ? (
                                /* QR only */
                                <TouchableOpacity
                                    style={[styles.qrButton]}
                                    onPress={() => router.push('/qr-scanner')}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <QrCode width={20} height={20} color="#fff" />
                                            <Text style={styles.primaryButtonText}>Scan QR Code</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : empOption === 4 ? (
                                /* Both biometric + QR */
                                <View style={styles.multiButtonContainer}>
                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                                        onPress={handleBiometricAuthentication}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Fingerprint width={20} height={20} color="#fff" />
                                                <Text style={styles.primaryButtonText}>Mark Attendance</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
                                        onPress={() => router.push('/qr-scanner')}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color={theme.colors.primary} />
                                        ) : (
                                            <>
                                                <QrCode width={20} height={20} color={theme.colors.primary} />
                                                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                                                    Scan QR Code
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                /* No punch option */
                                <View style={styles.noPunchContainer}>
                                    <AlertTriangle width={24} height={24} color={theme.colors.textSecondary} />
                                    <Text style={[styles.noPunchText, { color: theme.colors.textSecondary }]}>
                                        Punch attendance is not available for your account.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ========== REMARKS MODAL ========== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={remarksModalVisible}
                onRequestClose={() => setRemarksModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Remarks</Text>
                        <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
                            Enter any remarks for this attendance mark (optional):
                        </Text>
                        <TextInput
                            style={[styles.remarksInput, {
                                backgroundColor: theme.colors.background,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            }]}
                            value={userRemarksInput}
                            onChangeText={setUserRemarksInput}
                            placeholder="Enter remarks..."
                            placeholderTextColor={theme.colors.textTertiary}
                            multiline
                            textAlignVertical="top"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]}
                                onPress={() => setRemarksModalVisible(false)}
                            >
                                <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSubmitRemarks}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalSubmitText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ========== NEW LOCATION MODAL ========== */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={newLocationModalVisible}
                onRequestClose={() => setNewLocationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New Location Detected</Text>
                        <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
                            {`Address: ${newLocationData?.address || ''}\nCity: ${newLocationData?.city || ''}\n\nThis address is not available in the system. Do you want to save this address?`}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]}
                                onPress={() => {
                                    setNewLocationModalVisible(false);
                                    setNewLocationData(null);
                                }}
                            >
                                <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSaveNewLocation}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalSubmitText}>Yes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ========== LOCATION PERMISSION MODAL ========== */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={locationPermissionModal}
                onRequestClose={() => { }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.locationModalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={styles.locationIconContainer}>
                            <MapPin width={48} height={48} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.locationModalTitle, { color: theme.colors.text }]}>
                            Location Access Required
                        </Text>
                        <Text style={[styles.locationModalMessage, { color: theme.colors.textSecondary }]}>
                            We need access to your location to verify your attendance accurately.
                            {'\n\n'}
                            The app cannot function without location permissions as it ensures you're marking attendance from the correct workplace.
                            {'\n\n'}
                            Please enable location services in your device settings to continue.
                        </Text>
                        <TouchableOpacity
                            style={[styles.locationRetryButton, { backgroundColor: theme.colors.primary }]}
                            onPress={fetchLocation}
                        >
                            <RefreshCw width={18} height={18} color="#fff" />
                            <Text style={styles.primaryButtonText}>Retry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.locationGoBackButton}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.goBackText, { color: theme.colors.primary }]}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

    // Profile
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
        overflow: 'hidden',
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
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

    // Loading
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },

    // Info cards
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

    // Check-in details
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    timeCardsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    timeCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    timeCardLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    timeCardValue: {
        fontSize: 16,
        fontWeight: '700',
    },

    // Action buttons
    actionSection: {
        marginTop: 8,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    biometricButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#10B981',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    qrButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#8B5CF6',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    secondaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: 'transparent',
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    multiButtonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    noPunchContainer: {
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    noPunchText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Modal shared
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        margin: 20,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancelButton: {
        borderWidth: 1,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalSubmitText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },

    // Remarks input
    remarksInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },

    // Location permission modal
    locationModalContent: {
        maxWidth: 360,
    },
    locationIconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    locationModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    locationModalMessage: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 24,
        textAlign: 'center',
    },
    locationRetryButton: {
        flexDirection: 'row',
        width: '100%',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    locationGoBackButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    goBackText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
