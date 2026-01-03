import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore } from '@shared/store';
import { useTheme } from '@shared/theme';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useBTALeaveRecordList } from '@features/staff/api/staffApi';

export default function BTACalendarScreen() {
    const router = useRouter();
    const theme = useTheme();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [btaData, setBtaData] = useState<any>({});

    const btaListMutation = useBTALeaveRecordList();
    const loading = btaListMutation.isPending;

    useEffect(() => {
        fetchBTAData();
    }, [currentDate]);

    const fetchBTAData = async () => {
        const formData = new FormData();
        // Auth is injected by interceptor

        try {
            console.log('🔍 [BTA Calendar] Fetching leave records');
            const data = await btaListMutation.mutateAsync(formData);
            console.log('✅ [BTA Calendar] Response:', data);

            if (data.response === "Success") {
                processBTAData(data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch BTA data');
            }
        } catch (error: any) {
            console.error('❌ [BTA Calendar] Error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const processBTAData = (data: any) => {
        const processedData: any = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Process BTA records
        if (data.bta && Array.isArray(data.bta)) {
            data.bta.forEach((item: any) => {
                if (item.date) {
                    if (item.status === "1") {
                        processedData[item.date] = 'pending-bta';
                    } else if (item.status === "2" || item.status === "3") {
                        processedData[item.date] = 'applied-bta';
                    }
                }
            });
        }

        // Process holidays
        if (data.holidays && Array.isArray(data.holidays)) {
            data.holidays.forEach((item: any) => {
                if (item.date && item.date !== null) {
                    processedData[item.date] = 'holiday';
                }
            });
        }

        // Process leave days
        if (data.leave_days && Array.isArray(data.leave_days)) {
            data.leave_days.forEach((item: any) => {
                if (item.date && item.date !== null) {
                    processedData[item.date] = 'leave';
                }
            });
        }

        // Process week off days
        if (data.week_off_days && Array.isArray(data.week_off_days)) {
            data.week_off_days.forEach((item: any) => {
                if (item.date && item.date !== null) {
                    processedData[item.date] = 'weekoff';
                }
            });
        }

        // Mark past dates without events as "no-event"
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        for (let d = new Date(startOfMonth); d < today; d.setDate(d.getDate() + 1)) {
            const dateKey = formatDateKey(d);
            if (!processedData[dateKey]) {
                processedData[dateKey] = 'no-event';
            }
        }

        setBtaData(processedData);
    };

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days: (Date | null)[] = [];

        // Add empty slots for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied-bta': return '#10B981';
            case 'leave': return '#1D4ED8';
            case 'holiday': return '#F9A8D4';
            case 'no-event': return '#FBBF24';
            case 'weekoff': return '#047857';
            case 'pending-bta': return '#7C3AED';
            default: return 'transparent';
        }
    };

    const getStatusSymbol = (status: string) => {
        switch (status) {
            case 'applied-bta': return 'A';
            case 'leave': return 'L';
            case 'holiday': return 'H';
            case 'no-event': return 'N';
            case 'weekoff': return 'W';
            case 'pending-bta': return 'P';
            default: return '';
        }
    };

    const getDateStatus = (date: Date | null) => {
        if (!date) return null;
        const dateKey = formatDateKey(date);
        return btaData[dateKey] || null;
    };

    const isDateClickable = (date: Date | null) => {
        if (!date) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const status = getDateStatus(date);

        // Can't click on dates with existing events (except no-event and pending-bta)
        if (status && status !== 'no-event' && status !== 'pending-bta') return false;

        // Only future dates or today
        return date >= today;
    };

    const handleDateClick = (date: Date | null) => {
        if (!date) return;

        const status = getDateStatus(date);

        if (status === 'applied-bta') {
            Alert.alert('BTA Already Submitted', 'BTA already submitted for this date.');
            return;
        }

        if (status === 'holiday') {
            Alert.alert('Holiday', 'Holiday! BTA not allowed.');
            return;
        }

        if (status === 'weekoff') {
            Alert.alert('Week Off', 'WeekOff! BTA not allowed.');
            return;
        }

        if (status === 'leave') {
            Alert.alert('Leave Applied', 'Leave already applied! BTA not allowed.');
            return;
        }

        if (!isDateClickable(date)) {
            Alert.alert('Invalid Date', 'Please select a future date without any existing events.');
            return;
        }

        const formattedDate = formatDateKey(date);
        router.push(`/bta-application?selectedDate=${formattedDate}&isPending=${status === 'pending-bta' ? 'true' : 'false'}` as any);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const days = getDaysInMonth();
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <CorporateBackground>
            <TopBar title="BTA Calendar" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.instructionCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <Calendar size={32} color={theme.colors.primary} />
                    <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>Select Future Date</Text>
                    <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
                        Click on a future date to apply for BTA.
                    </Text>
                </View>

                <View style={[styles.calendarCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={() => navigateMonth(-1)} style={[styles.navButton, { backgroundColor: theme.colors.surface }]}>
                            <ChevronLeft size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.monthText, { color: theme.colors.text }]}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => navigateMonth(1)} style={[styles.navButton, { backgroundColor: theme.colors.surface }]}>
                            <ChevronRight size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.weekHeader, { backgroundColor: theme.colors.surface }]}>
                        {weekDays.map((day, idx) => (
                            <Text
                                key={idx}
                                style={[
                                    styles.weekHeaderText,
                                    { color: (idx === 0 || idx === 6) ? '#DC2626' : theme.colors.text }
                                ]}
                            >
                                {day}
                            </Text>
                        ))}
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
                        </View>
                    ) : (
                        <View style={styles.calendarGrid}>
                            {days.map((date, idx) => {
                                if (!date) return <View key={idx} style={styles.emptyDay} />;

                                const status = getDateStatus(date);
                                const isToday = date.getTime() === today.getTime();
                                const isClickable = isDateClickable(date);

                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.dayContainer}
                                        onPress={() => handleDateClick(date)}
                                        disabled={!isClickable}
                                    >
                                        <View
                                            style={[
                                                styles.calendarDay,
                                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                                status && { borderColor: getStatusColor(status), borderWidth: 2 },
                                                isToday && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                                            ]}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                { color: theme.colors.text },
                                                !isClickable && { color: theme.colors.textTertiary }
                                            ]}>
                                                {date.getDate()}
                                            </Text>
                                            {status && (
                                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]}>
                                                    <Text style={styles.dotText}>{getStatusSymbol(status)}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={[styles.legendCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]}>
                                <Text style={styles.legendSymbol}>A</Text>
                            </View>
                            <Text style={[styles.legendLabel, { color: theme.colors.text }]}>Applied BTA</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#1D4ED8' }]}>
                                <Text style={styles.legendSymbol}>L</Text>
                            </View>
                            <Text style={[styles.legendLabel, { color: theme.colors.text }]}>Leave</Text>
                        </View>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#F9A8D4' }]}>
                                <Text style={styles.legendSymbol}>H</Text>
                            </View>
                            <Text style={[styles.legendLabel, { color: theme.colors.text }]}>Holiday</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]}>
                                <Text style={styles.legendSymbol}>N</Text>
                            </View>
                            <Text style={[styles.legendLabel, { color: theme.colors.text }]}>No Event</Text>
                        </View>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#047857' }]}>
                                <Text style={styles.legendSymbol}>W</Text>
                            </View>
                            <Text style={[styles.legendLabel, { color: theme.colors.text }]}>WeekOff</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#7C3AED' }]}>
                                <Text style={styles.legendSymbol}>P</Text>
                            </View>
                            <Text style={[styles.legendLabel, { color: theme.colors.text }]}>Pending BTA</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.noteCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                    <Text style={[styles.noteText, { color: '#92400E' }]}>Note:- Only apply on future date.</Text>
                </View>
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 30 },
    instructionCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, borderWidth: 1 },
    instructionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, marginTop: 12 },
    instructionText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    calendarCard: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 8, padding: 20, marginBottom: 24, borderWidth: 1 },
    calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    navButton: { padding: 8, borderRadius: 8 },
    monthText: { fontSize: 18, fontWeight: '700' },
    weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, borderRadius: 12, paddingVertical: 10 },
    weekHeaderText: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'center' },
    loadingContainer: { paddingVertical: 40, alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
    emptyDay: { width: '14.28%', height: 48 },
    dayContainer: { width: '14.28%', alignItems: 'center' },
    calendarDay: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative', margin: 4, borderWidth: 1 },
    dayText: { fontSize: 12, fontWeight: '600' },
    statusDot: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    dotText: { fontSize: 8, fontWeight: '700', color: '#fff' },
    legendCard: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 16, borderWidth: 1 },
    legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
    legendDot: { width: 18, height: 18, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    legendSymbol: { fontSize: 10, fontWeight: '700', color: '#fff' },
    legendLabel: { fontSize: 12, fontWeight: '500' },
    noteCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
    noteText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
});
