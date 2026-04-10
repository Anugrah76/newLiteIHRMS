import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays } from 'date-fns';

export interface DailyGoal {
    id: string;
    text: string;
    completed: boolean;
    timestamp: string;
    addedToKra?: boolean;
    kraId?: string;
    carriedOver?: boolean;

    // Buffer fields for deferred submission
    mappedKraId?: string;       // KRA this goal is buffered for
    isAdditionalTask?: boolean; // Whether buffered for additional task
}

export interface DailyGoalsData {
    date: string;
    goals: DailyGoal[];
}

// Old format for migration
interface OldDailyGoal {
    text: string;
    completed: boolean;
    timestamp: string;
}

const STORAGE_PREFIX = 'daily_goals_';
const OLD_STORAGE_PREFIX = 'daily_goal_'; // Old single-goal format

/**
 * Generate a unique ID for a goal
 */
const generateId = (): string => {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get storage key for a specific date
 */
const getStorageKey = (date: Date): string => {
    return `${STORAGE_PREFIX}${format(date, 'yyyy-MM-dd')}`;
};

/**
 * Load goals for a specific date
 */
export const loadGoalsForDate = async (date: Date): Promise<DailyGoalsData> => {
    try {
        const key = getStorageKey(date);
        const stored = await AsyncStorage.getItem(key);

        if (stored) {
            const data: DailyGoalsData = JSON.parse(stored);
            return data;
        }

        // Try to migrate from old format
        const oldKey = `${OLD_STORAGE_PREFIX}${format(date, 'yyyy-MM-dd')}`;
        const oldStored = await AsyncStorage.getItem(oldKey);

        if (oldStored) {
            const oldGoal: OldDailyGoal = JSON.parse(oldStored);
            const migratedGoal: DailyGoal = {
                id: generateId(),
                text: oldGoal.text,
                completed: oldGoal.completed,
                timestamp: oldGoal.timestamp,
            };

            const newData: DailyGoalsData = {
                date: format(date, 'yyyy-MM-dd'),
                goals: [migratedGoal],
            };

            // Save in new format and delete old
            await saveGoalsForDate(date, newData.goals);
            await AsyncStorage.removeItem(oldKey);

            return newData;
        }

        return {
            date: format(date, 'yyyy-MM-dd'),
            goals: [],
        };
    } catch (error) {
        console.error('Failed to load goals:', error);
        return {
            date: format(date, 'yyyy-MM-dd'),
            goals: [],
        };
    }
};

/**
 * Save goals for a specific date
 */
export const saveGoalsForDate = async (date: Date, goals: DailyGoal[]): Promise<void> => {
    try {
        const key = getStorageKey(date);
        const data: DailyGoalsData = {
            date: format(date, 'yyyy-MM-dd'),
            goals,
        };
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save goals:', error);
        throw error;
    }
};

/**
 * Add a new goal to a specific date
 */
export const addGoal = async (date: Date, goalText: string): Promise<DailyGoal> => {
    const existingData = await loadGoalsForDate(date);
    const newGoal: DailyGoal = {
        id: generateId(),
        text: goalText,
        completed: false,
        timestamp: new Date().toISOString(),
    };

    existingData.goals.push(newGoal);
    await saveGoalsForDate(date, existingData.goals);

    return newGoal;
};

/**
 * Update a specific goal
 */
export const updateGoal = async (date: Date, goalId: string, updates: Partial<DailyGoal>): Promise<void> => {
    const existingData = await loadGoalsForDate(date);
    const goalIndex = existingData.goals.findIndex(g => g.id === goalId);

    if (goalIndex !== -1) {
        existingData.goals[goalIndex] = {
            ...existingData.goals[goalIndex],
            ...updates,
        };
        await saveGoalsForDate(date, existingData.goals);
    }
};

/**
 * Delete a specific goal
 */
export const deleteGoal = async (date: Date, goalId: string): Promise<void> => {
    const existingData = await loadGoalsForDate(date);
    existingData.goals = existingData.goals.filter(g => g.id !== goalId);
    await saveGoalsForDate(date, existingData.goals);
};

/**
 * Carry over incomplete goals from one date to another
 */
export const carryOverIncompleteGoals = async (fromDate: Date, toDate: Date): Promise<number> => {
    try {
        const fromData = await loadGoalsForDate(fromDate);
        const toData = await loadGoalsForDate(toDate);

        // Get incomplete goals that haven't been added to KRA
        const incompleteGoals = fromData.goals.filter(
            goal => !goal.completed && !goal.addedToKra
        );

        if (incompleteGoals.length === 0) {
            return 0;
        }

        // Check if goals already carried over (to prevent duplicates)
        const existingTexts = new Set(toData.goals.map(g => g.text));

        // Create new goals with carried over flag
        const carriedGoals: DailyGoal[] = incompleteGoals
            .filter(goal => !existingTexts.has(goal.text))
            .map(goal => ({
                id: generateId(),
                text: goal.text,
                completed: false,
                timestamp: new Date().toISOString(),
                carriedOver: true,
            }));

        if (carriedGoals.length > 0) {
            toData.goals = [...toData.goals, ...carriedGoals];
            await saveGoalsForDate(toDate, toData.goals);
        }

        return carriedGoals.length;
    } catch (error) {
        console.error('Failed to carry over goals:', error);
        return 0;
    }
};

/**
 * Get incomplete goals count for a date
 */
export const getIncompleteGoalsCount = async (date: Date): Promise<number> => {
    const data = await loadGoalsForDate(date);
    return data.goals.filter(g => !g.completed).length;
};

/**
 * Get completed goals count for a date
 */
export const getCompletedGoalsCount = async (date: Date): Promise<number> => {
    const data = await loadGoalsForDate(date);
    return data.goals.filter(g => g.completed).length;
};

/**
 * Clear all goals for a specific date
 */
export const clearGoalsForDate = async (date: Date): Promise<void> => {
    try {
        const key = getStorageKey(date);
        await AsyncStorage.removeItem(key);
        console.log('✅ Cleared goals for', format(date, 'yyyy-MM-dd'));
    } catch (error) {
        console.error('Failed to clear goals for date:', error);
        throw error;
    }
};

export const DailyGoalsStorage = {
    loadGoalsForDate,
    saveGoalsForDate,
    addGoal,
    updateGoal,
    deleteGoal,
    carryOverIncompleteGoals,
    getIncompleteGoalsCount,
    getCompletedGoalsCount,
    clearGoalsForDate,
};
