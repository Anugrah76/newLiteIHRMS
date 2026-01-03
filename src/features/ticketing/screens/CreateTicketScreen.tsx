import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@shared/components/ui/TopBar';
import { CorporateGradient } from '@shared/components/ui/CorporateGradient';
import { CorporateToast } from '@shared/components/ui/CorporateToast';
import { useTicketHandlers, useCreateTicket } from '../hooks/useTicketing';
import { TicketHandler } from '../types';
import { useAuthStore } from '@features/auth/store/authSlice';
import { Picker } from '@react-native-picker/picker';
import { TriangleAlert, EqualApproximately, ChevronsDown } from 'lucide-react-native';

export default function CreateTicketScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data: handlers, isLoading: loadingHandlers } = useTicketHandlers();
    const createTicketMutation = useCreateTicket();

    const [form, setForm] = useState({
        selectedPersonId: '',
        priority: '',
        subject: '',
        description: '',
    });

    const handleSubmit = async () => {
        if (!form.selectedPersonId || !form.priority || !form.subject || !form.description) {
            CorporateToast.show({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill in all required fields',
            });
            return;
        }

        const selectedHandler = handlers?.find((h: TicketHandler) =>
            // Match logic based on unique ID used in Picker
            // If we use person_id or department_id specific logic
            h.person_id === form.selectedPersonId ||
            h.id === form.selectedPersonId ||
            (h.person_name && h.department_id && `${h.person_name}_${h.department_id}` === form.selectedPersonId)
        );

        // Fallback or precise match - assumes unique value in picker
        const handlerToUse = handlers?.find((h: TicketHandler) => getHandlerValue(h) === form.selectedPersonId);


        if (!handlerToUse) {
            CorporateToast.show({
                type: 'error',
                title: 'Error',
                message: 'Selected person details not found',
            });
            return;
        }

        try {
            await createTicketMutation.mutateAsync({
                key: user?.api_key || '',
                indo_code: user?.indo_code || '',
                company_id: handlerToUse.company_id || '1',
                department_id: handlerToUse.department_id,
                person_name: handlerToUse.person_name,
                person_mail_id: handlerToUse.person_mail_id,
                priority: form.priority,
                subject: form.subject,
                description: form.description,
            });

            CorporateToast.show({
                type: 'success',
                title: 'Success',
                message: 'Ticket created successfully',
            });

            setTimeout(() => {
                router.back();
            }, 1000);

        } catch (error: any) {
            CorporateToast.show({
                type: 'error',
                title: 'Submission Failed',
                message: error.message || 'Could not create ticket',
            });
        }
    };

    const getHandlerValue = (handler: any) => {
        // Create a unique value for the picker
        if (handler.person_id) return handler.person_id;
        if (handler.id) return handler.id;
        return `${handler.person_name}_${handler.department_id}`;
    };

    return (
        <CorporateGradient>
            <SafeAreaView style={styles.container}>
                <TopBar title="Create Ticket" showBack />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.formCard}>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Select Person *</Text>
                                <View style={styles.inputWrapper}>
                                    {loadingHandlers ? (
                                        <ActivityIndicator color="#6777ef" />
                                    ) : (
                                        <Picker
                                            selectedValue={form.selectedPersonId}
                                            onValueChange={(val) => setForm(prev => ({ ...prev, selectedPersonId: val }))}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select a person" value="" />
                                            {handlers?.map((handler: TicketHandler, index: number) => (
                                                <Picker.Item
                                                    key={index}
                                                    label={`${handler.person_name} (${handler.department_name})`}
                                                    value={getHandlerValue(handler)}
                                                />
                                            ))}
                                        </Picker>
                                    )}
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Priority *</Text>
                                <View style={styles.inputWrapper}>
                                    <Picker
                                        selectedValue={form.priority}
                                        onValueChange={(val) => setForm(prev => ({ ...prev, priority: val }))}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select Priority" value="" />
                                        <Picker.Item label="High" value="high" />
                                        <Picker.Item label="Normal" value="normal" />
                                        <Picker.Item label="Low" value="low" />
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Subject *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter subject"
                                    value={form.subject}
                                    onChangeText={(val) => setForm(prev => ({ ...prev, subject: val }))}
                                />
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter description"
                                    value={form.description}
                                    onChangeText={(val) => setForm(prev => ({ ...prev, description: val }))}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, createTicketMutation.isPending && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={createTicketMutation.isPending}
                            >
                                {createTicketMutation.isPending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Create Ticket</Text>
                                )}
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </CorporateGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
    },
    picker: {
        // height: 50,
        // width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#F9FAFB',
        fontSize: 16,
        color: '#1F2937',
    },
    textArea: {
        minHeight: 120,
    },
    submitButton: {
        backgroundColor: '#6777ef',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
