import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Switch, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@shared/components/ui/TopBar';
import { MapPin, Calendar, Clock, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useAuthStore } from '@features/auth/store/authSlice';
import { useEventTravel, useSaveTravel } from '@features/bta/hooks';
import { CorporateToast } from '@shared/components/ui/CorporateToast';

const TravelBookingScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuthStore();

    // Params
    const eventId = params.eventId as string;
    const initialFrom = params.fromAddress as string || '';
    const initialTo = params.toAddress as string || '';
    const initialDate = params.travelDate as string || '';
    const initialDesc = params.description as string || '';
    const isSubmitted = params.eventStatus === '2'; // Locked if submitted

    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [travelId, setTravelId] = useState('');

    const [formData, setFormData] = useState({
        fromAddress: initialFrom,
        toAddress: initialTo,
        travelDate: new Date(),
        departureTime: new Date(),
        description: initialDesc,
        isReturn: false,
        returnTravelDate: new Date(),
        returnDepartureTime: new Date(),
        travelDateStr: initialDate, // For display/API if needed as string
        departureTimeStr: '',
        returnTravelDateStr: '',
        returnDepartureTimeStr: ''
    });

    // Date Pickers state
    const [showTravelDate, setShowTravelDate] = useState(false);
    const [showDepartureTime, setShowDepartureTime] = useState(false);
    const [showReturnDate, setShowReturnDate] = useState(false);
    const [showReturnTime, setShowReturnTime] = useState(false);

    // Hooks
    const fetchTravelMutation = useEventTravel();
    const saveTravelMutation = useSaveTravel(isEditMode);

    useEffect(() => {
        if (eventId && user) {
            loadTravelDetails();
        }
    }, [eventId]);

    const loadTravelDetails = () => {
        setIsLoading(true);
        fetchTravelMutation.mutate({
            eventId,
            indoCode: user?.emp_code || '',
            apiKey: user?.api_key || ''
        }, {
            onSuccess: (data) => {
                setIsLoading(false);
                if (data.response === 'Success') {
                    const record = data.data;
                    if (record) {
                        setTravelId(record.id);
                        setIsEditMode(true);

                        // Parse dates
                        const tDate = record.travel_date ? new Date(record.travel_date) : new Date();
                        const rDate = record.return_travel_date && record.return_travel_date !== 'null' ? new Date(record.return_travel_date) : new Date();

                        // Time parsing (approximate if string is HH:mm:ss)
                        const parseTime = (timeStr: string) => {
                            if (!timeStr) return new Date();
                            const [h, m, s] = timeStr.split(':');
                            const d = new Date();
                            d.setHours(parseInt(h) || 0, parseInt(m) || 0, 0, 0);
                            return d;
                        };

                        setFormData({
                            fromAddress: record.from_address || initialFrom,
                            toAddress: record.to_address || initialTo,
                            travelDate: tDate,
                            departureTime: parseTime(record.departure_time),
                            description: record.description || initialDesc,
                            isReturn: record.is_return === 'YES',
                            returnTravelDate: rDate,
                            returnDepartureTime: parseTime(record.return_departure_time),
                            travelDateStr: record.travel_date || initialDate,
                            departureTimeStr: record.departure_time || '',
                            returnTravelDateStr: record.return_travel_date || '',
                            returnDepartureTimeStr: record.return_departure_time || ''
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
        if (!formData.fromAddress || !formData.toAddress || !formData.travelDateStr || !formData.departureTimeStr) {
            Alert.alert('Error', 'Please fill required fields (From, To, Date, Time)');
            return;
        }

        if (formData.isReturn && (!formData.returnTravelDateStr || !formData.returnDepartureTimeStr)) {
            Alert.alert('Error', 'Please fill return journey details');
            return;
        }

        const payload = {
            ...(isEditMode ? { id: travelId } : { event_id: eventId }),
            from_address: formData.fromAddress,
            to_address: formData.toAddress,
            travel_date: formData.travelDateStr,
            departure_time: formData.departureTimeStr,
            description: formData.description,
            user_id: user?.emp_code || '',
            is_return: formData.isReturn ? "YES" : "NO",
            return_travel_date: formData.returnTravelDateStr,
            return_departure_time: formData.returnDepartureTimeStr,
            indo_code: user?.emp_code || '',
            key: user?.api_key || ''
        };

        saveTravelMutation.mutate(payload as any, {
            onSuccess: (data) => {
                if (data.response === 'Success' || data.message?.includes('Success') || data.message?.includes('updated')) {
                    CorporateToast.show({
                        type: 'success',
                        title: 'Success',
                        message: `Travel details ${isEditMode ? 'updated' : 'added'} successfully`
                    });
                    router.back();
                } else {
                    Alert.alert('Error', data.message || 'Failed to save');
                }
            },
            onError: () => Alert.alert('Error', 'Operation failed')
        });
    };

    const updateDate = (date: Date, type: 'travel' | 'return') => {
        const str = format(date, 'yyyy-MM-dd');
        if (type === 'travel') {
            setFormData(prev => ({ ...prev, travelDate: date, travelDateStr: str }));
            setShowTravelDate(false);
        } else {
            setFormData(prev => ({ ...prev, returnTravelDate: date, returnTravelDateStr: str }));
            setShowReturnDate(false);
        }
    };

    const updateTime = (date: Date, type: 'departure' | 'return') => {
        const str = format(date, 'HH:mm:ss');
        if (type === 'departure') {
            setFormData(prev => ({ ...prev, departureTime: date, departureTimeStr: str }));
            setShowDepartureTime(false);
        } else {
            setFormData(prev => ({ ...prev, returnDepartureTime: date, returnDepartureTimeStr: str }));
            setShowReturnTime(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TopBar
                title="Travel Booking"
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
                                <Text style={styles.label}>From Address</Text>
                                <View style={styles.inputWrap}>
                                    <MapPin size={18} color="#9CA3AF" />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.fromAddress}
                                        onChangeText={t => setFormData({ ...formData, fromAddress: t })}
                                        editable={!isSubmitted}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>To Address</Text>
                                <View style={styles.inputWrap}>
                                    <MapPin size={18} color="#9CA3AF" />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.toAddress}
                                        onChangeText={t => setFormData({ ...formData, toAddress: t })}
                                        editable={!isSubmitted}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Travel Date</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => !isSubmitted && setShowTravelDate(true)}
                                >
                                    <Text>{formData.travelDateStr || 'Select Date'}</Text>
                                    <Calendar size={18} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Departure Time</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => !isSubmitted && setShowDepartureTime(true)}
                                >
                                    <Text>{formData.departureTimeStr || 'Select Time'}</Text>
                                    <Clock size={18} color="#6B7280" />
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

                            <View style={styles.rowSwitch}>
                                <Text style={styles.label}>Return Journey</Text>
                                <Switch
                                    value={formData.isReturn}
                                    onValueChange={v => !isSubmitted && setFormData({ ...formData, isReturn: v })}
                                    trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                                    thumbColor={formData.isReturn ? '#4F46E5' : '#F3F4F6'}
                                    disabled={isSubmitted}
                                />
                            </View>

                            {formData.isReturn && (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Return Travel Date</Text>
                                        <TouchableOpacity
                                            style={styles.dateInput}
                                            onPress={() => !isSubmitted && setShowReturnDate(true)}
                                        >
                                            <Text>{formData.returnTravelDateStr || 'Select Date'}</Text>
                                            <Calendar size={18} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Return Departure Time</Text>
                                        <TouchableOpacity
                                            style={styles.dateInput}
                                            onPress={() => !isSubmitted && setShowReturnTime(true)}
                                        >
                                            <Text>{formData.returnDepartureTimeStr || 'Select Time'}</Text>
                                            <Clock size={18} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>

                        {!isSubmitted && (
                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSave}
                                disabled={saveTravelMutation.isPending}
                            >
                                {saveTravelMutation.isPending ? <ActivityIndicator color="#FFF" /> : (
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

            {showTravelDate && <DateTimePicker value={formData.travelDate} mode="date" onChange={(e, d) => d && updateDate(d, 'travel')} />}
            {showReturnDate && <DateTimePicker value={formData.returnTravelDate} mode="date" onChange={(e, d) => d && updateDate(d, 'return')} />}
            {showDepartureTime && <DateTimePicker value={formData.departureTime} mode="time" onChange={(e, d) => d && updateTime(d, 'departure')} />}
            {showReturnTime && <DateTimePicker value={formData.returnDepartureTime} mode="time" onChange={(e, d) => d && updateTime(d, 'return')} />}

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
    rowSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    saveBtn: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8 },
    saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});

export default TravelBookingScreen;
