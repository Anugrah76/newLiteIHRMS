import { useState, useMemo } from 'react';
import {
    ActivityIndicator, View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { Calendar, Clock, CheckCircle, XCircle, Users, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useLeaveQuotaByPeriod, useLeaveHistoryByPeriod } from '@features/leave/api/leaveApi';

const LEAVE_TYPES = [
    { id: "1", name: "Casual Leave", short: "CL" },
    { id: "2", name: "Sick Leave", short: "SL" },
    { id: "3", name: "Comp Off", short: "CO" },
    { id: "4", name: "Business Trip", short: "OD" },
    { id: "5", name: "Leave Without Pay", short: "LWP" },
    { id: "6", name: "Paid Leave", short: "EL" },
    { id: "7", name: "Restricted/Floating", short: "RH" }
];

const LEAVE_TYPE_MAP = LEAVE_TYPES.reduce((map, type) => {
    map[type.id] = { short_name: type.short, name: type.name };
    return map;
}, {} as any);

const STATUS_MAP = {
    "0": { name: "Rejected", color: "#EF4444" },
    "1": { name: "Pending", color: "#F59E0B" },
    "2": { name: "Approved", color: "#10B981" },
    "3": { name: "Cancelled", color: "#6B7280" }
};

export default function LeaveSummaryScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
    const [shouldFetch, setShouldFetch] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        pendingLeaves: true,
        leaveQuota: true
    });

    // Calculate month index for API
    const selectedMonthIndex = useMemo(() => months.indexOf(selectedMonth) + 1, [selectedMonth]);

    // Use React Query hooks with parameters
    const { data: quotaData, isLoading: quotaLoading, refetch: refetchQuota } = useLeaveQuotaByPeriod(
        selectedMonthIndex,
        selectedYear,
        shouldFetch
    );

    const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useLeaveHistoryByPeriod(
        selectedMonthIndex,
        selectedYear,
        shouldFetch
    );

    const toggleSection = (section: 'pendingLeaves' | 'leaveQuota') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Process quota data
    const leaveQuota = useMemo(() => {
        if (!quotaData?.leave_quota || !quotaData.leave_quota[0]) return [];

        const raw = quotaData.leave_quota[0];
        const ids = raw.lt_id.split(',');
        const totals = raw.leaves.split(',');
        const taken = raw.leavesTaked.split(',');
        const remaining = raw.remaining.split(',');

        return ids.map((id: string, i: number) => ({
            lt_id: id,
            leaves: totals[i],
            leavesTaked: taken[i],
            remaining: remaining[i],
            shortName: LEAVE_TYPE_MAP[id]?.short_name || id,
            fullName: LEAVE_TYPE_MAP[id]?.name || id
        }));
    }, [quotaData]);

    // Process and filter leave history
    const pendingLeaves = useMemo(() => {
        if (!historyData?.result) return [];

        const validLeaves = (historyData.result || [])
            .filter((leave: any) => leave !== null)
            .map((leave: any) => ({
                ...leave,
                shortName: LEAVE_TYPE_MAP[leave.lt_id]?.short_name || leave.lt_id,
                fullName: LEAVE_TYPE_MAP[leave.lt_id]?.name || leave.lt_id,
                statusInfo: STATUS_MAP[leave.status] || { name: "Unknown", color: "#6B7280" }
            }));

        const selectedMonthIdx = months.indexOf(selectedMonth);
        const selectedYearNum = parseInt(selectedYear);

        const filteredLeaves = validLeaves.filter((leave: any) => {
            const fromDate = new Date(leave.from_date);
            const toDate = new Date(leave.to_date);

            const leaveStartMonth = fromDate.getMonth();
            const leaveStartYear = fromDate.getFullYear();
            const leaveEndMonth = toDate.getMonth();
            const leaveEndYear = toDate.getFullYear();

            return (
                (leaveStartYear === selectedYearNum && leaveStartMonth === selectedMonthIdx) ||
                (leaveEndYear === selectedYearNum && leaveEndMonth === selectedMonthIdx) ||
                ((leaveStartYear < selectedYearNum || (leaveStartYear === selectedYearNum && leaveStartMonth < selectedMonthIdx)) &&
                    (leaveEndYear > selectedYearNum || (leaveEndYear === selectedYearNum && leaveEndMonth > selectedMonthIdx)))
            );
        });

        return filteredLeaves.sort((a: any, b: any) =>
            new Date(b.applydatetime).getTime() - new Date(a.applydatetime).getTime()
        );
    }, [historyData, selectedMonth, selectedYear]);

    const handleSearch = () => {
        setShouldFetch(true);
        refetchQuota();
        refetchHistory();
    };

    const handleRefresh = () => {
        refetchQuota();
        refetchHistory();
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { date: formattedDate, time: formattedTime };
    };

    const getStatusIcon = (status: string) => {
        const statusInfo = STATUS_MAP[status];
        if (status === '2') return CheckCircle;
        if (status === '0' || status === '3') return XCircle;
        return Clock;
    };

    const LeaveCard = ({ leave }: { leave: any }) => {
        if (!leave) return null;

        const StatusIcon = getStatusIcon(leave.status);
        const statusColor = leave.statusInfo?.color || '#6B7280';
        const statusName = leave.statusInfo?.name || 'Unknown';

        return (
            <View style={[styles.leaveCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.leaveCardHeader}>
                    <View style={styles.leaveTypeContainer}>
                        <View style={[styles.leaveTypeIcon, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
                            <Text style={[styles.leaveShortName, { color: theme.colors.primary }]}>{leave.shortName}</Text>
                        </View>
                        <View>
                            <Text style={[styles.leaveTypeText, { color: theme.colors.text }]}>{leave.fullName}</Text>
                            <Text style={[styles.leaveStatusText, { color: theme.colors.textSecondary }]}>
                                {leave.leave_period} day{leave.leave_period !== '1.00' ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusContainer, { backgroundColor: statusColor + '20' }]}>
                        <StatusIcon size={14} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusName}</Text>
                    </View>
                </View>

                <View style={[styles.leaveCardBody, { borderTopColor: theme.colors.border }]}>
                    <View style={styles.dateRow}>
                        <View style={styles.dateItem}>
                            <Calendar size={14} color={theme.colors.textSecondary} />
                            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>From</Text>
                            <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDateTime(leave.from_date).date}</Text>
                            <Text style={[styles.timeValue, { color: theme.colors.textSecondary }]}>{formatDateTime(leave.from_date).time}</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Calendar size={14} color={theme.colors.textSecondary} />
                            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>To</Text>
                            <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDateTime(leave.to_date).date}</Text>
                            <Text style={[styles.timeValue, { color: theme.colors.textSecondary }]}>{formatDateTime(leave.to_date).time}</Text>
                        </View>
                    </View>

                    {leave.comments && (
                        <View style={[styles.commentsSection, { borderTopColor: theme.colors.border }]}>
                            <Text style={[styles.commentsLabel, { color: theme.colors.textSecondary }]}>Comments:</Text>
                            <Text style={[styles.commentsText, { color: theme.colors.text }]}>{leave.comments}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const QuotaCard = ({ quota }: { quota: any }) => {
        if (!quota) return null;

        const percentage = quota.leaves > 0 ? (quota.leavesTaked / quota.leaves) * 100 : 0;

        return (
            <View style={[styles.quotaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.quotaCardTop}>
                    <View style={[styles.quotaIcon, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
                        <Text style={[styles.quotaShortName, { color: theme.colors.primary }]}>{quota.shortName}</Text>
                    </View>
                    <Text style={[styles.quotaTypeName, { color: theme.colors.text }]} numberOfLines={2}>{quota.fullName}</Text>
                </View>

                <View style={styles.quotaProgress}>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                        <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: theme.colors.primary }]} />
                    </View>
                </View>

                <View style={styles.quotaStats}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{quota.leaves}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: '#EF4444' }]}>{quota.leavesTaked}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Used</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: '#10B981' }]}>{quota.remaining}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Left</Text>
                    </View>
                </View>
            </View>
        );
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => ({
        label: `${currentYear - i}`,
        value: `${currentYear - i}`
    }));

    const monthOptions = months.map(month => ({ label: month, value: month }));

    return (
        <CorporateBackground>
            <TopBar title="Leave Summary" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={quotaLoading || historyLoading} onRefresh={handleRefresh} />}
            >
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <View style={styles.selectRow}>
                        <View style={styles.selectHalf}>
                            <SelectField label="Year" value={selectedYear} onValueChange={setSelectedYear} options={yearOptions} theme={theme} />
                        </View>
                        <View style={styles.selectHalf}>
                            <SelectField label="Month" value={selectedMonth} onValueChange={setSelectedMonth} options={monthOptions} theme={theme} />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: (quotaLoading || historyLoading) ? theme.colors.textTertiary : theme.colors.primary }]}
                        onPress={handleSearch}
                        disabled={quotaLoading || historyLoading}
                    >
                        {(quotaLoading || historyLoading) ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search</Text>}
                    </TouchableOpacity>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <TouchableOpacity style={[styles.sectionHeader, { borderBottomColor: theme.colors.border }]} onPress={() => toggleSection('pendingLeaves')}>
                        <View style={styles.sectionTitleContainer}>
                            <Clock size={20} color="#EF4444" />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pending Leaves - {selectedMonth}</Text>
                        </View>
                        {expandedSections.pendingLeaves ? <ChevronUp size={20} color={theme.colors.textSecondary} /> : <ChevronDown size={20} color={theme.colors.textSecondary} />}
                    </TouchableOpacity>

                    {expandedSections.pendingLeaves && (
                        <>
                            {historyLoading ? (
                                <View style={styles.emptyState}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                </View>
                            ) : pendingLeaves.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <CheckCircle size={48} color="#10B981" />
                                    <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Leaves Found</Text>
                                    <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                                        No leaves found for {selectedMonth} {selectedYear}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.cardsContainer}>
                                    {pendingLeaves.map((leave, index) => <LeaveCard key={index} leave={leave} />)}
                                </View>
                            )}
                        </>
                    )}
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <TouchableOpacity style={[styles.sectionHeader, { borderBottomColor: theme.colors.border }]} onPress={() => toggleSection('leaveQuota')}>
                        <View style={styles.sectionTitleContainer}>
                            <Users size={20} color="#6366F1" />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Leave Quota Till Now</Text>
                        </View>
                        {expandedSections.leaveQuota ? <ChevronUp size={20} color={theme.colors.textSecondary} /> : <ChevronDown size={20} color={theme.colors.textSecondary} />}
                    </TouchableOpacity>

                    {expandedSections.leaveQuota && (
                        <>
                            {quotaLoading ? (
                                <View style={styles.emptyState}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                </View>
                            ) : leaveQuota.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Users size={48} color={theme.colors.textSecondary} />
                                    <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Leave Quota Data</Text>
                                    <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                                        Click search to load your leave quota information
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.quotaGrid}>
                                    {leaveQuota.map((quota, index) => <QuotaCard key={index} quota={quota} />)}
                                </View>
                            )}
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
    content: { padding: 16, paddingBottom: 30 },
    formCard: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, marginBottom: 20, padding: 20, borderWidth: 1 },
    selectRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    selectHalf: { flex: 1 },
    button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    sectionCard: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, marginBottom: 20, padding: 20, borderWidth: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1 },
    sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginLeft: 8 },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    emptyStateText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    cardsContainer: { gap: 12 },
    leaveCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
    leaveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    leaveTypeContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    leaveTypeIcon: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    leaveShortName: { fontSize: 12, fontWeight: '700' },
    leaveTypeText: { fontSize: 16, fontWeight: '600' },
    leaveStatusText: { fontSize: 12, marginTop: 2 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 25 },
    statusText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
    leaveCardBody: { paddingTop: 12, borderTopWidth: 1 },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dateItem: { flex: 1, alignItems: 'center', padding: 8 },
    dateLabel: { fontSize: 12, marginTop: 4, marginBottom: 2 },
    dateValue: { fontSize: 14, fontWeight: '600' },
    timeValue: { fontSize: 12, marginTop: 2 },
    commentsSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
    commentsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    commentsText: { fontSize: 14, fontStyle: 'italic' },
    quotaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'space-between', marginBottom: 10 },
    quotaCard: { borderRadius: 12, padding: 14, borderWidth: 1, width: '48%', minHeight: 140, marginBottom: 10 },
    quotaCardTop: { alignItems: 'center', marginBottom: 12 },
    quotaIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1.5 },
    quotaShortName: { fontSize: 14, fontWeight: '700' },
    quotaTypeName: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
    quotaProgress: { marginBottom: 12 },
    progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    quotaStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    statBox: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    statLabel: { fontSize: 10, fontWeight: '500' },
    statDivider: { width: 1, height: 24 },
});
