import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Clock, Paperclip } from 'lucide-react-native';
import { TicketReply } from '../types';

interface ChatMessageProps {
    reply: TicketReply;
    isCurrentUser: boolean;
    onAttachmentPress?: (filename: string) => void;
}

export const ChatMessage = ({ reply, isCurrentUser, onAttachmentPress }: ChatMessageProps) => {
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
        if (!attachmentString || attachmentString.trim() === '') return null;

        const attachments = attachmentString.split(',').filter(att => att.trim() !== '');

        return (
            <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentLabel}>Attachments:</Text>
                {attachments.map((attachment, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.attachmentItem}
                        onPress={() => onAttachmentPress?.(attachment.trim())}
                    >
                        <Paperclip size={16} color="#6B7280" />
                        <Text style={styles.attachmentText} numberOfLines={1}>
                            {attachment.trim()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={[
            styles.messageCard,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
            <View style={styles.messageHeader}>
                <View style={styles.messageAuthor}>
                    <User size={16} color="#6B7280" />
                    <Text style={styles.authorName}>{reply.create_by}</Text>
                    <Text style={styles.empCode}>({reply.empcode})</Text>
                </View>
                <View style={styles.messageTime}>
                    <Clock size={14} color="#9CA3AF" />
                    <Text style={styles.timeText}>{formatDate(reply.create_datetime)}</Text>
                </View>
            </View>

            <Text style={styles.messageText}>{reply.ticket_answer}</Text>
            {renderAttachments(reply.attachment)}
        </View>
    );
};

const styles = StyleSheet.create({
    messageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    currentUserMessage: {
        borderLeftWidth: 4,
        borderLeftColor: '#6777ef',
        marginLeft: 20,
    },
    otherUserMessage: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
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
        color: '#1F2937',
        marginLeft: 6,
    },
    empCode: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    messageTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 8,
    },
    attachmentsContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    attachmentLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    attachmentText: {
        fontSize: 13,
        color: '#374151',
        marginLeft: 8,
        flex: 1,
    },
});
