import { CheckCircle, ChevronDown, Filter } from 'lucide-react-native';
import { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '@shared/theme';

interface SelectFieldOption {
    value: string;
    label: string;
    icon?: React.ComponentType<any>;
}

interface SelectFieldProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectFieldOption[];
    placeholder?: string;
    isCompact?: boolean;
    containerStyle?: any;
    buttonStyle?: any;
    textStyle?: any;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onValueChange,
    options = [],
    placeholder = 'Select an option',
    isCompact = false,
    containerStyle,
    buttonStyle,
    textStyle,
}) => {
    const theme = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((o) => o.value === value) || { label: placeholder };

    const handleSelect = (selectedValue: string) => {
        onValueChange && onValueChange(selectedValue);
        setModalVisible(false);
    };

    const renderItem = ({ item }: { item: SelectFieldOption }) => {
        const IconComponent = item.icon;
        const isSelected = item.value === value;

        return (
            <TouchableOpacity
                style={[
                    styles.option,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
                onPress={() => handleSelect(item.value)}
            >
                <View style={styles.optionContent}>
                    {IconComponent && (
                        <View style={[
                            styles.optionIconContainer,
                            { backgroundColor: theme.colors.primary + '20' },
                            isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }
                        ]}>
                            <IconComponent size={18} color={isSelected ? '#FFFFFF' : theme.colors.primary} />
                        </View>
                    )}

                    <Text
                        style={[
                            styles.optionText,
                            { color: theme.colors.text },
                            isSelected && { color: '#FFFFFF', fontWeight: '700' }
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.label}
                    </Text>

                    {isSelected && <CheckCircle size={16} color="#10B981" style={styles.checkIcon} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.inputContainer, containerStyle]}>
            {label ? <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text> : null}

            <TouchableOpacity
                style={[
                    styles.selectButton,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    value && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
                    isCompact && styles.selectButtonCompact,
                    buttonStyle,
                ]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <View style={styles.selectContent}>
                    {'icon' in selectedOption && selectedOption.icon && !isCompact && (
                        <View style={[styles.selectIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <selectedOption.icon size={18} color={theme.colors.primary} />
                        </View>
                    )}

                    <Text
                        style={[
                            styles.selectText,
                            { color: theme.colors.text },
                            !value && { color: theme.colors.textTertiary, fontWeight: '500' },
                            'icon' in selectedOption && selectedOption.icon && !isCompact && styles.selectTextWithIcon,
                            isCompact && styles.selectTextCompact,
                            textStyle,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {selectedOption.label}
                    </Text>
                </View>

                <View style={styles.chevronContainer}>
                    <ChevronDown size={20} color={theme.colors.textSecondary} />
                </View>
            </TouchableOpacity>

            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <View style={styles.modalTitleContainer}>
                                <Filter size={20} color={theme.colors.primary} />
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select {label}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList data={options} renderItem={renderItem} keyExtractor={(item) => String(item.value)} style={styles.optionsList} showsVerticalScrollIndicator={false} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16
    },
    label: {
        color: '#374151',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        minHeight: 50,
    },
    selectButtonSelected: {
        borderColor: '#6366F1',
        backgroundColor: '#F8FAFF',
    },
    selectButtonCompact: {
        paddingHorizontal: 12,
        minHeight: 48,
    },
    selectContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectIconContainer: {
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    selectText: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '600',
        flex: 1,
    },
    selectTextWithIcon: {
        marginLeft: 0
    },
    selectTextCompact: {
        fontSize: 14,
        fontWeight: '700',
    },
    placeholderText: {
        color: '#9CA3AF',
        fontWeight: '500',
    },
    chevronContainer: {
        marginLeft: 12,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
        elevation: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: 10,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#6B7280',
        fontWeight: '700'
    },

    // Options
    optionsList: {
        maxHeight: 400,
        padding: 12,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    selectedOption: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionIconContainer: {
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    selectedOptionIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    optionText: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '600',
        flex: 1,
    },
    selectedOptionText: {
        color: '#FFFFFF',
        fontWeight: '700'
    },
    checkIcon: {
        marginLeft: 8,
    },
});
