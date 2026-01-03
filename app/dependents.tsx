import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
    Platform,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useDependents, useAddDependent, useUpdateDependent, useDeleteDependent } from '@features/dependents/hooks';
import { User, Calendar, Phone, Trash2, Plus, X, Edit2, Users, Award, CreditCard } from 'lucide-react-native';

export default function DependentsScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Male');
    const [contact, setContact] = useState('');
    const [age, setAge] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [nominee, setNominee] = useState(false);

    const { data: dependents, isLoading, refetch } = useDependents();
    const { mutate: addDependent, isPending: isAdding } = useAddDependent();
    const { mutate: updateDependent, isPending: isUpdating } = useUpdateDependent();
    const { mutate: deleteDependent, isPending: isDeleting } = useDeleteDependent();

    const relationOptions = [
        { label: 'Father', value: 'Father', icon: User },
        { label: 'Mother', value: 'Mother', icon: User },
        { label: 'Spouse', value: 'Spouse', icon: User },
        { label: 'Son', value: 'Son', icon: User },
        { label: 'Daughter', value: 'Daughter', icon: User },
        { label: 'Brother', value: 'Brother', icon: User },
        { label: 'Sister', value: 'Sister', icon: User },
    ];

    const genderOptions = ['Male', 'Female', 'Other'];

    const totalDependents = dependents?.data?.length || 0;
    const nomineeCount = dependents?.data?.filter(d => d.nominee === 'Yes').length || 0;

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setRelationship('');
        setDob('');
        setGender('Male');
        setContact('');
        setAge('');
        setAadhar('');
        setNominee(false);
        setIsEditing(false);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (dep: any) => {
        setEditingId(dep.dependent_id);
        setName(dep.dependent_name);
        setRelationship(dep.relationship);
        setDob(dep.date_of_birth);
        setGender(dep.gender || 'Male');
        setContact(dep.phone || '');
        setAge(dep.dependent_age || '');
        setAadhar(dep.aadhar_number || '');
        setNominee(dep.nominee === 'Yes');
        setIsEditing(true);
        setModalVisible(true);
    };

    const handleSubmit = () => {
        if (!name || !relationship || !dob) {
            toast.show('error', 'Validation Error', 'Please fill required fields');
            return;
        }

        const payload = {
            dependent_name: name,
            relationship,
            date_of_birth: dob,
            gender,
            phone: contact,
            dependent_age: age,
            aadhar_number: aadhar,
            nominee: nominee ? 'Yes' : 'No'
        };

        if (isEditing && editingId) {
            updateDependent({ dependentId: editingId, data: payload }, {
                onSuccess: (data) => {
                    if (data.status === 1) {
                        toast.show('success', 'Success', 'Dependent updated successfully');
                        setModalVisible(false);
                        resetForm();
                        refetch();
                    } else {
                        toast.show('error', 'Failed', data.message || 'Could not update dependent');
                    }
                },
                onError: () => toast.show('error', 'Error', 'Network error occurred')
            });
        } else {
            addDependent(payload, {
                onSuccess: (data) => {
                    if (data.status === 1) {
                        toast.show('success', 'Success', 'Dependent added successfully');
                        setModalVisible(false);
                        resetForm();
                        refetch();
                    } else {
                        toast.show('error', 'Failed', data.message || 'Could not add dependent');
                    }
                },
                onError: () => toast.show('error', 'Error', 'Network error occurred')
            });
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Dependent',
            `Are you sure you want to delete ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteDependent(id, {
                            onSuccess: (data) => {
                                if (data.status === 1) {
                                    toast.show('success', 'Success', 'Dependent deleted');
                                    refetch();
                                } else {
                                    toast.show('error', 'Failed', data.message || 'Could not delete dependent');
                                }
                            }
                        });
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return dateString;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDob(`${day}-${month}-${year}`);
        }
    };

    const CustomCheckbox = ({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) => (
        <TouchableOpacity
            onPress={() => onValueChange(!value)}
            style={[styles.checkbox, value && styles.checkboxChecked]}
        >
            {value && <View style={styles.checkboxTick} />}
        </TouchableOpacity>
    );

    const StatsCard = ({ title, count, icon: IconComponent, color }: any) => (
        <View style={[styles.statsCard, { borderTopColor: color, backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
            <View style={styles.statsHeader}>
                <View style={[styles.statsIcon, { backgroundColor: color + '15' }]}>
                    <IconComponent size={24} color={color} />
                </View>
                <View style={styles.statsContent}>
                    <Text style={[styles.statsCount, { color: theme.colors.text }]}>{count}</Text>
                    <Text style={[styles.statsTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <CorporateBackground>
            <TopBar
                title="Dependents"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <StatsCard title="Total Dependents" count={totalDependents} icon={Users} color="#6366F1" />
                    <StatsCard title="Nominees" count={nomineeCount} icon={Award} color="#8B5CF6" />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={openAddModal}
                >
                    <Plus size={20} color="#FFFFFF" style={styles.addButtonIcon} />
                    <Text style={styles.addButtonText}>Add New Dependent</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            Loading dependents...
                        </Text>
                    </View>
                ) : (dependents?.data?.length || 0) > 0 ? (
                    dependents?.data?.map((dep, index) => {
                        const isNominee = dep.nominee === 'Yes';
                        const borderColor = isNominee ? '#8B5CF6' : '#6366F1';

                        return (
                            <View
                                key={index}
                                style={[styles.card, {
                                    backgroundColor: theme.colors.cardPrimary,
                                    borderColor: theme.colors.border,
                                    borderLeftColor: borderColor,
                                    borderLeftWidth: 4
                                }]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.nameContainer}>
                                        <User size={16} color={theme.colors.textSecondary} />
                                        <Text style={[styles.name, { color: theme.colors.text }]}>
                                            {dep.dependent_name}
                                        </Text>
                                    </View>
                                    {isNominee && (
                                        <View style={[styles.nomineeBadge, { backgroundColor: borderColor }]}>
                                            <Award size={12} color="#FFFFFF" />
                                            <Text style={styles.nomineeBadgeText}>Nominee</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Relation:</Text>
                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{dep.relationship}</Text>
                                    </View>
                                    {dep.dependent_age && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Age:</Text>
                                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{dep.dependent_age}</Text>
                                        </View>
                                    )}
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>DOB:</Text>
                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(dep.date_of_birth)}</Text>
                                    </View>
                                    {dep.aadhar_number && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Aadhar:</Text>
                                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{dep.aadhar_number}</Text>
                                        </View>
                                    )}
                                    {dep.phone && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Contact:</Text>
                                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{dep.phone}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
                                        onPress={() => openEditModal(dep)}
                                    >
                                        <Edit2 size={16} color={theme.colors.primary} />
                                        <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
                                        onPress={() => handleDelete(dep.dependent_id, dep.dependent_name)}
                                    >
                                        <Trash2 size={16} color={theme.colors.error} />
                                        <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Users size={64} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Dependents Added</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                            Tap the button above to add your first dependent
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                {isEditing ? 'Edit Dependent' : 'Add Dependent'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X width={24} height={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Full Name"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Relationship *</Text>
                                <SelectField
                                    label="Relationship"
                                    value={relationship}
                                    onValueChange={setRelationship}
                                    options={relationOptions}
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.formGroupHalf}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Age</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        value={age}
                                        onChangeText={setAge}
                                        placeholder="Age"
                                        keyboardType="numeric"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                                <View style={styles.formGroupHalf}>
                                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>DOB *</Text>
                                    <TouchableOpacity
                                        style={[styles.dateButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[dob ? styles.dateText : styles.datePlaceholder, { color: dob ? theme.colors.text : theme.colors.textTertiary }]}>
                                            {dob || 'Select DOB'}
                                        </Text>
                                        <Calendar size={16} color={theme.colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dob ? new Date(dob.split('-').reverse().join('-')) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Aadhar Number</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                    value={aadhar}
                                    onChangeText={setAadhar}
                                    placeholder="Aadhar Number"
                                    keyboardType="numeric"
                                    maxLength={12}
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Gender</Text>
                                <View style={styles.genderRow}>
                                    {genderOptions.map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[
                                                styles.genderOption,
                                                {
                                                    borderColor: theme.colors.border,
                                                    backgroundColor: gender === opt ? theme.colors.primary : theme.colors.surface
                                                }
                                            ]}
                                            onPress={() => setGender(opt)}
                                        >
                                            <Text style={[
                                                styles.genderText,
                                                { color: gender === opt ? '#ffffff' : theme.colors.text }
                                            ]}>{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Contact Number</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                                    value={contact}
                                    onChangeText={setContact}
                                    placeholder="Optional"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.checkboxRow}>
                                <CustomCheckbox value={nominee} onValueChange={setNominee} />
                                <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>Mark as Nominee</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.colors.primary }, (isAdding || isUpdating) && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={isAdding || isUpdating}
                            >
                                {(isAdding || isUpdating) ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.submitText}>{isEditing ? 'Update' : 'Add'} Dependent</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statsCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderTopWidth: 4,
        borderWidth: 1,
    },
    statsHeader: { flexDirection: 'row', alignItems: 'center' },
    statsIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statsContent: { flex: 1 },
    statsCount: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
    statsTitle: { fontSize: 12, fontWeight: '600' },
    addButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonIcon: { marginRight: 8 },
    addButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    loadingContainer: { paddingVertical: 60, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 14 },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    name: { fontSize: 16, fontWeight: '700' },
    nomineeBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    nomineeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    cardBody: { marginBottom: 12, gap: 8 },
    detailRow: { flexDirection: 'row' },
    detailLabel: { width: 80, fontSize: 13, fontWeight: '600' },
    detailValue: { flex: 1, fontSize: 13, fontWeight: '500' },
    cardActions: { flexDirection: 'row', gap: 10 },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
    },
    actionButtonText: { fontSize: 13, fontWeight: '700' },
    emptyCard: {
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    formScroll: { flex: 1 },
    inputGroup: { marginBottom: 16 },
    formRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    formGroupHalf: { flex: 1 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: { fontSize: 14 },
    datePlaceholder: { fontSize: 14 },
    genderRow: { flexDirection: 'row', gap: 8 },
    genderOption: {
        flex: 1,
        borderWidth: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    genderText: { fontSize: 14, fontWeight: '600' },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    checkboxTick: {
        width: 12,
        height: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    checkboxLabel: { fontSize: 15, fontWeight: '600' },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    disabledButton: { opacity: 0.7 },
    submitText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
