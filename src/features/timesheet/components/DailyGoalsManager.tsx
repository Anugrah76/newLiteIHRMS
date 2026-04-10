import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Pressable,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday, isBefore, startOfDay, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import { Target, CheckCircle, Circle, Plus, Trash2, X, Tag, Send, ClipboardList, Calendar, Bookmark } from 'lucide-react-native';
import { useTheme } from '@shared/theme';
import {
    DailyGoal,
    DailyGoalsStorage,
    loadGoalsForDate,
    addGoal,
    updateGoal,
    deleteGoal,
    saveGoalsForDate,
    carryOverIncompleteGoals,
} from '../utils/DailyGoalsStorage';

interface DailyGoalsManagerProps {
    date: Date;
    kraList: Array<{
        kra_id: string;
        name: string;
        category_name: string;
    }>;
    onAddToKra: (kraId: string, goalText: string) => void;
    isSubmitted?: boolean;
}

export const DailyGoalsManager: React.FC<DailyGoalsManagerProps> = ({
    date,
    kraList,
    onAddToKra,
    isSubmitted = false,
}) => {
    const theme = useTheme();
    const router = useRouter();
    const [goals, setGoals] = useState<DailyGoal[]>([]);
    const [inputText, setInputText] = useState('');
    const [showKraModal, setShowKraModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<DailyGoal | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load goals on date change
    useEffect(() => {
        loadGoalsData();
    }, [date]);

    // Auto carry-over from previous day
    useEffect(() => {
        if (isToday(date)) {
            autoCarryOverFromYesterday();
        }
    }, [date]);

    const loadGoalsData = async () => {
        setIsLoading(true);
        try {
            const data = await loadGoalsForDate(date);
            setGoals(data.goals);
        } catch (error) {
            console.error('Failed to load goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const autoCarryOverFromYesterday = async () => {
        const yesterday = subDays(date, 1);
        const carriedCount = await carryOverIncompleteGoals(yesterday, date);
        if (carriedCount > 0) {
            // Reload to show carried goals
            loadGoalsData();
        }
    };

    const handleAddGoal = async () => {
        if (!inputText.trim() || isSubmitted) return;

        try {
            const newGoal = await addGoal(date, inputText.trim());
            setGoals(prev => [...prev, newGoal]);
            setInputText('');
        } catch (error) {
            console.error('Failed to add goal:', error);
        }
    };

       const handleToggleComplete = async (goalId: string) => {
        if (isSubmitted) return;

        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newCompletedState = !goal.completed;

        try {
            await updateGoal(date, goalId, { completed: newCompletedState });
            setGoals(prev =>
                prev.map(g =>
                    g.id === goalId ? { ...g, completed: newCompletedState } : g
                )
            );

            // Show KRA modal when marking as complete
            if (newCompletedState && kraList.length > 0) {
                setSelectedGoal({ ...goal, completed: true });
                setShowKraModal(true);
            }
        } catch (error) {
            console.error('Failed to toggle goal:', error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (isSubmitted) return;

        try {
            await deleteGoal(date, goalId);
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

            await updateGoal(date, selectedGoal.id, {
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

    const handleSubmitToTimesheet = async () => {
        // Get all mapped goals
        const mappedGoals = goals.filter(g => g.completed && (g.mappedKraId || g.isAdditionalTask));

        if (mappedGoals.length === 0) return;

        // Group by KRA
        const kraMoves: Record<string, string[]> = {};
        const additionalTaskMoves: string[] = [];

        mappedGoals.forEach(g => {
            if (g.isAdditionalTask) {
                additionalTaskMoves.push(g.text);
            } else if (g.mappedKraId) {
                if (!kraMoves[g.mappedKraId]) {
                    kraMoves[g.mappedKraId] = [];
                }
                kraMoves[g.mappedKraId].push(g.text);
            }
        });

        // Navigate to timesheet with data
        router.push({
            pathname: '/timesheet',
            params: {
                goalSubmission: JSON.stringify({
                    kraMoves,
                    additionalTaskMoves,
                    date: format(date, 'yyyy-MM-dd')
                })
            }
        });

        // Clear all goals for this date after navigation
        setTimeout(async () => {
            await DailyGoalsStorage.clearGoalsForDate(date);
            // Refresh the goals display
            loadGoalsData();
        }, 1000);
    };

    const handleSkipKra = () => {
        setShowKraModal(false);
        setSelectedGoal(null);
    };

    const completedCount = goals.filter(g => g.completed).length;
    const totalCount = goals.length;
    const hasGoals = totalCount > 0;
    const hasMappedGoals = goals.some(g => g.completed && (g.mappedKraId || g.isAdditionalTask));

    // Get gradient colors based on time of day
    const getTimeBasedGradient = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            // Morning (5 AM - 12 PM): Soft sunrise colors
            return theme.isDark

                ? ['#A8EDEA', '#87CEEB', '#B0E0E6'] as const
                : ['#B8E6F0', '#A8D8EA', '#C8E6F5'] as const;

        } else if (hour >= 12 && hour < 17) {

            // Afternoon (12 PM - 5 PM): Warm daylight colors
            return theme.isDark
                ? ['#FF9A8B', '#FFB6A3', '#FFDAC1'] as const
                : ['#FFE5B4', '#FFD4A3', '#FFC48C'] as const;
        } else if (hour >= 17 && hour < 21) {
            // Evening (5 PM - 9 PM): Sunset colors
            return theme.isDark
                ? ['#FFB88C', '#FF9A8B', '#EF8481'] as const
                : ['#FFDAB9', '#FFCBA4', '#FFB88C'] as const;
        } else {
            // Night (9 PM - 5 AM): Cool night colors
            return theme.isDark
                ? ['#667EEA', '#764BA2', '#8B7FC7'] as const
                : ['#C5CAE9', '#B39DDB', '#9FA8DA'] as const;
        }
    };

    const gradientColors = getTimeBasedGradient();
    // Use dark text for light backgrounds
    const textColor = '#2D3748';

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
                            <Target size={24} color={textColor} />
                            <View>
                                <Text style={[styles.title, { color: textColor }]}>Daily Goals</Text>
                                {hasGoals && (
                                    <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>
                                        {completedCount}/{totalCount} completed
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Goals List */}
                    {hasGoals ? (
                        <ScrollView
                            style={styles.goalsList}
                            contentContainerStyle={styles.goalsListContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {goals.map(goal => (
                                <View
                                    key={goal.id}
                                    style={[
                                        styles.goalItem,
                                        goal.completed && styles.goalItemCompleted,
                                    ]}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleToggleComplete(goal.id)}
                                        style={styles.checkbox}
                                        disabled={isSubmitted}
                                    >
                                        {goal.completed ? (
                                            <CheckCircle size={24} color="#10b981" />
                                        ) : (
                                            <Circle size={24} color="rgba(255, 255, 255, 0.7)" />
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.goalContent}>
                                        <Text
                                            style={[
                                                styles.goalText,
                                                goal.completed && styles.goalTextCompleted,
                                            ]}
                                        >
                                            {goal.text}
                                        </Text>

                                        {/* Badges */}
                                        <View style={styles.badges}>
                                            {goal.carriedOver && (
                                                <View style={styles.badge}>
                                                    <Calendar size={10} color="#FFFFFF" />
                                                    <Text style={styles.badgeText}>
                                                        Carried Over
                                                    </Text>
                                                </View>
                                            )}
                                            {goal.addedToKra && (
                                                <View style={[styles.badge, styles.badgeKra]}>
                                                    <Tag size={10} color="#8b5cf6" />
                                                    <Text style={[styles.badgeText, styles.badgeKraText]}>
                                                        Added to KRA
                                                    </Text>
                                                </View>
                                            )}
                                            {goal.mappedKraId && (() => {
                                                const kra = kraList.find(k => k.kra_id === goal.mappedKraId);
                                                return kra ? (
                                                    <View style={[styles.badge, styles.badgePending]}>
                                                        <Bookmark size={10} color="#000" />
                                                        <Text style={[styles.badgeText, styles.badgePendingText]}>
                                                            {kra.name}
                                                        </Text>
                                                    </View>
                                                ) : null;
                                            })()}
                                            {goal.isAdditionalTask && (
                                                <View style={[styles.badge, styles.badgePending]}>
                                                    <ClipboardList size={10} color="#000" />
                                                    <Text style={[styles.badgeText, styles.badgePendingText]}>
                                                        Additional Task
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {!isSubmitted && (
                                        <TouchableOpacity
                                            onPress={() => handleDeleteGoal(goal.id)}
                                            style={styles.deleteButton}
                                        >
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No goals set for {isToday(date) ? 'today' : 'this day'}
                            </Text>
                            <Text style={styles.emptySubtext}>Add your first goal below!</Text>
                        </View>
                    )}

                    {/* Input Section */}
                    {!isSubmitted && (
                        <View style={styles.inputSection}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Add a new goal..."
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                onSubmitEditing={handleAddGoal}
                                returnKeyType="done"
                                multiline={false}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    !inputText.trim() && styles.addButtonDisabled,
                                ]}
                                onPress={handleAddGoal}
                                disabled={!inputText.trim()}
                            >
                                <Plus size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {isSubmitted && (
                        <View style={[styles.submittedBanner, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(45, 55, 72, 0.1)' }]}>
                            <Text style={[styles.submittedText, { color: textColor }]}>
                                ✓ Timesheet submitted - goals are read-only
                            </Text>
                        </View>
                    )}

                    {/* Submit to Timesheet Button */}
                    {hasMappedGoals && !isSubmitted && (
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(45, 55, 72, 0.15)' }]}
                            onPress={handleSubmitToTimesheet}
                        >
                            <Send size={18} color={textColor} />
                            <Text style={[styles.submitButtonText, { color: textColor }]}>Submit to Timesheet</Text>
                        </TouchableOpacity>
                    )}
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
                            <View>
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
                            {/* Additional Task Option */}
                            <TouchableOpacity
                                style={[
                                    styles.kraItem,
                                    styles.additionalTaskItem,
                                    { borderBottomColor: theme.colors.border },
                                ]}
                                onPress={() => handleSelectKra('ADDITIONAL_TASK')}
                            >
                                <ClipboardList size={20} color={theme.colors.primary} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.kraName, { color: theme.colors.text }]}>
                                        Additional Task
                                    </Text>
                                    <Text style={[styles.kraCategory, { color: theme.colors.textSecondary }]}>
                                        Add to general daily tasks
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Regular KRAs */}
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
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
        fontWeight: '500',
    },
    goalsList: {
        maxHeight: 300,
    },
    goalsListContent: {
        gap: 10,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
        gap: 12,
        backdropFilter: 'blur(10px)',
    },
    goalItemCompleted: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    checkbox: {
        paddingTop: 2,
    },
    goalContent: {
        flex: 1,
        gap: 6,
    },
    goalText: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 20,
        fontWeight: '500',
    },
    goalTextCompleted: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    badgeKra: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    badgeText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    badgeKraText: {
        color: '#8b5cf6',
    },
    badgePending: {
        backgroundColor: 'rgba(255, 193, 7, 0.9)',
    },
    badgePendingText: {
        color: '#000',
    },
    deleteButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyText: {
        fontSize: 16,
        color: '#00000000',
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0)',
    },
    inputSection: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.4,
    },
    submittedBanner: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    submittedText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#00000000',
        textAlign: 'center',
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
        maxHeight: '70%',
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
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    kraList: {
        paddingHorizontal: 20,
        maxHeight: 400,
    },
    kraItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    kraName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    kraCategory: {
        fontSize: 14,
    },
    skipButton: {
        marginHorizontal: 20,
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        padding: 14,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    additionalTaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
