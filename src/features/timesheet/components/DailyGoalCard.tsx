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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { Target, CheckCircle, X } from 'lucide-react-native';
import { useTheme } from '@shared/theme';

interface DailyGoalCardProps {
    date: Date;
    kraList: Array<{
        kra_id: string;
        name: string;
        category_name: string;
    }>;
    onAddToKra: (kraId: string, goalText: string) => void;
}

interface DailyGoal {
    text: string;
    completed: boolean;
    timestamp: string;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({ date, kraList, onAddToKra }) => {
    const theme = useTheme();
    const [goal, setGoal] = useState<DailyGoal | null>(null);
    const [inputText, setInputText] = useState('');
    const [showKraModal, setShowKraModal] = useState(false);

    const storageKey = `daily_goal_${format(date, 'yyyy-MM-dd')}`;

    // Load goal from AsyncStorage
    useEffect(() => {
        loadGoal();
    }, [date]);

    const loadGoal = async () => {
        try {
            const stored = await AsyncStorage.getItem(storageKey);
            if (stored) {
                setGoal(JSON.parse(stored));
            } else {
                setGoal(null);
                setInputText('');
            }
        } catch (error) {
            console.error('Failed to load goal:', error);
        }
    };

    const saveGoal = async (goalData: DailyGoal) => {
        try {
            await AsyncStorage.setItem(storageKey, JSON.stringify(goalData));
            setGoal(goalData);
        } catch (error) {
            console.error('Failed to save goal:', error);
        }
    };

    const handleSetGoal = () => {
        if (!inputText.trim()) return;
        const newGoal: DailyGoal = {
            text: inputText.trim(),
            completed: false,
            timestamp: new Date().toISOString(),
        };
        saveGoal(newGoal);
        setInputText('');
    };

    const handleMarkComplete = () => {
        if (!goal) return;
        saveGoal({ ...goal, completed: true });
    };

    const handleSelectKra = (kraId: string) => {
        if (!goal) return;
        onAddToKra(kraId, goal.text);
        setShowKraModal(false);
    };

    // Input Mode
    if (!goal) {
        return (
            <LinearGradient
                colors={theme.isDark ? ['#1e3a8a', '#3b82f6'] : ['#3b82f6', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.cardContent}>
                    <View style={styles.header}>
                        <Target size={24} color="#FFFFFF" />
                        <Text style={styles.title}>What's your main goal for today?</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Enter your goal..."
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.button, !inputText.trim() && styles.buttonDisabled]}
                        onPress={handleSetGoal}
                        disabled={!inputText.trim()}
                    >
                        <Text style={styles.buttonText}>Set Goal</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // Active Mode
    if (!goal.completed) {
        return (
            <LinearGradient
                colors={theme.isDark ? ['#0f766e', '#14b8a6'] : ['#14b8a6', '#5eead4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.cardContent}>
                    <View style={styles.header}>
                        <Target size={24} color="#FFFFFF" />
                        <Text style={styles.title}>Today's Goal</Text>
                    </View>
                    <Text style={styles.goalText}>{goal.text}</Text>
                    <TouchableOpacity style={styles.button} onPress={handleMarkComplete}>
                        <CheckCircle size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Mark Complete</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // Completed Mode
    return (
        <>
            <LinearGradient
                colors={theme.isDark ? ['#15803d', '#22c55e'] : ['#22c55e', '#86efac']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.cardContent}>
                    <View style={styles.header}>
                        <CheckCircle size={24} color="#FFFFFF" />
                        <Text style={styles.title}>Goal Completed! 🎉</Text>
                    </View>
                    <Text style={styles.goalText}>{goal.text}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => setShowKraModal(true)}>
                        <Text style={styles.buttonText}>Add to KRA Comment</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* KRA Selection Modal */}
            <Modal
                visible={showKraModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowKraModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowKraModal(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.cardPrimary }]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select KRA</Text>
                            <TouchableOpacity onPress={() => setShowKraModal(false)}>
                                <X size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.kraList}>
                            {kraList.map((kra) => (
                                <TouchableOpacity
                                    key={kra.kra_id}
                                    style={[styles.kraItem, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => handleSelectKra(kra.kra_id)}
                                >
                                    <Text style={[styles.kraName, { color: theme.colors.text }]}>{kra.name}</Text>
                                    <Text style={[styles.kraCategory, { color: theme.colors.textSecondary }]}>
                                        {kra.category_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    cardContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#FFFFFF',
        minHeight: 60,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    goalText: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 16,
        lineHeight: 24,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
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
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    kraList: {
        paddingHorizontal: 20,
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
});
