import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { DailyGoalsManager } from '@features/timesheet/components/DailyGoalsManager';
import { useTodayKRATasks } from '@features/dashboard/hooks/useTodayKRATasks';
import { useToast } from '@shared/components/Toast';

/**
 * Daily Goals Screen
 * Dedicated full-screen for managing daily goals
 */
export default function DailyGoalsScreen() {
    const router = useRouter();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Fetch today's KRA tasks for goal integration
    const { data: tasksData } = useTodayKRATasks();
    const tasks = tasksData?.data?.tasks || [];

    const handleAddGoalToKra = (kraId: string, goalText: string) => {
        // This will be handled by DailyGoalsManager internally
        // We just need to provide the callback
        toast.show('success', 'Added to KRA', 'Goal added successfully');
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Daily Goals"
                onMenuPress={() => setSidebarVisible(true)}
                showBack={false}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <DailyGoalsManager
                            date={new Date()}
                            kraList={tasks}
                            onAddToKra={handleAddGoalToKra}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Extra padding for tab bar
    },
    content: {
        padding: 16,
    },
});
