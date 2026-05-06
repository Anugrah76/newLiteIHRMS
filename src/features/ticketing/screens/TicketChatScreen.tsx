import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@shared/components/ui/TopBar';
import { CorporateGradient } from '@shared/components/ui/CorporateGradient';
import { ChatMessage } from '../components/ChatMessage';
import { useTicketChat } from '../hooks/useTicketing';
import { TicketReply } from '../types';
import { useAuthStore } from '@shared/store';
import { MessageCircle } from 'lucide-react-native';

export default function TicketChatScreen() {
    const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
    const { user } = useAuthStore();
    const { data: chatData, isLoading } = useTicketChat(ticketId);
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatData?.ticket_replies) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [chatData?.ticket_replies]);

    const handleAttachmentPress = (filename: string) => {
        Alert.alert('Attachment', `File: ${filename}\n\nDownload functionality to be implemented.`);
    };

    return (
        <CorporateGradient>
            <SafeAreaView style={styles.container}>
                <TopBar title={`Ticket #${ticketId}`} showBack />

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#6777ef" />
                    </View>
                ) : (
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                    >
                        <View style={styles.infoCard}>
                            <View style={styles.infoHeader}>
                                <MessageCircle size={24} color="#6777ef" />
                                <Text style={styles.infoTitle}>Ticket Details</Text>
                            </View>
                            <Text style={styles.ticketIdText}>Conversation History</Text>
                        </View>

                        {chatData?.ticket_replies && chatData.ticket_replies.length > 0 ? (
                            <View style={styles.chatContainer}>
                                {chatData.ticket_replies.map((reply: TicketReply, index: number) => (
                                    <ChatMessage
                                        key={index}
                                        reply={reply}
                                        isCurrentUser={reply.empcode === user?.empcode}
                                        onAttachmentPress={handleAttachmentPress}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No messages yet.</Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </CorporateGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 30,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    ticketIdText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 32,
    },
    chatContainer: {
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        fontStyle: 'italic',
    },
});
