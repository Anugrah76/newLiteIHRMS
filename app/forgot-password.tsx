import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { useToast } from '@shared/components/Toast';
import { useForgotPassword } from '@features/auth/api/authApi';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const toast = useToast();

    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    const { mutate: forgotPassword, isPending: loading } = useForgotPassword();

    const handleSubmit = () => {
        if (!email || !email.includes('@')) {
            toast.show('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }

        forgotPassword(email, {
            onSuccess: (data) => {
                console.log('✅ [Forgot Password] Response:', data);
                if (data.status === 2) {
                    setSuccess(true);
                    toast.show('success', 'Email Sent', data.message || 'Password reset instructions sent to your email');
                } else {
                    toast.show('error', 'Failed', data.message || 'Failed to send reset email');
                }
            },
            onError: (error: any) => {
                console.error('❌ [Forgot Password] Error:', error);
                toast.show('error', 'Error', 'Network error occurred. Please try again.');
            }
        });
    };

    return (
        <CorporateBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/ihrms-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Mail size={48} color="#6366F1" />
                        </View>

                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address and we'll send you instructions to reset your password
                        </Text>

                        {!success ? (
                            <>
                                <View style={styles.inputContainer}>
                                    <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={email}
                                        editable={!loading}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Send Reset Link</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => router.push('/login' as any)}
                                >
                                    <ArrowLeft size={16} color="#6366F1" />
                                    <Text style={styles.backButtonText}>Back to Login</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.successContainer}>
                                    <View style={styles.successIconContainer}>
                                        <CheckCircle size={64} color="#10B981" />
                                    </View>
                                    <Text style={styles.successTitle}>Check Your Email</Text>
                                    <Text style={styles.successText}>
                                        We've sent password reset instructions to your email address.
                                        Please check your inbox and follow the link to reset your password.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={() => router.push('/login' as any)}
                                >
                                    <Text style={styles.submitButtonText}>Go Back to Login</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 54,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#1F2937',
        fontSize: 15,
        fontWeight: '500',
    },
    submitButton: {
        width: '100%',
        height: 54,
        backgroundColor: '#6366F1',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    backButtonText: {
        color: '#6366F1',
        fontSize: 15,
        fontWeight: '600',
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    successText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
});
