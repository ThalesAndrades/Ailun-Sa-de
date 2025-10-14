/**
 * Layout de Abas Simplificado
 */

import React from 'react';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  // Redirecionar diretamente para o dashboard
  return <Redirect href="/dashboard" />;
}