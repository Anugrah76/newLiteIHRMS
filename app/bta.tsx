import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useMyEvents, useTeamBtaList } from '@features/bta/hooks';
import { PlaneTakeoff, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@features/auth/store/authSlice';

export default function BtaScreen() {
    const theme = useTheme();
    const toast = useToast();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'my_events' | 'approvals'>('my_events');

    // Fetch My Events
    const { data: myEvents, isLoading: loadingMyEvents } = useMyEvents({
        creator_id: user?.emp_code || '',
        status: '', // All statuses
        from_date: '', // All dates
        to_date: '',
        indo_code: user?.indo_code || '',
    }, !!user);

    // Fetch Team Approvals
    // Using default payload matching MyEventsPayload interface for now
    const { data: teamBtaData, isLoading: loadingApprovals } = useTeamBtaList({
        creator_id: '', // Empty might imply all for approver, or need specific API
        status: '2', // Assuming '2' is Submitted/Pending for approval
        from_date: '',
        to_date: '',
        indo_code: user?.indo_code || '',
        
    }, !!user);

    // Safe access
    const eventsList = Array.isArray(myEvents?.data) ? myEvents.data : [];
    const approvalsList = Array.isArray(teamBtaData?.data) ? teamBtaData.data : [];

    return (
        <CorporateBackground>
            <TopBar
                title="BTA Management"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
            />

            {/* Tab Switcher */}
            <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'my_events' && { borderBottomColor: theme.colors.primary }
                    ]}
                    onPress={() => setActiveTab('my_events')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'my_events' ? theme.colors.primary : theme.colors.textSecondary }
                    ]}>My Events</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'approvals' && { borderBottomColor: theme.colors.primary }
                    ]}
                    onPress={() => setActiveTab('approvals')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'approvals' ? theme.colors.primary : theme.colors.textSecondary }
                    ]}>Team Approvals</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'my_events' ? (
                    loadingMyEvents ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                    ) : eventsList.length > 0 ? (
                        eventsList.map((event: any, index: number) => (
                            <View key={index} style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.headerIcon}>
                                        <Calendar width={20} height={20} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.headerContent}>
                                        <Text style={[styles.title, { color: theme.colors.text }]}>{event.event_name}</Text>
                                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                            {event.from_date} - {event.to_date}
                                        </Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                                            {event.status || 'Active'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <PlaneTakeoff width={48} height={48} color={theme.colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No events found</Text>
                        </View>
                    )
                ) : (
                    loadingApprovals ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                    ) : approvalsList.length > 0 ? (
                        approvalsList.map((req: any, index: number) => (
                            <View key={index} style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <Text style={[styles.title, { color: theme.colors.text }]}>{req.emp_name}</Text>
                                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{req.event_name}</Text>
                                {/* Add actions here */}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <CheckCircle width={48} height={48} color={theme.colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No pending approvals</Text>
                        </View>
                    )
                )}
            </ScrollView>

            {activeTab === 'my_events' && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => toast.show('info', 'Create Event', 'Feature coming soon')}
                >
                    <Plus width={24} height={24} color="#ffffff" />
                </TouchableOpacity>
            )}

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
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        marginTop: 40,
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
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
