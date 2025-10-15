-- Tabelas para suporte ao AI Assistant e MCP

-- Tabela para armazenar conversas com o AI Assistant
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    intent TEXT,
    confidence DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para análise de sintomas
CREATE TABLE IF NOT EXISTS symptom_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symptoms TEXT[] NOT NULL,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    recommendations TEXT[] NOT NULL,
    confidence_score DECIMAL(3,2),
    needs_human_review BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para solicitações de consulta via AI
CREATE TABLE IF NOT EXISTS consultation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    beneficiary_uuid TEXT,
    service_type TEXT NOT NULL,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    preferred_date TIMESTAMP WITH TIME ZONE,
    symptoms TEXT[],
    ai_recommendation TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'completed', 'cancelled')),
    rapidoc_appointment_id TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de emergência
CREATE TABLE IF NOT EXISTS emergency_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    beneficiary_uuid TEXT,
    emergency_type TEXT NOT NULL,
    location TEXT,
    symptoms TEXT[],
    ai_assessment JSONB,
    human_contacted BOOLEAN DEFAULT FALSE,
    emergency_services_called BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved', 'escalated')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para recomendações personalizadas de saúde
CREATE TABLE IF NOT EXISTS health_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    beneficiary_uuid TEXT,
    category TEXT NOT NULL, -- 'preventive', 'lifestyle', 'medical', 'appointment'
    recommendation TEXT NOT NULL,
    priority INTEGER DEFAULT 1, -- 1=baixa, 2=média, 3=alta
    source TEXT DEFAULT 'ai_assistant',
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para feedback do AI Assistant
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    was_helpful BOOLEAN,
    improvement_suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações do AI Assistant por usuário
CREATE TABLE IF NOT EXISTS ai_user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    language_preference TEXT DEFAULT 'pt-BR',
    communication_style TEXT DEFAULT 'friendly', -- 'professional', 'friendly', 'concise'
    emergency_contacts JSONB DEFAULT '[]',
    notification_preferences JSONB DEFAULT '{}',
    medical_history_sharing BOOLEAN DEFAULT TRUE,
    ai_recommendations_enabled BOOLEAN DEFAULT TRUE,
    proactive_health_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_symptom_analysis_user_id ON symptom_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_analysis_urgency ON symptom_analysis(urgency_level);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_user_id ON consultation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_logs_user_id ON emergency_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_logs_created_at ON emergency_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_health_recommendations_user_id ON health_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_health_recommendations_priority ON health_recommendations(priority);

-- RLS (Row Level Security) Policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_conversations
CREATE POLICY "Users can view own AI conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para symptom_analysis
CREATE POLICY "Users can view own symptom analysis" ON symptom_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom analysis" ON symptom_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para consultation_requests
CREATE POLICY "Users can view own consultation requests" ON consultation_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultation requests" ON consultation_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultation requests" ON consultation_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para emergency_logs
CREATE POLICY "Users can view own emergency logs" ON emergency_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency logs" ON emergency_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para health_recommendations
CREATE POLICY "Users can view own health recommendations" ON health_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health recommendations" ON health_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health recommendations" ON health_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para ai_feedback
CREATE POLICY "Users can view own AI feedback" ON ai_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI feedback" ON ai_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para ai_user_preferences
CREATE POLICY "Users can view own AI preferences" ON ai_user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI preferences" ON ai_user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI preferences" ON ai_user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at 
    BEFORE UPDATE ON consultation_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_user_preferences_updated_at 
    BEFORE UPDATE ON ai_user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE ai_conversations IS 'Armazena conversas entre usuários e o AI Assistant';
COMMENT ON TABLE symptom_analysis IS 'Análises de sintomas realizadas pelo AI';
COMMENT ON TABLE consultation_requests IS 'Solicitações de consulta feitas via AI Assistant';
COMMENT ON TABLE emergency_logs IS 'Logs de situações de emergência detectadas pelo AI';
COMMENT ON TABLE health_recommendations IS 'Recomendações personalizadas de saúde geradas pelo AI';
COMMENT ON TABLE ai_feedback IS 'Feedback dos usuários sobre o AI Assistant';
COMMENT ON TABLE ai_user_preferences IS 'Preferências e configurações do AI Assistant por usuário';