import { ApiResponse } from '@shared/types';

export interface Ticket {
    ticket_id: string;
    ticket_code: string; // Sometimes called indo_code in response
    indo_code?: string;
    subject: string;
    priority: 'High' | 'Normal' | 'Low';
    status: 'Open' | 'Closed' | 'Draft';
    create_datetime: string;
    department_person_name: string;
    department_id: string;
}

export interface TicketReply {
    ticket_answer: string;
    create_by: string;
    empcode: string;
    create_datetime: string;
    attachment: string;
    person_image?: string;
}

export interface TicketChatResponse {
    status: number;
    message: string;
    ticket_replies: TicketReply[];
}

export interface TicketHandler {
    id?: string;
    person_id?: string;
    person_name: string;
    person_mail_id: string;
    department_id: string;
    department_name?: string;
    company_id?: string;
}

export interface CreateTicketPayload {
    key: string;
    indo_code: string;
    company_id: string;
    person_name: string;
    person_mail_id: string;
    department_id: string;
    priority: string;
    subject: string;
    description: string;
    // Files would be handled via FormData separately if needed, but here they assume direct fields
}

export interface MyTicketsPayload {
    key: string;
    year: string;
    month: string;
    ticket_status: string;
    indo_code: string;
}
