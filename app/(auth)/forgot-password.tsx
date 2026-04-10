import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Pressable,
    Image,
    StyleSheet,
    Text,
    TextInput,
    View, 
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    BackHandler
} from 'react-native';
import { AnimatedGradientBackground } from '@shared/components/AnimatedGradientBackground';
import { useToast } from '@shared/components/Toast';
import { useForgotPassword } from '@features/auth/api/authApi';
import { useTheme } from '@shared/theme';
import { useConfigStore } from '@shared/store';



const defaultLogo = require('../../assets/images/ihrms-logo.png');

/**
 * Forgot Password Screen - Professional Corporate Design
 * Password reset request screen
 */
export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
        const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const companyConfig = useConfigStore((state) => state.companyConfig);

    const { mutate: requestReset, isPending } = useForgotPassword();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };


        useEffect(() => {
            const backAction = () => {
                router.back();
                return true;
            };
    
            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
                setKeyboardVisible(true));
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
                setKeyboardVisible(false));
    
            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
            return () => {
                keyboardDidHideListener.remove();
                keyboardDidShowListener.remove();
                backHandler.remove();
            }
        }, [router]);

    const handleSubmit = () => {
        if (!email.trim()) {
            toast.show('error', 'Email Required', 'Please enter your email address');
            return;
        }

        if (!validateEmail(email.trim())) {
            toast.show('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }

        requestReset(email.trim(), {
            onSuccess: (data) => {
                if (data.status === 200 || data.status === 2) {
                    setSubmitted(true);
                    toast.show('success', 'Email Sent', data.message || 'Password reset instructions sent to your email');

                    // Navigate back to login after 3 seconds
                    setTimeout(() => {
                        router.back();
                    }, 3000);
                } else {
                    toast.show('error', 'Request Failed', data.message || 'Unable to process your request');
                }
            },
            onError: (error: any) => {
                console.error('Forgot password error:', error);
                toast.show('error', 'Network Error', 'Unable to connect to server');
            },
        });
    };

    if (submitted) {
        return (
            <AnimatedGradientBackground>
                
                <StatusBar barStyle={theme.isDark ? 'light-content' : 'light-content'} />

                <View style={styles.container}>
                    <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                        <View style={styles.successContainer}>
                            <View style={[styles.successIcon, { backgroundColor: theme.colors.success + '20' }]}>
                                <CheckCircle width={48} height={48} color={theme.colors.success} />
                            </View>

                            <Text style={[styles.successTitle, { color: theme.colors.text }]}>
                                Email Sent!
                            </Text>

                            <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
                                Password reset instructions have been sent to {email}
                            </Text>

                            <Text style={[styles.successNote, { color: theme.colors.textTertiary }]}>
                                Please check your inbox and follow the instructions to reset your password.
                            </Text>

                            <Pressable
                                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.buttonText}>Back to Login</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </AnimatedGradientBackground>
        );
    }

    return (
        <AnimatedGradientBackground>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'light-content'} />

            {/* Back Button */}
            <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <View style={[styles.backButtonCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <ArrowLeft width={24} height={24} color="#ffffff" />
                </View>
            </Pressable>


                      
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >

                      {!isKeyboardVisible &&
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                            <Image
                                source={companyConfig?.logo_url ? { uri: companyConfig.logo_url } : defaultLogo}
                                style={styles.logo}
                            />
                        </View>
                        {/*   <Text style={styles.companyName}>
                            {companyConfig?.company_name || ''}
                        </Text> */}
                    </View>
                }

                {/* Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary }]}>
                    <View style={[styles.cardHeader, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password?</Text>
                       {/*  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Enter your email address and we'll send you instructions to reset your password
                        </Text> */}
                    </View>

                    <View style={styles.cardBody}>
                        {/* Email Input */}
                        <Text style={[styles.label, { color: theme.colors.text }]}>Email Address</Text>
                        <View style={[styles.inputContainer, {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: theme.colors.border,
                        }]}>
                            <View style={[styles.iconBox, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.borderLight,
                            }]}>
                                <Mail width={20} height={20} color={theme.colors.primary} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Enter your registered email"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={email}
                                onChangeText={setEmail}
                                editable={!isPending}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Submit Button */}
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
                                <Text style={styles.buttonText}>Send Reset Instructions</Text>
                            )}
                        </Pressable>

                        {/* Back to Login */}
                        <Pressable
                            style={styles.backToLogin}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.backToLoginText, { color: theme.colors.textSecondary }]}>
                                Remember your password?{' '}
                                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                    Sign In
                                </Text>
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </AnimatedGradientBackground>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    backButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    logoContainer: {
        alignItems: 'center',
        margin: 20,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
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
        borderRadius:6,
        borderRightWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 14,
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
    backToLogin: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    backToLoginText: {
        fontSize: 14,
    },
    successContainer: {
        padding: 32,
        alignItems: 'center',
    },
    successIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
    },
    successNote: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
});
