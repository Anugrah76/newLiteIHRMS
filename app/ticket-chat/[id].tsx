import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useSendTicketMessage } from '@features/support/hooks';
import { Send, User } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

// Mock data until real endpoint for fetching chat history is confirmed/implemented details
// The current API might not support fetching chat history directly or I need to check `myTicket` response again to see if it includes standard chat array.
// Actually, `ticketChat` endpoint is for SENDING. 
// `myTicket` returns a list of tickets. 
// There is usually a `view_ticket_detail` or similar. 
// Let's rely on `myTicket` for basic details for now or assuming the list includes everything or this screen is MVP for sending.
// Correction: `API_ENDPOINTS.ticketChat` is for sending. 
// There is no explicit "get ticket messages" endpoint in the provided list. 
// The original app might have passed chat history via navigation or fetched it.
// I will implement the send interface and a basic placeholder for messages.

export default function TicketChatScreen() {
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const toast = useToast();
    const scrollViewRef = useRef<ScrollView>(null);

    const [message, setMessage] = useState('');
    // Mock messages for UI demonstration as I don't have a clear "get messages" endpoint in my list yet
    // In real implementation, we might need to find that endpoint or use what's available.
    const [messages, setMessages] = useState<any[]>([
        { id: '1', text: 'Hello, how can I help you?', sender: 'Support', isOwn: false, time: '10:00 AM' },
        { id: '2', text: 'I am facing issues with attendance.', sender: 'Me', isOwn: true, time: '10:05 AM' },
    ]);

    const { mutate: sendMessage, isPending } = useSendTicketMessage();

    const handleSend = () => {
        if (!message.trim()) return;

        sendMessage({
            ticket_id: id as string,
            message: message.trim(),
        }, {
            onSuccess: (data) => {
                if (data.status === 1) {
                    // Add message to local list for immediate feedback
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        text: message.trim(),
                        sender: 'Me',
                        isOwn: true,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    setMessage('');
                    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                } else {
                    toast.show('error', 'Failed', data.message || 'Could not send message');
                }
            },
            onError: () => {
                toast.show('error', 'Error', 'Network error');
            }
        });
    };

    return (
        <CorporateBackground>
            <TopBar
                title={`Ticket #${id}`}
                showBack
                onSearchPress={() => { }}
                onNotificationPress={() => { }}
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                >
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.isOwn
                                    ? [styles.ownMessage, { backgroundColor: theme.colors.primary }]
                                    : [styles.otherMessage, { backgroundColor: theme.colors.surfaceVariant, borderWidth: 1, borderColor: theme.colors.border }]
                            ]}
                        >
                            <Text style={[
                                styles.messageText,
                                { color: msg.isOwn ? '#ffffff' : theme.colors.text }
                            ]}>
                                {msg.text}
                            </Text>
                            <Text style={[
                                styles.messageTime,
                                { color: msg.isOwn ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary }
                            ]}>
                                {msg.time}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={[styles.inputContainer, { backgroundColor: theme.colors.cardPrimary, borderTopColor: theme.colors.border }]}>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                            color: theme.colors.text
                        }]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.textTertiary}
                        multiline
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: theme.colors.primary },
                            (!message.trim() || isPending) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={!message.trim() || isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Send width={20} height={20} color="#ffffff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    ownMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        marginBottom: 4,
    },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
