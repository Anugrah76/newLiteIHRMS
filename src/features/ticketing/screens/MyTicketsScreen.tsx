import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@shared/components/ui/TopBar';
import { CorporateGradient } from '@shared/components/ui/CorporateGradient';
import { TicketCard } from '../components/TicketCard';
import { useMyTickets } from '../hooks/useTicketing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function MyTicketsScreen() {
    const router = useRouter();
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [status, setStatus] = useState('All');

    const { data: tickets, isLoading } = useMyTickets(year, month, status);

    const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

    return (
        <CorporateGradient>
            <SafeAreaView style={styles.container}>
                <TopBar title="My Tickets" showBack />

                <View style={styles.filtersContainer}>
                    <View style={styles.row}>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={year}
                                onValueChange={(itemValue) => setYear(itemValue)}
                                style={styles.picker}
                            >
                                {years.map((y) => (
                                    <Picker.Item key={y} label={y} value={y} style={styles.pickerItem} />
                                ))}
                            </Picker>
                        </View>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={month}
                                onValueChange={(itemValue) => setMonth(itemValue)}
                                style={styles.picker}
                            >
                                {months.map((m) => (
                                    <Picker.Item
                                        key={m}
                                        label={m.charAt(0).toUpperCase() + m.slice(1)}
                                        value={m}
                                        style={styles.pickerItem}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={status}
                            onValueChange={(itemValue) => setStatus(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Status" value="All" style={styles.pickerItem} />
                            <Picker.Item label="Open" value="Open" style={styles.pickerItem} />
                            <Picker.Item label="Closed" value="Closed" style={styles.pickerItem} />
                            <Picker.Item label="Draft" value="Draft" style={styles.pickerItem} />
                        </Picker>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#6777ef" />
                    </View>
                ) : (
                    <FlatList
                        data={tickets}
                        keyExtractor={(item) => item.ticket_id}
                        renderItem={({ item }) => (
                            <TicketCard
                                ticket={item}
                                onPress={(id) => router.push({ pathname: '/ticketing/chat', params: { ticketId: id } })}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No tickets found</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </CorporateGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filtersContainer: {
        padding: 16,
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    pickerWrapper: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        // width: '100%', // Removed width 100% to let flex handle it or default behavior
    },
    pickerItem: {
        fontSize: 14,
        color: '#1F2937',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },
});
