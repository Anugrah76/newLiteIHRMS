import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useHRAnalytics } from '@/src/features/trip-tracking/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * HR Analytics Hub
 * Overview dashboard for HR/managers
 */
export default function HRAnalyticsScreen() {
    const theme = useTheme();

    const { data: analytics, isLoading } = useHRAnalytics();

    if (isLoading || !analytics) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.colors.textSecondary }}>Loading analytics...</Text>
                </View>
            </View>
        );
    }

    const quickLinks = [
        {
            icon: 'heat-wave',
            title: 'Location Heatmap',
            subtitle: 'See where employees work',
            route: '/analytics/heatmap',
            color: '#ef4444',
        },
        {
            icon: 'clock-check',
            title: 'Punctuality',
            subtitle: 'On-time rates by office',
            route: '/analytics/punctuality',
            color: '#10b981',
        },
        {
            icon: 'chart-line',
            title: 'Distance Trends',
            subtitle: 'Travel patterns & insights',
            route: '/analytics/distance',
            color: '#3b82f6',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>HR Analytics</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Overview Stats */}
                <View style={styles.overviewSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Today's Overview
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>

                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="account-group" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {analytics.total_employees}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Total Employees
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="check-circle" size={32} color={theme.colors.success} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {analytics.active_today}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Active Today
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="map-marker-path" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {analytics.on_trips}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                On Trips
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="home-outline" size={32} color={theme.colors.info} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {analytics.remote}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Remote
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="account-off" size={32} color={theme.colors.textTertiary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {analytics.absent}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Absent
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                            <MaterialCommunityIcons name="clock-alert" size={32} color={theme.colors.warning} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {analytics.late}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Late
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Department Breakdown */}
                <View style={[styles.departmentSection, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Department Breakdown
                    </Text>
                    {analytics.department_summary.map((dept, index) => {
                        const presentPercent = (dept.present / dept.total) * 100;
                        return (
                            <View key={index} style={styles.deptItem}>
                                <View style={styles.deptHeader}>
                                    <Text style={[styles.deptName, { color: theme.colors.text }]}>
                                        {dept.department}
                                    </Text>
                                    <Text style={[styles.deptStats, { color: theme.colors.textSecondary }]}>
                                        {dept.present}/{dept.total}
                                    </Text>
                                </View>
                                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${presentPercent}%`,
                                                backgroundColor: presentPercent >= 80 ? theme.colors.success : presentPercent >= 60 ? theme.colors.warning : theme.colors.error,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Quick Links */}
                <View style={styles.linksSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Detailed Analytics
                    </Text>
                    {quickLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.linkCard, { backgroundColor: theme.colors.surface }]}
                            onPress={() => router.push(link.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.linkIcon, { backgroundColor: link.color + '20' }]}>
                                <MaterialCommunityIcons name={link.icon as any} size={24} color={link.color} />
                            </View>
                            <View style={styles.linkText}>
                                <Text style={[styles.linkTitle, { color: theme.colors.text }]}>
                                    {link.title}
                                </Text>
                                <Text style={[styles.linkSubtitle, { color: theme.colors.textSecondary }]}>
                                    {link.subtitle}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (SCREEN_WIDTH - 52) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    departmentSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
    },
    deptItem: {
        marginBottom: 16,
    },
    deptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    deptName: {
        fontSize: 14,
        fontWeight: '500',
    },
    deptStats: {
        fontSize: 13,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    linksSection: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
    },
    linkIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkText: {
        flex: 1,
        marginLeft: 16,
    },
    linkTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    linkSubtitle: {
        fontSize: 13,
    },
});
