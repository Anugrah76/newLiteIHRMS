import { Stack } from 'expo-router';

export default function TicketingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="my-tickets" />
            <Stack.Screen name="assigned-tickets" />
            <Stack.Screen name="create-ticket" />
            <Stack.Screen name="chat" />
        </Stack>
    );
}
