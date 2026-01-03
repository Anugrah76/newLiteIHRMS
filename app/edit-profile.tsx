import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useAuthStore } from '@shared/store';
import { Save } from 'lucide-react-native';

export default function EditProfileScreen() {
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore((state) => state.user);

    // Placeholder state since we don't have update API yet
    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.mobile || '');

    const [submitting, setSubmitting] = useState(false);

    const handleSave = () => {
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            toast.show('success', 'Profile Updated', 'Your changes have been saved locally (Demo)');
            // In real app, we would invalidate queries and maybe update store
        }, 1500);
    };

    return (
        <CorporateBackground>
            <TopBar title="Edit Profile" onMenuPress={() => { }} showBack={true} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor={theme.colors.textTertiary}
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="email-address"
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Phone Number</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="phone-pad"
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
                                <Save width={20} height={20} color="#fff" />
                                <Text style={styles.btnText}>Save Changes</Text>
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
