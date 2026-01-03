import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useCompOffList, useApproveCompOff } from '@features/misc/hooks';
import { CheckCircle, XCircle, Calendar, User } from 'lucide-react-native';

export default function CompOffScreen() {
    const theme = useTheme();
    const toast = useToast();
    const { data: list, isLoading, refetch } = useCompOffList();
    const { mutate: approve, isPending } = useApproveCompOff();

    const items = Array.isArray(list?.data) ? list.data : [];

    const handleAction = (id: string, status: string) => {
        approve({ id, status }, {
            onSuccess: (data) => {
                if (data.status === 200 || data.status === 1) {
                    toast.show('success', 'Success', 'Status updated');
                    refetch();
                } else {
                    toast.show('error', 'Failed', data.message || 'Update failed');
                }
            },
            onError: () => toast.show('error', 'Error', 'Something went wrong')
        });
    };

    return (
        <CorporateBackground>
            <TopBar title="Comp-Off Approvals" onMenuPress={() => { }} showBack={true} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : items.length > 0 ? (
                    items.map((item: any, index: number) => (
                        <View key={index} style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            <View style={styles.header}>
                                <Text style={[styles.name, { color: theme.colors.text }]}>{item.emp_name}</Text>
                                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{item.date}</Text>
                            </View>
                            <Text style={[styles.reason, { color: theme.colors.textSecondary }]}>{item.reason}</Text>
                            <View style={styles.actions}>
                                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.success + '15' }]} onPress={() => handleAction(item.id, 'Approved')}>
                                    <CheckCircle size={16} color={theme.colors.success} />
                                    <Text style={[styles.btnText, { color: theme.colors.success }]}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.error + '15' }]} onPress={() => handleAction(item.id, 'Rejected')}>
                                    <XCircle size={16} color={theme.colors.error} />
                                    <Text style={[styles.btnText, { color: theme.colors.error }]}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.textSecondary }}>No pending requests</Text>
                )}
            </ScrollView>
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    name: { fontWeight: '700', fontSize: 16 },
    date: { fontSize: 14 },
    reason: { marginBottom: 12, fontStyle: 'italic' },
    actions: { flexDirection: 'row', gap: 12 },
    btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 6 },
    btnText: { fontWeight: '600', fontSize: 12 }
});
