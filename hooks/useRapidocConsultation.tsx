import { useState } from 'react';
import {
  requestImmediateConsultation,
  checkConsultationStatus,
  cancelImmediateConsultation,
  getAvailableSlots,
  scheduleConsultation,
  getAvailableSpecialties,
  completeConsultation,
  getConsultationHistory,
  type ImmediateConsultationRequest,
  type ScheduleConsultationRequest
} from '../services/rapidoc-consultation-service';

export interface UseRapidocConsultationReturn {
  loading: boolean;
  requestImmediate: (request: ImmediateConsultationRequest) => Promise<any>;
  checkStatus: (sessionId: string) => Promise<any>;
  cancelSession: (sessionId: string) => Promise<any>;
  getSlots: (serviceType: any, specialty?: string, startDate?: string) => Promise<any>;
  scheduleConsult: (request: ScheduleConsultationRequest) => Promise<any>;
  getSpecialties: () => Promise<any>;
  completeSession: (sessionId: string, rating: number, feedback?: string) => Promise<any>;
  getHistory: (beneficiaryUuid: string, limit?: number) => Promise<any>;
}

export function useRapidocConsultation(): UseRapidocConsultationReturn {
  const [loading, setLoading] = useState(false);

  const requestImmediate = async (request: ImmediateConsultationRequest) => {
    setLoading(true);
    try {
      const result = await requestImmediateConsultation(request);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (sessionId: string) => {
    return await checkConsultationStatus(sessionId);
  };

  const cancelSession = async (sessionId: string) => {
    return await cancelImmediateConsultation(sessionId);
  };

  const getSlots = async (serviceType: any, specialty?: string, startDate?: string) => {
    setLoading(true);
    try {
      const result = await getAvailableSlots(serviceType, specialty, startDate);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const scheduleConsult = async (request: ScheduleConsultationRequest) => {
    setLoading(true);
    try {
      const result = await scheduleConsultation(request);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getSpecialties = async () => {
    setLoading(true);
    try {
      const result = await getAvailableSpecialties();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (sessionId: string, rating: number, feedback?: string) => {
    return await completeConsultation(sessionId, rating, feedback);
  };

  const getHistory = async (beneficiaryUuid: string, limit?: number) => {
    return await getConsultationHistory(beneficiaryUuid, limit);
  };

  return {
    loading,
    requestImmediate,
    checkStatus,
    cancelSession,
    getSlots,
    scheduleConsult,
    getSpecialties,
    completeSession,
    getHistory,
  };
}