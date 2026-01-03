import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SkeletonListItem } from '@shared/components/Skeleton';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useMyTickets } from '@features/support/hooks';
import { MessageSquare, Clock, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TicketListScreen() {
    const theme = useTheme();
    const toast = useToast();
    const router = useRouter();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const { data: tickets, isLoading } = useMyTickets();

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
            case 'urgent':
                return theme.colors.error;
            case 'medium':
                return theme.colors.warning;
            case 'low':
                return theme.colors.success;
            default:
                return theme.colors.textSecondary;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return theme.colors.primary;
            case 'resolved':
            case 'closed':
                return theme.colors.success;
            case 'pending':
                return theme.colors.warning;
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="My Tickets"
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
                            Loading tickets...
                        </Text>
                    </View>
                ) : (tickets?.data?.length || 0) > 0 ? (
                    tickets?.data?.map((ticket, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.card, {
                                backgroundColor: theme.colors.cardPrimary,
                                borderColor: theme.colors.border
                            }]}
                            onPress={() => router.push(`/ticket-chat/${ticket.ticket_id}` as any)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[styles.ticketId, { color: theme.colors.textSecondary }]}>
                                    #{ticket.ticket_id}
                                </Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(ticket.ticket_status) + '20' },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(ticket.ticket_status) },
                                        ]}
                                    >
                                        {ticket.ticket_status}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.subject, { color: theme.colors.text }]} numberOfLines={1}>
                                {ticket.ticket_subject}
                            </Text>

                            <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                {ticket.ticket_description}
                            </Text>

                            <View style={styles.cardFooter}>
                                <View style={styles.footerItem}>
                                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(ticket.ticket_priority) }]} />
                                    <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                                        {ticket.ticket_priority} Priority
                                    </Text>
                                </View>
                                <View style={styles.footerItem}>
                                    <Clock width={14} height={14} color={theme.colors.textSecondary} />
                                    <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                                        {ticket.created_date}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <MessageSquare width={48} height={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
                            No Tickets Found
                        </Text>
                        <Text style={[styles.emptySubt, { color: theme.colors.textTertiary }]}>
                            Create a new ticket to get support
                        </Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/create-ticket')}
            >
                <Plus width={24} height={24} color="#ffffff" />
            </TouchableOpacity>

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
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketId: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    subject: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
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
    emptySubt: {
        fontSize: 14,
        marginTop: 8,
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
