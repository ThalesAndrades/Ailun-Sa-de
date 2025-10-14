import { useContext } from 'react';
import { CPFAuthContext, CPFAuthContextType } from '../contexts/CPFAuthContext';

export function useCPFAuth(): CPFAuthContextType {
  const context = useContext(CPFAuthContext);
  if (!context) {
    throw new Error('useCPFAuth deve ser usado dentro de um CPFAuthProvider');
  }
  return context;
}