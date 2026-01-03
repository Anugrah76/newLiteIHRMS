import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/store/authSlice';
import * as ticketingApi from '../api/ticketingApi';
import { CreateTicketPayload, MyTicketsPayload } from '../types';

export const useTicketHandlers = () => {
    const { user } = useAuthStore.getState();
    return useQuery({
        queryKey: ['ticketHandlers', user?.indo_code],
        queryFn: () => ticketingApi.getTicketHandlers(user?.api_key || '', user?.indo_code || ''),
        enabled: !!user?.api_key,
    });
};

export const useMyTickets = (year: string, month: string, status: string) => {
    const { user } = useAuthStore.getState();
    return useQuery({
        queryKey: ['myTickets', year, month, status],
        queryFn: () => ticketingApi.getMyTickets({
            key: user?.api_key || '',
            indo_code: user?.indo_code || '',
            year,
            month,
            ticket_status: status
        }),
        enabled: !!user?.api_key && !!year && !!month,
    });
};

export const useAssignedTickets = (year: string, month: string, status: string) => {
    const { user } = useAuthStore.getState();
    return useQuery({
        queryKey: ['assignedTickets', year, month, status],
        queryFn: () => ticketingApi.getAssignedTickets({
            key: user?.api_key || '',
            indo_code: user?.indo_code || '',
            year,
            month,
            ticket_status: status
        }),
        enabled: !!user?.api_key && !!year && !!month,
    });
};

export const useTicketChat = (ticketId: string) => {
    const { user } = useAuthStore.getState();
    return useQuery({
        queryKey: ['ticketChat', ticketId],
        queryFn: () => ticketingApi.getTicketChat(ticketId, user?.api_key || '', user?.indo_code || ''),
        enabled: !!user?.api_key && !!ticketId,
        refetchInterval: 10000, // Refresh chat every 10 seconds
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ticketingApi.createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTickets'] });
        },
    });
};
