/**
 * Templates de Mensagens Personalizadas - AiLun Saúde
 * 
 * Mensagens padronizadas para melhorar a experiência do usuário
 */

export const MessageTemplates = {
  // ========== AUTENTICAÇÃO ==========
  auth: {
    loginSuccess: (name: string) => ({
      title: '✅ Bem-vindo!',
      message: `Olá ${name}, é bom ter você de volta!`,
      type: 'success' as const,
    }),
    loginError: {
      title: '❌ Erro no Login',
      message: 'CPF ou senha incorretos. Verifique seus dados e tente novamente.',
      type: 'error' as const,
    },
    invalidCPF: {
      title: '⚠️ CPF Inválido',
      message: 'Por favor, digite um CPF válido com 11 dígitos.',
      type: 'warning' as const,
    },
    sessionExpired: {
      title: '⏱️ Sessão Expirada',
      message: 'Sua sessão expirou. Por favor, faça login novamente.',
      type: 'info' as const,
    },
  },

  // ========== MÉDICO IMEDIATO ==========
  immediate: {
    starting: {
      title: '⏳ Iniciando Consulta...',
      message: 'Estamos conectando você com um médico. Aguarde um momento.',
      type: 'info' as const,
    },
    success: (consultationUrl: string) => ({
      title: '✅ Consulta Pronta!',
      message: 'Sua consulta está pronta. Clique no botão abaixo para entrar na sala de atendimento.',
      type: 'success' as const,
      action: {
        label: 'Entrar na Consulta',
        url: consultationUrl,
      },
    }),
    error: {
      title: '❌ Erro ao Iniciar Consulta',
      message: 'Não foi possível iniciar a consulta. Tente novamente em alguns instantes.',
      type: 'error' as const,
    },
    noDoctor: {
      title: '⚠️ Médicos Indisponíveis',
      message: 'Todos os médicos estão ocupados no momento. Tente novamente em alguns minutos.',
      type: 'warning' as const,
    },
  },

  // ========== ESPECIALISTAS ==========
  specialist: {
    loadingSpecialties: {
      title: '⏳ Carregando Especialidades...',
      message: 'Buscando especialidades disponíveis.',
      type: 'info' as const,
    },
    noSpecialties: {
      title: '⚠️ Sem Especialidades',
      message: 'Não há especialidades disponíveis no momento.',
      type: 'warning' as const,
    },
    needsReferral: (specialty: string) => ({
      title: '📋 Encaminhamento Necessário',
      message: `Para consultar com ${specialty}, você precisa de um encaminhamento do clínico geral.`,
      type: 'warning' as const,
      action: {
        label: 'Agendar Clínico Geral',
      },
    }),
    loadingSchedules: {
      title: '⏳ Carregando Horários...',
      message: 'Buscando horários disponíveis.',
      type: 'info' as const,
    },
    noSchedules: (specialty: string) => ({
      title: '⚠️ Sem Horários Disponíveis',
      message: `Não há horários disponíveis para ${specialty} no momento. Tente novamente mais tarde.`,
      type: 'warning' as const,
    }),
    schedulingSuccess: (specialty: string, date: string) => ({
      title: '✅ Consulta Agendada!',
      message: `Sua consulta de ${specialty} foi agendada para ${date}. Você receberá um lembrete 30 minutos antes.`,
      type: 'success' as const,
      action: {
        label: 'Ver Minhas Consultas',
      },
    }),
    schedulingError: {
      title: '❌ Erro ao Agendar',
      message: 'Não foi possível agendar sua consulta. Tente novamente.',
      type: 'error' as const,
    },
  },

  // ========== CANCELAMENTO ==========
  cancellation: {
    confirmPrompt: (specialty: string, date: string) => ({
      title: '⚠️ Confirmar Cancelamento',
      message: `Tem certeza que deseja cancelar sua consulta de ${specialty} agendada para ${date}?`,
      type: 'warning' as const,
      confirmLabel: 'Sim, Cancelar',
      cancelLabel: 'Não, Manter Consulta',
    }),
    cancelling: {
      title: '⏳ Cancelando Consulta...',
      message: 'Processando cancelamento.',
      type: 'info' as const,
    },
    success: (specialty: string) => ({
      title: '✅ Consulta Cancelada',
      message: `Sua consulta de ${specialty} foi cancelada com sucesso.`,
      type: 'info' as const,
      action: {
        label: 'Agendar Nova Consulta',
      },
    }),
    error: {
      title: '❌ Erro ao Cancelar',
      message: 'Não foi possível cancelar a consulta. Tente novamente.',
      type: 'error' as const,
    },
  },

  // ========== NOTIFICAÇÕES ==========
  notifications: {
    reminder30min: (specialty: string) => ({
      title: '⏰ Lembrete de Consulta',
      message: `Sua consulta de ${specialty} começa em 30 minutos!`,
      type: 'info' as const,
    }),
    reminder24h: (specialty: string, date: string) => ({
      title: '📅 Lembrete: Consulta Amanhã',
      message: `Não esqueça! Você tem consulta de ${specialty} amanhã às ${date}.`,
      type: 'info' as const,
    }),
    appointmentConfirmed: (specialty: string, date: string) => ({
      title: '✅ Consulta Confirmada',
      message: `Sua consulta de ${specialty} está confirmada para ${date}.`,
      type: 'success' as const,
    }),
    referralApproved: (specialty: string) => ({
      title: '📋 Encaminhamento Aprovado',
      message: `Você recebeu encaminhamento para ${specialty}. Agora pode agendar sua consulta!`,
      type: 'success' as const,
      action: {
        label: 'Agendar Agora',
      },
    }),
  },

  // ========== ERROS GERAIS ==========
  errors: {
    network: {
      title: '🌐 Erro de Conexão',
      message: 'Verifique sua conexão com a internet e tente novamente.',
      type: 'error' as const,
    },
    server: {
      title: '⚠️ Erro no Servidor',
      message: 'Nossos servidores estão temporariamente indisponíveis. Tente novamente em alguns minutos.',
      type: 'error' as const,
    },
    unknown: {
      title: '❌ Erro Inesperado',
      message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      type: 'error' as const,
    },
    timeout: {
      title: '⏱️ Tempo Esgotado',
      message: 'A operação demorou muito tempo. Verifique sua conexão e tente novamente.',
      type: 'error' as const,
    },
  },

  // ========== LOADING STATES ==========
  loading: {
    default: {
      title: '⏳ Carregando...',
      message: 'Por favor, aguarde.',
      type: 'info' as const,
    },
    saving: {
      title: '💾 Salvando...',
      message: 'Salvando suas informações.',
      type: 'info' as const,
    },
    processing: {
      title: '⚙️ Processando...',
      message: 'Processando sua solicitação.',
      type: 'info' as const,
    },
  },

  // ========== CONFIRMAÇÕES ==========
  confirmations: {
    logout: {
      title: '🚪 Sair do Aplicativo',
      message: 'Tem certeza que deseja sair?',
      type: 'warning' as const,
      confirmLabel: 'Sim, Sair',
      cancelLabel: 'Cancelar',
    },
    deleteAccount: {
      title: '⚠️ Excluir Conta',
      message: 'Esta ação é irreversível. Tem certeza que deseja excluir sua conta?',
      type: 'error' as const,
      confirmLabel: 'Sim, Excluir',
      cancelLabel: 'Cancelar',
    },
  },

  // ========== SUCESSO ==========
  success: {
    saved: {
      title: '✅ Salvo com Sucesso',
      message: 'Suas informações foram salvas.',
      type: 'success' as const,
    },
    updated: {
      title: '✅ Atualizado',
      message: 'Informações atualizadas com sucesso.',
      type: 'success' as const,
    },
    deleted: {
      title: '✅ Excluído',
      message: 'Item excluído com sucesso.',
      type: 'success' as const,
    },
  },

  // ========== VALIDAÇÕES ==========
  validation: {
    requiredField: (fieldName: string) => ({
      title: '⚠️ Campo Obrigatório',
      message: `O campo "${fieldName}" é obrigatório.`,
      type: 'warning' as const,
    }),
    invalidEmail: {
      title: '⚠️ Email Inválido',
      message: 'Por favor, digite um email válido.',
      type: 'warning' as const,
    },
    invalidPhone: {
      title: '⚠️ Telefone Inválido',
      message: 'Por favor, digite um telefone válido.',
      type: 'warning' as const,
    },
    invalidDate: {
      title: '⚠️ Data Inválida',
      message: 'Por favor, selecione uma data válida.',
      type: 'warning' as const,
    },
  },
};

/**
 * Mensagens de boas-vindas personalizadas por horário
 */
export function getGreetingMessage(name: string): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return `Bom dia, ${name}! ☀️`;
  } else if (hour >= 12 && hour < 18) {
    return `Boa tarde, ${name}! 🌤️`;
  } else {
    return `Boa noite, ${name}! 🌙`;
  }
}

/**
 * Formatar data para exibição amigável
 */
export function formatFriendlyDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `amanhã às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === -1) {
    return `ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays > 1 && diffDays <= 7) {
    return `em ${diffDays} dias às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Mensagens de status de consulta
 */
export const ConsultationStatusMessages = {
  scheduled: {
    title: '📅 Agendada',
    color: '#2196F3',
  },
  active: {
    title: '🟢 Em Andamento',
    color: '#4CAF50',
  },
  completed: {
    title: '✅ Concluída',
    color: '#9E9E9E',
  },
  cancelled: {
    title: '❌ Cancelada',
    color: '#f44336',
  },
  missed: {
    title: '⚠️ Perdida',
    color: '#FF9800',
  },
};

