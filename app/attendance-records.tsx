import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    CloudRainWind,
    Coffee,
    XCircle,
    Clock,
    TentTree,
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useAttendanceRecords } from '@features/attendance/hooks';

// --- Constants & Types ---
const { width } = Dimensions.get('window');

interface PieChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
}

// --- Helper Functions (Ported from Reference) ---
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const convertToISO = (dateStr: any): string | null => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
        return null;
    }
    try {
        // Check if YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // Handle DD-MM-YYYY
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            // Check orientation: if first part > 1900, it's YYYY-MM-DD (covered above mostly, but splitting helps)
            // If last part > 1900, it's DD-MM-YYYY
            if (parseInt(parts[2]) > 1900) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
    } catch (e) {
        console.error('Date convert error', e);
    }
    return null;
};

// Robust extraction logic from reference
const extractDates = (data: any[], type: string): string[] => {
    const dates = new Set<string>();

    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const validData = data.filter(item =>
        item !== null && item !== undefined && item !== '' &&
        (typeof item === 'object' || typeof item === 'string' || typeof item === 'number')
    );

    if (validData.length === 0) return [];

    validData.forEach(item => {
        try {
            // 1. Handle Objects
            if (typeof item === 'object' && item !== null) {
                if (Object.keys(item).length === 0) return;

                // { date: "..." }
                if (item.date && typeof item.date === 'string') {
                    const iso = convertToISO(item.date);
                    if (iso) dates.add(iso);
                }
                // { attend_date: "..." } - Common in this API
                else if (item.attend_date && typeof item.attend_date === 'string') {
                    const iso = convertToISO(item.attend_date);
                    if (iso) dates.add(iso);
                }
                // { lastUpdate: "..." }
                else if (item.lastUpdate && typeof item.lastUpdate === 'string') {
                    const iso = convertToISO(item.lastUpdate);
                    if (iso) dates.add(iso);
                }
                // Range: { from_date, to_date }
                else if (item.from_date && item.to_date) {
                    const from = new Date(item.from_date);
                    const to = new Date(item.to_date);
                    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
                        let current = new Date(from);
                        while (current <= to) {
                            dates.add(formatDate(current));
                            current.setDate(current.getDate() + 1);
                        }
                    }
                }
            }
            // 2. Handle Strings
            else if (typeof item === 'string' && item.trim() !== '') {
                const iso = convertToISO(item.trim());
                if (iso) dates.add(iso);
            }
        } catch (e) {
            console.warn(`Error processing ${type} item`, e);
        }
    });

    return Array.from(dates);
};

// --- Components ---

const PieChart: React.FC<PieChartProps> = ({ data, size = 180 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <View style={[styles.pieContainer, { width: size, height: size }]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <Circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill="#E5E7EB" />
                </Svg>
                <View style={styles.pieCenter}>
                    <Text style={styles.pieTotal}>0</Text>
                </View>
            </View>
        );
    }

    let currentAngle = -90;
    const center = size / 2;
    const radius = size / 2 - 10;

    return (
        <View style={[styles.pieContainer, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;
                    const largeArc = angle > 180 ? 1 : 0;
                    const startRad = (currentAngle * Math.PI) / 180;
                    const endRad = ((currentAngle + angle) * Math.PI) / 180;

                    const x1 = center + radius * Math.cos(startRad);
                    const y1 = center + radius * Math.sin(startRad);
                    const x2 = center + radius * Math.cos(endRad);
                    const y2 = center + radius * Math.sin(endRad);

                    const d = [
                        `M ${center} ${center}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    currentAngle += angle;
                    return <Path key={index} d={d} fill={item.color} />;
                })}
                <Circle cx={center} cy={center} r={radius * 0.6} fill="white" />
            </Svg>
            <View style={styles.pieCenter}>
                <Text style={styles.pieTotal}>{total}</Text>
                <Text style={styles.pieLabel}>Total</Text>
            </View>
        </View>
    );
};

const SummaryCard = ({ title, count, icon: Icon, color, onPress, theme }: any) => (
    <TouchableOpacity
        style={[styles.summaryCard, { borderLeftColor: color, backgroundColor: theme.colors.cardPrimary }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.summaryRow}>
            <View style={[styles.summaryIconContainer, { backgroundColor: color + '20' }]}>
                <Icon size={20} color={color} />
            </View>
            <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>{title}</Text>
                <Text style={[styles.summaryCount, { color }]}>{count}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function AttendanceRecordsScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const getMonthStartEnd = (date: Date) => {
        return {
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear().toString(),
        };
    };

    const { data: response, isLoading } = useAttendanceRecords(getMonthStartEnd(currentDate));
    const result = response?.result;
    const isFreezed = response?.freezed === '1';

    // --- Prepare Data ---
    // When freezed=1, present_days is a flat string array: ["Week Off", "A", "P", "Holiday", ...]
    // Each index maps to day of month (index 0 = day 1). We parse statuses into date arrays.
    // When freezed=0, result has structured objects with dates.

    let presentDays: string[] = [];
    let leaveDays: string[] = [];
    let compOffDays: string[] = [];
    let holidayDays: string[] = [];
    let mispunchDays: string[] = [];
    let weekOffDays: string[] = [];
    let absentDays: string[] = [];

    if (isFreezed && result?.present_days && Array.isArray(result.present_days)) {
        // Freezed mode: flat status array
        const statusArray: string[] = result.present_days;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(new Date(year, month, day));
            const status = (statusArray[day - 1] || '').trim();

            if (!status) continue;

            if (status === 'M') {
                mispunchDays.push(dateStr);
            } else if (status === 'P' || status === 'Warning' || status === 'Q1' || status === 'Q2' || status === 'Q3' || status === 'Q4') {
                presentDays.push(dateStr);
            } else if (status.includes('LWP') || status === 'SL' || status === 'EL' || status === 'CL' || status === 'OD') {
                leaveDays.push(dateStr);
            } else if (status === 'Holiday') {
                holidayDays.push(dateStr);
            } else if (status === 'CO') {
                compOffDays.push(dateStr);
            } else if (status === 'A') {
                absentDays.push(dateStr);
            } else if (status === 'Week Off') {
                weekOffDays.push(dateStr);
            }
        }
    } else {
        // Non-freezed mode: structured date objects
        presentDays = extractDates(result?.present_days || [], 'present');
        leaveDays = extractDates(result?.leave_days || [], 'leave');
        compOffDays = extractDates(result?.comp_off_days || [], 'compoff');
        holidayDays = extractDates(result?.holiday_days || [], 'holiday');
        mispunchDays = extractDates(result?.mispunch_days || [], 'mispunch');
        weekOffDays = extractDates(result?.weekoff || [], 'weekoff');
        absentDays = extractDates(result?.absent_days || [], 'absent');
    }

    const dateStatusMap = new Map<string, string>();
    presentDays.forEach(d => dateStatusMap.set(d, 'present'));
    leaveDays.forEach(d => dateStatusMap.set(d, 'leave'));
    compOffDays.forEach(d => dateStatusMap.set(d, 'compoff'));
    holidayDays.forEach(d => dateStatusMap.set(d, 'holiday'));
    mispunchDays.forEach(d => dateStatusMap.set(d, 'mispunch'));
    weekOffDays.forEach(d => dateStatusMap.set(d, 'weekoff'));
    absentDays.forEach(d => dateStatusMap.set(d, 'absent'));

    const stats = {
        present: presentDays.length,
        leave: leaveDays.length,
        compoff: compOffDays.length,
        holiday: holidayDays.length,
        weekoff: weekOffDays.length,
        mispunch: mispunchDays.length,
        absent: absentDays.length,
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        const now = new Date();
        if (newDate > now && newDate.getMonth() !== now.getMonth()) {
            toast.show('error', 'Future Month', 'Cannot view future attendance');
            return;
        }
        setCurrentDate(newDate);
    };

    const router = useRouter();
    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay(); // 0 = Sun

        const days: (Date | null)[] = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

        const getStatusColor = (status: string) => {
            const colors: Record<string, string> = {
                present: '#10B981',
                leave: '#8B5CF6',
                holiday: '#EC4899',
                weekoff: '#6B7280',
                compoff: '#F59E0B',
                mispunch: '#EF4444',
                absent: '#F97316',
            };
            return colors[status] || 'transparent';
        };

        return (
            <View style={styles.calendarContainer}>
                {/* Month Nav */}
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                        <ChevronLeft size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: theme.colors.text }]}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                        <ChevronRight size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Week Headers */}
                <View style={styles.weekHeader}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <Text key={i} style={[styles.weekDayText, (i === 0 || i === 6) && { color: '#DC2626' }]}>{d}</Text>
                    ))}
                </View>

                {/* Days Grid */}
                <View style={styles.calendarGrid}>
                    {days.map((date, idx) => {
                        if (!date) return <View key={idx} style={styles.emptyDay} />;

                        const dateStr = formatDate(date);
                        const status = dateStatusMap.get(dateStr);
                        const isToday = formatDate(new Date()) === dateStr;
                        const statusColor = status ? getStatusColor(status) : null;

                        return (
                            <View key={idx} style={styles.dayContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.dayCell,
                                        {
                                            // Logic: Background is a lighter version (20% opacity) of the border color
                                            // If no status, use default surface/light gray
                                            backgroundColor: statusColor
                                                ? statusColor + '20'
                                                : (isToday ? theme.colors.primary + '20' : (theme.isDark ? theme.colors.surface : '#F3F4F6')),
                                            borderColor: statusColor || (isToday ? theme.colors.primary : 'transparent'),
                                            borderWidth: (statusColor || isToday) ? 2 : 0,
                                        }
                                    ]}
                                    onPress={() => {
                                        // Simple navigation for now, can add range check if strictly needed
                                        router.push({ pathname: '/apply-leave', params: { fromDate: dateStr } });
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        { color: theme.colors.text },
                                        isToday && { color: theme.colors.primary, fontWeight: 'bold' }
                                    ]}>
                                        {date.getDate()}
                                    </Text>

                                    {statusColor && (
                                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const pieData = [
        { label: 'Present', value: stats.present, color: '#10B981' },
        { label: 'Leave', value: stats.leave, color: '#8B5CF6' },
        { label: 'Week Off', value: stats.weekoff, color: '#6B7280' },
        { label: 'Comp Off', value: stats.compoff, color: '#F59E0B' },
        { label: 'Holiday', value: stats.holiday, color: '#EC4899' },
        { label: 'Missed Punch', value: stats.mispunch, color: '#EF4444' },
        { label: 'Absent', value: stats.absent, color: '#F97316' },
    ].filter(i => i.value > 0);

    return (
        <CorporateBackground>
            <TopBar
                title="Attendance Records"
                onMenuPress={() => setSidebarVisible(true)}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.content}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            {renderCalendar()}

                            {/* Chart Card */}
                            {pieData.length > 0 && (
                                <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: 'center' }]}>
                                        Attendance Overview
                                    </Text>
                                    <PieChart data={pieData} />
                                    <View style={styles.legendRow}>
                                        {pieData.map((item, i) => (
                                            <View key={i} style={styles.legendChip}>
                                                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                                                    {item.label}: {item.value}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Summary Grid (Requested Format) */}
                            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 16 }]}>Summary</Text>
                            <View style={styles.summaryGrid}>
                                <SummaryCard title="Present" count={stats.present} icon={CheckCircle} color="#10B981" theme={theme} />
                                <SummaryCard title="Leave" count={stats.leave} icon={CloudRainWind} color="#8B5CF6" theme={theme} />
                                <SummaryCard title="Comp Off" count={stats.compoff} icon={Coffee} color="#F59E0B" theme={theme} />
                                <SummaryCard title="Week Off" count={stats.weekoff} icon={CalendarIcon} color="#6B7280" theme={theme} />
                                <SummaryCard title="Missed Punch" count={stats.mispunch} icon={Clock} color="#EF4444" theme={theme} />
                                <SummaryCard title="Holiday" count={stats.holiday} icon={TentTree} color="#EC4899" theme={theme} />
                                <SummaryCard title="Absent" count={stats.absent} icon={XCircle} color="#F97316" theme={theme} />
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },

    // Calendar
    calendarContainer: {
        // Removed card styling (bg, shadow, padding) as requested
        marginBottom: 20,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthText: { fontSize: 18, fontWeight: '600' },
    navButton: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 10,
    },
    weekDayText: { fontSize: 12, fontWeight: '700', color: '#374151', width: 36, textAlign: 'center' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    emptyDay: { width: '14.28%', height: 48 },
    dayContainer: { width: '14.28%', alignItems: 'center', marginBottom: 8 },
    dayCell: {
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 8,
        position: 'relative',
        backgroundColor: '#F9FAFB'
    },
    dayText: { fontSize: 12, fontWeight: '600' },
    statusDot: {
        position: 'absolute',
        top: -2, right: -2,
        width: 10, height: 10,
        borderRadius: 5,
        borderWidth: 1, borderColor: '#fff'
    },

    // Chart
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    pieContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    pieCenter: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    pieTotal: { fontSize: 32, fontWeight: '700' },
    pieLabel: { fontSize: 14, color: '#6B7280' },
    legendRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    legendChip: { flexDirection: 'row', alignItems: 'center', padding: 4 },
    legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
    legendText: { fontSize: 12, fontWeight: '500' },

    // Summary Cards (Grid)
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    summaryCard: {
        flex: 1,
        minWidth: '45%',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryIconContainer: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    summaryContent: { flex: 1 },
    summaryTitle: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
    summaryCount: { fontSize: 20, fontWeight: '700' },
});
