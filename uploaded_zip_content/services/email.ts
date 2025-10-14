/**
 * Serviço de Email - AiLun Saúde
 * 
 * Utiliza Resend (https://resend.com) para envio de emails transacionais
 * 
 * Para configurar:
 * 1. Criar conta em https://resend.com
 * 2. Obter API Key
 * 3. Adicionar ao .env: RESEND_API_KEY=re_xxxxx
 * 4. Verificar domínio (ou usar resend.dev para testes)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'AiLun Saúde <noreply@ailun.com.br>'; // Alterar para seu domínio verificado
const FROM_EMAIL_DEV = 'AiLun Saúde <onboarding@resend.dev>'; // Para testes

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Enviar email usando Resend API
 */
async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada');
      return { success: false, error: 'API Key não configurada' };
    }

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL_DEV, // Usar FROM_EMAIL quando domínio estiver verificado
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar email:', data);
      return { success: false, error: data.message || 'Erro ao enviar email' };
    }

    console.log('Email enviado com sucesso:', data.id);
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Email de boas-vindas ao novo beneficiário
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  cpf: string
): Promise<{ success: boolean; error?: string }> {
  const senha = cpf.replace(/\D/g, '').substring(0, 4);

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao AiLun Saúde</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bem-vindo ao AiLun Saúde! 🎉</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                É um prazer tê-lo(a) conosco! Seu cadastro foi realizado com sucesso e agora você tem acesso completo aos nossos serviços de telemedicina.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">📱 Suas Credenciais de Acesso</h3>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                  <strong>Login (CPF):</strong> ${cpf}
                </p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>Senha:</strong> ${senha} <span style="color: #999;">(4 primeiros dígitos do seu CPF)</span>
                </p>
              </div>
              
              <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px 0;">🏥 Serviços Disponíveis</h3>
              <ul style="padding-left: 20px; color: #666; line-height: 1.8;">
                <li><strong>Médico Imediato:</strong> Atendimento rápido com clínico geral</li>
                <li><strong>Especialistas:</strong> Consultas com médicos especializados</li>
                <li><strong>Nutricionista:</strong> Acompanhamento nutricional</li>
                <li><strong>Psicologia:</strong> Suporte psicológico profissional</li>
              </ul>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://ailun.com.br" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Acessar Aplicativo
                </a>
              </div>
              
              <p style="font-size: 14px; color: #999; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                💡 <strong>Dica:</strong> Recomendamos que você altere sua senha no primeiro acesso para maior segurança.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                <strong>AiLun Tecnologia</strong><br>
                CNPJ: 60.740.536/0001-75
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Bem-vindo ao AiLun Saúde!

Olá ${name},

É um prazer tê-lo(a) conosco! Seu cadastro foi realizado com sucesso.

SUAS CREDENCIAIS:
Login (CPF): ${cpf}
Senha: ${senha} (4 primeiros dígitos do seu CPF)

SERVIÇOS DISPONÍVEIS:
- Médico Imediato
- Especialistas
- Nutricionista
- Psicologia

AiLun Tecnologia
CNPJ: 60.740.536/0001-75
  `;

  return await sendEmail({
    to: email,
    subject: '🎉 Bem-vindo ao AiLun Saúde!',
    html,
    text,
  });
}

/**
 * Email de confirmação de agendamento
 */
export async function sendAppointmentConfirmationEmail(
  email: string,
  name: string,
  specialty: string,
  appointmentDate: Date,
  appointmentUuid: string
): Promise<{ success: boolean; error?: string }> {
  const dateFormatted = appointmentDate.toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consulta Agendada</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Consulta Agendada!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
                Sua consulta foi agendada com sucesso! Confira os detalhes abaixo:
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 25px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 20px 0; color: #4CAF50; font-size: 18px;">📅 Detalhes da Consulta</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="font-weight: bold; color: #666; font-size: 14px; width: 120px;">Especialidade:</td>
                    <td style="color: #333; font-size: 14px;">${specialty}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: #666; font-size: 14px;">Data e Hora:</td>
                    <td style="color: #333; font-size: 14px;">${dateFormatted}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: #666; font-size: 14px;">Protocolo:</td>
                    <td style="color: #333; font-size: 14px; font-family: monospace;">${appointmentUuid.substring(0, 8).toUpperCase()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">⏰ Lembrete Importante</h4>
                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
                  Você receberá uma notificação 30 minutos antes da consulta. Certifique-se de estar em um local tranquilo com boa conexão de internet.
                </p>
              </div>
              
              <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px 0;">📋 Antes da Consulta</h3>
              <ul style="padding-left: 20px; color: #666; line-height: 1.8;">
                <li>Tenha em mãos seus exames recentes (se houver)</li>
                <li>Anote suas dúvidas e sintomas</li>
                <li>Esteja em um ambiente silencioso</li>
                <li>Verifique sua conexão de internet</li>
              </ul>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://ailun.com.br/consultas" style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Ver Minhas Consultas
                </a>
              </div>
              
              <p style="font-size: 14px; color: #999; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                Precisa cancelar ou reagendar? Acesse o aplicativo e gerencie suas consultas.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                <strong>AiLun Tecnologia</strong><br>
                CNPJ: 60.740.536/0001-75
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Consulta Agendada!

Olá ${name},

Sua consulta foi agendada com sucesso!

DETALHES:
Especialidade: ${specialty}
Data e Hora: ${dateFormatted}
Protocolo: ${appointmentUuid.substring(0, 8).toUpperCase()}

Você receberá uma notificação 30 minutos antes da consulta.

AiLun Tecnologia
CNPJ: 60.740.536/0001-75
  `;

  return await sendEmail({
    to: email,
    subject: `✅ Consulta Agendada - ${specialty}`,
    html,
    text,
  });
}

/**
 * Email de lembrete de consulta (24h antes)
 */
export async function sendAppointmentReminderEmail(
  email: string,
  name: string,
  specialty: string,
  appointmentDate: Date
): Promise<{ success: boolean; error?: string }> {
  const dateFormatted = appointmentDate.toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete de Consulta</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Lembrete de Consulta</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
                Este é um lembrete de que você tem uma consulta agendada para amanhã:
              </p>
              
              <div style="background-color: #fff3e0; border-left: 4px solid #FF9800; padding: 25px; margin: 30px 0; border-radius: 4px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; color: #E65100; font-size: 24px;">${specialty}</h2>
                <p style="margin: 0; font-size: 18px; color: #E65100; font-weight: bold;">${dateFormatted}</p>
              </div>
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 30px 0;">
                Não esqueça de se preparar para a consulta! 📋
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://ailun.com.br/consultas" style="display: inline-block; background-color: #FF9800; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Acessar Consulta
                </a>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                <strong>AiLun Tecnologia</strong><br>
                CNPJ: 60.740.536/0001-75
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Lembrete de Consulta

Olá ${name},

Você tem uma consulta agendada para amanhã:

${specialty}
${dateFormatted}

Não esqueça!

AiLun Tecnologia
CNPJ: 60.740.536/0001-75
  `;

  return await sendEmail({
    to: email,
    subject: `⏰ Lembrete: Consulta amanhã - ${specialty}`,
    html,
    text,
  });
}

/**
 * Email de cancelamento de consulta
 */
export async function sendCancellationEmail(
  email: string,
  name: string,
  specialty: string,
  appointmentDate: Date
): Promise<{ success: boolean; error?: string }> {
  const dateFormatted = appointmentDate.toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consulta Cancelada</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">❌ Consulta Cancelada</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
                Sua consulta foi cancelada conforme solicitado:
              </p>
              
              <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 25px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                  <strong>Especialidade:</strong> ${specialty}
                </p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>Data e Hora:</strong> ${dateFormatted}
                </p>
              </div>
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 30px 0;">
                Você pode agendar uma nova consulta a qualquer momento através do aplicativo.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://ailun.com.br/agendar" style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Agendar Nova Consulta
                </a>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                <strong>AiLun Tecnologia</strong><br>
                CNPJ: 60.740.536/0001-75
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Consulta Cancelada

Olá ${name},

Sua consulta foi cancelada:

Especialidade: ${specialty}
Data e Hora: ${dateFormatted}

Você pode agendar uma nova consulta a qualquer momento.

AiLun Tecnologia
CNPJ: 60.740.536/0001-75
  `;

  return await sendEmail({
    to: email,
    subject: `❌ Consulta Cancelada - ${specialty}`,
    html,
    text,
  });
}

