import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useLeaveHistory } from '@features/leave/hooks';
import { Calendar, Clock, FileText } from 'lucide-react-native';

export default function LeaveHistoryScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const { data: leaveHistory, isLoading } = useLeaveHistory();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return theme.colors.success;
            case 'pending':
                return theme.colors.warning;
            case 'rejected':
                return theme.colors.error;
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Leave History"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            Loading leave history...
                        </Text>
                    </View>
                ) : (leaveHistory?.data?.length || 0) > 0 ? (
                    leaveHistory?.data?.map((leave, index) => (
                        <View
                            key={index}
                            style={[styles.card, {
                                backgroundColor: theme.colors.cardPrimary,
                                borderColor: theme.colors.border
                            }]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.headerLeft}>
                                    <Text style={[styles.leaveType, { color: theme.colors.text }]}>
                                        {leave.leave_type}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(leave.status) + '20' },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: getStatusColor(leave.status) },
                                            ]}
                                        >
                                            {leave.status}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.daysCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <Text style={[styles.daysText, { color: theme.colors.primary }]}>
                                        {leave.days}
                                    </Text>
                                    <Text style={[styles.daysLabel, { color: theme.colors.primary }]}>
                                        days
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.infoRow}>
                                    <Calendar width={16} height={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        From:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                        {leave.from_date}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Calendar width={16} height={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        To:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                        {leave.to_date}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Clock width={16} height={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        Applied:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                        {leave.applied_date}
                                    </Text>
                                </View>

                                {leave.reason && (
                                    <View style={[styles.reasonContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <FileText width={14} height={14} color={theme.colors.textSecondary} />
                                        <Text style={[styles.reasonText, { color: theme.colors.textSecondary }]}>
                                            {leave.reason}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Calendar width={48} height={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
                            No Leave History
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textTertiary }]}>
                            Your leave applications will appear here
                        </Text>
                    </View>
                )}
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
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    leaveType: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    daysCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    daysText: {
        fontSize: 20,
        fontWeight: '700',
    },
    daysLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    cardBody: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        width: 60,
    },
    infoValue: {
        fontSize: 14,
        flex: 1,
    },
    reasonContainer: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    reasonText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
    emptyCard: {
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
