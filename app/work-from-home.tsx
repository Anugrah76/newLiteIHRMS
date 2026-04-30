import { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore, useWfhStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { Calendar, Clock, Timer, MessageSquare, Smartphone, CirclePlay, CircleStop, CirclePause, CheckCircle2, Search } from 'lucide-react-native';
import { useStartWork, useStopWork, useEndDay, useWfhFilter } from '@features/staff/api/staffApi';
import type { WfhLogEntry } from '@features/staff/api/staffApi';

export default function WorkFromHomeScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Persisted WFH session state (survives navigation & app restart)
    const isWorkStarted = useWfhStore(state => state.isWorkStarted);
    const startWorkData = useWfhStore(state => state.sessionData);
    const setWorkStarted = useWfhStore(state => state.setWorkStarted);
    const clearWork = useWfhStore(state => state.clearWork);
    const dayEndedDate = useWfhStore(state => state.dayEndedDate);
    const setDayEnded = useWfhStore(state => state.setDayEnded);
    const clearDayEnded = useWfhStore(state => state.clearDayEnded);

    // Work logs state
    const [workLogs, setWorkLogs] = useState<WfhLogEntry[]>([]);
    const [totalWorkHours, setTotalWorkHours] = useState<string>('00:00:00');
    const [logsLoading, setLogsLoading] = useState(false);

    // React Query hooks
    const startWorkMutation = useStartWork();
    const stopWorkMutation = useStopWork();
    const endDayMutation = useEndDay();
    const wfhFilterMutation = useWfhFilter();

    const currentDate = new Date().toLocaleDateString('en-GB');

    // Format a Date object as YYYY-MM-DD
    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format a Date object for display as DD/MM/YYYY
    const formatDateForDisplay = (date: Date) => {
        return date.toLocaleDateString('en-GB');
    };

    // Check if today's day has been ended
    const todayStr = formatDateForApi(new Date());
    const isDayEnded = dayEndedDate === todayStr;

    // Fetch work logs for the selected date
    const fetchWorkLogs = useCallback(async (dateOverride?: Date) => {
        try {
            setLogsLoading(true);
            const dateStr = formatDateForApi(dateOverride || selectedDate);
            console.log('🔍 [WFH Logs] Fetching for date:', dateStr);
            const result = await wfhFilterMutation.mutateAsync(dateStr);
            console.log('✅ [WFH Logs] Response:', result);

            if (result && result.data) {
                setWorkLogs(result.data);
                setTotalWorkHours(result.total_work_hours || '00:00:00');
            } else {
                setWorkLogs([]);
                setTotalWorkHours('00:00:00');
            }
        } catch (error: any) {
            console.error('❌ [WFH Logs] Error:', error);
            setWorkLogs([]);
            setTotalWorkHours('00:00:00');
        } finally {
            setLogsLoading(false);
        }
    }, [selectedDate]);

    // Handle date picker change
    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            if (Platform.OS === 'ios') {
                setShowDatePicker(false);
            }
        }
    };

    // Search button handler
    const handleSearch = () => {
        fetchWorkLogs(selectedDate);
    };

    // Fetch logs on mount + auto-clear stale dayEndedDate from a previous day
    useEffect(() => {
        if (dayEndedDate && dayEndedDate !== formatDateForApi(new Date())) {
            clearDayEnded();
        }
        fetchWorkLogs();
    }, []);

    const handleStart = async () => {
        try {
            console.log('🔍 [Start Work] Initiating...');

            const result = await startWorkMutation.mutateAsync();
            console.log('✅ [Start Work] API result:', JSON.stringify(result));

            if (result) {
                // After start_work succeeds, fetch the actual server-recorded values
                // The local clock can be off by 1+ seconds, and the API requires exact match
                const todayStr = formatDateForApi(new Date());
                const logsResult = await wfhFilterMutation.mutateAsync(todayStr);
                const active = logsResult?.data?.find(
                    (log: WfhLogEntry) => log.current_status === 'Working' && !log.end_time
                );

                if (active) {
                    console.log('✅ [Start Work] Server session:', active.work_date, active.start_time);
                    setWorkStarted({ work_date: active.work_date, start_time: active.start_time });
                } else {
                    // Fallback: use API response data if available
                    let sessionData = result.data;
                    if (Array.isArray(sessionData) && sessionData.length > 0) sessionData = sessionData[0];
                    const now = new Date();
                    setWorkStarted({
                        work_date: sessionData?.work_date || todayStr,
                        start_time: sessionData?.start_time || now.toTimeString().split(' ')[0],
                    });
                }

                toast.show('success', 'Success', 'Work started successfully');
                // Update logs display
                setWorkLogs(logsResult?.data || []);
                setTotalWorkHours(logsResult?.total_work_hours || '00:00:00');
            } else {
                toast.show('error', 'Error', 'Failed to start work');
            }
        } catch (error: any) {
            console.error('❌ [Start Work] Error:', error);
            toast.show('error', 'Error', 'Network error: ' + error.message);
        }
    };

    // Helper: get work_date & start_time for the active session
    // Falls back to the WFH filter logs if the persisted store is empty
    const getActiveSessionParams = async () => {
        const wd = startWorkData?.work_date;
        const st = startWorkData?.start_time;

        if (wd && st) {
            return { work_date: wd, start_time: st };
        }

        // Store is empty — try to find the active "Working" entry from today's logs
        console.log('⚠️ [Session] Store data missing, fetching from WFH filter...');
        try {
            const todayStr = formatDateForApi(new Date());
            const logsResult = await wfhFilterMutation.mutateAsync(todayStr);
            if (logsResult?.data) {
                const active = logsResult.data.find(
                    (log: WfhLogEntry) => log.current_status === 'Working' && !log.end_time
                );
                if (active) {
                    console.log('✅ [Session] Found active entry:', active.work_date, active.start_time);
                    // Also fix the store for next time
                    setWorkStarted({ work_date: active.work_date, start_time: active.start_time });
                    return { work_date: active.work_date, start_time: active.start_time };
                }
            }
        } catch (e) {
            console.error('❌ [Session] Failed to fetch active session:', e);
        }

        toast.show('error', 'Error', 'Could not determine the active work session');
        return null;
    };

    const handleStop = async () => {
        if (!remarks.trim()) {
            toast.show('error', 'Error', 'Please enter remarks');
            return;
        }

        try {
            const session = await getActiveSessionParams();
            if (!session) return;

            const payload = {
                work_date: session.work_date,
                start_time: session.start_time,
                status: 'Work Stop',
                remarks: remarks
            };

            console.log('🔍 [Stop Work] Payload:', JSON.stringify(payload));

            const result = await stopWorkMutation.mutateAsync(payload);
            console.log('✅ [Stop Work] Response:', JSON.stringify(result));

            if (result) {
                clearWork();
                setRemarks('');
                toast.show('success', 'Success', 'Work stopped successfully');
                fetchWorkLogs();
            } else {
                toast.show('error', 'Error', 'Failed to stop work');
            }
        } catch (error: any) {
            console.error('❌ [Stop Work] Error:', error);
            toast.show('error', 'Error', 'Network error: ' + error.message);
        }
    };

    const handleEndDay = async () => {
        if (!remarks.trim()) {
            toast.show('error', 'Error', 'Please enter remarks');
            return;
        }

        try {
            const session = await getActiveSessionParams();
            if (!session) return;

            const payload = {
                work_date: session.work_date,
                start_time: session.start_time,
                status: 'End Day',
                remarks: remarks
            };

            console.log('🔍 [End Day] Payload:', JSON.stringify(payload));

            const result = await endDayMutation.mutateAsync(payload);
            console.log('✅ [End Day] Response:', JSON.stringify(result));

            if (result) {
                setDayEnded(formatDateForApi(new Date()));
                setRemarks('');
                toast.show('success', 'Success', 'Work day ended successfully');
                fetchWorkLogs();
            } else {
                toast.show('error', 'Error', 'Failed to end day');
            }
        } catch (error: any) {
            console.error('❌ [End Day] Error:', error);
            toast.show('error', 'Error', 'Network error: ' + error.message);
        }
    };

    // Status badge color mapping
    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('working')) {
            return { bg: '#10B98120', text: '#059669', icon: CirclePlay };
        }
        if (s.includes('end day')) {
            return { bg: '#6366f120', text: '#6366f1', icon: CircleStop };
        }
        // Work Stop
        return { bg: '#F5920020', text: '#D97706', icon: CirclePause };
    };

    const loading = startWorkMutation.isPending || stopWorkMutation.isPending || endDayMutation.isPending;

    return (
        <CorporateBackground>
            <TopBar title="Work From Home" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Work Status</Text>

                    {isWorkStarted && (
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
                    )}

                    {isWorkStarted && (
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
                    )}
                </View>

                {isDayEnded ? (
                    <View style={[styles.dayEndedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.success + '40' }]}>
                        <CheckCircle2 size={28} color={theme.colors.success} />
                        <Text style={[styles.dayEndedText, { color: theme.colors.text }]}>Work day has been ended</Text>
                        <Text style={[styles.dayEndedSubtext, { color: theme.colors.textSecondary }]}>{currentDate}</Text>
                    </View>
                ) : !isWorkStarted ? (
                    <TouchableOpacity
                        style={[styles.button, styles.startButton]}
                        disabled={loading}
                        onPress={handleStart}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Start Work</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.stopButton, styles.halfButton]}
                            disabled={loading}
                            onPress={handleStop}
                        >
                            {stopWorkMutation.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Stop Work</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.endDayButton, styles.halfButton]}
                            disabled={loading}
                            onPress={handleEndDay}
                        >
                            {endDayMutation.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>End Day</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* ===================== DATE PICKER + SEARCH ===================== */}
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Date</Text>
                    <TouchableOpacity
                        style={[styles.datePickerRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.datePickerIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Calendar size={18} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.datePickerText, { color: theme.colors.text }]}>{formatDateForDisplay(selectedDate)}</Text>
                        <Text style={[styles.datePickerHint, { color: theme.colors.textTertiary }]}>Tap to change</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSearch}
                        disabled={logsLoading}
                    >
                        {logsLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Search size={16} color="#fff" />
                                <Text style={styles.searchButtonText}>Search Logs</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ===================== WORK LOGS SECTION ===================== */}
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <View style={styles.logsHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Work Logs</Text>
                        {totalWorkHours !== '00:00:00' && (
                            <View style={[styles.totalHoursBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Timer size={13} color={theme.colors.primary} />
                                <Text style={[styles.totalHoursText, { color: theme.colors.primary }]}>{totalWorkHours}</Text>
                            </View>
                        )}
                    </View>

                    {logsLoading ? (
                        <View style={styles.logsLoadingContainer}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                            <Text style={[styles.logsLoadingText, { color: theme.colors.textSecondary }]}>Loading work logs...</Text>
                        </View>
                    ) : workLogs.length === 0 ? (
                        <View style={styles.emptyLogsContainer}>
                            <Clock size={32} color={theme.colors.textTertiary} />
                            <Text style={[styles.emptyLogsText, { color: theme.colors.textSecondary }]}>No work logs found</Text>
                            <Text style={[styles.emptyLogsSubtext, { color: theme.colors.textTertiary }]}>No records for {formatDateForDisplay(selectedDate)}</Text>
                        </View>
                    ) : (
                        <View style={styles.logsList}>
                            {workLogs.map((log, index) => {
                                const statusStyle = getStatusStyle(log.current_status);
                                const StatusIcon = statusStyle.icon;
                                return (
                                    <View
                                        key={log.id}
                                        style={[
                                            styles.logCard,
                                            {
                                                backgroundColor: theme.colors.surface,
                                                borderColor: theme.colors.border,
                                            },
                                            index === 0 && { borderLeftColor: theme.colors.primary, borderLeftWidth: 3 },
                                        ]}
                                    >
                                        {/* Status badge */}
                                        <View style={styles.logCardTop}>
                                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                <StatusIcon size={12} color={statusStyle.text} />
                                                <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{log.current_status}</Text>
                                            </View>
                                            <View style={[styles.appBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                                                <Smartphone size={10} color={theme.colors.textTertiary} />
                                                <Text style={[styles.appBadgeText, { color: theme.colors.textTertiary }]}>{log.application}</Text>
                                            </View>
                                        </View>

                                        {/* Time row */}
                                        <View style={styles.logTimeRow}>
                                            <View style={styles.logTimeBlock}>
                                                <Text style={[styles.logTimeLabel, { color: theme.colors.textTertiary }]}>Start</Text>
                                                <Text style={[styles.logTimeValue, { color: theme.colors.text }]}>{log.start_time}</Text>
                                            </View>
                                            <View style={[styles.logTimeDivider, { backgroundColor: theme.colors.border }]} />
                                            <View style={styles.logTimeBlock}>
                                                <Text style={[styles.logTimeLabel, { color: theme.colors.textTertiary }]}>End</Text>
                                                <Text style={[styles.logTimeValue, { color: log.end_time ? theme.colors.text : theme.colors.textTertiary }]}>
                                                    {log.end_time || '—'}
                                                </Text>
                                            </View>
                                            <View style={[styles.logTimeDivider, { backgroundColor: theme.colors.border }]} />
                                            <View style={styles.logTimeBlock}>
                                                <Text style={[styles.logTimeLabel, { color: theme.colors.textTertiary }]}>Duration</Text>
                                                <Text style={[styles.logTimeValue, { color: log.work_hours ? theme.colors.primary : theme.colors.textTertiary, fontWeight: '700' }]}>
                                                    {log.work_hours || '—'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Remarks */}
                                        {log.remarks && (
                                            <View style={[styles.logRemarksRow, { borderTopColor: theme.colors.border }]}>
                                                <MessageSquare size={12} color={theme.colors.textTertiary} />
                                                <Text style={[styles.logRemarksText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                                    {log.remarks}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
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
    stopButton: { backgroundColor: '#4673b7ff' },
    endDayButton: { backgroundColor: '#5F90B2ff' },
    buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
    halfButton: { flex: 1, marginBottom: 20 },
    dayEndedCard: { alignItems: 'center', paddingVertical: 24, borderRadius: 16, borderWidth: 1.5, marginBottom: 20, gap: 6, borderStyle: 'dashed' },
    dayEndedText: { fontSize: 17, fontWeight: '700', marginTop: 4 },
    dayEndedSubtext: { fontSize: 13 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Date Picker + Search
    datePickerRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 14 },
    datePickerIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    datePickerText: { fontSize: 16, fontWeight: '600', flex: 1 },
    datePickerHint: { fontSize: 12 },
    searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    searchButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Work Logs section
    logsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    totalHoursBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    totalHoursText: { fontSize: 13, fontWeight: '700' },

    logsLoadingContainer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    logsLoadingText: { fontSize: 14 },

    emptyLogsContainer: { alignItems: 'center', paddingVertical: 28, gap: 6 },
    emptyLogsText: { fontSize: 15, fontWeight: '500', marginTop: 4 },
    emptyLogsSubtext: { fontSize: 13 },

    logsList: { gap: 12 },
    logCard: { borderRadius: 12, borderWidth: 1, padding: 14, overflow: 'hidden' },
    logCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
    statusBadgeText: { fontSize: 12, fontWeight: '600' },

    appBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
    appBadgeText: { fontSize: 11, fontWeight: '500' },

    logTimeRow: { flexDirection: 'row', alignItems: 'center' },
    logTimeBlock: { flex: 1, alignItems: 'center' },
    logTimeLabel: { fontSize: 11, fontWeight: '500', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
    logTimeValue: { fontSize: 14, fontWeight: '600' },
    logTimeDivider: { width: 1, height: 28, marginHorizontal: 4 },

    logRemarksRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, paddingTop: 10, borderTopWidth: 1, gap: 6 },
    logRemarksText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
