import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { TicketCheck, TicketPlus, Tickets } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function TicketHubScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const menuItems = [
        {
            title: 'My Tickets',
            subtitle: 'View your submitted tickets',
            icon: Tickets,
            route: '/my-tickets',
            color: '#3B82F6'
        },
        {
            title: 'Create Ticket',
            subtitle: 'Submit a new support request',
            icon: TicketPlus,
            route: '/create-ticket',
            color: '#10B981'
        },
        {
            title: 'Assigned Tickets',
            subtitle: 'Tickets assigned to you',
            icon: TicketCheck,
            route: '/assigned-tickets',
            color: '#F59E0B'
        },
    ];

    return (
        <CorporateBackground>
            <TopBar
                title="Ticket Management"
                onMenuPress={() => setSidebarVisible(true)}
            />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
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
                                <View style={[styles.topBorder, { backgroundColor: item.color }]} />

                                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                    <View style={[styles.iconInner, { backgroundColor: item.color + '25' }]}>
                                        <Icon size={28} color={item.color} strokeWidth={2.5} />
                                    </View>
                                </View>

                                <View style={styles.cardContent}>
                                    <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                        {item.subtitle}
                                    </Text>
                                </View>

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
