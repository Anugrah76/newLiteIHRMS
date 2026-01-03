import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Ticket
 */
export interface Ticket {
    ticket_id: string;
    ticket_subject: string;
    ticket_description: string;
    ticket_status: string;
    ticket_priority: string;
    created_date: string;
    department: string;
}

/**
 * Ticket Handler (Department)
 */
export interface TicketHandler {
    department_id: string;
    department_name: string;
    person_id?: string;
    person_name?: string;
    person_mail_id?: string;
    company_id?: string;
}

/**
 * Ticket Chat Message
 */
export interface TicketChatMessage {
    message_id: string;
    message: string;
    sender_name: string;
    sent_date: string;
    is_own: boolean;
}

/**
 * Create Ticket Request
 */
export interface CreateTicketRequest {
    department_id: string; // Changed from dept_id to match legacy payload key
    company_id: string;
    person_name: string;
    person_mail_id: string;
    subject: string;
    description: string;
    priority?: string;
}

/**
 * Ticket Chat Request
 */
export interface TicketChatRequest {
    ticket_id: string;
    message: string;
}

/**
 * Get ticket departments/handlers
 * Original params: indo_code, key (auto-injected)
 */
export const getTicketHandlers = async (): Promise<ApiResponse<TicketHandler[]>> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getTicketHandlers] API Endpoint:', API_ENDPOINTS.ticketHandler());

    const { data } = await apiClient.post(API_ENDPOINTS.ticketHandler(), formData);

    console.log('✅ [getTicketHandlers] Response:', data);
    console.log('✅ [getTicketHandlers] Handlers count:', data?.data?.length || 0);
    return data;
};

/**
 * Get my tickets
 * Original params: indo_code, key (auto-injected)
 */
export const getMyTickets = async (): Promise<ApiResponse<Ticket[]>> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getMyTickets] API Endpoint:', API_ENDPOINTS.myTicket());

    const { data } = await apiClient.post(API_ENDPOINTS.myTicket(), formData);

    console.log('✅ [getMyTickets] Response:', data);
    console.log('✅ [getMyTickets] Tickets count:', data?.data?.length || 0);
    return data;
};

/**
 * Get assigned tickets (for support staff)
 * Original params: indo_code, key (auto-injected)
 */
export const getAssignedTickets = async (): Promise<ApiResponse<Ticket[]>> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getAssignedTickets] API Endpoint:', API_ENDPOINTS.assignedTicket());

    const { data } = await apiClient.post(API_ENDPOINTS.assignedTicket(), formData);

    console.log('✅ [getAssignedTickets] Response:', data);
    console.log('✅ [getAssignedTickets] Tickets count:', data?.data?.length || 0);
    return data;
};

/**
 * Create new ticket
 * Original params: indo_code, key, company_id, person_name, person_mail_id, department_id, priority, subject, description
 */
export const createTicket = async (params: CreateTicketRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // CRITICAL: Must use exact parameter names as original
    formData.append('department_id', params.department_id); // Legacy uses department_id
    formData.append('company_id', params.company_id);
    formData.append('person_name', params.person_name);
    formData.append('person_mail_id', params.person_mail_id);

    formData.append('subject', params.subject);
    formData.append('description', params.description);

    if (params.priority) {
        formData.append('priority', params.priority);
    }

    // indo_code and key auto-injected by interceptor

    console.log('🔍 [createTicket] API Endpoint:', API_ENDPOINTS.createTicket());
    console.log('🔍 [createTicket] Params:', params);

    // Log FormData entries
    const formDataEntries: any = {};
    formData.forEach((value, key) => { formDataEntries[key] = value; });
    console.log('🔍 [createTicket] FormData entries (before interceptor):', formDataEntries);

    const { data } = await apiClient.post(API_ENDPOINTS.createTicket(), formData);

    console.log('✅ [createTicket] Response:', data);
    return data;
};

/**
 * Send ticket chat message
 * Original params: indo_code, key, ticket_id, message
 */
export const sendTicketMessage = async (params: TicketChatRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // CRITICAL: Must use exact parameter names as original
    formData.append('ticket_id', params.ticket_id);
    formData.append('message', params.message);

    // indo_code and key auto-injected by interceptor

    console.log('🔍 [sendTicketMessage] API Endpoint:', API_ENDPOINTS.ticketChat());
    console.log('🔍 [sendTicketMessage] Params:', params);

    const { data } = await apiClient.post(API_ENDPOINTS.ticketChat(), formData);

    console.log('✅ [sendTicketMessage] Response:', data);
    return data;
};

/**
 * React Query hooks
 */
export const useTicketHandlers = () => {
    return useQuery({
        queryKey: ['ticketHandlers'],
        queryFn: getTicketHandlers,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useMyTickets = () => {
    return useQuery({
        queryKey: ['myTickets'],
        queryFn: getMyTickets,
    });
};

export const useAssignedTickets = () => {
    return useQuery({
        queryKey: ['assignedTickets'],
        queryFn: getAssignedTickets,
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTicket,
        onSuccess: () => {
            // Invalidate to refresh data
            queryClient.invalidateQueries({ queryKey: ['myTickets'] });
        },
    });
};

export const useSendTicketMessage = () => {
    return useMutation({
        mutationFn: sendTicketMessage,
    });
};
