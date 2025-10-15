
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Receber webhook do Asaas
    const webhook = await req.json();
    
    const { event, payment } = webhook;

    // Registrar webhook para auditoria
    await supabase.from('asaas_webhooks').insert({
      event,
      payment_id: payment?.id,
      subscription_id: payment?.subscription,
      customer_id: payment?.customer,
      payload: webhook,
      created_at: new Date().toISOString(),
    });

    // Processar evento
    const beneficiaryUuid = payment?.externalReference;
    
    if (!beneficiaryUuid) {
      console.warn('Webhook sem externalReference:', payment?.id);
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook sem externalReference' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar status baseado no evento
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Atualizar perfil do usuário
        await supabase
          .from('profiles') // Fix: Removed invalid characters
          .update({
            subscription_status: 'ACTIVE',
            last_payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('beneficiary_uuid', beneficiaryUuid);

        // Registrar pagamento
        await supabase.from('payment_logs').insert({
          beneficiary_uuid: beneficiaryUuid,
          payment_id: payment.id,
          subscription_id: payment.subscription,
          value: payment.value,
          status: 'RECEIVED',
          billing_type: payment.billingType,
          due_date: payment.dueDate,
          payment_date: payment.clientPaymentDate || new Date().toISOString(), // Usar a data de pagamento do Asaas se disponível, senão a data atual.
          invoice_url: payment.invoiceUrl,
          bank_slip_url: payment.bankSlipUrl,
          metadata: payment,
          created_at: new Date().toISOString(),
        });

        // Criar notificação
        await supabase.from('system_notifications').insert({
          beneficiary_uuid: beneficiaryUuid,
          type: 'payment_confirmed',
          title: 'Pagamento Confirmado',
          message: `Seu pagamento de R$ ${payment.value.toFixed(2)} foi confirmado! Sua assinatura está ativa.`,
          priority: 'high',
          created_at: new Date().toISOString(),
        });
        break;

      case 'PAYMENT_OVERDUE':
        await supabase // Fix: Corrected 'supabas' to 'supabase' and removed invalid characters
          .from('profiles')
          .update({
            subscription_status: 'OVERDUE',
            updated_at: new Date().toISOString(),
          })
          .eq('beneficiary_uuid', beneficiaryUuid);

        // Criar notificação
        await supabase.from('system_notifications').insert({
          beneficiary_uuid: beneficiaryUuid,
          type: 'payment_overdue',
          title: 'Pagamento Vencido',
          message: 'Seu pagamento está vencido. Por favor, regularize sua situação para continuar usando os serviços.',
          priority: 'high',
          created_at: new Date().toISOString(),
        });
        break;

      case 'PAYMENT_REFUNDED':
        await supabase
          .from('profiles') // Fix: Removed invalid characters
          .update({
            subscription_status: 'REFUNDED',
            updated_at: new Date().toISOString(),
          })
          .eq('beneficiary_uuid', beneficiaryUuid);

        // Criar notificação
        await supabase.from('system_notifications').insert({
          beneficiary_uuid: beneficiaryUuid,
          type: 'payment_refunded',
          title: 'Pagamento Reembolsado',
          message: 'Seu pagamento foi reembolsado. Entre em contato se tiver dúvidas.',
          priority: 'medium',
          created_at: new Date().toISOString(),
        });
        break;

      case 'PAYMENT_CREATED':
        // Registrar novo pagamento pendente
        await supabase.from('payment_logs').insert({
          beneficiary_uuid: beneficiaryUuid,
          payment_id: payment.id,
          subscription_id: payment.subscription,
          value: payment.value,
          status: 'PENDING',
          billing_type: payment.billingType,
          due_date: payment.dueDate,
          invoice_url: payment.invoiceUrl,
          bank_slip_url: payment.bankSlipUrl,
          metadata: payment,
          created_at: new Date().toISOString(),
        });
        break;
    }

    // Marcar webhook como processado
    await supabase
      .from('asaas_webhooks')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('payment_id', payment?.id)
      .eq('event', event);

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processado com sucesso' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
