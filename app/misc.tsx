import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { Calendar, UserMinus, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function MiscOptionsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const options = [
        {
            title: 'Comp-Off Approvals',
            subtitle: 'Manage compensatory off requests',
            icon: Calendar,
            route: '/comp-off',
            color: '#6366F1'
        },
        {
            title: 'Resignation Approvals',
            subtitle: 'Manage resignation requests',
            icon: UserMinus,
            route: '/resignation',
            color: '#EF4444'
        },
        {
            title: 'Missed Punch Approvals',
            subtitle: 'Manage missed punch requests',
            icon: Clock,
            route: '/missed-punch',
            color: '#F59E0B'
        }
    ];

    return (
        <CorporateBackground>
            <TopBar
                title="Other Options"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {options.map((option, index) => {
                        const Icon = option.icon;
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
                                onPress={() => router.push(option.route as any)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.topBorder, { backgroundColor: option.color }]} />

                                <View style={[styles.iconContainer, { backgroundColor: option.color + '15' }]}>
                                    <View style={[styles.iconInner, { backgroundColor: option.color + '25' }]}>
                                        <Icon size={28} color={option.color} strokeWidth={2.5} />
                                    </View>
                                </View>

                                <View style={styles.cardContent}>
                                    <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                                        {option.title}
                                    </Text>
                                    <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {option.subtitle}
                                    </Text>
                                </View>

                                <View style={[styles.actionIndicator, { backgroundColor: option.color + '20' }]}>
                                    <Text style={[styles.actionText, { color: option.color }]}>View →</Text>
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
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
