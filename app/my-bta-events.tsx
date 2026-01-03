import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { SkeletonCard } from '@shared/components/Skeleton';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useTheme } from '@shared/theme';
import { MapPin, Calendar, IndianRupee, Eye, Car, Hotel, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useMyEvents, useSubmitBTAEvent, useCancelEvent } from '@features/staff/api/staffApi';

const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: any = {
        '1': { text: "Draft", color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
        '2': { text: "Submitted", color: "#3B82F6", bg: "#DBEAFE", icon: CheckCircle },
        '3': { text: "Approved", color: "#10B981", bg: "#D1FAE5", icon: CheckCircle },
        '4': { text: "Rejected", color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
        '5': { text: "Cancelled", color: "#6B7280", bg: "#F3F4F6", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['1'];
    const Icon = config.icon;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.color }]}>
            <Icon size={14} color={config.color} />
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

export default function MyBTAEventsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

    const currentDate = new Date();
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
    const [filterStatus, setFilterStatus] = useState('2');

    // Hooks
    const searchEventsMutation = useMyEvents();
    const submitEventMutation = useSubmitBTAEvent();
    const cancelEventMutation = useCancelEvent();

    // Derived loading state
    const loading = searchEventsMutation.isPending ||
        (refreshing && searchEventsMutation.isPending);

    const monthOptions = [
        { label: 'January', value: '0' },
        { label: 'February', value: '1' },
        { label: 'March', value: '2' },
        { label: 'April', value: '3' },
        { label: 'May', value: '4' },
        { label: 'June', value: '5' },
        { label: 'July', value: '6' },
        { label: 'August', value: '7' },
        { label: 'September', value: '8' },
        { label: 'October', value: '9' },
        { label: 'November', value: '10' },
        { label: 'December', value: '11' },
    ];

    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const year = currentDate.getFullYear() - 2 + i;
        return { label: year.toString(), value: year.toString() };
    });

    const statusOptions = [
        { label: 'Draft', value: '1' },
        { label: 'Submitted', value: '2' },
        { label: 'Approved', value: '3' },
        { label: 'Rejected', value: '4' },
        { label: 'Cancelled', value: '5' },
    ];

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const monthStr = String(filterMonth + 1).padStart(2, '0');
        const lastDay = new Date(filterYear, filterMonth + 1, 0).getDate();
        const fromDate = `${filterYear}-${monthStr}-01`;
        const toDate = `${filterYear}-${monthStr}-${lastDay}`;

        const formData = new FormData();
        formData.append("creator_id", user?.indo_code || '');
        formData.append("status", filterStatus);
        formData.append("from_date", fromDate);
        formData.append("to_date", toDate);
        // Auth injected by interceptor

        try {
            console.log('🔍 [Fetch Events] Filters:', { filterStatus, fromDate, toDate });

            const result = await searchEventsMutation.mutateAsync(formData);
            console.log('✅ [Fetch Events] Response:', result);

            if (result.response === "Success" && result.message === "Success") {
                setEvents(result.data);
            } else {
                setEvents([]);
            }
        } catch (error: any) {
            console.error('❌ [Fetch Events] Error:', error);
            Alert.alert("Error", "Failed to fetch events");
        } finally {
            setRefreshing(false);
        }
    };

    const handleSubmitEvent = (event: any) => {
        Alert.alert(
            "Confirm Submit",
            "Do you want to submit this event?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        const submitData = {
                            event_ids: [{
                                event_id: event.id,
                                serial_number: event.serial_no,
                                indo_code: user?.indo_code,
                            }],
                            key: user?.api_key, // Explicitly needed for this endpoint structure? Or handled? 
                            // Usually interceptor handles FormData or JSON if standard. 
                            // This endpoint expects a JSON body with keys.
                            // The staffApi hook for submitBTAEvent takes 'payload'.
                            // If api interceptor handles JSON too (it should), then we might not need key here if consistent.
                            // But usually key is top level. Let's pass it for safety or rely on client.
                            // However, the interceptor handles key injection if config.data is object?
                            submit_by: user?.indo_code,
                            remark: "submit",
                            status_id: "2",
                        };
                        // Note: The previous code sent key in body. The client interceptor handles params/data injection?
                        // If the interceptor only injects for FormData, we need to be careful with JSON.
                        // Assuming the interceptor handles both or we pass it partially.
                        // Let's rely on manual injection for now if JSON structure is specific.

                        try {
                            const result = await submitEventMutation.mutateAsync(submitData);
                            console.log('✅ [Submit Event] Response:', result);

                            if (result.response === "Success" && result.message.includes("Records updated")) {
                                Alert.alert("Success", "Event submitted successfully");
                                fetchEvents();
                            } else {
                                Alert.alert("Error", "Failed to submit event");
                            }
                        } catch (error: any) {
                            console.error('❌ [Submit Event] Error:', error);
                            Alert.alert("Error", "Something went wrong");
                        }
                    }
                }
            ]
        );
    };

    const handleCancelEvent = (event: any) => {
        Alert.prompt(
            "Cancel Event",
            "Please enter cancellation remarks:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: async (remarks) => {
                        const formData = new FormData();
                        formData.append("event_id", event.id);
                        formData.append("cancel_by", user?.indo_code || '');
                        formData.append("cancel_remarks", remarks || "");
                        formData.append("status", "5");
                        // Auth injected by interceptor

                        try {
                            const result = await cancelEventMutation.mutateAsync(formData);
                            console.log('✅ [Cancel Event] Response:', result);

                            if (result.response === "Success" && result.message.includes("Records updated")) {
                                Alert.alert("Success", "Event cancelled successfully");
                                fetchEvents();
                            } else {
                                Alert.alert("Error", "Failed to cancel event");
                            }
                        } catch (error: any) {
                            console.error('❌ [Cancel Event] Error:', error);
                            Alert.alert("Error", "Something went wrong");
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    return (
        <CorporateBackground>
            <TopBar title="My BTA Events" onMenuPress={() => setSidebarVisible(true)} showBack />
            <View style={styles.container}>
                <View style={[styles.filterSection, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <SelectField
                        label="Month"
                        value={filterMonth.toString()}
                        onValueChange={(value) => setFilterMonth(parseInt(value))}
                        options={monthOptions}
                        theme={theme}
                    />
                    <SelectField
                        label="Year"
                        value={filterYear.toString()}
                        onValueChange={(value) => setFilterYear(parseInt(value))}
                        options={yearOptions}
                        theme={theme}
                    />
                    <SelectField
                        label="Status"
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                        options={statusOptions}
                        theme={theme}
                    />
                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
                        onPress={fetchEvents}
                    >
                        {loading && !refreshing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.searchButtonText}>Search</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.eventsList}
                    contentContainerStyle={styles.eventsContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} />}
                >
                    {loading && !refreshing ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : events.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No events found</Text>
                        </View>
                    ) : (
                        events.map((event) => (
                            <View key={event.id} style={[styles.eventCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.eventHeader}>
                                    <Text style={[styles.serialNo, { color: theme.colors.text }]}>#{event.serial_no}</Text>
                                    <StatusBadge status={event.status} />
                                </View>

                                <View style={styles.eventBody}>
                                    <View style={styles.eventRow}>
                                        <MapPin size={18} color={theme.colors.primary} />
                                        <View style={styles.eventText}>
                                            <Text style={[styles.eventLabel, { color: theme.colors.textSecondary }]}>From</Text>
                                            <Text style={[styles.eventValue, { color: theme.colors.text }]} numberOfLines={1}>{event.from_address}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.eventRow}>
                                        <MapPin size={18} color={theme.colors.primary} />
                                        <View style={styles.eventText}>
                                            <Text style={[styles.eventLabel, { color: theme.colors.textSecondary }]}>To</Text>
                                            <Text style={[styles.eventValue, { color: theme.colors.text }]} numberOfLines={1}>{event.to_address}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.eventRow}>
                                        <Calendar size={18} color={theme.colors.primary} />
                                        <View style={styles.eventText}>
                                            <Text style={[styles.eventLabel, { color: theme.colors.textSecondary }]}>Travel Period</Text>
                                            <Text style={[styles.eventValue, { color: theme.colors.text }]}>{event.start_date} to {event.end_date}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.eventRow}>
                                        <IndianRupee size={18} color={theme.colors.primary} />
                                        <View style={styles.eventText}>
                                            <Text style={[styles.eventLabel, { color: theme.colors.textSecondary }]}>Budget</Text>
                                            <Text style={[styles.eventValue, { color: theme.colors.text }]}>₹{event.budget}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.eventActions}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { borderColor: theme.colors.border }]}
                                        onPress={() => router.push(`/bta-travel?eventId=${event.id}&fromAddress=${event.from_address}&toAddress=${event.to_address}&travelDate=${event.start_date}&description=${event.description}&eventStatus=${event.status}` as any)}
                                    >
                                        <Car size={16} color={theme.colors.primary} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Travel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, { borderColor: theme.colors.border }]}
                                        onPress={() => router.push(`/bta-hotel?eventId=${event.id}&hotelAddress=${event.to_address}&checkInDate=${event.start_date}&checkOutDate=${event.end_date}&description=${event.description}&eventStatus=${event.status}` as any)}
                                    >
                                        <Hotel size={16} color={theme.colors.primary} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Hotel</Text>
                                    </TouchableOpacity>

                                    {event.status === '1' && (
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.submitBtn]}
                                            onPress={() => handleSubmitEvent(event)}
                                            disabled={submitEventMutation.isPending}
                                        >
                                            {submitEventMutation.isPending ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} color="#FFFFFF" />
                                                    <Text style={styles.submitBtnText}>Submit</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}

                                    {event.status !== '5' && (
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                                            onPress={() => handleCancelEvent(event)}
                                            disabled={cancelEventMutation.isPending}
                                        >
                                            <XCircle size={16} color="#EF4444" />
                                            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    filterSection: { margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    searchButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    eventsList: { flex: 1 },
    eventsContent: { padding: 16, gap: 16 },
    loadingContainer: { alignItems: 'center', paddingVertical: 40 },
    loadingText: { marginTop: 12, fontSize: 14 },
    emptyContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 16 },
    eventCard: { borderRadius: 16, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
    eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    serialNo: { fontSize: 18, fontWeight: '700' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, gap: 6 },
    statusBadgeText: { fontSize: 12, fontWeight: '700' },
    eventBody: { gap: 12, marginBottom: 16 },
    eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    eventText: { flex: 1 },
    eventLabel: { fontSize: 12, marginBottom: 4 },
    eventValue: { fontSize: 14, fontWeight: '600' },
    eventActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, gap: 6 },
    actionBtnText: { fontSize: 14, fontWeight: '600' },
    submitBtn: { backgroundColor: '#10B981', borderColor: '#10B981' },
    submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
