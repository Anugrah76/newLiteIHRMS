import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

// --- Interfaces ---

export interface CompOffRequest {
    id: string;
    emp_name: string;
    date: string;
    reason: string;
    status: string;
    [key: string]: any;
}

export interface ResignationRequest {
    id: string;
    emp_name: string;
    resignation_date: string;
    reason: string;
    status: string;
    [key: string]: any;
}

export interface MissedPunchRequest {
    id: string;
    emp_name: string;
    date: string;
    reason: string;
    status: string;
    [key: string]: any;
}

// --- CompOff API ---

export const getCompOffList = async (): Promise<ApiResponse<CompOffRequest[]>> => {
    console.log('🔍 [getCompOffList] Requesting:', API_ENDPOINTS.compoffList());
    const { data } = await apiClient.post(API_ENDPOINTS.compoffList());
    console.log('✅ [getCompOffList] Response:', data);
    return data;
};

export const approveCompOff = async (payload: any): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveCompOff] Endpoint:', API_ENDPOINTS.approveCompoff());
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    const { data } = await apiClient.post(API_ENDPOINTS.approveCompoff(), formData);
    console.log('✅ [approveCompOff] Response:', data);
    return data;
};

// --- Resignation API ---

export const getResignationList = async (): Promise<ApiResponse<ResignationRequest[]>> => {
    console.log('🔍 [getResignationList] Requesting:', API_ENDPOINTS.resignationList());
    const { data } = await apiClient.post(API_ENDPOINTS.resignationList());
    console.log('✅ [getResignationList] Response:', data);
    return data;
};

export const approveResignation = async (payload: any): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveResignation] Endpoint:', API_ENDPOINTS.approveResignation());
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    const { data } = await apiClient.post(API_ENDPOINTS.approveResignation(), formData);
    console.log('✅ [approveResignation] Response:', data);
    return data;
};

// --- Missed Punch API ---

export const getMissedPunchList = async (): Promise<ApiResponse<MissedPunchRequest[]>> => {
    console.log('🔍 [getMissedPunchList] Requesting:', API_ENDPOINTS.missPunchList());
    const { data } = await apiClient.post(API_ENDPOINTS.missPunchList());
    console.log('✅ [getMissedPunchList] Response:', data);
    return data;
};

export const approveMissedPunch = async (payload: any): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveMissedPunch] Endpoint:', API_ENDPOINTS.approveMPunch());
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    const { data } = await apiClient.post(API_ENDPOINTS.approveMPunch(), formData);
    console.log('✅ [approveMissedPunch] Response:', data);
    return data;
};

// --- Hooks ---

export const useCompOffList = () => useQuery({ queryKey: ['compOffList'], queryFn: getCompOffList });
export const useApproveCompOff = () => useMutation({ mutationFn: approveCompOff });

export const useResignationList = () => useQuery({ queryKey: ['resignationList'], queryFn: getResignationList });
export const useApproveResignation = () => useMutation({ mutationFn: approveResignation });

export const useMissedPunchList = () => useQuery({ queryKey: ['missedPunchList'], queryFn: getMissedPunchList });
export const useApproveMissedPunch = () => useMutation({ mutationFn: approveMissedPunch });
