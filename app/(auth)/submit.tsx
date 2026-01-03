import { useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    StatusBar,
} from 'react-native';
import { useToast } from '@shared/components/Toast';
import { AnimatedGradientBackground } from '@shared/components/AnimatedGradientBackground';
import { useCompanyConfig } from '@features/auth/hooks';
import { useTheme } from '@shared/theme';

const logo = require('../../assets/images/Ihrmslite.png');

/**
 * Submit Screen - Professional Corporate Design
 * First screen in app flow - captures company code
 */
export default function SubmitScreen() {
    const [companyId, setCompanyId] = useState('');
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();

    const { mutate: submitCode, isPending } = useCompanyConfig();

    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const handleSubmit = () => {
        if (!companyId.trim()) {
            toast.show('error', 'Please enter a Company Code');
            return;
        }

        submitCode(companyId.trim(), {
            onSuccess: (data) => {
                if (data.status === 200) {
                    toast.show('success', 'Company Code Valid');
                    setTimeout(() => router.push('/(auth)/login'), 2500);
                } else {
                    toast.show('error', 'Invalid Code', data.message);
                }
            },
            onError: (error) => {
                console.error('Error during code validation:', error);
                toast.show('error', 'Network Error', 'Please try again');
            },
        });
    };

    return (
        <AnimatedGradientBackground>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'light-content'} />

            <View style={styles.container}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                        <Image source={logo} style={styles.logo} />
                    </View>
                    <Text style={styles.appName}>IHRMS</Text>
                    <Text style={styles.appTagline}>Human Resource Management System</Text>
                </View>

                {/* Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                    <View style={[styles.cardHeader, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Company Verification</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Enter your organization code to continue
                        </Text>
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Company Code</Text>
                        <View style={[styles.inputContainer, {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: theme.colors.border,
                        }]}>
                            <View style={[styles.iconBox, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.borderLight,
                            }]}>
                                <Building2 width={20} height={20} color={theme.colors.primary} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Enter code"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={companyId}
                                onChangeText={setCompanyId}
                                editable={!isPending}
                                autoCapitalize="characters"
                                autoCorrect={false}
                            />
                        </View>

                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: theme.colors.primary },
                                isPending && styles.buttonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify & Continue</Text>
                            )}
                        </Pressable>

                        <Text style={[styles.note, { color: theme.colors.textTertiary }]}>
                            Contact your system administrator if you don't have a code
                        </Text>
                    </View>
                </View>
            </View>
        </AnimatedGradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
        letterSpacing: 2,
    },
    appTagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 8,
        width: '100%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    cardHeader: {
        padding: 24,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    cardBody: {
        padding: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 24,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRightWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        paddingHorizontal: 16,
        fontWeight: '500',
    },
    button: {
        height: 48,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
