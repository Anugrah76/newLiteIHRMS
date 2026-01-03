import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { Lock } from 'lucide-react-native';

export default function ChangePasswordScreen() {
    const theme = useTheme();
    const toast = useToast();

    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSave = () => {
        if (newPass !== confirmPass) {
            toast.show('error', 'Mismatch', 'New passwords do not match');
            return;
        }
        setSubmitting(true);
        // Simulate API
        setTimeout(() => {
            setSubmitting(false);
            toast.show('success', 'Password Changed', 'Your password has been updated securely');
        }, 1500);
    };

    return (
        <CorporateBackground>
            <TopBar title="Change Password" onMenuPress={() => { }} showBack={true} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Current Password</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        value={oldPass}
                        onChangeText={setOldPass}
                        placeholderTextColor={theme.colors.textTertiary}
                        secureTextEntry
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        value={newPass}
                        onChangeText={setNewPass}
                        placeholderTextColor={theme.colors.textTertiary}
                        secureTextEntry
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm New Password</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        value={confirmPass}
                        onChangeText={setConfirmPass}
                        placeholderTextColor={theme.colors.textTertiary}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Lock width={20} height={20} color="#fff" />
                                <Text style={styles.btnText}>Update Password</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    formCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
    input: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, fontSize: 16 },
    saveBtn: { flexDirection: 'row', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 12 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
