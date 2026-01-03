import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { CalendarCheck2, CalendarClock, CalendarDays, CalendarX, FileCheck2, TicketsPlane, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function StaffManagementScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const menuItems = [
        {
            title: 'Missed Punch',
            subtitle: 'Approve punch corrections',
            icon: CalendarClock,
            route: '/staff-missed-punch',
            color: '#F59E0B',
            gradient: ['#FEF3C7', '#FDE68A']
        },
        {
            title: 'Comp Off',
            subtitle: 'Manage compensatory offs',
            icon: CalendarCheck2,
            route: '/staff-comp-off',
            color: '#10B981',
            gradient: ['#D1FAE5', '#A7F3D0']
        },
        {
            title: 'Leaves',
            subtitle: 'Review leave requests',
            icon: CalendarX,
            route: '/staff-leaves',
            color: '#EF4444',
            gradient: ['#FEE2E2', '#FECACA']
        },
        {
            title: 'F&F Clearance',
            subtitle: 'Full & final settlements',
            icon: FileCheck2,
            route: '/staff-fnf-clearance',
            color: '#8B5CF6',
            gradient: ['#EDE9FE', '#DDD6FE']
        },
        {
            title: 'Business Trip',
            subtitle: 'Approve BTA requests',
            icon: TicketsPlane,
            route: '/staff-bta-approval',
            color: '#3B82F6',
            gradient: ['#DBEAFE', '#BFDBFE']
        },
        {
            title: 'Staff Attendance',
            subtitle: 'Mark team attendance',
            icon: CalendarDays,
            route: '/staff-attendance',
            color: '#EC4899',
            gradient: ['#FCE7F3', '#FBCFE8']
        },
    ];

    return (
        <CorporateBackground>
            <TopBar
                title="Staff Management"
                onMenuPress={() => setSidebarVisible(true)}
            />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >


                {/* Menu Grid */}
                <View style={styles.grid}>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuCard,
                                    {
                                        backgroundColor: theme.colors.cardPrimary,
                                        borderColor: theme.colors.border,
                                        width: isTablet ? '31%' : '48%',
                                    }
                                ]}
                                onPress={() => router.push(item.route as any)}
                                activeOpacity={0.7}
                            >
                                {/* Colored Top Border */}
                                <View style={[styles.topBorder, { backgroundColor: item.color }]} />

                                {/* Icon Container with Gradient Effect */}
                                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                    <View style={[styles.iconInner, { backgroundColor: item.color + '25' }]}>
                                        <Icon size={28} color={item.color} strokeWidth={2.5} />
                                    </View>
                                </View>

                                {/* Content */}
                                <View style={styles.cardContent}>
                                    <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {item.subtitle}
                                    </Text>
                                </View>

                                {/* Action Indicator */}
                                <View style={[styles.actionIndicator, { backgroundColor: item.color + '20' }]}>
                                    <Text style={[styles.actionText, { color: item.color }]}>View →</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    menuCard: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 200,
    },
    topBorder: {
        height: 4,
        width: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
    },
    iconInner: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        alignItems: 'center',
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    menuSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 16,
        opacity: 0.8,
    },
    actionIndicator: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginTop: 'auto',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
