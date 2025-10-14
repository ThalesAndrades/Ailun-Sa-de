/**
 * Mensagens de Erro Personalizadas - AiLun Saúde
 * Todas as mensagens de erro da plataforma devem ser educadas, profissionais e centradas no paciente
 */

export const ErrorMessages = {
  // Erros de Autenticação
  AUTH: {
    INVALID_CREDENTIALS: 'Desculpe, não conseguimos encontrar uma conta com essas credenciais. Por favor, verifique seu CPF e tente novamente.',
    CPF_REQUIRED: 'Por favor, informe seu CPF para continuar.',
    CPF_INVALID: 'O CPF informado não é válido. Por favor, verifique e tente novamente.',
    SESSION_EXPIRED: 'Sua sessão expirou por segurança. Por favor, faça login novamente.',
    UNAUTHORIZED: 'Você precisa estar autenticado para acessar esta área.',
    ACCOUNT_LOCKED: 'Sua conta foi temporariamente bloqueada por segurança. Entre em contato com nosso suporte.',
    NETWORK_ERROR: 'Não conseguimos conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
  },

  // Erros de Cadastro
  SIGNUP: {
    CPF_ALREADY_EXISTS: 'Já existe uma conta cadastrada com este CPF. Você pode fazer login ou recuperar sua senha.',
    EMAIL_ALREADY_EXISTS: 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.',
    INVALID_EMAIL: 'O e-mail informado não é válido. Por favor, verifique e tente novamente.',
    WEAK_PASSWORD: 'Sua senha precisa ter pelo menos 8 caracteres, incluindo letras e números.',
    PASSWORDS_DONT_MATCH: 'As senhas não coincidem. Por favor, verifique e tente novamente.',
    REQUIRED_FIELD: 'Este campo é obrigatório. Por favor, preencha para continuar.',
    INVALID_PHONE: 'O número de telefone informado não é válido. Por favor, verifique.',
    INVALID_DATE: 'A data informada não é válida. Por favor, verifique.',
    UNDERAGE: 'Você precisa ter pelo menos 18 anos para se cadastrar.',
    TERMS_NOT_ACCEPTED: 'Para continuar, você precisa aceitar nossos Termos de Uso e Política de Privacidade.',
  },

  // Erros de Pagamento
  PAYMENT: {
    PAYMENT_FAILED: 'Não conseguimos processar seu pagamento. Por favor, verifique os dados do cartão e tente novamente.',
    CARD_DECLINED: 'Seu cartão foi recusado. Entre em contato com seu banco ou tente outro cartão.',
    INSUFFICIENT_FUNDS: 'Saldo insuficiente. Por favor, verifique com seu banco ou tente outro cartão.',
    INVALID_CARD: 'Os dados do cartão estão incorretos. Por favor, verifique e tente novamente.',
    EXPIRED_CARD: 'Seu cartão está vencido. Por favor, use outro cartão.',
    PAYMENT_TIMEOUT: 'O pagamento demorou muito para ser processado. Por favor, tente novamente.',
    PIX_GENERATION_FAILED: 'Não conseguimos gerar o código PIX. Por favor, tente novamente em alguns instantes.',
  },

  // Erros de Consulta
  CONSULTATION: {
    NO_DOCTORS_AVAILABLE: 'No momento, não há médicos disponíveis. Por favor, tente novamente em alguns minutos ou agende uma consulta.',
    SCHEDULE_FAILED: 'Não conseguimos agendar sua consulta. Por favor, tente novamente.',
    INVALID_SPECIALTY: 'A especialidade selecionada não é válida. Por favor, escolha outra.',
    NO_SLOTS_AVAILABLE: 'Não há horários disponíveis para esta especialidade no momento. Por favor, tente outro dia ou especialidade.',
    CONSULTATION_NOT_FOUND: 'Não encontramos esta consulta. Por favor, verifique e tente novamente.',
    ALREADY_IN_CONSULTATION: 'Você já está em uma consulta ativa. Por favor, finalize-a antes de iniciar outra.',
    REFERRAL_REQUIRED: 'Esta especialidade requer um encaminhamento médico. Por favor, consulte um clínico geral primeiro.',
    CONNECTION_FAILED: 'Não conseguimos conectar à videochamada. Verifique sua conexão com a internet e tente novamente.',
  },

  // Erros de Perfil
  PROFILE: {
    UPDATE_FAILED: 'Não conseguimos atualizar seu perfil. Por favor, tente novamente.',
    PHOTO_UPLOAD_FAILED: 'Não conseguimos enviar sua foto. Por favor, tente novamente.',
    PHOTO_TOO_LARGE: 'A foto é muito grande. Por favor, escolha uma imagem menor que 5MB.',
    INVALID_PHOTO_FORMAT: 'Formato de foto não suportado. Use JPG, PNG ou GIF.',
  },

  // Erros de Plano/Assinatura
  SUBSCRIPTION: {
    NO_ACTIVE_PLAN: 'Você não possui um plano ativo. Por favor, assine um plano para acessar nossos serviços.',
    PLAN_EXPIRED: 'Seu plano expirou. Por favor, renove para continuar usando nossos serviços.',
    PLAN_NOT_FOUND: 'Não encontramos informações sobre seu plano. Entre em contato com nosso suporte.',
    UPGRADE_REQUIRED: 'Este serviço não está incluído no seu plano atual. Faça um upgrade para acessar.',
  },

  // Erros da API Rapidoc
  RAPIDOC: {
    API_ERROR: 'Estamos com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.',
    BENEFICIARY_NOT_FOUND: 'Não encontramos seu cadastro como beneficiário. Por favor, complete seu cadastro.',
    INVALID_REQUEST: 'Houve um erro ao processar sua solicitação. Por favor, tente novamente.',
    TIMEOUT: 'A solicitação demorou muito para ser processada. Por favor, tente novamente.',
    RATE_LIMIT: 'Você fez muitas solicitações em pouco tempo. Por favor, aguarde alguns minutos e tente novamente.',
  },

  // Erros Gerais
  GENERAL: {
    UNKNOWN_ERROR: 'Algo deu errado. Por favor, tente novamente ou entre em contato com nosso suporte.',
    NETWORK_ERROR: 'Não conseguimos conectar ao servidor. Verifique sua conexão com a internet.',
    SERVER_ERROR: 'Nossos servidores estão temporariamente indisponíveis. Por favor, tente novamente em alguns instantes.',
    MAINTENANCE: 'Estamos realizando uma manutenção programada. Voltaremos em breve.',
    NOT_FOUND: 'A página que você está procurando não foi encontrada.',
    PERMISSION_DENIED: 'Você não tem permissão para acessar este recurso.',
  },

  // Mensagens de Validação
  VALIDATION: {
    REQUIRED: 'Este campo é obrigatório.',
    MIN_LENGTH: (min: number) => `Este campo deve ter pelo menos ${min} caracteres.`,
    MAX_LENGTH: (max: number) => `Este campo deve ter no máximo ${max} caracteres.`,
    EMAIL: 'Por favor, informe um e-mail válido.',
    PHONE: 'Por favor, informe um telefone válido.',
    CPF: 'Por favor, informe um CPF válido.',
    DATE: 'Por favor, informe uma data válida.',
    NUMBER: 'Por favor, informe um número válido.',
    POSITIVE_NUMBER: 'Por favor, informe um número positivo.',
  },
};

/**
 * Mensagens de Sucesso Personalizadas - AiLun Saúde
 */
export const SuccessMessages = {
  AUTH: {
    LOGIN_SUCCESS: 'Bem-vindo de volta! Que bom ter você aqui.',
    LOGOUT_SUCCESS: 'Você saiu com sucesso. Até breve!',
  },

  SIGNUP: {
    ACCOUNT_CREATED: 'Sua conta foi criada com sucesso! Bem-vindo à AiLun Saúde.',
    PROFILE_COMPLETED: 'Perfil completo! Agora você pode aproveitar todos os nossos serviços.',
  },

  PAYMENT: {
    PAYMENT_SUCCESS: 'Pagamento realizado com sucesso! Seu plano já está ativo.',
    PIX_GENERATED: 'Código PIX gerado com sucesso. Efetue o pagamento para ativar seu plano.',
  },

  CONSULTATION: {
    SCHEDULED: 'Consulta agendada com sucesso! Você receberá uma confirmação por e-mail.',
    STARTED: 'Conectando você ao médico. Aguarde um momento.',
    COMPLETED: 'Consulta finalizada. Obrigado por usar a AiLun Saúde!',
  },

  PROFILE: {
    UPDATED: 'Seu perfil foi atualizado com sucesso!',
    PHOTO_UPLOADED: 'Foto atualizada com sucesso!',
  },

  GENERAL: {
    SAVED: 'Alterações salvas com sucesso!',
    DELETED: 'Item removido com sucesso!',
    COPIED: 'Copiado para a área de transferência!',
  },
};

/**
 * Mensagens Informativas - AiLun Saúde
 */
export const InfoMessages = {
  CONSULTATION: {
    WAITING_DOCTOR: 'Estamos conectando você a um médico. O tempo médio de espera é de 5 a 10 minutos.',
    PREPARING_ROOM: 'Preparando a sala de consulta. Aguarde um momento.',
    DOCTOR_ASSIGNED: 'Um médico foi designado para você. Conectando...',
  },

  PAYMENT: {
    PROCESSING: 'Processando seu pagamento. Isso pode levar alguns segundos.',
    PIX_WAITING: 'Aguardando confirmação do pagamento PIX. Isso pode levar até 2 minutos.',
  },

  GENERAL: {
    LOADING: 'Carregando...',
    SAVING: 'Salvando...',
    PROCESSING: 'Processando...',
  },
};

