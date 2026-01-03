import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { Calendar, CheckCircle, ChevronRight, Clock, Eye, File, FileText, Search, Tag, User } from 'lucide-react-native';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';

export default function MyTicketsScreen() {
    const router = useRouter();
    const toast = useToast();
    const theme = useTheme();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [status, setStatus] = useState("All");
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);

    const months = Array.from({ length: 12 }, (_, i) => ({
        label: new Date(2020, i).toLocaleString('default', { month: 'long' }),
        value: (i + 1).toString().padStart(2, '0'),
        icon: Calendar,
    }));

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => ({
        label: `${currentYear - i}`,
        value: `${currentYear - i}`,
        icon: Calendar,
    }));

    const statuses = [
        { value: "All", label: "All", icon: FileText },
        { value: "Draft", label: "Draft", icon: File },
        { value: "Open", label: "Open", icon: Eye },
        { value: "Closed", label: "Closed", icon: CheckCircle },
    ];

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

    const handleSearch = async () => {
        if (!user?.api_key || !user.indo_code) {
            toast.show("error", "Auth Error", "User data missing");
            return;
        }

        setLoading(true);
        setTickets([]);

        const formData = new FormData();
        // Manually append auth fields as apiClient interceptor might not handle FormData injection automatically
        formData.append('key', user.api_key);
        formData.append('indo_code', user.indo_code);
        formData.append('year', year);
        formData.append('ticket_status', status);

        // Convert month number to lowercase month name for API
        const monthName = new Date(2020, parseInt(month) - 1).toLocaleString('default', { month: 'long' }).toLowerCase();
        formData.append('month', monthName);

        try {
            console.log('🔍 [My Tickets Search] API:', API_ENDPOINTS.myTicket());

            const response = await apiClient.post(API_ENDPOINTS.myTicket(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            const data = response.data;
            console.log('✅ [My Tickets Search] Response:', data);

            if (data.status === 'Success') {
                setTickets(data?.queries || []);
                toast.show("success", "Success", `Found ${data?.queries?.length || 0} ticket(s)`);
            } else {
                toast.show("info", "No Data", "No tickets found");
            }
        } catch (error: any) {
            console.error('❌ [My Tickets Search] Error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch tickets";
            toast.show("error", "Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketClick = (ticketId: string) => {
        router.push(`/ticket-chat?ticketId=${ticketId}`);
    };

    return (
        <CorporateBackground>
            <TopBar
                title="My Tickets"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100, padding: 16 }}>
                <View style={[styles.filterSection, { backgroundColor: theme.colors.cardPrimary }]}>
                    <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Filter Tickets</Text>

                    <SelectField label="Month" value={month} onValueChange={setMonth} options={months} />
                    <SelectField label="Year" value={year} onValueChange={setYear} options={years} />
                    <SelectField label="Status" value={status} onValueChange={setStatus} options={statuses} />

                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.5 }]}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        <Search size={20} color="#FFFFFF" />
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : tickets.length > 0 ? (
                    <View style={styles.ticketsContainer}>
                        <Text style={[styles.ticketsTitle, { color: theme.colors.text }]}>Fetched Tickets</Text>
                        {tickets.map((ticket) => (
                            <TouchableOpacity
                                key={ticket.ticket_id}
                                style={[
                                    styles.ticketCard,
                                    {
                                        backgroundColor: theme.colors.cardPrimary,
                                        borderLeftColor: getPriorityColor(ticket.priority)
                                    }
                                ]}
                                onPress={() => handleTicketClick(ticket.ticket_id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.ticketHeader}>
                                    <View style={styles.ticketIdContainer}>
                                        <Text style={[styles.ticketId, { color: theme.colors.text }]}>#{ticket.ticket_id}</Text>
                                        <Text style={[styles.ticketId, { color: theme.colors.text }]}>Code: {ticket.indo_code}</Text>
                                    </View>
                                    <View style={styles.ticketHeaderRight}>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                                            <Text style={styles.statusText}>{ticket.status}</Text>
                                        </View>
                                        <ChevronRight size={20} color={theme.colors.textSecondary} />
                                    </View>
                                </View>

                                <Text style={[styles.ticketSubject, { color: theme.colors.text }]}>{ticket.subject}</Text>

                                <View style={styles.detailRow}>
                                    <User size={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Person: {ticket.department_person_name}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Clock size={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Date: {formatDate(ticket.create_datetime)}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Tag size={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Priority: {ticket.priority}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Search size={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Tickets Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Select filters and tap Search</Text>
                    </View>
                )}
            </ScrollView>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    filterSection: { padding: 16, borderRadius: 12, marginBottom: 16 },
    filterSectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    searchButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8 },
    searchButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    ticketsContainer: { marginTop: 10 },
    ticketsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    ticketCard: {
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
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    ticketIdContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    ticketHeaderRight: { flexDirection: 'row', alignItems: 'center' },
    ticketId: { fontSize: 16, fontWeight: '600', marginRight: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
    statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },
    ticketSubject: { fontSize: 16, fontWeight: '500', marginBottom: 12, lineHeight: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    detailText: { fontSize: 14, flex: 1 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, borderRadius: 14, marginTop: 20 },
    emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 14, marginBottom: 5 },
    emptySubtitle: { fontSize: 13, textAlign: 'center' },
});
