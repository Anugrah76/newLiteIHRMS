import { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    BackHandler,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { createCommonStyles } from '@shared/styles/commonStyles';
import { useKRATasks, useTimesheetCalendar } from '@features/timesheet/hooks';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import { apiClient } from '@shared/api/client';
import { useToast } from '@shared/components/Toast';
import { useAuthStore } from '@shared/store';
import { Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Save, Send, Plus, ClipboardList } from 'lucide-react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isFuture } from 'date-fns';

export default function TimesheetScreen() {
    const theme = useTheme();
    const toast = useToast();
    const commonStyles = createCommonStyles(theme.isDark);
    const user = useAuthStore(state => state.user);

    // View State
    const [viewMode, setViewMode] = useState<'calendar' | 'timesheet'>('calendar');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isSubmittedState, setIsSubmittedState] = useState(false);

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Timesheet Form State
    const [kraFormData, setKraFormData] = useState<Record<string, { task_completed: string; comment: string; timesheet_id: string | null; kra_id: string }>>({});
    const [additionalTask, setAdditionalTask] = useState('');
    const [expandedKraId, setExpandedKraId] = useState<string | null>(null);

    // Queries
    const monthName = format(currentMonth, 'MMMM');
    const yearStr = format(currentMonth, 'yyyy');

    // Status Query (for Calendar)
    const { data: calendarStatus, isLoading: isCalendarLoading, refetch: refetchCalendar } = useTimesheetCalendar(monthName, yearStr);

    // Tasks Query (for Selected Date)
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data: tasksData, isLoading: isTasksLoading, refetch: refetchTasks } = useKRATasks(viewMode === 'timesheet' ? dateStr : undefined);

    // Handle Hardware Back Press
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (viewMode === 'timesheet') {
                    setViewMode('calendar');
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [viewMode])
    );

    // Initialize form data from API
    useEffect(() => {
        if (tasksData?.data?.tasks) {
            const initialFormData: typeof kraFormData = {};
            tasksData.data.tasks.forEach(task => {
                initialFormData[task.kra_id] = {
                    task_completed: task.task_done || '',
                    comment: task.comment || '',
                    timesheet_id: task.timesheet_id,
                    kra_id: task.kra_id
                };
            });
            setKraFormData(initialFormData);
        }
        setAdditionalTask(tasksData?.data?.additional_task || '');

        // Sync local submitted state with API data
        setIsSubmittedState(tasksData?.data?.submit_status === 1);
    }, [tasksData]);

    const handleDateSelect = (date: Date) => {
        if (isFuture(date)) {
            toast.show('info', 'Future Date', 'Cannot access future dates');
            return;
        }
        setSelectedDate(date);
        setViewMode('timesheet');
        setExpandedKraId(null);
    };

    const handleKraInputChange = (kraId: string, field: 'task_completed' | 'comment', value: string) => {
        setKraFormData(prev => ({
            ...prev,
            [kraId]: { ...prev[kraId], [field]: value }
        }));
    };

    // Calendar Helpers
    const getDayStatus = (date: Date) => {
        const dStr = format(date, 'yyyy-MM-dd');
        if (calendarStatus?.submittedDates?.includes(dStr)) return 'submitted';
        if (calendarStatus?.draftDates?.includes(dStr)) return 'draft';
        return 'pending';
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

        const getStatusColor = (status: string) => {
            return status === 'submitted' ? theme.colors.success : theme.colors.warning;
        };

        return (
            <View style={styles.calendarContainer}>
                {/* Month Navigation */}
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => setCurrentMonth(prev => subMonths(prev, 1))} style={styles.navButton}>
                        <ChevronLeft size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: theme.colors.text }]}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => !isSameMonth(currentMonth, new Date()) && setCurrentMonth(prev => addMonths(prev, 1))}
                        style={[styles.navButton, isSameMonth(currentMonth, new Date()) && styles.disabledButton]}
                        disabled={isSameMonth(currentMonth, new Date())}
                    >
                        <ChevronRight size={20} color={isSameMonth(currentMonth, new Date()) ? theme.colors.textTertiary : theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Week Days Header */}
                <View style={styles.weekHeader}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <Text key={i} style={[styles.weekDayText, (i === 0 || i === 6) && { color: '#DC2626' }]}>{day}</Text>
                    ))}
                </View>

                {isCalendarLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.calendarGrid}>
                        {days.map((date, idx) => {
                            if (!date) return <View key={`empty-${idx}`} style={styles.emptyDay} />;

                            const status = getDayStatus(date);
                            const isTodayDate = isToday(date);
                            const isDisabled = isFuture(date);
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const statusColor = status !== 'pending' ? getStatusColor(status) : null;

                            return (
                                <View key={format(date, 'yyyy-MM-dd')} style={styles.dayContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dayCell,
                                            {
                                                backgroundColor: statusColor
                                                    ? statusColor + '20'
                                                    : (isTodayDate ? theme.colors.primary + '20' : (theme.isDark ? theme.colors.surface : '#F3F4F6')),
                                                borderColor: statusColor || (isTodayDate ? theme.colors.primary : 'transparent'),
                                                borderWidth: (statusColor || isTodayDate) ? 2 : 0,
                                            },
                                            !isCurrentMonth && { opacity: 0.3 },
                                            isDisabled && styles.disabledDay
                                        ]}
                                        onPress={() => isCurrentMonth && !isDisabled && handleDateSelect(date)}
                                        disabled={!isCurrentMonth || isDisabled}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            { color: theme.colors.text },
                                            isTodayDate && { color: theme.colors.primary, fontWeight: 'bold' }
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
                )}

                {/* Legend */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Draft</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Submitted</Text>
                    </View>
                </View>
            </View>
        );
    };

    const handleKraSubmit = async (submitStatus: number) => {
        const tasks = tasksData?.data?.tasks || [];
        if (tasks.length === 0) {
            toast.show('error', 'No Tasks', 'No KRA tasks to submit');
            return;
        }

        const kraList = Object.values(kraFormData).map(item => ({
            TimeSheet_id: item.timesheet_id,
            kra_id: item.kra_id,
            remark: item.comment || '',
            task_completed: item.task_completed || '0'
        }));

        const payload = {
            key: user?.api_key,
            indo_code: user?.indo_code,
            date: format(selectedDate, 'yyyy-MM-dd'),
            submit_status: submitStatus,
            kraList
        };

        try {
            console.log('🔍 [handleKraSubmit] Submitting KRA tasks:', payload);
            console.log('🔗 [handleKraSubmit] Endpoint:', API_ENDPOINTS.fillTimeSheet());

            // Use apiClient to ensure correct Base URL and error handling
            // We explicitly set Content-Type to application/json as this endpoint expects JSON for bulk updates
            const response = await apiClient.post(API_ENDPOINTS.fillTimeSheet(), payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            const data = response.data;
            console.log('✅ [handleKraSubmit] Response:', data);

            if (response.status === 200) {
                toast.show('success', submitStatus === 0 ? 'Draft Saved' : 'Submitted', data.message || 'KRA tasks saved successfully');
                refetchTasks();
                refetchCalendar();

                // Optimistically update local submit state
                if (submitStatus === 1) {
                    setIsSubmittedState(true);
                    setViewMode('calendar');
                }
            } else {
                toast.show('error', 'Failed', data.message || 'Unable to save KRA tasks');
            }
        } catch (error: any) {
            console.error('❌ [handleKraSubmit] Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit';
            toast.show('error', 'Error', errorMessage);
        }
    };

    const handleAdditionalTaskSubmit = async (status: number) => {
        if (!additionalTask.trim()) {
            toast.show('error', 'Empty Task', 'Please enter task description');
            return;
        }

        const formData = new FormData();
        // Manually append auth fields as apiClient interceptor might not handle FormData injection automatically
        formData.append('key', user?.api_key || '');
        formData.append('indo_code', user?.indo_code || '');
        formData.append('date', format(selectedDate, 'yyyy-MM-dd'));
        formData.append('status', status.toString());
        formData.append('task', additionalTask);

        try {
            console.log('🔍 [handleAdditionalTaskSubmit] Submitting additional task');
            const response = await apiClient.post(API_ENDPOINTS.saveAdditionalTask(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            const data = response.data;
            console.log('✅ [handleAdditionalTaskSubmit] Response:', data);

            if (data.status === 1) {
                toast.show('success', status === 0 ? 'Draft Saved' : 'Submitted', data.message || 'Additional task saved successfully');
                refetchTasks();
                refetchCalendar();
                if (status === 1) {
                    setAdditionalTask('');
                    setViewMode('calendar');
                }
            } else {
                toast.show('error', 'Failed', data.message || 'Unable to save additional task');
            }
        } catch (error: any) {
            console.error('❌ [handleAdditionalTaskSubmit] Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit';
            toast.show('error', 'Error', errorMessage);
        }
    };

    const renderTimesheet = () => {
        const tasks = tasksData?.data?.tasks || [];
        const isSubmitted = tasksData?.data?.submit_status === 1;
        const isAdditionalTaskSubmitted = tasksData?.data?.additional_task_status === 1;

        return (
            <ScrollView style={commonStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}>
                <View>
                    {/* Header */}
                    <View style={[styles.tsHeader, { backgroundColor: theme.colors.cardPrimary, padding: 16, marginBottom: 16, borderRadius: 12 }]}>
                        <Text style={[styles.tsDate, { color: theme.colors.text }]}>{format(selectedDate, 'EEEE, d MMMM')}</Text>
                        <Text style={[styles.tsSubtitle, { color: theme.colors.textSecondary }]}>Daily Timesheet</Text>
                    </View>

                    {/* KRA Section */}
                    <View style={[styles.section, { backgroundColor: theme.colors.cardPrimary, borderRadius: 12, padding: 16, marginBottom: 16 }]}>
                        <View style={styles.sectionHeader}>
                            <ClipboardList size={24} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>KRA Tasks</Text>
                        </View>

                        {isTasksLoading ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
                        ) : tasks.length > 0 ? (
                            <>
                                {tasks.map((task) => (
                                    <View key={task.kra_id} style={[styles.kraCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                                        <TouchableOpacity style={styles.kraHeader} onPress={() => setExpandedKraId(expandedKraId === task.kra_id ? null : task.kra_id)}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.kraName, { color: theme.colors.text }]}>{task.name}</Text>
                                                <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                                    <Text style={[styles.categoryText, { color: theme.colors.primary }]}>{task.category_name}</Text>
                                                </View>
                                            </View>
                                            {expandedKraId === task.kra_id ? <ChevronUp size={20} color={theme.colors.primary} /> : <ChevronDown size={20} color={theme.colors.textSecondary} />}
                                        </TouchableOpacity>

                                        {expandedKraId === task.kra_id && (
                                            <View style={styles.kraExpanded}>
                                                <View style={styles.kraDetails}>
                                                    <View style={styles.detailRow}>
                                                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Description:</Text>
                                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.description}</Text>
                                                    </View>
                                                    <View style={styles.detailRow}>
                                                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Target:</Text>
                                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.target}</Text>
                                                    </View>
                                                    <View style={styles.detailRow}>
                                                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Measurement:</Text>
                                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.measurement_criteria}</Text>
                                                    </View>
                                                    <View style={styles.detailRow}>
                                                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Weightage:</Text>
                                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.weightage}%</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.kraInputs}>
                                                    <View style={styles.inputGroup}>
                                                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Task Completed *</Text>
                                                        <TextInput
                                                            style={[styles.numberInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                                            value={kraFormData[task.kra_id]?.task_completed || ''}
                                                            onChangeText={(value) => handleKraInputChange(task.kra_id, 'task_completed', value)}
                                                            keyboardType="numeric"
                                                            placeholder="0"
                                                            placeholderTextColor={theme.colors.textTertiary}
                                                            editable={!isSubmittedState}
                                                        />
                                                    </View>
                                                    <View style={styles.inputGroup}>
                                                        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Comments</Text>
                                                        <TextInput
                                                            style={[styles.commentInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                                            value={kraFormData[task.kra_id]?.comment || ''}
                                                            onChangeText={(value) => handleKraInputChange(task.kra_id, 'comment', value)}
                                                            placeholder="Enter comments..."
                                                            placeholderTextColor={theme.colors.textTertiary}
                                                            multiline
                                                            numberOfLines={3}
                                                            editable={!isSubmittedState}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}

                                {!isSubmittedState ? (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.draftButton, { borderColor: theme.colors.warning }]}
                                            disabled={tasks.length === 0}
                                            onPress={() => handleKraSubmit(0)}
                                        >
                                            <Save size={20} color={theme.colors.warning} />
                                            <Text style={[styles.draftButtonText, { color: theme.colors.warning }]}>Save as Draft</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                                            disabled={tasks.length === 0}
                                            onPress={() => handleKraSubmit(1)}
                                        >
                                            <Send size={20} color="#FFFFFF" />
                                            <Text style={styles.submitButtonText}>Submit</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={[styles.submittedBanner, { backgroundColor: theme.colors.success + '20' }]}>
                                        <Text style={[styles.submittedText, { color: theme.colors.success }]}>✓ KRA tasks have been submitted for this date</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No KRA tasks assigned for this date.</Text>
                        )}
                    </View>

                    {/* Additional Task Section */}
                    <View style={[styles.section, { backgroundColor: theme.colors.cardPrimary, borderRadius: 12, padding: 16 }]}>
                        <View style={styles.sectionHeader}>
                            <Plus size={24} color={theme.colors.success} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Additional Task</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Task Description</Text>
                            <TextInput
                                style={[styles.additionalInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                value={additionalTask}
                                onChangeText={setAdditionalTask}
                                placeholder="Enter additional task details..."
                                placeholderTextColor={theme.colors.textTertiary}
                                multiline
                                numberOfLines={4}
                                editable={!isAdditionalTaskSubmitted}
                            />
                        </View>

                        {!isAdditionalTaskSubmitted ? (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.draftButton, { borderColor: theme.colors.warning }]}
                                    onPress={() => handleAdditionalTaskSubmit(0)}
                                >
                                    <Save size={20} color={theme.colors.warning} />
                                    <Text style={[styles.draftButtonText, { color: theme.colors.warning }]}>Save as Draft</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: theme.colors.success }]}
                                    onPress={() => handleAdditionalTaskSubmit(1)}
                                >
                                    <Send size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={[styles.submittedBanner, { backgroundColor: theme.colors.success + '20' }]}>
                                <Text style={[styles.submittedText, { color: theme.colors.success }]}>✓ Additional task has been submitted for this date</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        );
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Timesheet"
                onMenuPress={() => setSidebarVisible(true)}
                showBack={viewMode === 'timesheet'}
                onBackPress={() => setViewMode('calendar')}
            />
            {viewMode === 'calendar' ? renderCalendar() : renderTimesheet()}
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    calendarContainer: { padding: 16 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthText: { fontSize: 18, fontWeight: '600' },
    navButton: { padding: 8, borderRadius: 8 },
    disabledButton: { opacity: 0.3 },

    weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, paddingVertical: 10 },
    weekDayText: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'center' },

    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    emptyDay: { width: '14.28%', height: 48 },
    dayContainer: { width: '14.28%', alignItems: 'center', marginBottom: 8 },
    dayCell: {
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 8,
        position: 'relative'
    },
    disabledDay: { opacity: 0.5 },
    dayText: { fontSize: 12, fontWeight: '600' },
    statusDot: {
        position: 'absolute',
        top: -2, right: -2,
        width: 10, height: 10,
        borderRadius: 5,
    },

    legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12 },

    tsHeader: { marginBottom: 16 },
    tsDate: { fontSize: 20, fontWeight: '700' },
    tsSubtitle: { fontSize: 14, marginTop: 4 },

    section: { marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600' },

    kraCard: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
    kraHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    kraName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    categoryText: { fontSize: 12, fontWeight: '500' },

    kraExpanded: { padding: 16, paddingTop: 0 },
    kraDetails: { marginBottom: 16 },
    detailRow: { marginBottom: 8 },
    detailLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
    detailValue: { fontSize: 14 },

    kraInputs: { gap: 12 },
    inputGroup: { marginBottom: 12 },
    inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    numberInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
    commentInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
    additionalInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },

    actionButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
    draftButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 8, borderWidth: 2 },
    draftButtonText: { fontSize: 14, fontWeight: '600' },
    submitButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 8 },
    submitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

    submittedBanner: { padding: 12, borderRadius: 8, marginTop: 16 },
    submittedText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },

    emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
});
