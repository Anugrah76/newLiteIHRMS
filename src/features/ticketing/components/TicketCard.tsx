import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Clock, Tag, ChevronRight } from 'lucide-react-native';
import { Ticket } from '../types';

interface TicketCardProps {
    ticket: Ticket;
    onPress: (ticketId: string) => void;
}

export const TicketCard = ({ ticket, onPress }: TicketCardProps) => {
    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#DC2626';
            case 'normal': return '#059669';
            case 'low': return '#D97706';
            default: return '#6B7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
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
            year: 'numeric'
        });
    };

    return (
        <TouchableOpacity
            style={[styles.ticketCard, { borderLeftColor: getPriorityColor(ticket.priority) }]}
            onPress={() => onPress(ticket.ticket_id)}
            activeOpacity={0.7}
        >
            <View style={styles.ticketHeader}>
                <View style={styles.ticketIdContainer}>
                    <Text style={styles.ticketId}>#{ticket.ticket_id}</Text>
                    <Text style={styles.ticketId}>Code: {ticket.indo_code}</Text>
                </View>
                <View style={styles.ticketHeaderRight}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                        <Text style={styles.statusText}>{ticket.status}</Text>
                    </View>
                    <ChevronRight size={20} color="#6B7280" style={styles.chevronIcon} />
                </View>
            </View>

            <Text style={styles.ticketSubject}>{ticket.subject}</Text>

            <View style={styles.detailRow}>
                <User size={16} color="#6B7280" />
                <Text style={styles.detailText}>Person: {ticket.department_person_name}</Text>
            </View>

            <View style={styles.detailRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailText}>Date: {formatDate(ticket.create_datetime)}</Text>
            </View>

            <View style={styles.detailRow}>
                <Tag size={16} color="#6B7280" />
                <Text style={styles.detailText}>Priority: {ticket.priority}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    ticketCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
        borderLeftWidth: 4,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    ticketHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ticketId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    chevronIcon: {
        marginLeft: 4,
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 12,
        lineHeight: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
});
