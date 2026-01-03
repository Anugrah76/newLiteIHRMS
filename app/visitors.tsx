import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useAllVisitors, useApproveRejectVisitor, type Visitor } from '@features/visitors/api/visitorsApi';
import {
    User, CheckCircle, XCircle, Clock, Calendar, Phone, FileText,
    Shield, Thermometer, Search
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onPress }: { checked: boolean; onPress: (e?: any) => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <CheckCircle size={16} color="#FFFFFF" strokeWidth={2} />}
    </TouchableOpacity>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status?.toString()) {
            case "2": return { text: "Approved", color: "#10B981", bg: "#D1FAE5", border: "#34D399", icon: CheckCircle };
            case "1": return { text: "Pending", color: "#F59E0B", bg: "#FEF3C7", border: "#FBBF24", icon: Clock };
            case "3": return { text: "Rejected", color: "#EF4444", bg: "#FEE2E2", border: "#F87171", icon: XCircle };
            default: return { text: "Pending", color: "#F59E0B", bg: "#FEF3C7", border: "#FBBF24", icon: Clock };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border, borderWidth: 1 }]}>
            <Icon size={12} color={config.color} style={{ marginRight: 6 }} />
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

// Expandable Visitor Card Component
const VisitorCard = ({ item, isSelected, onToggle, onApprove, onReject, showCheckbox, isProcessing }: {
    item: Visitor;
    isSelected: boolean;
    onToggle: () => void;
    onApprove: () => void;
    onReject: () => void;
    showCheckbox: boolean;
    isProcessing: boolean;
}) => {
    const theme = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    const formatMeetingDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return "N/A";
        try {
            const date = new Date(dateTimeString);
            const datePart = date.toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            const timePart = date.toLocaleString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const formattedTime = timePart.replace(/(am|pm)/i, match => match.toUpperCase());
            return `${datePart}, ${formattedTime}`;
        } catch (error) {
            return dateTimeString;
        }
    };

    const hasSymptoms = item.fever === "1" || item.cough === "1" || item.breathlessness === "1" || item.throat === "1";

    return (
        <View style={[
            styles.card,
            { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border },
            isSelected && styles.cardSelected,
            isProcessing && styles.cardProcessing
        ]}>
            {/* Compact Header */}
            <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
                disabled={isProcessing}
            >
                <View style={styles.compactHeader}>
                    {showCheckbox && (
                        <CustomCheckbox
                            checked={isSelected}
                            onPress={(e: any) => {
                                e?.stopPropagation?.();
                                onToggle();
                            }}
                        />
                    )}

                    {/* Visitor Photo */}
                    {item.profile_picture && (
                        <Image
                            source={{ uri: item.profile_picture }}
                            style={[styles.compactPhoto, isProcessing && styles.disabledImage]}
                            defaultSource={require('@/assets/images/default-avatar.png')}
                        />
                    )}

                    {/* Compact Info */}
                    <View style={styles.compactInfo}>
                        <Text style={[styles.compactName, { color: theme.colors.text }, isProcessing && styles.disabledText]} numberOfLines={1}>
                            {item.first_name} {item.last_name}
                        </Text>
                        <Text style={[styles.compactDate, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                            {formatMeetingDateTime(item.meeting_datetime)}
                        </Text>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.compactBadges}>
                        {isProcessing ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <StatusBadge status={item.status} />
                        )}
                    </View>

                    {/* Expand Icon */}
                    {!isProcessing && (
                        <View style={styles.expandIcon}>
                            <Text style={[styles.expandText, { color: theme.colors.textSecondary }]}>
                                {isExpanded ? '▲' : '▼'}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Expanded Details */}
            {isExpanded && (
                <View style={styles.expandedContent}>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    {/* Meeting Details */}
                    <View style={styles.detailSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Meeting Details</Text>

                        <View style={styles.detailRow}>
                            <User size={16} color={theme.colors.primary} />
                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Contact Person:</Text>
                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.first_name || "N/A"}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Phone size={16} color={theme.colors.primary} />
                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Mobile:</Text>
                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.visitor_mobile || "N/A"}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FileText size={16} color={theme.colors.primary} />
                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Purpose:</Text>
                            <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={2}>{item.purpose || "N/A"}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Clock size={16} color={theme.colors.primary} />
                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Meeting Time:</Text>
                            <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={2}>
                                {formatMeetingDateTime(item.meeting_datetime)}
                            </Text>
                        </View>
                    </View>

                    {/* Health Declaration */}
                    <View style={styles.detailSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Health Declaration</Text>
                        <View style={styles.healthCompact}>
                            <View style={styles.healthBadgeSmall}>
                                <Text style={[styles.healthBadgeLabel, { color: theme.colors.textSecondary }]}>Fever:</Text>
                                <Text style={[
                                    styles.healthBadgeValue,
                                    { color: theme.colors.text },
                                    item.fever === "1" && styles.healthRiskText
                                ]}>
                                    {item.fever === "1" ? "Yes" : "No"}
                                </Text>
                            </View>
                            <View style={styles.healthBadgeSmall}>
                                <Text style={[styles.healthBadgeLabel, { color: theme.colors.textSecondary }]}>Cough:</Text>
                                <Text style={[
                                    styles.healthBadgeValue,
                                    { color: theme.colors.text },
                                    item.cough === "1" && styles.healthRiskText
                                ]}>
                                    {item.cough === "1" ? "Yes" : "No"}
                                </Text>
                            </View>
                            <View style={styles.healthBadgeSmall}>
                                <Text style={[styles.healthBadgeLabel, { color: theme.colors.textSecondary }]}>Breathlessness:</Text>
                                <Text style={[
                                    styles.healthBadgeValue,
                                    { color: theme.colors.text },
                                    item.breathlessness === "1" && styles.healthRiskText
                                ]}>
                                    {item.breathlessness === "1" ? "Yes" : "No"}
                                </Text>
                            </View>
                            <View style={styles.healthBadgeSmall}>
                                <Text style={[styles.healthBadgeLabel, { color: theme.colors.textSecondary }]}>Throat:</Text>
                                <Text style={[
                                    styles.healthBadgeValue,
                                    { color: theme.colors.text },
                                    item.throat === "1" && styles.healthRiskText
                                ]}>
                                    {item.throat === "1" ? "Yes" : "No"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.covidDeclaration}>
                            <Shield size={14} color={item.covid_declaration === "1" ? "#10B981" : "#EF4444"} />
                            <Text style={[styles.covidText, { color: theme.colors.textSecondary }]}>
                                COVID Declaration: {item.covid_declaration === "1" ? "Submitted" : "Not Submitted"}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons for Pending */}
                    {item.status?.toString() === "1" && (
                        <View style={styles.visitorActions}>
                            <TouchableOpacity
                                style={[styles.visitorActionButton, styles.approveButton, isProcessing && styles.buttonDisabled]}
                                onPress={onApprove}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <CheckCircle size={16} color="#FFFFFF" />
                                        <Text style={styles.visitorActionText}>Approve</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.visitorActionButton, styles.rejectButton, isProcessing && styles.buttonDisabled]}
                                onPress={onReject}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <XCircle size={16} color="#FFFFFF" />
                                        <Text style={styles.visitorActionText}>Reject</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default function VisitorsScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Filter State
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    // API Hooks
    const { data: visitorsData, isLoading, refetch } = useAllVisitors({ year, month });
    const { mutate: updateVisitor } = useApproveRejectVisitor();

    const visitorsList = Array.isArray(visitorsData?.data) ? visitorsData.data : [];

    // Filter visitors by tab
    const getFilteredVisitors = () => {
        switch (activeTab) {
            case 'approved': return visitorsList.filter(v => v.status?.toString() === "2");
            case 'pending': return visitorsList.filter(v => v.status?.toString() === "1");
            case 'rejected': return visitorsList.filter(v => v.status?.toString() === "3");
            case 'all':
            default: return visitorsList;
        }
    };

    const filteredVisitors = getFilteredVisitors();

    // Get counts
    const counts = {
        pending: visitorsList.filter(v => v.status?.toString() === "1").length,
        approved: visitorsList.filter(v => v.status?.toString() === "2").length,
        rejected: visitorsList.filter(v => v.status?.toString() === "3").length,
        all: visitorsList.length,
    };

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

    // Selection Handlers
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const pendingVisitors = filteredVisitors.filter(v => v.status?.toString() === "1");
        if (selectedIds.length === pendingVisitors.length && pendingVisitors.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingVisitors.map(item => item.id));
        }
    };

    // Visitor Action Handler
    const handleVisitorAction = async (visitor: Visitor, action: 'approve' | 'reject') => {
        setActionLoading(prev => ({ ...prev, [visitor.id]: true }));

        updateVisitor({
            visitor_id: visitor.visit_id,
            meeting_id: visitor.id,
            status: action === 'approve' ? '2' : '3'
        }, {
            onSuccess: (data) => {
                if (data?.data) {
                    toast.show('success', 'Success', `Visitor ${action}d successfully`);
                    setSelectedIds(prev => prev.filter(id => id !== visitor.id));
                    refetch();
                } else {
                    toast.show('error', 'Failed', data?.message || `Failed to ${action} visitor`);
                }
                setActionLoading(prev => {
                    const newState = { ...prev };
                    delete newState[visitor.id];
                    return newState;
                });
            },
            onError: (error: any) => {
                toast.show('error', 'Error', error.message || 'Network error occurred');
                setActionLoading(prev => {
                    const newState = { ...prev };
                    delete newState[visitor.id];
                    return newState;
                });
            }
        });
    };

    // Bulk Actions
    const handleBulkAction = async (action: 'approve' | 'reject') => {
        if (selectedIds.length === 0) {
            toast.show('info', 'No Selection', `Please select visitors to ${action}`);
            return;
        }

        const selectedVisitors = filteredVisitors.filter(v => selectedIds.includes(v.id));

        for (const visitor of selectedVisitors) {
            await handleVisitorAction(visitor, action);
        }

        toast.show('success', 'Bulk Action Complete', `${selectedIds.length} visitors ${action}d`);
        setSelectedIds([]);
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Visitor Notifications"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Filter Form */}
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <View style={styles.selectRow}>
                        <View style={styles.selectHalf}>
                            <SelectField
                                label="Year"
                                value={year}
                                onValueChange={setYear}
                                options={years}
                            />
                        </View>
                        <View style={styles.selectHalf}>
                            <SelectField
                                label="Month"
                                value={month}
                                onValueChange={setMonth}
                                options={months}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: theme.colors.primary }, isLoading && styles.searchButtonDisabled]}
                        onPress={() => refetch()}
                        disabled={isLoading}
                    >
                        <View style={styles.searchButtonContent}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Search size={20} color="#FFFFFF" />
                            )}
                            <Text style={styles.searchButtonText}>
                                {isLoading ? "Searching..." : "Search Visitors"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                {visitorsList.length > 0 && (
                    <View style={styles.tabContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                                onPress={() => setActiveTab('all')}
                            >
                                <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === 'all' && { color: theme.colors.primary }]}>
                                    All ({counts.all})
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'pending' && styles.tabActivePending]}
                                onPress={() => setActiveTab('pending')}
                            >
                                <Clock size={16} color={activeTab === 'pending' ? "#F59E0B" : theme.colors.textSecondary} />
                                <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === 'pending' && { color: "#F59E0B" }]}>
                                    Pending ({counts.pending})
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'approved' && styles.tabActiveApproved]}
                                onPress={() => setActiveTab('approved')}
                            >
                                <CheckCircle size={16} color={activeTab === 'approved' ? "#10B981" : theme.colors.textSecondary} />
                                <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === 'approved' && { color: "#10B981" }]}>
                                    Approved ({counts.approved})
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'rejected' && styles.tabActiveRejected]}
                                onPress={() => setActiveTab('rejected')}
                            >
                                <XCircle size={16} color={activeTab === 'rejected' ? "#EF4444" : theme.colors.textSecondary} />
                                <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === 'rejected' && { color: "#EF4444" }]}>
                                    Rejected ({counts.rejected})
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* Bulk Actions */}
                {activeTab === 'pending' && selectedIds.length > 0 && (
                    <View style={[styles.bulkActions, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.bulkHeader}>
                            <CustomCheckbox
                                checked={selectedIds.length === filteredVisitors.filter(v => v.status === "1").length}
                                onPress={toggleSelectAll}
                            />
                            <Text style={[styles.bulkText, { color: theme.colors.text }]}>
                                {selectedIds.length} selected
                            </Text>
                        </View>
                        <View style={styles.bulkButtons}>
                            <TouchableOpacity
                                style={[styles.bulkButton, styles.approveButton]}
                                onPress={() => handleBulkAction('approve')}
                            >
                                <CheckCircle size={16} color="#FFFFFF" />
                                <Text style={styles.bulkButtonText}>Approve All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bulkButton, styles.rejectButton]}
                                onPress={() => handleBulkAction('reject')}
                            >
                                <XCircle size={16} color="#FFFFFF" />
                                <Text style={styles.bulkButtonText}>Reject All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Visitors List */}
                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading visitors...</Text>
                    </View>
                ) : filteredVisitors.length > 0 ? (
                    filteredVisitors.map((visitor) => (
                        <VisitorCard
                            key={visitor.id}
                            item={visitor}
                            isSelected={selectedIds.includes(visitor.id)}
                            onToggle={() => toggleSelection(visitor.id)}
                            onApprove={() => handleVisitorAction(visitor, 'approve')}
                            onReject={() => handleVisitorAction(visitor, 'reject')}
                            showCheckbox={activeTab === 'pending'}
                            isProcessing={actionLoading[visitor.id] || false}
                        />
                    ))
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.colors.cardPrimary }]}>
                        <User size={64} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Visitors Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                            {activeTab === 'pending' ? 'No pending visitor requests' : `No ${activeTab} visitors for this period`}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: { padding: 16, paddingBottom: 40 },
    formCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
    selectRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    selectHalf: { flex: 1 },
    searchButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    searchButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    searchButtonDisabled: { opacity: 0.6 },

    tabContainer: { marginBottom: 16 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6' },
    tabActive: { backgroundColor: '#EEF2FF' },
    tabActivePending: { backgroundColor: '#FEF3C7' },
    tabActiveApproved: { backgroundColor: '#D1FAE5' },
    tabActiveRejected: { backgroundColor: '#FEE2E2' },
    tabText: { fontSize: 14, fontWeight: '600' },

    bulkActions: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
    bulkHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    bulkText: { fontSize: 15, fontWeight: '600' },
    bulkButtons: { flexDirection: 'row', gap: 10 },
    bulkButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 8 },
    bulkButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    card: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    cardSelected: { borderColor: '#6366F1', borderWidth: 2, backgroundColor: '#EEF2FF' },
    cardProcessing: { opacity: 0.6 },

    compactHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    compactPhoto: { width: 48, height: 48, borderRadius: 24 },
    compactInfo: { flex: 1 },
    compactName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    compactDate: { fontSize: 12, fontWeight: '500' },
    compactBadges: { marginRight: 8 },
    expandIcon: { padding: 4 },
    expandText: { fontSize: 12 },

    expandedContent: { marginTop: 12 },
    divider: { height: 1, marginBottom: 12 },
    detailSection: { marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    detailLabel: { fontSize: 13, fontWeight: '600', width: 120 },
    detailValue: { flex: 1, fontSize: 13, fontWeight: '500' },

    healthCompact: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    healthBadgeSmall: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    healthBadgeLabel: { fontSize: 12, fontWeight: '600' },
    healthBadgeValue: { fontSize: 12, fontWeight: '500' },
    healthRiskText: { color: '#EF4444', fontWeight: '700' },
    covidDeclaration: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    covidText: { fontSize: 12, fontWeight: '500' },

    visitorActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    visitorActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
    approveButton: { backgroundColor: '#10B981' },
    rejectButton: { backgroundColor: '#EF4444' },
    visitorActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    buttonDisabled: { opacity: 0.6 },

    statusBadge: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignItems: 'center' },
    statusBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

    checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },

    loadingState: { paddingVertical: 60, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 14 },
    emptyState: { borderRadius: 14, padding: 40, alignItems: 'center', marginTop: 20 },
    emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 14, marginBottom: 5 },
    emptySubtitle: { fontSize: 13, textAlign: 'center' },

    disabledImage: { opacity: 0.5 },
    disabledText: { opacity: 0.5 },
});
