import { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform

} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useTicketHandlers, useCreateTicket } from '@features/support/hooks';
import { MessageSquare, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SelectField } from '@shared/components/SelectField';

export default function CreateTicketScreen() {
    const theme = useTheme();
    const toast = useToast();
    const router = useRouter();

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('2'); // Default: Medium

    const { data: ticketHandlersResponse, isLoading: loadingHandlers } = useTicketHandlers();

    // Process handlers and create person map
    const { persons, personMap, personOptions } = useMemo(() => {
        const handlers: any[] = (ticketHandlersResponse as any)?.ticket_handlers || [];
        const map = new Map();
        const list: any[] = [];
        const options: any[] = [];

        handlers.forEach((h, index) => {
            // Create unique ID if not present
            const uid = h.person_id || `${h.department_id}_${index}`;
            const person = {
                ...h,
                uid,
                displayName: `${h.person_name} (${h.department_name})`
            };

            if (!map.has(uid)) {
                map.set(uid, person);
                list.push(person);
                options.push({
                    label: person.displayName,
                    value: uid
                });
            }
        });
        return { persons: list, personMap: map, personOptions: options };
    }, [ticketHandlersResponse]);

    const { mutate: createTicket, isPending } = useCreateTicket();

    const priorities = [
        { id: '1', label: 'Low', color: theme.colors.success },
        { id: '2', label: 'Medium', color: theme.colors.warning },
        { id: '3', label: 'High', color: theme.colors.error },
    ];

    const handleSubmit = () => {
        if (!selectedPersonId) {
            toast.show('error', 'Validation Error', 'Please select a person');
            return;
        }

        const selectedPerson = personMap.get(selectedPersonId);
        if (!selectedPerson) {
            toast.show('error', 'Error', 'Selected person details not found');
            return;
        }

        if (!subject.trim()) {
            toast.show('error', 'Validation Error', 'Please enter subject');
            return;
        }
        if (!description.trim()) {
            toast.show('error', 'Validation Error', 'Please enter description');
            return;
        }

        createTicket({
            department_id: selectedPerson.department_id,
            company_id: selectedPerson.company_id || '1',
            person_name: selectedPerson.person_name,
            person_mail_id: selectedPerson.person_mail_id,
            subject: subject.trim(),
            description: description.trim(),
            priority,
        }, {
            onSuccess: (data: any) => {
                // Check for success message or status
                if (data.status === 1 || data.status === "Ticket Created Successfully.") {
                    toast.show('success', 'Success', 'Ticket created successfully');
                    setTimeout(() => router.back(), 1500);
                } else {
                    toast.show('error', 'Failed', data.message || 'Unable to create ticket');
                }
            },
            onError: () => {
                toast.show('error', 'Network Error', 'Unable to connect to server');
            },
        });
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Create Ticket"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
            />


            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Adjust this number if it's too high/low on iOS
            >


                <ScrollView
                    style={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Person Selection */}
                    <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        {loadingHandlers ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <SelectField
                                label="Select Person *"
                                placeholder="Select a person"
                                value={selectedPersonId}
                                onValueChange={setSelectedPersonId}
                                options={personOptions}
                            />
                        )}
                    </View>

                    {/* Priority Selection */}
                    <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                            Priority *
                        </Text>
                        <View style={styles.priorityRow}>
                            {priorities.map((p) => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[
                                        styles.priorityButton,
                                        {
                                            backgroundColor: priority === p.id ? p.color : theme.colors.surfaceVariant,
                                            borderColor: p.color,
                                        },
                                    ]}
                                    onPress={() => setPriority(p.id)}
                                >
                                    <Text
                                        style={[
                                            styles.priorityText,
                                            { color: priority === p.id ? '#ffffff' : theme.colors.text },
                                        ]}
                                    >
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Subject */}
                    <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                            Subject *
                        </Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                color: theme.colors.text
                            }]}
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="Brief description of the issue"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    </View>

                    {/* Description */}
                    <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                            Description *
                        </Text>
                        <TextInput
                            style={[styles.textArea, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                color: theme.colors.text
                            }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Detailed description of the issue..."
                            placeholderTextColor={theme.colors.textTertiary}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.colors.primary },
                            isPending && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <MessageSquare width={20} height={20} color="#ffffff" />
                                <Text style={styles.submitButtonText}>Create Ticket</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    deptGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    deptButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    deptText: {
        fontSize: 14,
        fontWeight: '600',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',

    },
    priorityText: {
        fontSize: 14,
        fontWeight: '700',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        height: 120,
    },
    submitButton: {
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
