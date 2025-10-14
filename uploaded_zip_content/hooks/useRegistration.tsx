import { useState } from 'react';
import { 
  processRegistration, 
  checkPaymentStatus,
  type RegistrationData,
  type RegistrationResult 
} from '../services/registration';

export interface UseRegistrationReturn {
  loading: boolean;
  processing: boolean;
  register: (data: RegistrationData) => Promise<RegistrationResult>;
  checkPayment: (paymentId: string) => Promise<any>;
}

export function useRegistration(): UseRegistrationReturn {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const register = async (data: RegistrationData): Promise<RegistrationResult> => {
    setLoading(true);
    setProcessing(true);
    
    try {
      const result = await processRegistration(data);
      return result;
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const checkPayment = async (paymentId: string) => {
    return await checkPaymentStatus(paymentId);
  };

  return {
    loading,
    processing,
    register,
    checkPayment,
  };
}