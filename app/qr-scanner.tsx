import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, AppState, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { ArrowLeft, QrCode } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function QRScannerScreen() {
    const router = useRouter();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [location, setLocation] = useState<any>(null);
    const qrLock = useRef(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        initializeScanner();

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === "active") {
                qrLock.current = false;
                setIsProcessing(false);
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, []);

    const initializeScanner = async () => {
        if (!permission?.granted) {
            await requestPermission();
        }

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            }
        } catch (error) {
            console.error('Location error:', error);
        }
    };

    const buildAttendanceUrl = (qrData: string, coords: any) => {
        if (!coords?.latitude) throw new Error("Location unavailable");
        if (!qrData) throw new Error("Invalid QR code");

        const baseUrl = qrData.includes('?') ? qrData : `${qrData}?`;
        const params = new URLSearchParams({
            mode: "1",
            indo_code: user?.emp_code || user?.indo_code || "",
            key: user?.api_key || "",
            email: user?.username || "null",
            lat: String(coords.latitude),
            long: String(coords.longitude),
            address: "Unknown",
            city: "Unknown",
        });

        return baseUrl.endsWith('?') ? `${baseUrl}${params}` : `${baseUrl}&${params}`;
    };

    const handleBarcodeScanned = async ({ data }: any) => {
        if (!data || qrLock.current || isProcessing) return;
        qrLock.current = true;
        setIsProcessing(true);

        try {
            console.log('🔍 [QR Scan] Scanned data:', data);

            let coords = location?.coords;
            if (!coords?.latitude) {
                const loc = await Location.getCurrentPositionAsync({});
                coords = loc.coords;
            }

            if (!coords) throw new Error("Location unavailable. Enable GPS.");

            const attendanceUrl = buildAttendanceUrl(data, coords);
            console.log('🔍 [QR Scan] Attendance URL:', attendanceUrl);

            const response = await fetch(attendanceUrl, { method: "GET" });
            const result = await response.json();
            console.log('✅ [QR Scan] Response:', result);

            if (result.status === 4) {
                toast.show('error', 'Invalid Location');
                qrLock.current = false;
                setIsProcessing(false);
                return;
            }

            if (result.status === 3) {
                toast.show('success', 'Attendance marked!');
                setTimeout(() => router.back(), 1000);
                return;
            }

            if (result.status === 2) {
                toast.show('warning', result.message || 'Already marked');
                setTimeout(() => router.back(), 1000);
                return;
            }

            throw new Error(result.message || "Failed to mark attendance");
        } catch (error: any) {
            console.error('❌ [QR Scan] Error:', error);
            toast.show('error', error.message || 'Scan Failed');
            qrLock.current = false;
            setIsProcessing(false);
        }
    };

    if (permission === null || permission === undefined) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Initializing...</Text>
                </View>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <QrCode size={64} color="#6366F1" />
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>Grant camera permission to scan QR codes.</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const accuracy = location?.coords?.accuracy || 0;
    const accuracyColor = accuracy > 50 ? '#EF4444' : accuracy > 30 ? '#F59E0B' : '#10B981';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan QR Code</Text>
                <View style={styles.headerSpacer} />
            </View>

            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            {/* Overlay */}
            <View style={StyleSheet.absoluteFillObject}>
                <View style={styles.overlayContainer}>
                    <View style={styles.overlayTop} />
                    <View style={styles.middleRow}>
                        <View style={styles.overlaySide} />
                        <View style={styles.scanArea}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            <View style={styles.scanLine} />
                        </View>
                        <View style={styles.overlaySide} />
                    </View>
                    <View style={styles.overlayBottom} />
                </View>

                <View style={styles.instructionsContainer}>
                    <View style={styles.instructionBox}>
                        <QrCode size={24} color="#fff" />
                        <Text style={styles.instructionText}>Position QR code within frame</Text>
                    </View>
                </View>
            </View>

            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={styles.processingText}>Processing...</Text>
                    </View>
                </View>
            )}

            <View style={styles.statusContainer}>
                {!location ? (
                    <>
                        <ActivityIndicator size="small" color="#F59E0B" />
                        <Text style={styles.statusText}>Getting location...</Text>
                    </>
                ) : (
                    <View style={styles.accuracyContainer}>
                        <View style={[styles.accuracyDot, { backgroundColor: accuracyColor }]} />
                        <Text style={styles.accuracyText}>Accuracy: {accuracy.toFixed(0)}m</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    header: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 10 },
    backButton: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center' },
    headerSpacer: { width: 40 },
    overlayContainer: { flex: 1 },
    overlayTop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    overlayBottom: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    overlaySide: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    middleRow: { flexDirection: 'row' },
    scanArea: { width: 280, height: 280, position: 'relative' },
    corner: { position: 'absolute', width: 30, height: 30, borderColor: '#6366F1', borderWidth: 4 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    scanLine: { position: 'absolute', top: '50%', left: 20, right: 20, height: 2, backgroundColor: '#6366F1', opacity: 0.8 },
    instructionsContainer: { position: 'absolute', bottom: 100, left: 20, right: 20, alignItems: 'center' },
    instructionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 12 },
    instructionText: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F2937' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#9CA3AF', fontWeight: '500' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#1F2937' },
    permissionTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 24, marginBottom: 12, textAlign: 'center' },
    permissionText: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    permissionButton: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginBottom: 16 },
    permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    cancelButton: { paddingHorizontal: 24, paddingVertical: 12 },
    cancelButtonText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
    processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
    processingContainer: { backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 24, borderRadius: 16, alignItems: 'center', gap: 16 },
    processingText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    statusContainer: { position: 'absolute', top: 120, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 8 },
    statusText: { color: '#F59E0B', fontSize: 14, fontWeight: '500' },
    accuracyContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    accuracyDot: { width: 12, height: 12, borderRadius: 6 },
    accuracyText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
