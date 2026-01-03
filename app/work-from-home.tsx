import { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { Calendar, Clock } from 'lucide-react-native';
import { useStartWork, useStopWork } from '@features/staff/api/staffApi';

export default function WorkFromHomeScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isWorkStarted, setIsWorkStarted] = useState(false);
    const [startWorkData, setStartWorkData] = useState<any>(null);
    const [remarks, setRemarks] = useState('');

    // React Query hooks
    const startWorkMutation = useStartWork();
    const stopWorkMutation = useStopWork();

    const currentDate = new Date().toLocaleDateString('en-GB');

    const handleStart = async () => {
        try {
            console.log('🔍 [Start Work] Initiating...');

            const result = await startWorkMutation.mutateAsync();
            console.log('✅ [Start Work] Response:', result);

            if (result) {
                setStartWorkData(result);
                setIsWorkStarted(true);
                toast.show('success', 'Success', 'Work started successfully');
            } else {
                toast.show('error', 'Error', 'Failed to start work');
            }
        } catch (error: any) {
            console.error('❌ [Start Work] Error:', error);
            toast.show('error', 'Error', 'Network error: ' + error.message);
        }
    };

    const handleStop = async () => {
        if (!remarks.trim()) {
            toast.show('error', 'Error', 'Please enter remarks');
            return;
        }

        try {
            const payload = {
                work_date: startWorkData?.work_date || '',
                start_time: startWorkData?.start_time || '',
                status: 'Work stop/End Day',
                remarks: remarks
            };

            console.log('🔍 [Stop Work] Payload:', payload);

            const result = await stopWorkMutation.mutateAsync(payload);
            console.log('✅ [Stop Work] Response:', result);

            if (result) {
                setStartWorkData(null);
                setIsWorkStarted(false);
                setRemarks('');
                toast.show('success', 'Success', 'Work stopped successfully');
            } else {
                toast.show('error', 'Error', 'Failed to stop work');
            }
        } catch (error: any) {
            console.error('❌ [Stop Work] Error:', error);
            toast.show('error', 'Error', 'Network error: ' + error.message);
        }
    };

    const loading = startWorkMutation.isPending || stopWorkMutation.isPending;

    return (
        <CorporateBackground>
            <TopBar title="Work From Home" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Work Status</Text>

                    {!isWorkStarted ? (
                        <View style={[styles.inputContainer, styles.dateDisplay]}>
                            <View style={[styles.iconBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                <Calendar size={16} color={theme.colors.textSecondary} />
                            </View>
                            <Text style={[styles.dateText, { color: theme.colors.text }]}>{currentDate}</Text>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.workInfoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                <View style={styles.workInfoRow}>
                                    <Clock size={16} color={theme.colors.primary} />
                                    <Text style={[styles.workInfoLabel, { color: theme.colors.textSecondary }]}>Start Time:</Text>
                                    <Text style={[styles.workInfoValue, { color: theme.colors.text }]}>{startWorkData?.start_time}</Text>
                                </View>
                                <View style={styles.workInfoRow}>
                                    <Calendar size={16} color={theme.colors.primary} />
                                    <Text style={[styles.workInfoLabel, { color: theme.colors.textSecondary }]}>Work Date:</Text>
                                    <Text style={[styles.workInfoValue, { color: theme.colors.text }]}>{startWorkData?.work_date}</Text>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Remarks</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                    placeholder="Enter your work completion remarks..."
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.button, !isWorkStarted ? styles.startButton : styles.stopButton]}
                    disabled={loading}
                    onPress={!isWorkStarted ? handleStart : handleStop}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{!isWorkStarted ? 'Start Work' : 'Stop Work'}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 30 },
    formCard: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, padding: 20, marginBottom: 20, borderWidth: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    inputContainer: { marginBottom: 20 },
    dateDisplay: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 6, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    dateText: { fontSize: 16, fontWeight: '500' },
    workInfoCard: { borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1 },
    workInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    workInfoLabel: { fontSize: 14, marginLeft: 8, marginRight: 8 },
    workInfoValue: { fontSize: 14, fontWeight: '600', flex: 1 },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
    input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, minHeight: 100 },
    button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, marginBottom: 20 },
    startButton: { backgroundColor: '#10B981' },
    stopButton: { backgroundColor: '#EF4444' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
