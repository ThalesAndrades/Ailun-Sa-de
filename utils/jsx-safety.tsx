/**
 * Utilitário para Segurança JSX
 * Previne erros de "text node" em React Native
 */

import React from 'react';
import { Text } from 'react-native';

/**
 * Renderiza texto apenas se não for falsy
 * Previne erro "Unexpected text node"
 */
export const SafeText = ({ children, style }: { children: any; style?: any }) => {
  if (children === null || children === undefined || children === false || children === '') {
    return null;
  }
  return <Text style={style}>{String(children)}</Text>;
};

/**
 * Renderiza componente apenas se condição for verdadeira
 */
export const SafeRender = ({ condition, children }: { condition: any; children: React.ReactNode }) => {
  return condition ? <>{children}</> : null;
};

/**
 * Limpa valores falsy para usar em expressões condicionais JSX
 */
export const safeBool = (value: any): boolean => {
  return Boolean(value);
};

/**
 * Converte valor para string segura para JSX
 */
export const safeString = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined || value === false) {
    return fallback;
  }
  return String(value);
};

/**
 * Hook para valores seguros em JSX
 */
export const useSafeValue = (value: any, fallback: any = null) => {
  if (value === null || value === undefined || value === false || value === '') {
    return fallback;
  }
  return value;
};