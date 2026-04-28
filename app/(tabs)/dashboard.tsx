import { useRouter, useFocusEffect } from 'expo-router';
import { Clock, Calendar, FileText, Award, BadgeIndianRupee, TentTree, Home } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Image,
    Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore, useConfigStore, usePunchOptionStore } from '@shared/store';
import { usePunchTime, useTodayKRATasks } from '@features/dashboard/hooks';
import { DailyGoalsCard } from '@features/dashboard/components/DailyGoalsCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@shared/theme';
import { WelcomeCardGradient } from '@shared/components/WelcomeCardGradient';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { getPunchOptions } from '@features/attendance/api/attendanceApi';
import { useToast } from '@shared/components/Toast';

/**
 * Dashboard Screen
 * Landing page after login - shows attendance status and quick actions
 * Modern architecture: TypeScript + React Query + Zustand
 */
export default function DashboardScreen() {
    const router = useRouter();
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const companyConfig = useConfigStore((state) => state.companyConfig);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [punchLoading, setPunchLoading] = useState(false);
    const setPunchOptions = usePunchOptionStore((state) => state.setPunchOptions);
    const setEmpOption = usePunchOptionStore((state) => state.setEmpOption);
    const toast = useToast();

    // Get today's date in DD-MM-YYYY format
    const today = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // React Query - auto-fetches and caches punch time
    const { data: punchTime, isLoading, error, refetch } = usePunchTime(today());

    // Refetch punch time every time this screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Fetch today's KRA tasks for goals integration
    const { data: tasksData } = useTodayKRATasks();
    const tasks = tasksData?.data?.tasks || [];

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    /**
     * Handle Mark Attendance press
     * Fetches punch options from API, stores in Zustand, then navigates
     * (mirrors the old project's handlePunch flow)
     */
    const handlePunch = async () => {
        setPunchLoading(true);
        try {
            const result = await getPunchOptions();
            if (result && result.status === 1 && result.emp_punch_option) {
                setEmpOption(Number(result.emp_punch_option));
                router.push('/mark-attendance');
            } else {
                toast.show('error', 'No Punch Option Set', 'Try again');
            }
        } catch (error) {
            console.error('Punch Options Error:', error);
            toast.show('error', 'Network Error', 'Please try later');
        } finally {
            setPunchLoading(false);
        }
    };

    const quickActions = [
        {
            icon: Calendar,
            title: 'Attendance Records',
            subtitle: 'View your attendance history',
            color: '#0369a1',
            bgColor: '#f0f9ff',
            onPress: () => router.push('/attendance'),
        },
        {
            icon: FileText,
            title: 'Leave Management',
            subtitle: 'Apply for leave or view balance',
            color: '#7c3aed',
            bgColor: '#faf5ff',
            onPress: () => router.push('/leave-summary'),
        },
        {
            icon: Award,
            title: 'Timesheet',
            subtitle: 'Track your working hours',
            color: '#dc2626',
            bgColor: '#fef2f2',
            onPress: () => router.push('/timesheet'),
        },
        {
            icon: BadgeIndianRupee,
            title: 'Salary Management',
            subtitle: 'View salary slips',
            color: '#0f766e',
            bgColor: '#f0fdfa',
            onPress: () => router.push('/transferred-salary'),
        },
        {
            icon: TentTree,
            title: 'Holidays',
            subtitle: 'View holidays',
            color: '#0f766e',
            bgColor: '#f0fdfa',
            onPress: () => router.push('/holidays'),
        }
    ];

    // Get gradient colors based on time of day
    // Get gradient colors based on time of day
    const getTimeBasedGradient = () => {
        const hour = currentTime.getHours();

        if (hour >= 5 && hour < 12) {
            return theme.isDark
                ? ['#A8EDEA', '#87CEEB', '#B0E0E6'] as const
                : ['#B8E6F0', '#A8D8EA', '#C8E6F5'] as const;

        } else if (hour >= 12 && hour < 17) {
            return theme.isDark
                ? ['#FF9A8B', '#FFB6A3', '#FFDAC1'] as const
                : ['#FFE5B4', '#FFD4A3', '#FFC48C'] as const;


        } else if (hour >= 17 && hour < 20) {
            return theme.isDark
                ? ['#FFB88C', '#FF9A8B', '#EF8481'] as const
                : ['#FFDAB9', '#FFCBA4', '#FFB88C'] as const;
        } else {
            return theme.isDark
                ? ['#667EEA', '#764BA2', '#8B7FC7'] as const
                : ['#C5CAE9', '#B39DDB', '#9FA8DA'] as const;
        }
    };

    const gradientColors = getTimeBasedGradient();
    const textColor = theme.isDark ? '#FFFFFF' : '#2D3748';

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Dashboard"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => { }}
                onNotificationPress={() => { }}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.welcomeCardGradient}
                        >
                            <View style={styles.welcomeCardContent}>
                                <View style={styles.profilePhotoContainer}>
                                    <Image
                                        source={
                                            user?.profile_photo
                                                ? { uri: user.profile_photo }
                                                : require('../../assets/images/default-pfp.png')
                                        }
                                        style={styles.profilePhoto}
                                    />
                                </View>

                                <View style={styles.welcomeContent}>
                                    <Text style={[styles.welcomeText, { color: textColor }]}>{getGreeting()}</Text>
                                    <Text style={[styles.userName, { color: textColor }]}>{user?.fullName || 'Employee'}</Text>
                                    <Text style={[styles.userCode, { color: textColor, opacity: 0.7 }]}>{user?.emp_code || ''}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Today's Status */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Status</Text>

                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.attendanceCard}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="large" color={textColor} />
                            ) : punchTime ? (
                                <>
                                    <View style={styles.attendanceHeader}>
                                        <View style={styles.attendanceStatus}>
                                            <View
                                                style={[
                                                    styles.statusIndicator,
                                                    { backgroundColor: punchTime.punch_out_time ? theme.colors.success : theme.colors.warning },
                                                ]}
                                            />
                                            <Text style={[styles.statusText, { color: textColor }]}>{currentTime.toDateString()}</Text>
                                        </View>
                                        <Text style={[styles.statusText, { color: textColor }]}>
                                            {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </Text>
                                    </View>

                                    <View style={styles.timeCardsContainer}>
                                        <View style={[styles.timeCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' }]}>
                                            <View style={styles.timeCardHeader}>
                                                <View style={styles.timeIconContainer}>
                                                    <Clock width={16} height={16} color={theme.colors.success} />
                                                </View>
                                                <Text style={[styles.timeCardLabel, { color: textColor, opacity: 0.7 }]}>Check In</Text>
                                            </View>
                                            <Text style={[styles.timeCardValue, { color: textColor }]}>
                                                {punchTime.punch_in_time || '--:--'}
                                            </Text>
                                        </View>

                                        <View style={[styles.timeCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' }]}>
                                            <View style={styles.timeCardHeader}>
                                                <View style={styles.timeIconContainer}>
                                                    <Clock width={16} height={16} color={theme.colors.error} />
                                                </View>
                                                <Text style={[styles.timeCardLabel, { color: textColor, opacity: 0.7 }]}>Check Out</Text>
                                            </View>
                                            <Text style={[styles.timeCardValue, { color: textColor }]}>
                                                {punchTime.punch_out_time || '--:--'}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Clock width={32} height={32} color={textColor} opacity={0.5} />
                                    <Text style={[styles.noDataTitle, { color: textColor }]}>No attendance recorded</Text>
                                    <Text style={[styles.noDataSubtitle, { color: textColor, opacity: 0.7 }]}>Mark your attendance to start tracking</Text>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Attendance Action Buttons Row */}
                        <View style={styles.actionButtonsRow}>
                            {/* Mark Attendance Button */}
                            <TouchableOpacity
                                style={[styles.markAttendanceButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handlePunch}
                                disabled={punchLoading}
                                activeOpacity={0.8}
                            >
                                {punchLoading ? (
                                    <>
                                        <ActivityIndicator size="small" color="#ffffff" />
                                        <Text style={styles.markAttendanceText}>Processing...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Clock width={18} height={18} color="#ffffff" />
                                        <Text style={styles.markAttendanceText}>Mark Attendance</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Work From Home Button */}
                            <TouchableOpacity
                                style={styles.wfhButton}
                                onPress={() => router.push('/work-from-home')}
                                activeOpacity={0.8}
                            >
                                <Home width={18} height={18} color="#ffffff" />
                                <Text style={styles.markAttendanceText}>Work From Home</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Daily Goals Card */}
                        <DailyGoalsCard
                            maxVisible={4}
                            onExpand={() => router.push('/(tabs)/daily-goals')}
                            kraList={tasks}
                        />
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            {quickActions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.quickActionCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}
                                    onPress={action.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                                        <action.icon width={20} height={20} color={action.color} />
                                    </View>
                                    <View style={styles.quickActionContent}>
                                        <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>{action.title}</Text>
                                        <Text style={[styles.quickActionSubtitle, { color: theme.colors.textSecondary }]}>{action.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Company Logo Footer */}
                    {companyConfig?.logo_url && (
                        <View style={styles.footer}>
                            <Image source={{ uri: companyConfig.logo_url }} style={styles.companyLogo} />
                        </View>
                    )}
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
        paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for tab bar
    },
    welcomeSection: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    welcomeCardGradient: {
        borderRadius: 12,
    },
    welcomeCardContent: {
        flexDirection: 'row',
        padding: 24,
        alignItems: 'center',
    },
    profilePhotoContainer: {
        marginRight: 16,
    },
    profilePhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    welcomeContent: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    userCode: {
        fontSize: 14,
        color: '#e0e7ff',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    attendanceCard: {
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e0e7ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    attendanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    attendanceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
    },
    timeCardsContainer: {
        flexDirection: 'row',

        gap: 12,
    },
    timeCard: {
        flex: 1,
        borderRadius: 8,
        padding: 16,
        //borderWidth: 1,
    },
    timeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeIconContainer: {
        marginRight: 6,
    },
    timeCardLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timeCardValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    noDataContainer: {
        alignItems: 'center',
        padding: 20,
    },
    noDataTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    noDataSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    quickActionsGrid: {
        gap: 12,
    },
    quickActionCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quickActionContent: {
        flex: 1,
        justifyContent: 'center',
    },
    quickActionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    quickActionSubtitle: {
        fontSize: 14,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    companyLogo: {
        width: 120,
        height: 60,
        resizeMode: 'contain',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    markAttendanceButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    wfhButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 8,
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    markAttendanceText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
        textAlign: 'center',
    },
});
