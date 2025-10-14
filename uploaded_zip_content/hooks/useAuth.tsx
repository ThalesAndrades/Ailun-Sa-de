/**
 * Hook de compatibilidade para autenticação
 * Redireciona para o hook CPF correto
 */

import { useCPFAuth } from './useCPFAuth';

export function useAuth() {
  return useCPFAuth();
}