import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@shared/components/ui/TopBar';
import { MapPin, Calendar, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useAuthStore } from '@features/auth/store/authSlice';
import { useEventHotel, useSaveHotel } from '@features/bta/hooks';
import { CorporateToast } from '@shared/components/ui/CorporateToast';

const HotelBookingScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuthStore();

    // Params
    const eventId = params.eventId as string;
    const initialAddress = params.hotelAddress as string || '';
    const initialCheckIn = params.checkInDate as string || '';
    const initialCheckOut = params.checkOutDate as string || '';
    const initialDesc = params.description as string || '';
    const isSubmitted = params.eventStatus === '2';

    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hotelId, setHotelId] = useState('');

    const [formData, setFormData] = useState({
        hotelAddress: initialAddress,
        checkInDate: new Date(),
        checkOutDate: new Date(),
        description: initialDesc,
        checkInStr: initialCheckIn,
        checkOutStr: initialCheckOut,
    });

    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);

    const fetchHotelMutation = useEventHotel();
    const saveHotelMutation = useSaveHotel(isEditMode);

    useEffect(() => {
        if (eventId && user) {
            loadHotelDetails();
        }
    }, [eventId]);

    const loadHotelDetails = () => {
        setIsLoading(true);
        fetchHotelMutation.mutate({
            eventId,
            indoCode: user?.emp_code || '',
            apiKey: user?.api_key || ''
        }, {
            onSuccess: (data) => {
                setIsLoading(false);
                if (data.response === 'Success') {
                    const record = data.data;
                    if (record) {
                        setHotelId(record.id);
                        setIsEditMode(true);

                        const cIn = record.check_in_time ? new Date(record.check_in_time) : new Date();
                        const cOut = record.check_out_time ? new Date(record.check_out_time) : new Date();

                        setFormData({
                            hotelAddress: record.hotel_address || initialAddress,
                            checkInDate: cIn,
                            checkOutDate: cOut,
                            description: record.description || initialDesc,
                            checkInStr: record.check_in_time || '',
                            checkOutStr: record.check_out_time || '',
                        });
                    }
                } else if (data.message?.includes('Record Not Found')) {
                    setIsEditMode(false);
                }
            },
            onError: () => setIsLoading(false)
        });
    };

    const handleSave = () => {
        if (!formData.hotelAddress || !formData.checkInStr || !formData.checkOutStr) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        const payload = {
            ...(isEditMode ? { id: hotelId } : { event_id: eventId }),
            hotel_address: formData.hotelAddress,
            check_in_time: formData.checkInStr,
            check_out_time: formData.checkOutStr,
            description: formData.description,
            user_id: user?.emp_code || '',
            indo_code: user?.emp_code || '',
            key: user?.api_key || ''
        };

        saveHotelMutation.mutate(payload as any, {
            onSuccess: (data) => {
                if (data.response === 'Success' || data.message?.includes('Success') || data.message?.includes('updated')) {
                    CorporateToast.show({
                        type: 'success',
                        title: 'Success',
                        message: `Hotel details ${isEditMode ? 'updated' : 'added'} successfully`
                    });
                    router.back();
                } else {
                    Alert.alert('Error', data.message || 'Failed to save');
                }
            },
            onError: () => Alert.alert('Error', 'Operation failed')
        });
    };

    const updateDate = (date: Date, type: 'in' | 'out') => {
        const str = format(date, 'yyyy-MM-dd');
        if (type === 'in') {
            setFormData(prev => ({ ...prev, checkInDate: date, checkInStr: str }));
            setShowCheckIn(false);
        } else {
            setFormData(prev => ({ ...prev, checkOutDate: date, checkOutStr: str }));
            setShowCheckOut(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopBar
                title="Hotel Booking"
                showBack
            />
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366F1" />
                </View>
            ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.card}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Hotel Address</Text>
                                <View style={styles.inputWrap}>
                                    <MapPin size={18} color="#9CA3AF" />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.hotelAddress}
                                        onChangeText={t => setFormData({ ...formData, hotelAddress: t })}
                                        editable={!isSubmitted}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Check-In Date</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => !isSubmitted && setShowCheckIn(true)}
                                >
                                    <Text>{formData.checkInStr || 'Select Date'}</Text>
                                    <Calendar size={18} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Check-Out Date</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => !isSubmitted && setShowCheckOut(true)}
                                >
                                    <Text>{formData.checkOutStr || 'Select Date'}</Text>
                                    <Calendar size={18} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    multiline
                                    numberOfLines={3}
                                    value={formData.description}
                                    onChangeText={t => setFormData({ ...formData, description: t })}
                                    editable={!isSubmitted}
                                />
                            </View>
                        </View>

                        {!isSubmitted && (
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSave}
                                disabled={saveHotelMutation.isPending}
                            >
                                {saveHotelMutation.isPending ? <ActivityIndicator color="#FFF" /> : (
                                    <>
                                        <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.saveBtnText}>{isEditMode ? "Update Details" : "Save Details"}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            {showCheckIn && <DateTimePicker value={formData.checkInDate} mode="date" onChange={(e, d) => d && updateDate(d, 'in')} />}
            {showCheckOut && <DateTimePicker value={formData.checkOutDate} mode="date" onChange={(e, d) => d && updateDate(d, 'out')} />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 16 },
    card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '500' },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#F9FAFB' },
    input: { flex: 1, paddingVertical: 10, marginLeft: 8, color: '#111827', fontSize: 14 },
    textArea: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, backgroundColor: '#F9FAFB', marginLeft: 0 },
    dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, backgroundColor: '#F9FAFB' },
    saveBtn: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8 },
    saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});

export default HotelBookingScreen;
