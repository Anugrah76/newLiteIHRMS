import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TicketPlus, Tickets, TicketCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@shared/components/ui/TopBar';
import { CorporateGradient } from '@shared/components/ui/CorporateGradient';
import { useSidebarStore } from '@shared/store/sidebarStore';

export default function TicketOptionsScreen() {
    const router = useRouter();
    const setSidebarVisible = useSidebarStore((state) => state.setSidebarVisible);

    const menuOptions = [
        {
            title: 'My Tickets',
            icon: Tickets,
            route: '/ticketing/my-tickets',
            description: 'View tickets you created'
        },
        {
            title: 'Create Ticket',
            icon: TicketPlus,
            route: '/ticketing/create-ticket',
            description: 'Raise a new support ticket'
        },
        {
            title: 'Assigned Tickets',
            icon: TicketCheck,
            route: '/ticketing/assigned-tickets',
            description: 'View tickets assigned to you'
        }
    ];

    return (
        <CorporateGradient>
            <SafeAreaView style={styles.container}>
                <TopBar
                    title="Ticket Management"
                    onMenuPress={() => setSidebarVisible(true)}
                    showBack
                />

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.menuGrid}>
                        {menuOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuCard}
                                onPress={() => router.push(option.route)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    <option.icon size={32} color="#000" />
                                </View>
                                <Text style={styles.cardTitle}>{option.title}</Text>
                                <Text style={styles.cardDescription}>{option.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </CorporateGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    menuCard: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderTopWidth: 4,
        borderTopColor: '#3abaf4',
        marginBottom: 8,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});
