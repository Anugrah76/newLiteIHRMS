import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, IndianRupee, Eye, Car, Users, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { BtaEvent } from '../api/btaApi';

interface EventCardProps {
    event: BtaEvent;
    onView: (event: BtaEvent) => void;
    onTravel: (event: BtaEvent) => void;
    onHotel: (event: BtaEvent) => void;
    onSubmit: (event: BtaEvent) => void;
    onCancel: (event: BtaEvent) => void;
}

const statusConfig: Record<string, { text: string; color: string; bg: string; border: string; icon: any }> = {
    '1': { text: "Draft", color: "#F59E0B", bg: "#FEF3C7", border: "#FBBF24", icon: Clock },
    '2': { text: "Submitted", color: "#3B82F6", bg: "#DBEAFE", border: "#60A5FA", icon: CheckCircle },
    '3': { text: "Approved", color: "#10B981", bg: "#D1FAE5", border: "#34D399", icon: CheckCircle },
    '4': { text: "Rejected", color: "#EF4444", bg: "#FEE2E2", border: "#F87171", icon: XCircle },
    '5': { text: "Cancelled", color: "#6B7280", bg: "#F3F4F6", border: "#9CA3AF", icon: XCircle }
};

const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || { text: "Unknown", color: "#6B7280", bg: "#F3F4F6", border: "#9CA3AF", icon: Clock };
    const Icon = config.icon;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
            <Icon size={14} color={config.color} style={{ marginRight: 6 }} />
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

export const EventCard = memo(({ event, onView, onTravel, onHotel, onSubmit, onCancel }: EventCardProps) => {
    return (
        <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
                <View style={styles.eventHeaderLeft}>
                    <View style={styles.serialNoContainer}>
                        <Text style={styles.eventSerialNo}>#{event.serial_no}</Text>
                    </View>
                </View>
                <StatusBadge status={event.status} />
            </View>

            <View style={styles.eventBody}>
                <View style={styles.eventRow}>
                    <View style={styles.eventIconContainer}>
                        <MapPin size={18} color="#6366F1" />
                    </View>
                    <View style={styles.eventTextContainer}>
                        <Text style={styles.eventLabel}>From</Text>
                        <Text style={styles.eventValue} numberOfLines={1}>{event.from_address}</Text>
                    </View>
                </View>

                <View style={styles.eventRow}>
                    <View style={styles.eventIconContainer}>
                        <MapPin size={18} color="#6366F1" />
                    </View>
                    <View style={styles.eventTextContainer}>
                        <Text style={styles.eventLabel}>To</Text>
                        <Text style={styles.eventValue} numberOfLines={1}>{event.to_address}</Text>
                    </View>
                </View>

                <View style={styles.eventRow}>
                    <View style={styles.eventIconContainer}>
                        <Calendar size={18} color="#6366F1" />
                    </View>
                    <View style={styles.eventTextContainer}>
                        <Text style={styles.eventLabel}>Travel Period</Text>
                        <Text style={styles.eventValue}>{event.start_date} to {event.end_date}</Text>
                    </View>
                </View>

                <View style={styles.eventRow}>
                    <View style={styles.eventIconContainer}>
                        <IndianRupee size={18} color="#6366F1" />
                    </View>
                    <View style={styles.eventTextContainer}>
                        <Text style={styles.eventLabel}>Budget</Text>
                        <Text style={styles.eventValue}>₹{event.budget}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.eventActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onView(event)}
                    activeOpacity={0.7}
                >
                    <Eye size={16} color="#6366F1" />
                    <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onTravel(event)}
                    activeOpacity={0.7}
                >
                    <Car size={16} color="#6366F1" />
                    <Text style={styles.actionBtnText}>Travel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onHotel(event)}
                    activeOpacity={0.7}
                >
                    <Users size={16} color="#6366F1" />
                    <Text style={styles.actionBtnText}>Hotel</Text>
                </TouchableOpacity>

                {event.status === '1' && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.submitBtn]}
                        onPress={() => onSubmit(event)}
                        activeOpacity={0.7}
                    >
                        <CheckCircle size={16} color="#FFFFFF" />
                        <Text style={styles.submitBtnText}>Submit</Text>
                    </TouchableOpacity>
                )}

                {event.status !== '5' && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={() => onCancel(event)}
                        activeOpacity={0.7}
                    >
                        <XCircle size={16} color="#EF4444" />
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

EventCard.displayName = 'EventCard';

const styles = StyleSheet.create({
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    eventHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serialNoContainer: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    eventSerialNo: {
        color: '#6366F1',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    eventBody: {
        marginBottom: 16,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventIconContainer: {
        width: 28,
        alignItems: 'center',
        marginRight: 8,
    },
    eventTextContainer: {
        flex: 1,
    },
    eventLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    eventValue: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
    },
    eventActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    actionBtnText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#4B5563',
        marginLeft: 4,
    },
    submitBtn: {
        backgroundColor: '#10B981',
    },
    submitBtnText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    cancelBtn: {
        backgroundColor: '#FEF2F2',
    },
    cancelBtnText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#EF4444',
        marginLeft: 4,
    },
});
