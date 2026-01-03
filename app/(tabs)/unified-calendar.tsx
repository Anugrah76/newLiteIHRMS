import { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
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
    FileText,
    Plus,
    ClipboardList,
    X,
    Eye,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useAttendanceRecords } from '@features/attendance/hooks';
import { useTimesheetCalendar } from '@features/timesheet/hooks';
import { useLeaveHistoryByPeriod } from '@features/leave/api/leaveApi';
import { format, addMonths, subMonths, isSameMonth, isFuture, isToday } from 'date-fns';

const { width } = Dimensions.get('window');

// Date formatting utilities
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const convertToISO = (dateStr: any): string | null => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return null;
    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        const parts = dateStr.split('-');
        if (parts.length === 3 && parseInt(parts[2]) > 1900) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    } catch (e) {
        console.error('Date convert error', e);
    }
    return null;
};

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
            if (typeof item === 'object' && item !== null) {
                if (Object.keys(item).length === 0) return;

                if (item.date && typeof item.date === 'string') {
                    const iso = convertToISO(item.date);
                    if (iso) dates.add(iso);
                } else if (item.attend_date && typeof item.attend_date === 'string') {
                    const iso = convertToISO(item.attend_date);
                    if (iso) dates.add(iso);
                } else if (item.lastUpdate && typeof item.lastUpdate === 'string') {
                    const iso = convertToISO(item.lastUpdate);
                    if (iso) dates.add(iso);
                } else if (item.from_date && item.to_date) {
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
            } else if (typeof item === 'string' && item.trim() !== '') {
                const iso = convertToISO(item.trim());
                if (iso) dates.add(iso);
            }
        } catch (e) {
            console.warn(`Error processing ${type} item`, e);
        }
    });

    return Array.from(dates);
};

type ViewFilter = 'all' | 'attendance' | 'timesheet' | 'leave';

interface DayDetail {
    date: string;
    attendance: {
        status: string | null;
        color: string | null;
        label: string | null;
    };
    timesheet: {
        status: string | null;
        color: string | null;
        label: string | null;
    };
    leave: {
        hasLeave: boolean;
        details: any | null;
    };
}

export default function UnifiedCalendarScreen() {
    const theme = useTheme();
    const toast = useToast();
    const router = useRouter();

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
    const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // API Queries
    const getMonthStartEnd = (date: Date) => ({
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear().toString(),
    });

    const monthName = format(currentMonth, 'MMMM');
    const yearStr = format(currentMonth, 'yyyy');

    const { data: attendanceResponse, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useAttendanceRecords(getMonthStartEnd(currentMonth));
    const { data: timesheetStatus, isLoading: isTimesheetLoading, refetch: refetchTimesheet } = useTimesheetCalendar(monthName, yearStr);

    // Refetch on focus
    useFocusEffect(
        useCallback(() => {
            refetchAttendance();
            refetchTimesheet();
        }, [currentMonth])
    );

    // Extract Attendance Data
    const attendanceResult = attendanceResponse?.result;
    const presentDays = extractDates(attendanceResult?.present_days || [], 'present');
    const leaveDays = extractDates(attendanceResult?.leave_days || [], 'leave');
    const compOffDays = extractDates(attendanceResult?.comp_off_days || [], 'compoff');
    const holidayDays = extractDates(attendanceResult?.holiday_days || [], 'holiday');
    const mispunchDays = extractDates(attendanceResult?.mispunch_days || [], 'mispunch');
    const weekOffDays = extractDates(attendanceResult?.weekoff || [], 'weekoff');
    const absentDays = extractDates(attendanceResult?.absent_days || [], 'absent');

    const attendanceStatusMap = new Map<string, string>();
    presentDays.forEach(d => attendanceStatusMap.set(d, 'present'));
    leaveDays.forEach(d => attendanceStatusMap.set(d, 'leave'));
    compOffDays.forEach(d => attendanceStatusMap.set(d, 'compoff'));
    holidayDays.forEach(d => attendanceStatusMap.set(d, 'holiday'));
    mispunchDays.forEach(d => attendanceStatusMap.set(d, 'mispunch'));
    weekOffDays.forEach(d => attendanceStatusMap.set(d, 'weekoff'));
    absentDays.forEach(d => attendanceStatusMap.set(d, 'absent'));

    // Extract Timesheet Data
    const timesheetSubmittedDates = timesheetStatus?.submittedDates || [];
    const timesheetDraftDates = timesheetStatus?.draftDates || [];

    const timesheetStatusMap = new Map<string, string>();
    timesheetSubmittedDates.forEach((d: string) => timesheetStatusMap.set(d, 'submitted'));
    timesheetDraftDates.forEach((d: string) => timesheetStatusMap.set(d, 'draft'));

    // Extract Leave Data
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const selectedMonthIndex = useMemo(() => currentMonth.getMonth() + 1, [currentMonth]);

    const { data: leaveHistoryData } = useLeaveHistoryByPeriod(
        selectedMonthIndex,
        yearStr,
        true
    );

    // Process leave applications for the current month
    const leaveApplications = useMemo(() => {
        if (!leaveHistoryData?.result) return [];

        return (leaveHistoryData.result || [])
            .filter((leave: any) => leave !== null)
            .filter((leave: any) => {
                const fromDate = new Date(leave.from_date);
                const toDate = new Date(leave.to_date);
                const leaveStartMonth = fromDate.getMonth();
                const leaveStartYear = fromDate.getFullYear();
                const leaveEndMonth = toDate.getMonth();
                const leaveEndYear = toDate.getFullYear();

                const monthIdx = currentMonth.getMonth();
                const yearNum = currentMonth.getFullYear();

                return (
                    (leaveStartYear === yearNum && leaveStartMonth === monthIdx) ||
                    (leaveEndYear === yearNum && leaveEndMonth === monthIdx) ||
                    ((leaveStartYear < yearNum || (leaveStartYear === yearNum && leaveStartMonth < monthIdx)) &&
                        (leaveEndYear > yearNum || (leaveEndYear === yearNum && leaveEndMonth > monthIdx)))
                );
            });
    }, [leaveHistoryData, currentMonth]);

    // Map leave applications to specific dates
    const leaveDetailsMap = new Map<string, any>();
    leaveApplications.forEach((leave: any) => {
        const fromDate = new Date(leave.from_date);
        const toDate = new Date(leave.to_date);

        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            let current = new Date(fromDate);
            while (current <= toDate) {
                const dateStr = formatDate(current);
                leaveDetailsMap.set(dateStr, leave);
                current.setDate(current.getDate() + 1);
            }
        }
    });


    // Navigation
    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + direction);

        if (direction > 0 && isSameMonth(newDate, new Date())) {
            // Allow current month
        } else if (direction > 0 && newDate > new Date()) {
            toast.show('error', 'Future Month', 'Cannot view future data');
            return;
        }

        setCurrentMonth(newDate);
    };

    // Color Mappings
    const getAttendanceColor = (status: string): string => {
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

    const getAttendanceLabel = (status: string): string => {
        const labels: Record<string, string> = {
            present: 'Present',
            leave: 'On Leave',
            holiday: 'Holiday',
            weekoff: 'Week Off',
            compoff: 'Comp Off',
            mispunch: 'Missed Punch',
            absent: 'Absent',
        };
        return labels[status] || '';
    };

    const getTimesheetColor = (status: string): string => {
        return status === 'submitted' ? '#10B981' : '#F59E0B';
    };

    const getTimesheetLabel = (status: string): string => {
        return status === 'submitted' ? 'Submitted' : 'Draft';
    };

    const handleDayPress = (date: Date) => {
        const dateStr = formatDate(date);
        const attendanceStatus = attendanceStatusMap.get(dateStr) || null;
        const timesheetStatus = timesheetStatusMap.get(dateStr) || null;
        const leaveDetails = leaveDetailsMap.get(dateStr) || null;

        const dayDetail: DayDetail = {
            date: dateStr,
            attendance: {
                status: attendanceStatus,
                color: attendanceStatus ? getAttendanceColor(attendanceStatus) : null,
                label: attendanceStatus ? getAttendanceLabel(attendanceStatus) : null,
            },
            timesheet: {
                status: timesheetStatus,
                color: timesheetStatus ? getTimesheetColor(timesheetStatus) : null,
                label: timesheetStatus ? getTimesheetLabel(timesheetStatus) : null,
            },
            leave: {
                hasLeave: !!leaveDetails,
                details: leaveDetails,
            },
        };

        setSelectedDay(dayDetail);
        setModalVisible(true);
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const days: (Date | null)[] = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

        return (
            <View style={styles.calendarContainer}>
                {/* Month Navigation */}
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                        <ChevronLeft size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: theme.colors.text }]}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigateMonth(1)}
                        style={[styles.navButton, isSameMonth(currentMonth, new Date().setMonth(new Date().getMonth() + 1)) && styles.disabledButton]}
                    >
                        <ChevronRight size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                    style={styles.filterScrollContainer}
                >
                    {(['all', 'attendance', 'timesheet', 'leave'] as ViewFilter[]).map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterTab,
                                { borderColor: theme.colors.border },
                                viewFilter === filter && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => setViewFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: theme.colors.textSecondary },
                                viewFilter === filter && { color: '#fff', fontWeight: '600' }
                            ]}>
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Week Headers */}
                <View style={styles.weekHeader}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <Text key={i} style={[styles.weekDayText, (i === 0 || i === 6) && { color: '#DC2626' }]}>{d}</Text>
                    ))}
                </View>

                {/* Days Grid */}
                {(isAttendanceLoading || isTimesheetLoading) ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.calendarGrid}>
                        {days.map((date, idx) => {
                            if (!date) return <View key={`empty-${idx}`} style={styles.emptyDay} />;

                            const dateStr = formatDate(date);
                            const attendanceStatus = attendanceStatusMap.get(dateStr);
                            const timesheetStatus = timesheetStatusMap.get(dateStr);
                            const isTodayDate = isToday(date);
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const isFutureDate = isFuture(date);

                            // Determine primary color based on filter
                            let primaryColor = null;
                            let showAttendanceDot = false;
                            let showTimesheetDot = false;

                            if (viewFilter === 'all') {
                                // Show both if available
                                if (attendanceStatus) {
                                    primaryColor = getAttendanceColor(attendanceStatus);
                                }
                                showAttendanceDot = !!attendanceStatus;
                                showTimesheetDot = !!timesheetStatus;
                            } else if (viewFilter === 'attendance') {
                                if (attendanceStatus) {
                                    primaryColor = getAttendanceColor(attendanceStatus);
                                    showAttendanceDot = true;
                                }
                            } else if (viewFilter === 'timesheet') {
                                if (timesheetStatus) {
                                    primaryColor = getTimesheetColor(timesheetStatus);
                                    showTimesheetDot = true;
                                }
                            } else if (viewFilter === 'leave') {
                                if (attendanceStatus === 'leave') {
                                    primaryColor = getAttendanceColor('leave');
                                    showAttendanceDot = true;
                                }
                            }

                            return (
                                <View key={dateStr} style={styles.dayContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dayCell,
                                            {
                                                backgroundColor: primaryColor
                                                    ? primaryColor + '20'
                                                    : (isTodayDate ? theme.colors.primary + '20' : (theme.isDark ? theme.colors.surface : '#F3F4F6')),
                                                borderColor: primaryColor || (isTodayDate ? theme.colors.primary : 'transparent'),
                                                borderWidth: (primaryColor || isTodayDate) ? 2 : 0,
                                            },
                                            !isCurrentMonth && { opacity: 0.3 },
                                            isFutureDate && { opacity: 0.5 }
                                        ]}
                                        onPress={() => isCurrentMonth && !isFutureDate && handleDayPress(date)}
                                        disabled={!isCurrentMonth || isFutureDate}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            { color: theme.colors.text },
                                            isTodayDate && { color: theme.colors.primary, fontWeight: 'bold' }
                                        ]}>
                                            {date.getDate()}
                                        </Text>

                                        {/* Multi-status indicators */}
                                        {viewFilter === 'all' && (
                                            <View style={styles.dotsContainer}>
                                                {showAttendanceDot && attendanceStatus && (
                                                    <View style={[styles.miniDot, { backgroundColor: getAttendanceColor(attendanceStatus) }]} />
                                                )}
                                                {showTimesheetDot && timesheetStatus && (
                                                    <View style={[styles.miniDot, { backgroundColor: getTimesheetColor(timesheetStatus) }]} />
                                                )}
                                            </View>
                                        )}

                                        {/* Single status dot for filtered views */}
                                        {viewFilter !== 'all' && primaryColor && (
                                            <View style={[styles.statusDot, { backgroundColor: primaryColor }]} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Legend */}
                <View style={styles.legendContainer}>
                    {viewFilter === 'all' || viewFilter === 'attendance' ? (
                        <>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Present</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Leave</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Week Off</Text>
                            </View>
                        </>
                    ) : null}
                    {viewFilter === 'all' || viewFilter === 'timesheet' ? (
                        <>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>TS Submitted</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>TS Draft</Text>
                            </View>
                        </>
                    ) : null}
                    {viewFilter === 'leave' ? (
                        <>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>On Leave</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Approved</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Pending</Text>
                            </View>
                        </>
                    ) : null}
                </View>
            </View>
        );
    };

    const renderDayDetailModal = () => {
        if (!selectedDay) return null;

        const dateObj = new Date(selectedDay.date);
        const displayDate = format(dateObj, 'EEEE, MMMM d, yyyy');

        return (
            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{displayDate}</Text>
                                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Day Summary</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}>
                            {/* Attendance Section */}
                            <View style={[styles.detailSection, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.detailHeader}>
                                    <CheckCircle size={20} color={theme.colors.primary} />
                                    <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Attendance</Text>
                                </View>
                                {selectedDay.attendance.status ? (
                                    <View style={styles.detailContent}>
                                        <View style={[styles.statusBadge, { backgroundColor: selectedDay.attendance.color + '20', borderColor: selectedDay.attendance.color }]}>
                                            <View style={[styles.statusDotLarge, { backgroundColor: selectedDay.attendance.color }]} />
                                            <Text style={[styles.statusText, { color: selectedDay.attendance.color }]}>
                                                {selectedDay.attendance.label}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={[styles.noDataText, { color: theme.colors.textTertiary }]}>No attendance data</Text>
                                )}
                            </View>

                            {/* Timesheet Section */}
                            <View style={[styles.detailSection, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.detailHeader}>
                                    <ClipboardList size={20} color={theme.colors.success} />
                                    <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Timesheet</Text>
                                </View>
                                {selectedDay.timesheet.status ? (
                                    <View style={styles.detailContent}>
                                        <View style={[styles.statusBadge, { backgroundColor: selectedDay.timesheet.color + '20', borderColor: selectedDay.timesheet.color }]}>
                                            <View style={[styles.statusDotLarge, { backgroundColor: selectedDay.timesheet.color }]} />
                                            <Text style={[styles.statusText, { color: selectedDay.timesheet.color }]}>
                                                {selectedDay.timesheet.label}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                                            onPress={() => {
                                                setModalVisible(false);
                                                router.push({ pathname: '/timesheet', params: { date: selectedDay.date } });
                                            }}
                                        >
                                            <Eye size={16} color="#fff" />
                                            <Text style={styles.viewButtonText}>View Timesheet</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={[styles.noDataText, { color: theme.colors.textTertiary }]}>No timesheet filled</Text>
                                        {!isFuture(dateObj) && (
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    router.push({ pathname: '/timesheet', params: { date: selectedDay.date } });
                                                }}
                                            >
                                                <Plus size={16} color="#fff" />
                                                <Text style={styles.actionButtonText}>Fill Timesheet</Text>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </View>

                            {/* Leave Application Section */}
                            <View style={[styles.detailSection, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.detailHeader}>
                                    <FileText size={20} color="#8B5CF6" />
                                    <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Leave Application</Text>
                                </View>
                                {selectedDay.leave.hasLeave && selectedDay.leave.details ? (
                                    <View style={styles.detailContent}>
                                        {(() => {
                                            const leave = selectedDay.leave.details;
                                            const LEAVE_TYPES: Record<string, { name: string; short: string }> = {
                                                "1": { name: "Casual Leave", short: "CL" },
                                                "2": { name: "Sick Leave", short: "SL" },
                                                "3": { name: "Comp Off", short: "CO" },
                                                "4": { name: "Business Trip", short: "OD" },
                                                "5": { name: "Leave Without Pay", short: "LWP" },
                                                "6": { name: "Paid Leave", short: "EL" },
                                                "7": { name: "Restricted/Floating", short: "RH" }
                                            };
                                            const STATUS_MAP: Record<string, { name: string; color: string }> = {
                                                "0": { name: "Rejected", color: "#EF4444" },
                                                "1": { name: "Pending", color: "#F59E0B" },
                                                "2": { name: "Approved", color: "#10B981" },
                                                "3": { name: "Cancelled", color: "#6B7280" }
                                            };
                                            const leaveType = LEAVE_TYPES[leave.lt_id] || { name: "Unknown", short: "??" };
                                            const status = STATUS_MAP[leave.status] || { name: "Unknown", color: "#6B7280" };
                                            const formatDateTime = (dateString: string) => {
                                                const date = new Date(dateString);
                                                return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                            };

                                            return (
                                                <>
                                                    <View style={[styles.leaveInfoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                                        <View style={styles.leaveHeader}>
                                                            <View style={[styles.leaveTypeBadge, { backgroundColor: '#8B5CF6' + '20', borderColor: '#8B5CF6' }]}>
                                                                <Text style={[styles.leaveTypeBadgeText, { color: '#8B5CF6' }]}>{leaveType.short}</Text>
                                                            </View>
                                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                                <Text style={[styles.leaveTypeName, { color: theme.colors.text }]}>{leaveType.name}</Text>
                                                                <Text style={[styles.leaveDuration, { color: theme.colors.textSecondary }]}>
                                                                    {leave.leave_period} day{leave.leave_period !== '1.00' ? 's' : ''}
                                                                </Text>
                                                            </View>
                                                            <View style={[styles.leaveStatusBadge, { backgroundColor: status.color + '20' }]}>
                                                                <Text style={[styles.leaveStatusText, { color: status.color }]}>{status.name}</Text>
                                                            </View>
                                                        </View>

                                                        <View style={[styles.leaveDateRange, { borderTopColor: theme.colors.border }]}>
                                                            <View style={styles.leaveDateItem}>
                                                                <Text style={[styles.leaveDateLabel, { color: theme.colors.textSecondary }]}>From</Text>
                                                                <Text style={[styles.leaveDateValue, { color: theme.colors.text }]}>{formatDateTime(leave.from_date)}</Text>
                                                            </View>
                                                            <Text style={{ color: theme.colors.textTertiary }}>→</Text>
                                                            <View style={styles.leaveDateItem}>
                                                                <Text style={[styles.leaveDateLabel, { color: theme.colors.textSecondary }]}>To</Text>
                                                                <Text style={[styles.leaveDateValue, { color: theme.colors.text }]}>{formatDateTime(leave.to_date)}</Text>
                                                            </View>
                                                        </View>

                                                        {leave.comments && (
                                                            <View style={[styles.leaveComments, { borderTopColor: theme.colors.border }]}>
                                                                <Text style={[styles.leaveCommentsLabel, { color: theme.colors.textSecondary }]}>Comments:</Text>
                                                                <Text style={[styles.leaveCommentsText, { color: theme.colors.text }]}>{leave.comments}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <TouchableOpacity
                                                        style={[styles.actionButton, { backgroundColor: theme.colors.textTertiary }]}
                                                        onPress={() => {
                                                            setModalVisible(false);
                                                            router.push('/leave-summary');
                                                        }}
                                                    >
                                                        <Eye size={16} color="#fff" />
                                                        <Text style={styles.actionButtonText}>View All Leaves</Text>
                                                    </TouchableOpacity>
                                                </>
                                            );
                                        })()}
                                    </View>
                                ) : (
                                    <>
                                        <Text style={[styles.noDataText, { color: theme.colors.textTertiary }]}>No leave applied for this date</Text>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                                            onPress={() => {
                                                setModalVisible(false);
                                                router.push({ pathname: '/apply-leave', params: { fromDate: selectedDay.date } });
                                            }}
                                        >
                                            <Plus size={16} color="#fff" />
                                            <Text style={styles.actionButtonText}>Apply for Leave</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Unified Calendar"
                onMenuPress={() => setSidebarVisible(true)}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.content}>
                    {/* Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }]}>
                        <CalendarIcon size={20} color={theme.colors.primary} />
                        <Text style={[styles.infoText, { color: theme.colors.primary }]}>
                            Unified view of Attendance, Timesheet & Leave
                        </Text>
                    </View>

                    {renderCalendar()}
                </View>
            </ScrollView>

            {renderDayDetailModal()}
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    infoText: { fontSize: 13, fontWeight: '500', flex: 1 },

    // Calendar
    calendarContainer: { marginBottom: 20 },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthText: { fontSize: 18, fontWeight: '700' },
    navButton: { padding: 8, borderRadius: 8 },
    disabledButton: { opacity: 0.3 },

    // Filter Tabs
    filterScrollContainer: {
        marginBottom: 16,
    },
    filterScrollContent: {
        gap: 8,
        paddingHorizontal: 2,
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    filterText: { fontSize: 12, fontWeight: '500' },

    // Week Header
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingVertical: 10,
    },
    weekDayText: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'center' },

    // Calendar Grid
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    emptyDay: { width: '14.28%', height: 48 },
    dayContainer: { width: '14.28%', alignItems: 'center', marginBottom: 8 },
    dayCell: {
        width: 36, height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        position: 'relative',
    },
    dayText: { fontSize: 12, fontWeight: '600' },
    statusDot: {
        position: 'absolute',
        top: -2, right: -2,
        width: 10, height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#fff'
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 2,
        flexDirection: 'row',
        gap: 2,
    },
    miniDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },

    // Legend
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, fontWeight: '500' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalSubtitle: { fontSize: 13, marginTop: 2 },
    closeButton: { padding: 4 },
    modalBody: { paddingHorizontal: 20, paddingTop: 16 },

    // Detail Sections
    detailSection: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    detailTitle: { fontSize: 16, fontWeight: '600' },
    detailContent: { gap: 12 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    statusDotLarge: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: { fontSize: 14, fontWeight: '600' },
    noDataText: { fontSize: 14, fontStyle: 'italic' },

    // Action Buttons
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginTop: 8,
    },
    actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    viewButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    // Leave Info Styles
    leaveInfoCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    leaveHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    leaveTypeBadge: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaveTypeBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    leaveTypeName: {
        fontSize: 16,
        fontWeight: '600',
    },
    leaveDuration: {
        fontSize: 12,
        marginTop: 2,
    },
    leaveStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    leaveStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    leaveDateRange: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        marginBottom: 12,
    },
    leaveDateItem: {
        alignItems: 'center',
    },
    leaveDateLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    leaveDateValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    leaveComments: {
        paddingTop: 12,
        borderTopWidth: 1,
    },
    leaveCommentsLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    leaveCommentsText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});
