import { useRouter } from 'expo-router';
import { Clock, Calendar, FileText, Award, BadgeIndianRupee } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { useAuthStore, useConfigStore } from '@shared/store';
import { usePunchTime } from '@features/dashboard/hooks';
import { useTheme } from '@shared/theme';
import { WelcomeCardGradient } from '@shared/components/WelcomeCardGradient';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';

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

    // Get today's date in DD-MM-YYYY format
    const today = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // React Query - auto-fetches and caches punch time
    const { data: punchTime, isLoading, error } = usePunchTime(today());

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const quickActions = [
        {
            icon: Calendar,
            title: 'Attendance Records',
            subtitle: 'View your attendance history',
            color: '#0369a1',
            bgColor: '#f0f9ff',
            onPress: () => router.push('/(tabs)/attendance'),
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
            onPress: () => router.push('/(tabs)/timesheet'),
        },
        {
            icon: BadgeIndianRupee,
            title: 'Salary Management',
            subtitle: 'View salary slips',
            color: '#0f766e',
            bgColor: '#f0fdfa',
            onPress: () => router.push('/transferred-salary'),
        },
    ];

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
                        <WelcomeCardGradient>
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
                                    <Text style={styles.welcomeText}>{getGreeting()}</Text>
                                    <Text style={styles.userName}>{user?.fullName || 'Employee'}</Text>
                                    <Text style={styles.userCode}>{user?.emp_code || ''}</Text>
                                </View>
                            </View>
                        </WelcomeCardGradient>
                    </View>

                    {/* Today's Status */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Status</Text>

                        {isLoading ? (
                            <View style={[styles.attendanceCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                            </View>
                        ) : punchTime ? (
                            <View style={[styles.attendanceCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.attendanceHeader}>
                                    <View style={styles.attendanceStatus}>
                                        <View
                                            style={[
                                                styles.statusIndicator,
                                                { backgroundColor: punchTime.punch_out_time ? theme.colors.success : theme.colors.warning },
                                            ]}
                                        />
                                        <Text style={[styles.statusText, { color: theme.colors.text }]}>{punchTime.punch_date}</Text>
                                    </View>
                                </View>

                                <View style={styles.timeCardsContainer}>
                                    <View style={[styles.timeCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                                        <View style={styles.timeCardHeader}>
                                            <View style={styles.timeIconContainer}>
                                                <Clock width={16} height={16} color={theme.colors.success} />
                                            </View>
                                            <Text style={[styles.timeCardLabel, { color: theme.colors.textSecondary }]}>Check In</Text>
                                        </View>
                                        <Text style={[styles.timeCardValue, { color: theme.colors.text }]}>
                                            {punchTime.punch_in_time || '--:--'}
                                        </Text>
                                    </View>

                                    <View style={[styles.timeCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                                        <View style={styles.timeCardHeader}>
                                            <View style={styles.timeIconContainer}>
                                                <Clock width={16} height={16} color={theme.colors.error} />
                                            </View>
                                            <Text style={[styles.timeCardLabel, { color: theme.colors.textSecondary }]}>Check Out</Text>
                                        </View>
                                        <Text style={[styles.timeCardValue, { color: theme.colors.text }]}>
                                            {punchTime.punch_out_time || '--:--'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.attendanceCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.noDataContainer}>
                                    <Clock width={32} height={32} color={theme.colors.textTertiary} />
                                    <Text style={[styles.noDataTitle, { color: theme.colors.textSecondary }]}>No attendance recorded</Text>
                                    <Text style={[styles.noDataSubtitle, { color: theme.colors.textTertiary }]}>Mark your attendance to start tracking</Text>
                                </View>
                            </View>
                        )}

                        {/* Mark Attendance Button */}
                        <TouchableOpacity
                            style={[styles.markAttendanceButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => router.push('/mark-attendance')}
                            activeOpacity={0.8}
                        >
                            <Clock width={20} height={20} color="#ffffff" />
                            <Text style={styles.markAttendanceText}>Mark Attendance</Text>
                        </TouchableOpacity>
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
        borderWidth: 1,
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
    markAttendanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    markAttendanceText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
