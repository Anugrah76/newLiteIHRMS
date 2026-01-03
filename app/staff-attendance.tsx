import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { Calendar, CheckCircle, Clock, FileText, Search, User, XCircle } from 'lucide-react-native';
import { useStaffAttendanceList, useStaffAttendanceApprove } from '@features/staff/api/staffApi';

// Custom Checkbox
const CustomCheckbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <CheckCircle size={16} color="#FFFFFF" strokeWidth={2} />}
    </TouchableOpacity>
);

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const config = status === "P"
        ? { text: "Present", color: "#10B981", bg: "#D1FAE5", border: "#34D399", icon: CheckCircle }
        : { text: "Absent", color: "#EF4444", bg: "#FEE2E2", border: "#F87171", icon: XCircle };

    const Icon = config.icon;
    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border, borderWidth: 1 }]}>
            <Icon size={14} color={config.color} style={{ marginRight: 6 }} />
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

// Request Card
const RequestCard = ({ item, isSelected, onToggle }: any) => {
    const formatTime = (time: string | null) => (time ? time.split(":").slice(0, 2).join(":") : null);

    return (
        <View style={[styles.card, isSelected && styles.cardSelected]}>
            <View style={styles.cardHeader}>
                <CustomCheckbox checked={isSelected} onPress={onToggle} />
                <StatusBadge status={item.status} />
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                    <View style={styles.cardIconContainer}>
                        <User size={18} color="#6366F1" />
                    </View>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardLabel}>Employee</Text>
                        <Text style={styles.cardValue} numberOfLines={1}>{item.name}</Text>
                    </View>
                </View>
                <View style={styles.cardRow}>
                    <View style={styles.cardIconContainer}>
                        <FileText size={18} color="#6366F1" />
                    </View>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardLabel}>Code</Text>
                        <Text style={styles.cardValue}>{item.indo_code}</Text>
                    </View>
                </View>
                <View style={styles.cardRow}>
                    <View style={styles.cardIconContainer}>
                        <Calendar size={18} color="#6366F1" />
                    </View>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardLabel}>Department</Text>
                        <Text style={styles.cardValue}>{item.department || "N/A"}</Text>
                    </View>
                </View>
                {item.in_time && (
                    <View style={styles.cardRow}>
                        <View style={styles.cardIconContainer}>
                            <Clock size={18} color="#6366F1" />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={styles.cardLabel}>In-time</Text>
                            <Text style={styles.cardValue}>{formatTime(item.in_time)}</Text>
                        </View>
                    </View>
                )}
                {item.out_time && (
                    <View style={styles.cardRow}>
                        <View style={styles.cardIconContainer}>
                            <Clock size={18} color="#6366F1" />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={styles.cardLabel}>Out-time</Text>
                            <Text style={styles.cardValue}>{formatTime(item.out_time)}</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default function StaffAttendanceScreen() {
    const router = useRouter();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [dataList, setDataList] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [remark, setRemark] = useState('');

    // React Query hooks
    const searchAttendanceMutation = useStaffAttendanceList();
    const approveAttendanceMutation = useStaffAttendanceApprove();

    // Month & Year Options
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

    // Flatten staff list
    const FlatStaffList = (data: any[]) => {
        if (!Array.isArray(data)) return [];
        return data.map(item => ({
            ...item,
            in_time: item["in-time"] || null,
            out_time: item["out-time"] || null,
            id: `${item.indo_code}-${year}-${month.padStart(2, '0')}`,
        }));
    };

    const staffRequests = FlatStaffList(dataList);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === staffRequests.length && staffRequests.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(staffRequests.map(item => item.id));
        }
    };

    const handleSearch = async () => {
        if (!user?.api_key || !user?.indo_code) {
            toast.show("error", "Auth Error", "User data missing");
            return;
        }

        setDataList([]);
        setSelectedIds([]);

        const formData = new FormData();
        formData.append('month', month);
        formData.append('year', year);

        try {
            const data = await searchAttendanceMutation.mutateAsync(formData);

            if (data.status === 1) {
                setDataList(data.data || []);
                toast.show("success", "Success", `Found ${data.data?.length || 0} records`);
            } else {
                toast.show("info", "No Data", data.message || "No records found");
            }
        } catch (error: any) {
            console.error('❌ [handleSearch] Error:', error);
            toast.show("error", "Error", error.message || "Failed to fetch data");
        }
    };

    const handleApprove = async () => {
        if (selectedIds.length === 0) {
            toast.show("error", "No Selection", "Please select at least one record");
            return;
        }

        const selectedRecords = staffRequests.filter(r => selectedIds.includes(r.id));
        const requestIds = selectedRecords.map(r => r.indo_code);

        // staffApi.approveStaffAttendance handles formData creation.
        // If it expects rawData wrapper, we need to match it, but based on existing code it sends flat params.
        // The staffApi implementation has a fallback for flat params if 'staff_employees' is missing.
        const payload = {
            request_ids: JSON.stringify(requestIds),
            remark: remark,
        };

        try {
            const data = await approveAttendanceMutation.mutateAsync(payload);

            if (data.status === 1) {
                toast.show("success", "Approved", data.message || "Staff attendance approved successfully");
                setSelectedIds([]);
                setRemark('');
                handleSearch(); // Refresh data
            } else {
                toast.show("error", "Failed", data.message || "Unable to approve");
            }
        } catch (error: any) {
            console.error('❌ [handleApprove] Error:', error);
            toast.show("error", "Error", error.message || "Failed to approve");
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Staff Attendance"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
                onBackPress={() => router.back()}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100, padding: 16 }}>
                {/* Filters */}
                <View style={styles.filterSection}>
                    <View style={styles.selectRow}>
                        <View style={styles.selectHalf}>
                            <SelectField label="Month" value={month} onValueChange={setMonth} options={months} />
                        </View>
                        <View style={styles.selectHalf}>
                            <SelectField label="Year" value={year} onValueChange={setYear} options={years} />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.searchButton, searchAttendanceMutation.isPending && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={searchAttendanceMutation.isPending}
                    >
                        <View style={styles.searchButtonContent}>
                            <Search size={20} color="#FFFFFF" />
                            <Text style={styles.searchButtonText}>Search</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Results */}
                {searchAttendanceMutation.isPending ? (
                    <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
                ) : staffRequests.length > 0 ? (
                    <>
                        {/* Results Header */}
                        <View style={styles.resultsHeader}>
                            <View style={styles.resultsInfo}>
                                <Text style={styles.resultsTitle}>Records Found</Text>
                                <Text style={styles.resultsSubtitle}>{staffRequests.length} total • {selectedIds.length} selected</Text>
                            </View>
                            <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
                                <CustomCheckbox checked={selectedIds.length === staffRequests.length && staffRequests.length > 0} onPress={toggleSelectAll} />
                                <Text style={styles.selectAllText}>All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Cards */}
                        {staffRequests.map((item) => (
                            <RequestCard
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.includes(item.id)}
                                onToggle={() => toggleSelection(item.id)}
                            />
                        ))}

                        {/* Action Section */}
                        {selectedIds.length > 0 && (
                            <View style={styles.actionSection}>
                                <View style={styles.actionHeader}>
                                    <Text style={styles.actionTitle}>Approve Attendance</Text>
                                    <Text style={styles.actionSubtitle}>{selectedIds.length} record(s) selected</Text>
                                </View>

                                <View style={styles.remarkSection}>
                                    <Text style={styles.remarkLabel}>Remark (Optional)</Text>
                                    <TextInput
                                        style={styles.remarkInput}
                                        value={remark}
                                        onChangeText={setRemark}
                                        placeholder="Enter remark..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.approveButton, approveAttendanceMutation.isPending && { opacity: 0.5 }]}
                                    onPress={handleApprove}
                                    disabled={approveAttendanceMutation.isPending}
                                >
                                    <CheckCircle size={20} color="#FFFFFF" />
                                    <Text style={styles.approveButtonText}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Search size={48} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>No Records Found</Text>
                        <Text style={styles.emptySubtitle}>Select month and year, then tap Search</Text>
                    </View>
                )}
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    filterSection: { marginBottom: 20 },
    selectRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    selectHalf: { flex: 1 },

    searchButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonDisabled: { backgroundColor: '#9CA3AF' },
    searchButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    resultsInfo: { flex: 1 },
    resultsTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    resultsSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    selectAllContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    selectAllText: { fontSize: 14, fontWeight: '600', color: '#374151' },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardSelected: { borderColor: '#6366F1', borderWidth: 2, backgroundColor: '#F8FAFF' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardContent: { gap: 12 },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
    cardIconContainer: {
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTextContainer: { flex: 1 },
    cardLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginBottom: 3, textTransform: 'uppercase' },
    cardValue: { fontSize: 15, color: '#1F2937', fontWeight: '600' },

    statusBadge: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    actionSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    actionHeader: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    actionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    actionSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

    remarkSection: { marginBottom: 16 },
    remarkLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    remarkInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
        textAlignVertical: 'top',
        fontSize: 14,
        backgroundColor: '#F9FAFB',
        color: '#1F2937',
    },

    approveButton: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    approveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginTop: 20,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 6 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
