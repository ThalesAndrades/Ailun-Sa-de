-- ===========================
-- SCHEMA DE PAGAMENTOS - ASAAS
-- ===========================

-- Adicionar colunas de assinatura na tabela user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS asaas_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'INACTIVE',
ADD COLUMN IF NOT EXISTS subscription_value DECIMAL(10,2) DEFAULT 89.90,
ADD COLUMN IF NOT EXISTS subscription_billing_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_asaas_customer 
ON user_profiles(asaas_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_asaas_subscription 
ON user_profiles(asaas_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status);

-- Tabela de logs de pagamentos
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_uuid VARCHAR(255) NOT NULL,
  payment_id VARCHAR(255) NOT NULL,
  subscription_id VARCHAR(255),
  value DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  billing_type VARCHAR(20) NOT NULL,
  due_date DATE,
  payment_date TIMESTAMPTZ,
  invoice_url TEXT,
  bank_slip_url TEXT,
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_beneficiary 
ON payment_logs(beneficiary_uuid);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id 
ON payment_logs(payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_logs_status 
ON payment_logs(status);

CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at 
ON payment_logs(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_logs_updated_at
BEFORE UPDATE ON payment_logs
FOR EACH ROW
EXECUTE FUNCTION update_payment_logs_updated_at();

-- Tabela de webhooks do Asaas
CREATE TABLE IF NOT EXISTS asaas_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  payment_id VARCHAR(255),
  subscription_id VARCHAR(255),
  customer_id VARCHAR(255),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para asaas_webhooks
CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_event 
ON asaas_webhooks(event);

CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_payment_id 
ON asaas_webhooks(payment_id);

CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_processed 
ON asaas_webhooks(processed);

CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_created_at 
ON asaas_webhooks(created_at DESC);

-- Comentários nas tabelas
COMMENT ON TABLE payment_logs IS 'Registro de todos os pagamentos processados via Asaas';
COMMENT ON TABLE asaas_webhooks IS 'Registro de webhooks recebidos do Asaas para auditoria';

COMMENT ON COLUMN user_profiles.asaas_customer_id IS 'ID do cliente no Asaas';
COMMENT ON COLUMN user_profiles.asaas_subscription_id IS 'ID da assinatura ativa no Asaas';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Status da assinatura: ACTIVE, INACTIVE, OVERDUE, CANCELED, REFUNDED';
COMMENT ON COLUMN user_profiles.subscription_value IS 'Valor mensal da assinatura (R$ 89,90)';
COMMENT ON COLUMN user_profiles.subscription_billing_type IS 'Forma de pagamento: CREDIT_CARD, PIX';
COMMENT ON COLUMN user_profiles.last_payment_date IS 'Data do último pagamento recebido';

