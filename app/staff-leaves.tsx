import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { Calendar, CheckCircle, Clock, FileText, Lightbulb, Search, User, XCircle } from 'lucide-react-native';
import { useLeaveRequests, useApproveLeave } from '@features/staff/api/staffApi';
import { useLeaveTypes } from '@features/leave/api/leaveApi';

const CustomCheckbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => {
    const theme = useTheme();
    return (
        <TouchableOpacity onPress={onPress} style={[styles.checkbox, { borderColor: theme.colors.border, backgroundColor: checked ? theme.colors.primary : theme.colors.surface }]}>
            {checked && <CheckCircle size={16} color="#FFFFFF" strokeWidth={2} />}
        </TouchableOpacity>
    );
};

const StatusBadge = ({ status }: { status: string | number }) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    const statusConfig: any = {
        1: { text: "Pending", color: "#F59E0B", bg: "#FEF3C7", border: "#FBBF24", icon: Clock },
        2: { text: "Cancelled", color: "#F87171", bg: "#FEE2E2", border: "#9CA3AF", icon: FileText },
        3: { text: "Approved", color: "#10B981", bg: "#D1FAE5", border: "#34D399", icon: CheckCircle },
        4: { text: "Rejected", color: "#EF4444", bg: "#FEE2E2", border: "#F87171", icon: XCircle },
        5: { text: "Taken", color: "#10B981", bg: "#D1FAE5", border: "#9CA3AF", icon: CheckCircle },
    };
    const config = statusConfig[statusNum] || { text: "Unknown", color: "#6B7280", bg: "#F3F4F6", border: "#9CA3AF", icon: FileText };
    const Icon = config.icon;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border, borderWidth: 1 }]}>
            <Icon size={14} color={config.color} style={{ marginRight: 6 }} />
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

const RequestCard = ({ item, isSelected, onToggle, leaveTypeMap, onLongPress, theme }: any) => {
    const isPending = item.status === '1' || item.status === 1;

    return (
        <TouchableOpacity
            onLongPress={() => isPending && onLongPress(item)}
            delayLongPress={500}
            activeOpacity={0.9}
        >
            <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }, isSelected && { borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: theme.colors.primary + '10' }]}>
                <View style={styles.cardHeader}>
                    {isPending ? (
                        <CustomCheckbox checked={isSelected} onPress={onToggle} />
                    ) : (
                        <View style={{ width: 24 }} />
                    )}
                    <StatusBadge status={item.status} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <User size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Employee</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]} numberOfLines={1}>{item.resource_name}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <FileText size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Code</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{item.indo_code}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <FileText size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Leave Type</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{leaveTypeMap[item.lt_id] || "Unknown"}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Calendar size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>From Date</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{item.from_date}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Calendar size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>To Date</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{item.to_date}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <FileText size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Comments</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]} numberOfLines={2}>{item.comments || "N/A"}</Text>
                        </View>
                    </View>
                </View>

                {isPending && (
                    <View style={[styles.cardHint, { borderTopColor: theme.colors.border }]}>
                        <Lightbulb width={14} height={14} color="#73b4ddff" />
                        <Text style={[styles.cardHintText, { color: theme.colors.textSecondary }]}> Long press to approve/reject</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function StaffLeavesScreen() {
    const router = useRouter();
    const toast = useToast();
    const theme = useTheme();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [status, setStatus] = useState("1");
    const [dataList, setDataList] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [mRemark, setMRemark] = useState('');
    const [leaveTypeMap, setLeaveTypeMap] = useState<any>({});
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalRemark, setModalRemark] = useState('');

    // React Query hooks
    const searchLeavesMutation = useLeaveRequests();
    const approveLeaveMutation = useApproveLeave();
    const { data: leaveTypesData } = useLeaveTypes();

    useEffect(() => {
        // Process leave types from React Query
        if (leaveTypesData?.data) {
            const map: any = {};
            leaveTypesData.data.forEach((lt: any) => {
                map[lt.leave_type_id || lt.lt_id] = lt.leave_type_name || lt.name;
            });
            setLeaveTypeMap(map);
        }
    }, [leaveTypesData]);

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
        { value: "0", label: "All", icon: FileText },
        { value: "1", label: "Pending", icon: Clock },
        { value: "2", label: "Cancelled", icon: FileText },
        { value: "3", label: "Approved", icon: CheckCircle },
        { value: "4", label: "Rejected", icon: XCircle },
        { value: "5", label: "Taken", icon: FileText },
    ];

    const FlatLeaveList = (data: any[]) => {
        if (!Array.isArray(data)) return [];
        return data.flatMap(employee =>
            employee.leaves.map((request: any) => ({
                ...request,
                resource_name: employee.resource_name,
                indo_code: employee.indo_code,
                id: `${employee.indo_code}-${request.leave_id}`
            }))
        );
    };

    const leaveRequests = FlatLeaveList(dataList);
    const pendingRequests = leaveRequests.filter(item => item.status === '1' || item.status === 1);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === pendingRequests.length && pendingRequests.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingRequests.map(item => item.id));
        }
    };

    const handleLongPress = (item: any) => {
        setSelectedItem(item);
        setModalRemark("");
        setActionModalVisible(true);
    };

    const handleModalAction = async (stat: number) => {
        if (!selectedItem) return;

        const payload = {
            leavesList: [{
                leave_id: selectedItem.leave_id,
                status: stat,
            }],
            key: user?.api_key || "",
            indo_code: user?.indo_code || "",
            managerRemark: modalRemark || undefined,
        };

        setActionModalVisible(false);

        try {
            await approveLeaveMutation.mutateAsync(payload);
            toast.show('success', stat === 3 ? 'Approved' : 'Rejected', 'Action completed');
            setSelectedItem(null);
            setModalRemark("");
            handleSearch();
        } catch (error: any) {
            console.error('❌ [Leave Modal Action] Error:', error);
            toast.show('error', 'Error', error.message || 'Failed to process');
        }
    };

    const handleSearch = async () => {
        if (!user?.api_key || !user?.indo_code) {
            toast.show("error", "Auth Error", "User data missing");
            return;
        }

        setDataList([]);
        setSelectedIds([]);
        setMRemark("");

        const formData = new FormData();
        formData.append('year', year);
        formData.append('month', month);
        if (status !== "0") formData.append('status', status);

        try {
            const data = await searchLeavesMutation.mutateAsync(formData);

            if (data?.data && Array.isArray(data.data)) {
                setDataList(data.data);
                toast.show("success", "Success", `Found ${data.data.length} employee(s)`);
            } else {
                toast.show("info", "No Data", data.message || "No records found");
            }
        } catch (error: any) {
            console.error('❌ [Leave Search] Error:', error);
            toast.show("error", "Error", error.message || "Failed to fetch data");
        }
    };

    const handleApprove = async (stat: number) => {
        if (selectedIds.length === 0) {
            toast.show("error", "No Selection", "Please select at least one request");
            return;
        }

        const selectedItems = leaveRequests.filter(item => selectedIds.includes(item.id));
        const payload = {
            leavesList: selectedItems.map(item => ({
                leave_id: item.leave_id,
                status: stat,
            })),
            key: user?.api_key || "",
            indo_code: user?.indo_code || "",
            managerRemark: mRemark || undefined,
        };

        try {
            await approveLeaveMutation.mutateAsync(payload);
            toast.show('success', stat === 3 ? 'Approved' : 'Rejected', 'Action completed');
            setSelectedIds([]);
            setMRemark("");
            handleSearch();
        } catch (error: any) {
            console.error('❌ [Leave Approve] Error:', error);
            toast.show('error', 'Error', error.message || 'Failed to process');
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Leave Approval"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100, padding: 16 }}>
                <View style={[styles.filterSection, { backgroundColor: theme.colors.cardPrimary }]}>
                    <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Filter Options</Text>

                    <SelectField label="Month" value={month} onValueChange={setMonth} options={months} />
                    <SelectField label="Year" value={year} onValueChange={setYear} options={years} />
                    <SelectField label="Status" value={status} onValueChange={setStatus} options={statuses} />

                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: theme.colors.primary }, searchLeavesMutation.isPending && { opacity: 0.5 }]}
                        onPress={handleSearch}
                        disabled={searchLeavesMutation.isPending}
                    >
                        <Search size={20} color="#FFFFFF" />
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {searchLeavesMutation.isPending ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : leaveRequests.length > 0 ? (
                    <>
                        <View style={[styles.resultsHeader, { backgroundColor: theme.colors.cardPrimary }]}>
                            <View style={styles.resultsInfo}>
                                <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Records Found</Text>
                                <Text style={[styles.resultsSubtitle, { color: theme.colors.textSecondary }]}>
                                    {leaveRequests.length} total • {pendingRequests.length > 0 ? 'Select to approve or reject' : 'No pending requests'}
                                </Text>
                            </View>
                            {pendingRequests.length > 0 && (
                                <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
                                    <CustomCheckbox checked={selectedIds.length === pendingRequests.length} onPress={toggleSelectAll} />
                                    <Text style={[styles.selectAllText, { color: theme.colors.text }]}>All</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {leaveRequests.map((item) => (
                            <RequestCard
                                key={item.id}
                                item={item}
                                leaveTypeMap={leaveTypeMap}
                                isSelected={selectedIds.includes(item.id)}
                                onToggle={() => toggleSelection(item.id)}
                                onLongPress={handleLongPress}
                                theme={theme}
                            />
                        ))}

                        {selectedIds.length > 0 && (
                            <View style={[styles.actionSection, { backgroundColor: theme.colors.cardPrimary }]}>
                                <View style={styles.actionHeader}>
                                    <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Bulk Action</Text>
                                    <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>{selectedIds.length} selected</Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton, approveLeaveMutation.isPending && { opacity: 0.5 }]}
                                        onPress={() => handleApprove(4)}
                                        disabled={approveLeaveMutation.isPending}
                                    >
                                        <XCircle size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Reject ({selectedIds.length})</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.approveButton, approveLeaveMutation.isPending && { opacity: 0.5 }]}
                                        onPress={() => handleApprove(3)}
                                        disabled={approveLeaveMutation.isPending}
                                    >
                                        <CheckCircle size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Approve ({selectedIds.length})</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.remarkSection}>
                                    <Text style={[styles.remarkLabel, { color: theme.colors.text }]}>Manager Remarks</Text>
                                    <Text style={[styles.remarkHelper, { color: theme.colors.textSecondary }]}>Optional comments (recommended for rejection)</Text>
                                    <TextInput
                                        style={[styles.remarkInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        value={mRemark}
                                        onChangeText={setMRemark}
                                        placeholder="Enter remarks..."
                                        placeholderTextColor={theme.colors.textTertiary}
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Search size={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Records Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Select filters and tap Search</Text>
                    </View>
                )}
            </ScrollView>

            {/* Action Modal */}
            <Modal transparent visible={actionModalVisible} onRequestClose={() => setActionModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Quick Action</Text>
                        <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                            {selectedItem?.resource_name} - {selectedItem?.from_date} to {selectedItem?.to_date}
                        </Text>

                        <TextInput
                            style={[styles.remarkInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text, marginTop: 16 }]}
                            value={modalRemark}
                            onChangeText={setModalRemark}
                            placeholder="Enter remark (optional)..."
                            placeholderTextColor={theme.colors.textTertiary}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={[styles.actionButtons, { marginTop: 16 }]}>
                            <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleModalAction(3)}>
                                <CheckCircle size={18} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleModalAction(4)}>
                                <XCircle size={18} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>Reject</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.surface }]} onPress={() => setActionModalVisible(false)}>
                            <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    resultsInfo: { flex: 1 },
    resultsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
    resultsSubtitle: { fontSize: 12, fontWeight: '500' },
    selectAllContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    selectAllText: { fontSize: 13, fontWeight: '600' },
    card: { borderRadius: 10, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    cardContent: { gap: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
    cardIconContainer: { borderRadius: 8, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cardTextContainer: { flex: 1 },
    cardLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
    cardValue: { fontSize: 14, fontWeight: '600' },
    cardHint: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
    cardHintText: { fontSize: 11, fontStyle: 'italic' },
    statusBadge: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, alignItems: 'center' },
    statusBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    actionSection: { borderRadius: 14, padding: 18, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    actionHeader: { marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    actionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
    actionSubtitle: { fontSize: 12, fontWeight: '500' },
    remarkSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    remarkLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    remarkHelper: { fontSize: 13, fontWeight: '500', marginBottom: 12, fontStyle: 'italic' },
    remarkInput: { borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 70, textAlignVertical: 'top', fontSize: 13, marginBottom: 12 },
    actionButtons: { flexDirection: 'row', gap: 10 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
    approveButton: { backgroundColor: '#10B981' },
    rejectButton: { backgroundColor: '#EF4444' },
    actionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    checkbox: { width: 20, height: 20, borderWidth: 2, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, borderRadius: 14, marginTop: 20 },
    emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 14, marginBottom: 5 },
    emptySubtitle: { fontSize: 13, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { borderRadius: 16, width: '100%', maxWidth: 400, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    modalSubtitle: { fontSize: 13, marginBottom: 12 },
    cancelButton: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { fontSize: 14, fontWeight: '600' },
});
