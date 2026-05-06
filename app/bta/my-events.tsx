import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
    Dimensions, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, FileText, X, Upload, File, Calendar as CalIcon, IndianRupee, MapPin, Car, Bike, Train, Plane, Briefcase, Heart, Users } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';

import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { InputField } from '@shared/components/InputField';
import { SelectField as SharedSelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useSidebarStore } from '@shared/store/sidebarStore';
import {
    useMyEvents, useSubmitEvent, useCancelEvent, useUpdateEvent,
    useTravelModes, useTravelTypes
} from '@features/bta/hooks';
import { EventCard } from '@features/bta/components/EventCard';
import { useToast } from '@shared/components/Toast';
import { BtaEvent } from '@features/bta/api/btaApi';
import { CorporateBackground } from '@shared/components/CorporateBackground';

const { width } = Dimensions.get('window');

// Icon mapping functions
const getTravelModeIcon = (modeName: string) => {
    const modeMap: Record<string, any> = {
        '4W': Car,
        '2W': Bike,
        'Train': Train,
        'Flight': Plane
    };
    return modeMap[modeName] || Plus;
};

const getTravelTypeIcon = (typeName: string) => {
    const typeMap: Record<string, any> = {
        'Business': Briefcase,
        'Personal': Heart,
        'Official': Users,
        'Tourist': MapPin
    };
    return typeMap[typeName] || Briefcase;
};

const MyEventsScreen = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const { setSidebarVisible } = useSidebarStore();
    const toast = useToast();

    // Filters
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterStatus, setFilterStatus] = useState('2'); // Default to Submitted

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const statuses = [
        { label: 'All', value: '' },
        { label: 'Draft', value: '1' },
        { label: 'Submitted', value: '2' },
        { label: 'Approved', value: '3' },
        { label: 'Rejected', value: '4' },
        { label: 'Cancelled', value: '5' },
    ];

    // Dates for API
    const monthStr = String(filterMonth + 1).padStart(2, '0');
    const lastDay = new Date(filterYear, filterMonth + 1, 0).getDate();
    const fromDate = `${filterYear}-${monthStr}-01`;
    const toDate = `${filterYear}-${monthStr}-${lastDay}`;

    // Data Fetching
    const { data: eventsData, isLoading, refetch } = useMyEvents({
        creator_id: user?.emp_code || '',
        status: filterStatus,
        from_date: fromDate,
        to_date: toDate,
        indo_code: user?.emp_code || '',
    }, !!user);

    const submitEventMutation = useSubmitEvent();
    const cancelEventMutation = useCancelEvent();
    const updateEventMutation = useUpdateEvent();

    // Travel Modes & Types
    const { data: travelModesData } = useTravelModes();
    const { data: travelTypesData } = useTravelTypes();

    // Modal State
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<BtaEvent | null>(null);
    const [editFormData, setEditFormData] = useState({
        fromAddress: '',
        toAddress: '',
        budget: '',
        description: '',
        fromDate: '',
        toDate: '',
        travelMode: '',
        travelType: '',
        uploadedFiles: [] as any[]
    });

    // Date Picker State
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [fromDateObj, setFromDateObj] = useState(new Date());
    const [toDateObj, setToDateObj] = useState(new Date());

    // Process travel modes/types into select options
    // Access nested data property from ApiResponse
    const modesList = travelModesData?.data?.travel_modes || [];
    const travelModeOptions = modesList.length > 0
        ? [
            { label: 'None Selected', value: '' },
            ...modesList.map(mode => ({
                label: mode.name,
                value: mode.id,
                icon: getTravelModeIcon(mode.name)
            }))
        ]
        : [{ label: 'None Selected', value: '' }];

    const typesList = travelTypesData?.data?.travel_types || [];
    const travelTypeOptions = typesList.length > 0
        ? [
            { label: 'None Selected', value: '' },
            ...typesList.map(type => ({
                label: type.name,
                value: type.id,
                icon: getTravelTypeIcon(type.name)
            }))
        ]
        : [{ label: 'None Selected', value: '' }];

    // Handlers
    const handleView = useCallback((event: BtaEvent) => {
        setSelectedEvent(event);
        setEditFormData({
            fromAddress: event.from_address,
            toAddress: event.to_address,
            budget: event.budget,
            description: event.description,
            fromDate: event.start_date,
            toDate: event.end_date,
            travelMode: event.travel_mode_id,
            travelType: event.travel_type_id,
            uploadedFiles: []
        });

        // Parse dates
        const [year, month, day] = event.start_date.split('-');
        setFromDateObj(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));

        const [toYear, toMonth, toDay] = event.end_date.split('-');
        setToDateObj(new Date(parseInt(toYear), parseInt(toMonth) - 1, parseInt(toDay)));

        setViewModalVisible(true);
    }, []);

    const handleUpdateEvent = useCallback(async () => {
        if (!selectedEvent) return;

        updateEventMutation.mutate({
            key: user?.api_key || '',
            start_date: editFormData.fromDate,
            end_date: editFormData.toDate,
            description: editFormData.description,
            budget: editFormData.budget,
            travel_mode_id: editFormData.travelMode,
            travel_type_id: editFormData.travelType,
            from_address: editFormData.fromAddress,
            to_address: editFormData.toAddress,
            user_id: user?.emp_code || '',
            is_manager_change: "NO",
            manager_id: user?.manager_id || '',
            manager_code: "",
            id: selectedEvent.id,
            indo_code: user?.emp_code || '',
            uploadedFiles: editFormData.uploadedFiles
        }, {
            onSuccess: (data) => {
                if (data.response === 'Success') {
                    toast.show('success', 'Updated', 'Event updated successfully');
                    setViewModalVisible(false);
                    refetch();
                } else {
                    toast.show('error', 'Failed', data.message || 'Failed to update');
                }
            },
            onError: () => {
                toast.show('error', 'Error', 'Something went wrong');
            }
        });
    }, [selectedEvent, editFormData, user, updateEventMutation, toast, refetch]);

    const handleTravel = (event: BtaEvent) => {
        router.push({
            pathname: '/bta/travel-booking',
            params: {
                eventId: event.id,
                fromAddress: event.from_address,
                toAddress: event.to_address,
                travelDate: event.start_date,
                description: event.description,
                eventStatus: event.status
            }
        });
    };

    const handleHotel = (event: BtaEvent) => {
        router.push({
            pathname: '/bta/hotel-booking',
            params: {
                eventId: event.id,
                hotelAddress: event.to_address,
                checkInDate: event.start_date,
                checkOutDate: event.end_date,
                description: event.description,
                eventStatus: event.status
            }
        });
    };

    const handleSubmit = (event: BtaEvent) => {
        Alert.alert(
            "Confirm Submit",
            "Do you want to submit this event?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: () => {
                        submitEventMutation.mutate({
                            event_ids: [{
                                event_id: event.id,
                                serial_number: event.serial_no,
                                indo_code: user?.emp_code || ''
                            }],
                            key: user?.api_key || '',
                            submit_by: user?.emp_code || '',
                            remark: "submit",
                            status_id: "2"
                        }, {
                            onSuccess: (data) => {
                                if (data.response === 'Success') {
                                    toast.show('success', 'Submitted', 'Event submitted successfully');
                                    refetch();
                                } else {
                                    toast.show('error', 'Error', data.message || 'Failed to submit');
                                }
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleCancel = (event: BtaEvent) => {
        Alert.prompt(
            "Cancel Event",
            "Enter cancellation remarks:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: (remarks: any) => {
                        cancelEventMutation.mutate({
                            event_id: event.id,
                            cancel_by: user?.emp_code || '',
                            cancel_remarks: remarks || '',
                            status: "5",
                            key: user?.api_key || '',
                            indo_code: user?.emp_code || ''
                        }, {
                            onSuccess: (data) => {
                                if (data.response === 'Success') {
                                    toast.show('success', 'Cancelled', 'Event cancelled successfully');
                                    refetch();
                                } else {
                                    toast.show('error', 'Error', data.message || 'Failed to cancel');
                                }
                            }
                        });
                    }
                }
            ],
            "plain-text"
        );
    };

    // File Upload
    const pickDocument = useCallback(async () => {
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
                    size: asset.size || 0,
                    type: asset.mimeType,
                    uri: asset.uri,
                }));

                setEditFormData(prev => ({
                    ...prev,
                    uploadedFiles: [...prev.uploadedFiles, ...newFiles]
                }));
            }
        } catch (error) {
            toast.show('error', 'Error', 'Failed to pick document');
        }
    }, [toast]);

    const removeFile = useCallback((fileId: number) => {
        setEditFormData(prev => ({
            ...prev,
            uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
        }));
    }, []);

    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const handleInputChange = useCallback((field: string, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleDateChange = useCallback((event: any, selectedDate: Date | undefined, dateType: string) => {
        if (Platform.OS === 'android') {
            setShowFromDatePicker(false);
            setShowToDatePicker(false);
        }

        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            if (dateType === 'from') {
                setFromDateObj(selectedDate);
                handleInputChange('fromDate', formattedDate);
            } else {
                setToDateObj(selectedDate);
                handleInputChange('toDate', formattedDate);
            }
        }
    }, [handleInputChange]);

    return (
        <CorporateBackground>
            <SafeAreaView style={styles.safeArea}>
                <TopBar
                    title="My Events (BTA)"
                    onMenuPress={() => setSidebarVisible(true)}
                    showBack
                />

                <View style={styles.container}>
                    {/* Filters */}
                    <View style={styles.filterSection}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                            {months.map((m, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.filterChip, filterMonth === i && styles.activeFilterChip]}
                                    onPress={() => setFilterMonth(i)}
                                >
                                    <Text style={[styles.filterChipText, filterMonth === i && styles.activeFilterChipText]}>
                                        {m}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.yearStatusRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {years.map((y) => (
                                    <TouchableOpacity
                                        key={y}
                                        style={[styles.smallChip, filterYear === y && styles.activeSmallChip]}
                                        onPress={() => setFilterYear(y)}
                                    >
                                        <Text style={[styles.smallChipText, filterYear === y && styles.activeSmallChipText]}>
                                            {y}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.yearStatusRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {statuses.map((s) => (
                                    <TouchableOpacity
                                        key={s.value}
                                        style={[styles.smallChip, filterStatus === s.value && styles.activeSmallChip]}
                                        onPress={() => setFilterStatus(s.value)}
                                    >
                                        <Text style={[styles.smallChipText, filterStatus === s.value && styles.activeSmallChipText]}>
                                            {s.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Refresh Button */}
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={() => refetch()}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <CalIcon size={18} color="#FFF" />
                                    <Text style={styles.refreshButtonText}>Refresh Events</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
                    >
                        {eventsData?.data && eventsData.data.length > 0 ? (
                            eventsData.data.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onView={handleView}
                                    onTravel={handleTravel}
                                    onHotel={handleHotel}
                                    onSubmit={handleSubmit}
                                    onCancel={handleCancel}
                                />
                            ))
                        ) : (
                            !isLoading && (
                                <View style={styles.emptyState}>
                                    <FileText size={48} color="#D1D5DB" />
                                    <Text style={styles.emptyStateText}>No events found</Text>
                                </View>
                            )
                        )}
                    </ScrollView>

                    {/* FAB */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => router.push('/bta/create-event')}
                    >
                        <Plus size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* View/Edit Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={viewModalVisible}
                    onRequestClose={() => setViewModalVisible(false)}
                >
                    <CorporateBackground>
                        <SafeAreaView style={styles.modalContainer}>
                            <TopBar
                                title="Event Details"
                                onMenuPress={() => setViewModalVisible(false)}
                                showBack
                            />

                            <KeyboardAvoidingView
                                style={styles.keyboardView}
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            >
                                <ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={styles.scrollContent}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.formCard}>
                                        <View style={styles.formHeader}>
                                            <Text style={styles.formTitle}>Event Information</Text>
                                            <Text style={styles.formSubtitle}>
                                                {selectedEvent?.status === '2' ? 'View only (submitted)' : 'Edit details below'}
                                            </Text>
                                        </View>

                                        <View style={styles.formContent}>
                                            <InputField
                                                label="From Address"
                                                placeholder="Enter departure location"
                                                value={editFormData.fromAddress}
                                                onChangeText={(value: string) => handleInputChange('fromAddress', value)}
                                                editable={selectedEvent?.status !== '2'}
                                            />

                                            <InputField
                                                label="To Address"
                                                placeholder="Enter destination"
                                                value={editFormData.toAddress}
                                                onChangeText={(value: string) => handleInputChange('toAddress', value)}
                                                editable={selectedEvent?.status !== '2'}
                                            />

                                            <SharedSelectField
                                                label="Travel Mode"
                                                value={editFormData.travelMode}
                                                onValueChange={(value: string) => handleInputChange('travelMode', value)}
                                                options={travelModeOptions}
                                            />

                                            <SharedSelectField
                                                label="Travel Type"
                                                value={editFormData.travelType}
                                                onValueChange={(value: string) => handleInputChange('travelType', value)}
                                                options={travelTypeOptions}
                                            />

                                            <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                                                <InputField
                                                    label="From Date"
                                                    placeholder="Select date"
                                                    value={editFormData.fromDate}
                                                    editable={false}
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                                                <InputField
                                                    label="To Date"
                                                    placeholder="Select date"
                                                    value={editFormData.toDate}
                                                    editable={false}
                                                />
                                            </TouchableOpacity>

                                            <InputField
                                                label="Budget"
                                                placeholder="Enter estimated budget"
                                                value={editFormData.budget}
                                                onChangeText={(value: string) => handleInputChange('budget', value)}
                                                keyboardType="numeric"
                                                editable={selectedEvent?.status !== '2'}
                                            />

                                            <InputField
                                                label="Description"
                                                placeholder="Enter event description"
                                                value={editFormData.description}
                                                onChangeText={(value: string) => handleInputChange('description', value)}
                                                multiline={true}
                                                editable={selectedEvent?.status !== '2'}
                                            />

                                            {/* File Upload Section */}
                                            {selectedEvent?.status !== '2' && (
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>Upload Files</Text>
                                                    <TouchableOpacity
                                                        style={styles.uploadButton}
                                                        onPress={pickDocument}
                                                    >
                                                        <Upload size={20} color="#6366F1" />
                                                        <Text style={styles.uploadButtonText}>Choose Documents</Text>
                                                    </TouchableOpacity>

                                                    {editFormData.uploadedFiles.length > 0 && (
                                                        <View style={styles.filesList}>
                                                            {editFormData.uploadedFiles.map((file) => (
                                                                <View key={file.id} style={styles.fileItem}>
                                                                    <View style={styles.fileInfo}>
                                                                        <View style={styles.fileIconContainer}>
                                                                            <File size={18} color="#6366F1" />
                                                                        </View>
                                                                        <View style={styles.fileDetails}>
                                                                            <Text style={styles.fileName} numberOfLines={1}>
                                                                                {file.name}
                                                                            </Text>
                                                                            <Text style={styles.fileSize}>
                                                                                {formatFileSize(file.size)}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <TouchableOpacity
                                                                        style={styles.removeButton}
                                                                        onPress={() => removeFile(file.id)}
                                                                    >
                                                                        <X size={16} color="#EF4444" />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Update Button */}
                                    {selectedEvent?.status !== '2' && (
                                        <TouchableOpacity
                                            style={[styles.updateButton, updateEventMutation.isPending && styles.updateButtonDisabled]}
                                            onPress={handleUpdateEvent}
                                            disabled={updateEventMutation.isPending}
                                        >
                                            {updateEventMutation.isPending ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.updateButtonText}>Update Event</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                            </KeyboardAvoidingView>

                            {/* Date Pickers */}
                            {showFromDatePicker && (
                                <DateTimePicker
                                    value={fromDateObj}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'from')}
                                />
                            )}

                            {showToDatePicker && (
                                <DateTimePicker
                                    value={toDateObj}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'to')}
                                />
                            )}
                        </SafeAreaView>
                    </CorporateBackground>
                </Modal>

                <Sidebar visible={false} onClose={() => { }} />
            </SafeAreaView>
        </CorporateBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    filterSection: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    monthScroll: {
        marginBottom: 12,
    },
    yearStatusRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
    },
    activeFilterChip: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#6366F1',
    },
    filterChipText: {
        fontSize: 13,
        color: '#6B7280',
    },
    activeFilterChipText: {
        color: '#6366F1',
        fontWeight: '600',
    },
    smallChip: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeSmallChip: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
    },
    smallChipText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeSmallChipText: {
        color: '#059669',
        fontWeight: '500',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    refreshButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9CA3AF',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalContainer: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    formHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    formContent: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
        borderWidth: 2,
        borderColor: '#6366F1',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    uploadButtonText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    filesList: {
        marginTop: 12,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    fileIconContainer: {
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 11,
        color: '#6B7280',
    },
    removeButton: {
        padding: 4,
    },
    updateButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    updateButtonDisabled: {
        opacity: 0.6,
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default MyEventsScreen;
