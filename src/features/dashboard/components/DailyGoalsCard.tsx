import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { Target, CheckCircle, Circle, Plus, Trash2, Maximize2, X } from 'lucide-react-native';
import { useTheme } from '@shared/theme';
import {
    DailyGoal,
    loadGoalsForDate,
    addGoal,
    updateGoal,
    deleteGoal,
} from '@features/timesheet/utils/DailyGoalsStorage';

interface DailyGoalsCardProps {
    maxVisible?: number;
    onExpand: () => void;
    kraList?: Array<{
        kra_id: string;
        name: string;
        category_name: string;
    }>;
    showExpandButton?: boolean;
}

export const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
    maxVisible = 4,
    onExpand,
    kraList = [],
    showExpandButton = true,
}) => {
    const theme = useTheme();
    const [goals, setGoals] = useState<DailyGoal[]>([]);
    const [inputText, setInputText] = useState('');
    const [showKraModal, setShowKraModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<DailyGoal | null>(null);
    const today = new Date();

    useEffect(() => {
        loadGoalsData();
    }, []);

    const loadGoalsData = async () => {
        try {
            const data = await loadGoalsForDate(today);
            setGoals(data.goals);
        } catch (error) {
            console.error('Failed to load goals:', error);
        }
    };

    const handleAddGoal = async () => {
        if (!inputText.trim()) return;

        try {
            const newGoal = await addGoal(today, inputText.trim());
            const updatedGoals = [...goals, newGoal];
            setGoals(updatedGoals);
            setInputText('');

            // Auto-expand if reaching 5th goal
            if (updatedGoals.length > maxVisible) {
                onExpand();
            }
        } catch (error) {
            console.error('Failed to add goal:', error);
        }
    };

    const handleToggleComplete = async (goalId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newCompletedState = !goal.completed;

        try {
            await updateGoal(today, goalId, { completed: newCompletedState });
            setGoals(prev =>
                prev.map(g =>
                    g.id === goalId ? { ...g, completed: newCompletedState } : g
                )
            );

            // Show KRA modal when marking as complete (if KRAs available)
            if (newCompletedState && kraList.length > 0) {
                setSelectedGoal({ ...goal, completed: true });
                setShowKraModal(true);
            }
        } catch (error) {
            console.error('Failed to toggle goal:', error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        try {
            await deleteGoal(today, goalId);
            setGoals(prev => prev.filter(g => g.id !== goalId));
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    const handleSelectKra = async (kraId: string) => {
        if (!selectedGoal) return;

        try {
            // Buffer the selection - don't add to timesheet yet
            const isAdditional = kraId === 'ADDITIONAL_TASK';

            await updateGoal(today, selectedGoal.id, {
                mappedKraId: isAdditional ? undefined : kraId,
                isAdditionalTask: isAdditional,
            });

            // Update local state
            setGoals(prev =>
                prev.map(g =>
                    g.id === selectedGoal.id
                        ? {
                            ...g,
                            mappedKraId: isAdditional ? undefined : kraId,
                            isAdditionalTask: isAdditional
                        }
                        : g
                )
            );

            setShowKraModal(false);
            setSelectedGoal(null);
        } catch (error) {
            console.error('Failed to map goal:', error);
        }
    };

    const handleSkipKra = () => {
        setShowKraModal(false);
        setSelectedGoal(null);
    };

    const visibleGoals = goals.slice(0, maxVisible);
    const completedCount = goals.filter(g => g.completed).length;
    const totalCount = goals.length;
    const hasMore = goals.length > maxVisible;

    // Get gradient colors based on time of day
    // Get gradient colors based on time of day
    const getTimeBasedGradient = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            // Morning: Soft sunrise colors
            return theme.isDark
                ? ['#A8EDEA', '#87CEEB', '#B0E0E6'] as const
                : ['#B8E6F0', '#A8D8EA', '#C8E6F5'] as const;

        } else if (hour >= 12 && hour < 17) {
            // Afternoon: Warm daylight colors
            return theme.isDark
                ? ['#FF9A8B', '#FFB6A3', '#FFDAC1'] as const
                : ['#FFE5B4', '#FFD4A3', '#FFC48C'] as const;

        } else if (hour >= 17 && hour < 21) {
            // Evening: Sunset colors
            return theme.isDark
                ? ['#FFB88C', '#FF9A8B', '#EF8481'] as const
                : ['#FFDAB9', '#FFCBA4', '#FFB88C'] as const;
        } else {
            // Night: Cool night colors
            return theme.isDark
                ? ['#667EEA', '#764BA2', '#8B7FC7'] as const
                : ['#C5CAE9', '#B39DDB', '#9FA8DA'] as const;
        }
    };

    const gradientColors = getTimeBasedGradient();
    // Use dark text for light backgrounds
    const textColor = theme.isDark ? '#FFFFFF' : '#2D3748';

    return (
        <>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Target size={20} color={textColor} />
                            <View>
                                <Text style={[styles.title, { color: textColor }]}>Daily Goals</Text>
                                {totalCount > 0 && (
                                    <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>
                                        {completedCount}/{totalCount} completed
                                    </Text>
                                )}
                            </View>
                        </View>
                        {showExpandButton && (
                            <TouchableOpacity onPress={onExpand} style={styles.expandButton}>
                                <Maximize2 size={20} color={textColor} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Goals List */}
                    {visibleGoals.length > 0 ? (
                        <View style={styles.goalsList}>
                            {visibleGoals.map(goal => (
                                <View key={goal.id} style={styles.goalItem}>
                                    <TouchableOpacity
                                        onPress={() => handleToggleComplete(goal.id)}
                                        style={styles.checkbox}
                                    >
                                        {goal.completed ? (
                                            <CheckCircle size={20} color="#10b981" />
                                        ) : (
                                            <Circle size={20} color="rgba(0, 0, 0, 0.7)" />
                                        )}
                                    </TouchableOpacity>

                                    <Text
                                        style={[
                                            styles.goalText,
                                            goal.completed && styles.goalTextCompleted,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {goal.text}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => handleDeleteGoal(goal.id)}
                                        style={styles.deleteButton}
                                    >
                                        <Trash2 size={16} color="rgba(239, 68, 68, 0.9)" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {hasMore && (
                                <TouchableOpacity onPress={onExpand} style={styles.viewMoreButton}>
                                    <Text style={styles.viewMoreText}>
                                        +{goals.length - maxVisible} more goal{goals.length - maxVisible > 1 ? 's' : ''}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No goals for today</Text>
                        </View>
                    )}

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Add a new goal..."
                            placeholderTextColor="rgba(0, 0, 0, 0.6)"
                            onSubmitEditing={handleAddGoal}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                !inputText.trim() && styles.addButtonDisabled,
                            ]}
                            onPress={handleAddGoal}
                            disabled={!inputText.trim()}
                        >
                            <Plus size={20} color="#000000ff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* KRA Selection Modal */}
            <Modal
                visible={showKraModal}
                transparent
                animationType="slide"
                onRequestClose={handleSkipKra}
            >
                <Pressable style={styles.modalOverlay} onPress={handleSkipKra}>
                    <Pressable
                        style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]}
                        onPress={e => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                    Add Goal to KRA
                                </Text>
                                {selectedGoal && (
                                    <Text
                                        style={[
                                            styles.modalSubtitle,
                                            { color: theme.colors.textSecondary },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        "{selectedGoal.text}"
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={handleSkipKra}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.kraList}>
                            {kraList.map(kra => (
                                <TouchableOpacity
                                    key={kra.kra_id}
                                    style={[
                                        styles.kraItem,
                                        { borderBottomColor: theme.colors.border },
                                    ]}
                                    onPress={() => handleSelectKra(kra.kra_id)}
                                >
                                    <View>
                                        <Text style={[styles.kraName, { color: theme.colors.text }]}>
                                            {kra.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.kraCategory,
                                                { color: theme.colors.textSecondary },
                                            ]}
                                        >
                                            {kra.category_name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.skipButton, { borderColor: theme.colors.border }]}
                            onPress={handleSkipKra}
                        >
                            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
                                Skip for now
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    expandButton: {
        padding: 4,
    },
    goalsList: {
        gap: 8,
        marginBottom: 12,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 10,
        gap: 10,
    },
    checkbox: {
        paddingRight: 2,
    },
    goalText: {
        flex: 1,
        fontSize: 14,
        color: '#000000ff',
        fontWeight: '500',
    },
    goalTextCompleted: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    deleteButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(9, 9, 9, 1)',
    },
    inputSection: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#FFFFFF',
    },
    addButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.4,
    },
    viewMoreButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    viewMoreText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    kraList: {
        paddingHorizontal: 20,
        maxHeight: 300,
    },
    kraItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    kraName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    kraCategory: {
        fontSize: 13,
    },
    skipButton: {
        marginHorizontal: 20,
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
