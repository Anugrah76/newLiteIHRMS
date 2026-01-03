import React, { useState, useEffect } from 'react';
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
    Modal,
} from 'react-native';
import {
    Calendar,
    Clock,
    FileText,
    MessageSquare,
    Send,
    ChevronDown,
    X,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useLeaveTypes, useApplyLeave, LeaveType } from '@features/leave/api/leaveApi';

export default function ApplyLeaveScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const toast = useToast();

    // Form State
    const [fromDate, setFromDate] = useState<Date>(
        params.fromDate ? new Date(params.fromDate as string) : new Date()
    );
    const [toDate, setToDate] = useState<Date>(
        params.fromDate ? new Date(params.fromDate as string) : new Date()
    );

    // Default times (9 AM - 6 PM)
    const defaultStart = new Date(); defaultStart.setHours(9, 0, 0);
    const defaultEnd = new Date(); defaultEnd.setHours(18, 0, 0);

    const [fromTime, setFromTime] = useState<Date>(defaultStart);
    const [toTime, setToTime] = useState<Date>(defaultEnd);
    const [comments, setComments] = useState('');
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);

    // Pickers State
    const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
    const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
    const [isFromTimePickerVisible, setFromTimePickerVisibility] = useState(false);
    const [isToTimePickerVisible, setToTimePickerVisibility] = useState(false);
    const [isLeaveTypeModalVisible, setLeaveTypeModalVisibility] = useState(false);

    // API
    const { data: leaveTypesResponse, isLoading: isLoadingTypes } = useLeaveTypes();
    const { mutate: submitLeave, isPending: isSubmitting } = useApplyLeave();

    const leaveTypes = leaveTypesResponse?.data || [];

    // Validations & Submit
    const handleSubmit = () => {
        if (!selectedLeaveType) {
            toast.show('error', 'Validation Error', 'Please select a leave type.');
            return;
        }
        if (!comments.trim()) {
            toast.show('error', 'Validation Error', 'Please enter comments.');
            return;
        }
        if (toDate < fromDate) {
            toast.show('error', 'Validation Error', 'To Date cannot be before From Date.');
            return;
        }

        const formatTime = (d: Date) => d.toTimeString().split(' ')[0]; // HH:MM:SS
        const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${day}-${month}-${year}`; // API expects DD-MM-YYYY
        };

        const payload = {
            leave_type: selectedLeaveType.leave_type_id,
            from_date: formatDate(fromDate),
            to_date: formatDate(toDate),
            from_time: formatTime(fromTime),
            to_time: formatTime(toTime),
            comments: comments.trim(),
        };

        submitLeave(payload, {
            onSuccess: (res) => {
                if (res.status === 1) {
                    toast.show('success', 'Success', 'Leave application submitted successfully.');
                    setTimeout(() => router.back(), 1500);
                } else {
                    toast.show('error', 'Submission Failed', res.message || 'Unknown error');
                }
            },
            onError: (err: any) => {
                toast.show('error', 'Error', err.message || 'Failed to submit leave.');
            }
        });
    };

    // Formatters
    const displayDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' });
    const displayTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Render Helpers
    const renderField = (label: string, value: string, onPress: () => void, Icon: any, placeholder: string) => (
        <TouchableOpacity style={styles.fieldContainer} onPress={onPress} activeOpacity={0.7}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label} <Text style={{ color: theme.colors.error }}>*</Text></Text>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Icon size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
                <Text style={[styles.inputText, { color: value ? theme.colors.text : theme.colors.textSecondary }]}>
                    {value || placeholder}
                </Text>
                <ChevronDown size={20} color={theme.colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <CorporateBackground>
            <TopBar title="Apply for Leave" showBack />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Leave Details</Text>

                        {/* Dates */}
                        {renderField('From Date', displayDate(fromDate), () => setFromDatePickerVisibility(true), Calendar, 'Select date')}
                        {renderField('To Date', displayDate(toDate), () => setToDatePickerVisibility(true), Calendar, 'Select date')}

                        {/* Times */}
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                {renderField('From Time', displayTime(fromTime), () => setFromTimePickerVisibility(true), Clock, 'Select time')}
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                {renderField('To Time', displayTime(toTime), () => setToTimePickerVisibility(true), Clock, 'Select time')}
                            </View>
                        </View>

                        {/* Leave Type */}
                        {renderField(
                            'Leave Type',
                            selectedLeaveType?.leave_type_name || selectedLeaveType?.name || '',
                            () => setLeaveTypeModalVisibility(true),
                            FileText,
                            'Select leave type'
                        )}

                        {/* Comments */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Comments <Text style={{ color: theme.colors.error }}>*</Text></Text>
                            <View style={[styles.textAreaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                <MessageSquare size={20} color={theme.colors.primary} style={{ marginRight: 10, marginTop: 4 }} />
                                <TextInput
                                    style={[styles.textArea, { color: theme.colors.text }]}
                                    value={comments}
                                    onChangeText={setComments}
                                    placeholder="Enter reason..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.colors.primary },
                                isSubmitting && { opacity: 0.7 }
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Send size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.submitText}>Submit Leave Request</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Pickers */}
            <DateTimePickerModal
                isVisible={isFromDatePickerVisible}
                mode="date"
                date={fromDate}
                onConfirm={(date) => { setFromDatePickerVisibility(false); setFromDate(date); }}
                onCancel={() => setFromDatePickerVisibility(false)}
            />
            <DateTimePickerModal
                isVisible={isToDatePickerVisible}
                mode="date"
                date={toDate}
                minimumDate={fromDate}
                onConfirm={(date) => { setToDatePickerVisibility(false); setToDate(date); }}
                onCancel={() => setToDatePickerVisibility(false)}
            />
            <DateTimePickerModal
                isVisible={isFromTimePickerVisible}
                mode="time"
                date={fromTime}
                onConfirm={(date) => { setFromTimePickerVisibility(false); setFromTime(date); }}
                onCancel={() => setFromTimePickerVisibility(false)}
            />
            <DateTimePickerModal
                isVisible={isToTimePickerVisible}
                mode="time"
                date={toTime}
                onConfirm={(date) => { setToTimePickerVisibility(false); setToTime(date); }}
                onCancel={() => setToTimePickerVisibility(false)}
            />

            {/* Leave Type Modal */}
            <Modal
                transparent
                visible={isLeaveTypeModalVisible}
                animationType="slide"
                onRequestClose={() => setLeaveTypeModalVisibility(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Leave Type</Text>
                            <TouchableOpacity onPress={() => setLeaveTypeModalVisibility(false)} style={{ padding: 4 }}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 16 }}>
                            {isLoadingTypes ? (
                                <ActivityIndicator color={theme.colors.primary} />
                            ) : (
                                leaveTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.leave_type_id}
                                        style={[
                                            styles.typeItem,
                                            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                            selectedLeaveType?.leave_type_id === type.leave_type_id && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }
                                        ]}
                                        onPress={() => { setSelectedLeaveType(type); setLeaveTypeModalVisibility(false); }}
                                    >
                                        <View style={styles.leaveTypeContent}>
                                            <Text style={[
                                                styles.leaveTypeName,
                                                { color: theme.colors.text },
                                                selectedLeaveType?.leave_type_id === type.leave_type_id && styles.selectedLeaveTypeName
                                            ]}>
                                                {type.leave_type_name || type.name}
                                            </Text>
                                            {type.description && (
                                                <Text style={[styles.leaveTypeDescription, { color: theme.colors.textSecondary }]}>{type.description}</Text>
                                            )}
                                        </View>
                                        {selectedLeaveType?.leave_type_id === type.leave_type_id && <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>✓</Text>}
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: { padding: 16 },
    card: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        elevation: 4,
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
    fieldContainer: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    inputText: { fontSize: 16 },
    row: { flexDirection: 'row' },
    textAreaBox: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        minHeight: 120,
    },
    textArea: { flex: 1, fontSize: 16, marginTop: -4 },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        elevation: 4,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 20, maxHeight: '80%', padding: 0 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    typeItem: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
    typeName: { fontSize: 16, fontWeight: '600' },
    leaveTypeContent: {
        flex: 1,
        marginRight: 12,
    },
    leaveTypeName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedLeaveTypeName: {
        color: '#6366F1',
    },
    leaveTypeDescription: {
        fontSize: 14,
    },
    selectedIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCheckmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
