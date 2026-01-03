import { apiClient, createFormData } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import { ApiResponse } from '@shared/types';
import {
    Ticket,
    TicketHandler,
    TicketChatResponse,
    CreateTicketPayload,
    MyTicketsPayload
} from '../types';

export const getTicketHandlers = async (key: string, indo_code: string) => {
    const { data } = await apiClient.post<{ status: number; ticket_handlers: TicketHandler[] }>(
        API_ENDPOINTS.ticketHandler(),
        createFormData({ key, indo_code })
    );
    return data.ticket_handlers || [];
};

export const getMyTickets = async (payload: MyTicketsPayload) => {
    const { data } = await apiClient.post<{ status: string; queries: Ticket[] }>(
        API_ENDPOINTS.myTicket(),
        createFormData(payload)
    );
    return data.queries || [];
};

export const getAssignedTickets = async (payload: MyTicketsPayload) => {
    const { data } = await apiClient.post<{ status: string; queries: Ticket[]; response: number }>(
        API_ENDPOINTS.assignedTicket(),
        createFormData(payload)
    );
    return data.queries || [];
};

export const getTicketChat = async (ticketId: string, key: string, indo_code: string) => {
    const { data } = await apiClient.post<TicketChatResponse>(
        API_ENDPOINTS.ticketChat(),
        createFormData({ ticket_id: ticketId, key, indo_code })
    );
    return data;
};

export const createTicket = async (payload: CreateTicketPayload) => {
    const { data } = await apiClient.post<{ status: string; message: string }>(
        API_ENDPOINTS.createTicket(),
        createFormData(payload)
    );
    return data;
};
