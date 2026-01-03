import { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Modal, FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore } from '@shared/store';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { Calendar, IndianRupee, MapPin, CheckCircle, Upload, ChevronDown, X, File } from 'lucide-react-native';
import { useTravelModes, useTravelTypes, useCreateBTAEvent, useSubmitBTAEvent } from '@features/staff/api/staffApi';

export default function BTAApplicationScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const params = useLocalSearchParams();
    const user = useAuthStore(state => state.user);

    const selectedDate = params.selectedDate as string;
    const isPendingDate = params.isPending === 'true';

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [eventId, setEventId] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [isFinalSubmit, setIsFinalSubmit] = useState(false);

    const [formData, setFormData] = useState({
        fromAddress: '',
        toAddress: '',
        budget: '',
        description: '',
        fromDate: '',
        toDate: '',
        travelMode: '',
        travelType: '',
        managerCode: '',
        uploadedFiles: [] as any[]
    });

    const [isManagerChange, setIsManagerChange] = useState(false);
    const [showTravelModeModal, setShowTravelModeModal] = useState(false);
    const [showTravelTypeModal, setShowTravelTypeModal] = useState(false);

    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    // Queries
    const { data: travelModesData, isLoading: modesLoading } = useTravelModes();
    const { data: travelTypesData, isLoading: typesLoading } = useTravelTypes();

    const travelModes = travelModesData?.data?.travel_modes || [];
    const travelTypes = travelTypesData?.data?.travel_types || [];

    // Mutations
    const createEventMutation = useCreateBTAEvent();
    const submitEventMutation = useSubmitBTAEvent();

    // Combined loading state
    const isLoading = modesLoading || typesLoading || createEventMutation.isPending || submitEventMutation.isPending;

    useEffect(() => {
        if (selectedDate) {
            const [year, month, day] = selectedDate.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            setFromDate(dateObj);
            const formatted = `${day}-${month}-${year}`;
            handleInputChange('fromDate', formatted);
        }
    }, [selectedDate]);

    const handleInputChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleDateChange = (event: any, selectedDate: Date | undefined, dateType: string) => {
        if (Platform.OS === 'android') {
            setShowFromDatePicker(false);
            setShowToDatePicker(false);
        }

        if (selectedDate) {
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            if (dateType === 'from') {
                if (!params.selectedDate) {
                    setFromDate(selectedDate);
                    handleInputChange('fromDate', formattedDate);
                }
            } else {
                setToDate(selectedDate);
                handleInputChange('toDate', formattedDate);
            }
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.map(asset => ({
                    id: Date.now() + Math.random(),
                    name: asset.name,
                    size: asset.size,
                    type: asset.mimeType,
                    uri: asset.uri,
                }));

                setFormData(prev => ({
                    ...prev,
                    uploadedFiles: [...prev.uploadedFiles, ...newFiles]
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const removeFile = (fileId: number) => {
        setFormData(prev => ({
            ...prev,
            uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
        }));
    };

    const validateForm = () => {
        if (!formData.fromAddress || !formData.toAddress) {
            Alert.alert('Error', 'From and To Address are mandatory');
            return false;
        }
        if (!formData.fromDate || !formData.toDate) {
            Alert.alert('Error', 'From and To Date should not be blank');
            return false;
        }
        if (!formData.travelMode) {
            Alert.alert('Error', 'Please select travel mode');
            return false;
        }
        if (!formData.travelType) {
            Alert.alert('Error', 'Please select travel type');
            return false;
        }
        return true;
    };

    const handleCreateEvent = async () => {
        if (!validateForm()) return;

        const formDataToSend = new FormData();

        // Note: 'key' and 'indo_code' are auto-injected by apiClient interceptor
        formDataToSend.append("from_address", formData.fromAddress);
        formDataToSend.append("to_address", formData.toAddress);
        formDataToSend.append("start_date", formData.fromDate);
        formDataToSend.append("end_date", formData.toDate);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("budget", formData.budget);
        formDataToSend.append("travel_mode_id", formData.travelMode);
        formDataToSend.append("travel_type_id", formData.travelType);
        formDataToSend.append("user_id", user?.indo_code || '');
        formDataToSend.append("manager_id", user?.manager_id || "EC-100");
        formDataToSend.append("is_manager_change", isManagerChange ? "YES" : "NO");
        formDataToSend.append("manager_code", user?.manager_indo_code || '');

        formData.uploadedFiles.forEach((file) => {
            formDataToSend.append("userfiles", {
                uri: file.uri,
                type: file.type,
                name: file.name,
            } as any);
        });

        try {
            const result = await createEventMutation.mutateAsync(formDataToSend);

            if (result.response === "Success" && result.message === "Success") {
                const eventData = result.data;
                setEventId(eventData.id);
                setSerialNo(eventData.serial_no);
                setIsFinalSubmit(true);

                Alert.alert('Success', 'Event created successfully! You can now final submit.');
            } else {
                Alert.alert('Error', result.message || 'Failed to create event');
            }
        } catch (error: any) {
            console.error('❌ [Create Event] Error:', error);
            Alert.alert('Error', 'Something went wrong, please try again');
        }
    };

    const handleFinalSubmit = () => {
        Alert.alert(
            "Confirm Submit",
            "Do you want to submit this event?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: submitEvent }
            ]
        );
    };

    const submitEvent = async () => {
        const submitData = {
            event_ids: [{
                event_id: eventId,
                serial_number: serialNo,
                indo_code: user?.indo_code,
            }],
            // key: user?.api_key, // Auto-injected? No, JSON payload is typically NOT intercepted for adding keys if it's not FormData?
            // Wait, the client interceptor checks `if (config.data instanceof FormData)`.
            // So for JSON, we MUST manually add credentials if the backend expects them in the JSON body.
            // But wait, user?.api_key logic in manual refactor showed it usage.
            // Let's check `apiClient` again. Yes, interceptor only handles FormData.
            // So for JSON we must include the credentials manually.
            key: user?.api_key,
            submit_by: user?.indo_code,
            remark: "submit",
            status_id: "2",
        };

        try {
            const result = await submitEventMutation.mutateAsync(submitData);

            if (result.response === "Success" && result.message.includes("Records updated")) {
                Alert.alert("Success", "Event submitted successfully!");
                router.push('/my-bta-events');
            } else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } catch (error: any) {
            console.error('❌ [Submit Event] Error:', error);
            Alert.alert("Error", "Something went wrong, please try again");
        }
    };

    const handleSubmit = () => {
        if (isFinalSubmit) {
            handleFinalSubmit();
        } else {
            handleCreateEvent();
        }
    };

    const getButtonText = () => {
        if (isFinalSubmit) return "Final Submit";
        if (isPendingDate) return "Submit";
        return "Add Event";
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const selectedTravelMode = travelModes.find((m: any) => m.id === formData.travelMode);
    const selectedTravelType = travelTypes.find((t: any) => t.id === formData.travelType);

    return (
        <CorporateBackground>
            <TopBar title="BTA Application" onMenuPress={() => setSidebarVisible(true)} showBack />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <View style={[styles.formHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.formTitle, { color: theme.colors.text }]}>Event Details</Text>
                            <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>Fill in the information below</Text>
                        </View>

                        <View style={styles.formContent}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>From Address *</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.border }]}>
                                        <MapPin size={18} color={theme.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Enter departure location"
                                        placeholderTextColor={theme.colors.textTertiary}
                                        value={formData.fromAddress}
                                        onChangeText={(value) => handleInputChange('fromAddress', value)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>To Address *</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.border }]}>
                                        <MapPin size={18} color={theme.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Enter destination"
                                        placeholderTextColor={theme.colors.textTertiary}
                                        value={formData.toAddress}
                                        onChangeText={(value) => handleInputChange('toAddress', value)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Travel Mode *</Text>
                                <TouchableOpacity onPress={() => setShowTravelModeModal(true)}>
                                    <View style={[styles.selectButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                        <Text style={[styles.selectText, { color: formData.travelMode ? theme.colors.text : theme.colors.textTertiary }]}>
                                            {selectedTravelMode?.name || 'Select mode'}
                                        </Text>
                                        <ChevronDown size={20} color={theme.colors.textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Travel Type *</Text>
                                <TouchableOpacity onPress={() => setShowTravelTypeModal(true)}>
                                    <View style={[styles.selectButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                        <Text style={[styles.selectText, { color: formData.travelType ? theme.colors.text : theme.colors.textTertiary }]}>
                                            {selectedTravelType?.name || 'Select type'}
                                        </Text>
                                        <ChevronDown size={20} color={theme.colors.textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>From Date *</Text>
                                <TouchableOpacity onPress={() => !selectedDate && setShowFromDatePicker(true)}>
                                    <View style={styles.inputWrapper}>
                                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.border }]}>
                                            <Calendar size={18} color={theme.colors.primary} />
                                        </View>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                            placeholder="Select date"
                                            placeholderTextColor={theme.colors.textTertiary}
                                            value={formData.fromDate}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>To Date *</Text>
                                <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                                    <View style={styles.inputWrapper}>
                                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.border }]}>
                                            <Calendar size={18} color={theme.colors.primary} />
                                        </View>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                            placeholder="Select date"
                                            placeholderTextColor={theme.colors.textTertiary}
                                            value={formData.toDate}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Budget</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.border }]}>
                                        <IndianRupee size={18} color={theme.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Enter estimated budget"
                                        placeholderTextColor={theme.colors.textTertiary}
                                        value={formData.budget}
                                        onChangeText={(value) => handleInputChange('budget', value)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.multilineInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                    placeholder="Enter event description"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={formData.description}
                                    onChangeText={(value) => handleInputChange('description', value)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.checkboxContainer, { borderColor: theme.colors.border }]}
                                onPress={() => setIsManagerChange(!isManagerChange)}
                            >
                                <View style={[styles.checkbox, isManagerChange && { backgroundColor: theme.colors.primary }]}>
                                    {isManagerChange && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>Change Manager</Text>
                            </TouchableOpacity>

                            {isManagerChange && (
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, { color: theme.colors.text }]}>Manager Code</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Enter manager code"
                                        placeholderTextColor={theme.colors.textTertiary}
                                        value={formData.managerCode}
                                        onChangeText={(value) => handleInputChange('managerCode', value)}
                                    />
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Upload Files</Text>
                                <TouchableOpacity
                                    style={[styles.uploadButton, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}
                                    onPress={pickDocument}
                                >
                                    <Upload size={20} color={theme.colors.primary} />
                                    <Text style={[styles.uploadButtonText, { color: theme.colors.primary }]}>Choose Documents</Text>
                                </TouchableOpacity>

                                {formData.uploadedFiles.length > 0 && (
                                    <View style={styles.filesList}>
                                        {formData.uploadedFiles.map((file) => (
                                            <View key={file.id} style={[styles.fileItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                                <View style={styles.fileInfo}>
                                                    <File size={18} color={theme.colors.primary} />
                                                    <View style={styles.fileDetails}>
                                                        <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>{file.name}</Text>
                                                        <Text style={[styles.fileSize, { color: theme.colors.textSecondary }]}>{formatFileSize(file.size)}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity onPress={() => removeFile(file.id)}>
                                                    <X size={16} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: isLoading ? theme.colors.textTertiary : theme.colors.primary }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <CheckCircle size={20} color="#FFFFFF" />
                                <Text style={styles.submitButtonText}>{getButtonText()}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {showFromDatePicker && (
                <DateTimePicker
                    value={fromDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleDateChange(event, date, 'from')}
                />
            )}

            {showToDatePicker && (
                <DateTimePicker
                    value={toDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleDateChange(event, date, 'to')}
                />
            )}

            <Modal visible={showTravelModeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Travel Mode</Text>
                            <TouchableOpacity onPress={() => setShowTravelModeModal(false)}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={travelModes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => {
                                        handleInputChange('travelMode', item.id);
                                        setShowTravelModeModal(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showTravelTypeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Travel Type</Text>
                            <TouchableOpacity onPress={() => setShowTravelTypeModal(false)}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={travelTypes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => {
                                        handleInputChange('travelType', item.id);
                                        setShowTravelTypeModal(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    formCard: { borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 12, marginBottom: 24, borderWidth: 1 },
    formHeader: { padding: 24, borderBottomWidth: 1 },
    formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    formSubtitle: { fontSize: 15, fontWeight: '500' },
    formContent: { padding: 24 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 15, marginBottom: 8, fontWeight: '600' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center' },
    input: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, flex: 1, minHeight: 56, fontWeight: '500', marginLeft: 12 },
    multilineInput: { minHeight: 100, textAlignVertical: 'top', marginLeft: 0 },
    iconBox: { borderWidth: 2, borderRadius: 12, width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
    selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, minHeight: 56 },
    selectText: { fontSize: 16, fontWeight: '500' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 20 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    checkboxLabel: { fontSize: 16, fontWeight: '600' },
    uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 2, gap: 8 },
    uploadButtonText: { fontSize: 16, fontWeight: '600' },
    filesList: { marginTop: 12, gap: 8 },
    fileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1 },
    fileInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    fileDetails: { flex: 1 },
    fileName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    fileSize: { fontSize: 12 },
    submitButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginTop: 8 },
    submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalOption: { padding: 16, borderBottomWidth: 1 },
    modalOptionText: { fontSize: 16, fontWeight: '500' },
});
