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
import { useMissPunchList, useApproveMissPunch } from '@features/staff/api/staffApi';
import { Calendar, CheckCircle, Clock, FileText, Search, User, XCircle, Lightbulb } from 'lucide-react-native';

const CustomCheckbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <CheckCircle size={16} color="#FFFFFF" strokeWidth={2} />}
    </TouchableOpacity>
);

const StatusBadge = ({ status }: { status: string | number }) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    const statusConfig: any = {
        1: { text: "Pending", color: "#F59E0B", bg: "#FEF3C7", border: "#FBBF24", icon: Clock },
        3: { text: "Approved", color: "#10B981", bg: "#D1FAE5", border: "#34D399", icon: CheckCircle },
        4: { text: "Rejected", color: "#EF4444", bg: "#FEE2E2", border: "#F87171", icon: XCircle },
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

const RequestCard = ({ item, isSelected, onToggle, onLongPress, theme }: any) => {
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
                            <Clock size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Misspunch Date</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{item.mispunch_date}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <FileText size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Old Punch</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{item.oldpunch}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRow}>
                        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <FileText size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.cardTextContainer}>
                            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>New Punch</Text>
                            <Text style={[styles.cardValue, { color: theme.colors.text }]}>{item.newpunch}</Text>
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
                    <View style={styles.cardHint}>
                        <Lightbulb width={14} height={14} color="#73b4ddff" />
                        <Text style={[styles.cardHintText, { color: theme.colors.textSecondary }]}> Long press to approve/reject</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function StaffMissedPunchScreen() {
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
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalRemark, setModalRemark] = useState('');

    // React Query hooks
    const missPunchListMutation = useMissPunchList();
    const approveMissPunchMutation = useApproveMissPunch();
    const loading = missPunchListMutation.isPending || approveMissPunchMutation.isPending;

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
        { value: "1", label: "Pending", icon: Clock },
        { value: "3", label: "Approved", icon: CheckCircle },
        { value: "4", label: "Rejected", icon: XCircle },
    ];

    const FlatMissPunchList = (data: any[]) => {
        if (!Array.isArray(data)) return [];
        return data.flatMap(employee =>
            employee.mispunch.map((request: any) => ({
                ...request,
                resource_name: employee.resource_name,
                indo_code: employee.indo_code,
                id: `${request.mp_id}-${request.atten_id}`,
            }))
        );
    };

    const missPunchRequests = FlatMissPunchList(dataList);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const pendingRequests = missPunchRequests.filter(r => r.status === '1' || r.status === 1);
        if (selectedIds.length === pendingRequests.length && pendingRequests.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingRequests.map(item => item.id));
        }
    };

    const handleSearch = async () => {
        setDataList([]);
        setSelectedIds([]);

        try {
            const result = await missPunchListMutation.mutateAsync({ year, month, status });
            console.log('✅ [handleSearch] Response:', result);

            if (result?.data && Array.isArray(result.data)) {
                setDataList(result.data);
                toast.show("success", "Success", `Found ${result.data.length} employee(s)`);
            } else {
                toast.show("info", "No Data", result.message || "No records found");
            }
        } catch (error: any) {
            console.error('❌ [handleSearch] Error:', error);
            toast.show("error", "Error", error.message || "Failed to fetch data");
        }
    };

    const handleApprove = async (stat: number) => {
        if (selectedIds.length === 0) {
            toast.show("error", "No Selection", "Please select at least one request");
            return;
        }

        const selectedItems = missPunchRequests.filter(r => selectedIds.includes(r.id));
        const payload = {
            approveList: selectedItems.map(item => ({
                mp_id: item.mp_id,
                atten_id: item.atten_id,
                newpunch: item.newpunch,
                status: stat
            })),
            managerRemark: mRemark || "",
        };

        try {
            const result = await approveMissPunchMutation.mutateAsync(payload);
            console.log('✅ [handleApprove] Response:', result);

            toast.show('success', stat === 3 ? 'Approved' : 'Rejected', result?.message || 'Action completed');
            setSelectedIds([]);
            setMRemark("");
            handleSearch(); // Refresh
        } catch (error: any) {
            console.error('❌ [handleApprove] Error:', error);
            toast.show('error', 'Error', error.message || 'Failed to process');
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
            approveList: [{
                mp_id: selectedItem.mp_id,
                atten_id: selectedItem.atten_id,
                newpunch: selectedItem.newpunch,
                status: stat
            }],
            managerRemark: modalRemark || "",
        };

        setActionModalVisible(false);

        try {
            const result = await approveMissPunchMutation.mutateAsync(payload);
            console.log('✅ [handleModalAction] Response:', result);

            toast.show('success', stat === 3 ? 'Approved' : 'Rejected', result?.message || 'Action completed');
            setSelectedItem(null);
            setModalRemark("");
            handleSearch();
        } catch (error: any) {
            console.error('❌ [handleModalAction] Error:', error);
            toast.show('error', 'Error', error.message);
        }
    };

    const pendingRequests = missPunchRequests.filter(r => r.status === '1' || r.status === 1);

    return (
        <CorporateBackground>
            <TopBar
                title="Missed Punch Approval"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100, padding: 16 }}>
                {/* Filters */}
                <View style={[styles.filterSection, { backgroundColor: theme.colors.cardPrimary }]}>
                    <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Filter Options</Text>

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

                {/* Results */}
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : missPunchRequests.length > 0 ? (
                    <>
                        <View style={[styles.resultsHeader, { backgroundColor: theme.colors.cardPrimary }]}>
                            <View style={styles.resultsInfo}>
                                <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Records Found</Text>
                                <Text style={[styles.resultsSubtitle, { color: theme.colors.textSecondary }]}>{missPunchRequests.length} total • {selectedIds.length} selected</Text>
                            </View>
                            <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
                                <CustomCheckbox checked={selectedIds.length === pendingRequests.length && pendingRequests.length > 0} onPress={toggleSelectAll} />
                                <Text style={[styles.selectAllText, { color: theme.colors.text }]}>All</Text>
                            </TouchableOpacity>
                        </View>

                        {missPunchRequests.map((item) => (
                            <RequestCard
                                key={item.id}
                                item={item}
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
                                    <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>{selectedIds.length} request(s) selected</Text>
                                </View>

                                <TextInput
                                    style={[styles.remarkInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                    value={mRemark}
                                    onChangeText={setMRemark}
                                    placeholder="Enter remark (optional)..."
                                    placeholderTextColor={theme.colors.textTertiary}
                                    multiline
                                    numberOfLines={3}
                                />

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.approveButton, loading && { opacity: 0.5 }]}
                                        onPress={() => handleApprove(3)}
                                        disabled={loading}
                                    >
                                        <CheckCircle size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton, loading && { opacity: 0.5 }]}
                                        onPress={() => handleApprove(4)}
                                        disabled={loading}
                                    >
                                        <XCircle size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Reject</Text>
                                    </TouchableOpacity>
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

            {/* Single Item Action Modal */}
            <Modal transparent visible={actionModalVisible} onRequestClose={() => setActionModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Quick Action</Text>
                        <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                            {selectedItem?.resource_name} - {selectedItem?.mispunch_date}
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
    selectRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    selectThird: { flex: 1 },

    searchButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    searchButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    resultsInfo: { flex: 1 },
    resultsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
    resultsSubtitle: { fontSize: 12, fontWeight: '500' },
    selectAllContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    selectAllText: { fontSize: 13, fontWeight: '600' },

    card: {
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    cardContent: { gap: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
    cardIconContainer: {
        borderRadius: 8,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardTextContainer: { flex: 1 },
    cardLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
    cardValue: { fontSize: 14, fontWeight: '600' },

    cardHint: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    cardHintText: { fontSize: 11, fontStyle: 'italic' },

    statusBadge: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    statusBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

    actionSection: {
        borderRadius: 14,
        padding: 18,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    actionHeader: { marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    actionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
    actionSubtitle: { fontSize: 12, fontWeight: '500' },

    remarkInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        minHeight: 70,
        textAlignVertical: 'top',
        fontSize: 13,
        marginBottom: 12,
    },

    actionButtons: { flexDirection: 'row', gap: 10 },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    approveButton: { backgroundColor: '#10B981' },
    rejectButton: { backgroundColor: '#EF4444' },
    actionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
        borderRadius: 14,
        marginTop: 20,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 14, marginBottom: 5 },
    emptySubtitle: { fontSize: 13, textAlign: 'center' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    modalSubtitle: { fontSize: 13, marginBottom: 12 },

    cancelButton: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { fontSize: 14, fontWeight: '600' },
});
