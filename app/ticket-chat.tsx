import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { AlertCircle, Calendar, Clock, MessageCircle, Paperclip, Tag, User } from 'lucide-react-native';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';

export default function TicketChatScreen() {
    const router = useRouter();
    const toast = useToast();
    const theme = useTheme();
    const { ticketId, subject, detailed, priority, status: ticketStatus, personName, createDatetime } = useLocalSearchParams<{
        ticketId: string;
        subject: string;
        detailed: string;
        priority: string;
        status: string;
        personName: string;
        createDatetime: string;
    }>();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ticketData, setTicketData] = useState<any>(null);

    useEffect(() => {
        if (ticketId) {
            fetchTicketChat();
        }
    }, [ticketId]);

    const fetchTicketChat = async () => {
        if (!ticketId) {
            toast.show("error", "No ticket ID provided");
            return;
        }

        if (!user?.api_key || !user?.indo_code) {
            toast.show("error", "Auth Error", "User data missing");
            return;
        }

        setLoading(true);

        const payLoad = new FormData();
        payLoad.append('ticket_id', ticketId as string);
        // key and indo_code auto-injected by interceptor

        try {
            console.log('🔍 [Ticket Chat] API:', API_ENDPOINTS.ticketChat());

            const response = await apiClient.post(API_ENDPOINTS.ticketChat(), payLoad);
            const data = response.data;

            console.log('✅ [Ticket Chat] Response:', data);

            if (data.status === 1) {
                setTicketData(data);
            } else {
                toast.show("error", data.message || "Failed to fetch ticket chat");
            }
        } catch (error: any) {
            console.error('❌ [Ticket Chat] Error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load ticket chat";
            toast.show("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p?.toLowerCase()) {
            case 'high': return '#DC2626';
            case 'medium': return '#D97706';
            case 'low': return '#059669';
            default: return '#6B7280';
        }
    };

    const getStatusColor = (s: string) => {
        switch (s?.toLowerCase()) {
            case 'open': return '#3B82F6';
            case 'closed': return '#059669';
            case 'draft': return '#D97706';
            default: return '#6B7280';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderAttachments = (attachmentString: string) => {
        if (!attachmentString || attachmentString.trim() === '') {
            return null;
        }

        const attachments = attachmentString.split(',').filter(att => att.trim() !== '');

        return (
            <View style={[styles.attachmentsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.attachmentLabel, { color: theme.colors.textSecondary }]}>Attachments:</Text>
                {attachments.map((attachment, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.attachmentItem, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}
                    >
                        <Paperclip size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.attachmentText, { color: theme.colors.text }]} numberOfLines={1}>
                            {attachment.trim()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderTicketReply = (reply: any, index: number) => {
        const isCurrentUser = reply.empcode === user?.empcode;

        return (
            <View
                key={index}
                style={[
                    styles.messageCard,
                    {
                        backgroundColor: theme.colors.cardPrimary,
                        borderLeftColor: isCurrentUser ? '#6777ef' : '#10B981',
                    },
                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                ]}
            >
                <View style={styles.messageHeader}>
                    <View style={styles.messageAuthor}>
                        <User size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.authorName, { color: theme.colors.text }]}>{reply.create_by}</Text>
                        <Text style={[styles.empCode, { color: theme.colors.textSecondary }]}>({reply.empcode})</Text>
                    </View>
                    <View style={styles.messageTime}>
                        <Clock size={14} color={theme.colors.textTertiary} />
                        <Text style={[styles.timeText, { color: theme.colors.textTertiary }]}>{formatDate(reply.create_datetime)}</Text>
                    </View>
                </View>

                <Text style={[styles.messageText, { color: theme.colors.text }]}>{reply.ticket_answer}</Text>

                {renderAttachments(reply.attachment)}
            </View>
        );
    };

    if (loading) {
        return (
            <CorporateBackground>
                <TopBar
                    title="Ticket Chat"
                    onMenuPress={() => setSidebarVisible(true)}
                    showBack
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading ticket chat...</Text>
                </View>
                <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
            </CorporateBackground>
        );
    }

    return (
        <CorporateBackground>
            <TopBar
                title={`Ticket #${ticketId}`}
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100, padding: 16 }}>
                <View style={[styles.ticketInfoCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    {/* Header */}
                    <View style={styles.ticketInfoHeader}>
                        <MessageCircle size={22} color={theme.colors.primary} />
                        <Text style={[styles.ticketInfoTitle, { color: theme.colors.text }]}>Ticket Details</Text>
                        <View style={[styles.statusPill, { backgroundColor: getStatusColor(ticketStatus) }]}>
                            <Text style={styles.statusPillText}>{ticketStatus || 'Unknown'}</Text>
                        </View>
                    </View>

                    {/* Ticket ID & Subject */}
                    <Text style={[styles.ticketIdText, { color: theme.colors.textSecondary }]}>Ticket ID: #{ticketId}</Text>
                    {!!subject && (
                        <Text style={[styles.subjectText, { color: theme.colors.text }]}>{subject}</Text>
                    )}

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    {/* Meta rows */}
                    {!!personName && (
                        <View style={styles.infoRow}>
                            <User size={15} color={theme.colors.textSecondary} />
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Assigned To</Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{personName}</Text>
                        </View>
                    )}
                    {!!priority && (
                        <View style={styles.infoRow}>
                            <Tag size={15} color={getPriorityColor(priority)} />
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Priority</Text>
                            <Text style={[styles.infoValue, { color: getPriorityColor(priority), fontWeight: '700' }]}>{priority}</Text>
                        </View>
                    )}
                    {!!createDatetime && (
                        <View style={styles.infoRow}>
                            <Calendar size={15} color={theme.colors.textSecondary} />
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Created</Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDate(createDatetime)}</Text>
                        </View>
                    )}

                    {/* Description / Detailed */}
                    {!!detailed && (
                        <View style={[styles.detailedBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <View style={styles.detailedHeader}>
                                <AlertCircle size={15} color={theme.colors.primary} />
                                <Text style={[styles.detailedLabel, { color: theme.colors.primary }]}>Description</Text>
                            </View>
                            <Text style={[styles.detailedText, { color: theme.colors.text }]}>{detailed}</Text>
                        </View>
                    )}
                </View>

                {ticketData?.ticket_replies?.length > 0 ? (
                    <View style={styles.chatContainer}>
                        <Text style={[styles.chatTitle, { color: theme.colors.text }]}>
                            Conversation ({ticketData.ticket_replies.length} messages)
                        </Text>
                        {ticketData.ticket_replies.map((reply: any, index: number) => renderTicketReply(reply, index))}
                    </View>
                ) : (
                    <View style={[styles.noDataContainer, { backgroundColor: theme.colors.cardPrimary }]}>
                        <MessageCircle size={64} color={theme.colors.textTertiary} />
                        <Text style={[styles.noDataText, { color: theme.colors.text }]}>No messages found for this ticket</Text>
                        <Text style={[styles.noDataSubText, { color: theme.colors.textSecondary }]}>
                            {ticketData ? 'This ticket has no replies yet.' : 'Unable to load ticket data.'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    ticketInfoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
    },
    ticketInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketInfoTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    ticketIdText: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    subjectText: {
        fontSize: 17,
        fontWeight: '700',
        marginTop: 4,
        lineHeight: 23,
    },
    statusPill: {
        marginLeft: 'auto',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusPillText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 13,
        width: 90,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    detailedBox: {
        marginTop: 8,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
    },
    detailedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    detailedLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    detailedText: {
        fontSize: 14,
        lineHeight: 21,
    },
    chatContainer: {
        flex: 1,
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    messageCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderLeftWidth: 4,
    },
    currentUserMessage: {
        marginLeft: 20,
    },
    otherUserMessage: {
        marginRight: 20,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    messageAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    empCode: {
        fontSize: 12,
        marginLeft: 4,
    },
    messageTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        marginLeft: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 8,
    },
    attachmentsContainer: {
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    attachmentLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginBottom: 4,
        borderWidth: 1,
    },
    attachmentText: {
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        borderRadius: 12,
    },
    noDataText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    noDataSubText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
