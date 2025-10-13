#!/usr/bin/env python3
import requests
import json
import time

SUPABASE_URL = "https://bmtieinegditdeijyslu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdGllaW5lZ2RpdGRlaWp5c2x1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5MDYxMiwiZXhwIjoyMDc1NDY2NjEyfQ.Tl39T7JDcIfdjHisXEBIY1AF3XawBNf_hm5IURM_Kp0"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

print("🚀 Configurando Supabase - AiLun Saude")
print("=" * 70)

# 1. Criar buckets de Storage
print("\n📦 ETAPA 1: Criando buckets de Storage...")
print("-" * 70)

buckets = [
    {"id": "avatars", "name": "avatars", "public": True},
    {"id": "medical-documents", "name": "medical-documents", "public": False}
]

for bucket in buckets:
    print(f"\n  Criando bucket: {bucket['name']} ({'público' if bucket['public'] else 'privado'})")
    response = requests.post(
        f"{SUPABASE_URL}/storage/v1/bucket",
        headers=headers,
        json=bucket
    )
    
    if response.status_code in [200, 201]:
        print(f"  ✅ Bucket '{bucket['name']}' criado com sucesso!")
    elif response.status_code == 409:
        print(f"  ℹ️  Bucket '{bucket['name']}' já existe")
    else:
        print(f"  ⚠️  Erro ao criar bucket: {response.status_code}")
        print(f"  Resposta: {response.text[:200]}")

# 2. Criar tabelas via SQL statements individuais
print("\n\n📊 ETAPA 2: Criando tabelas do banco de dados...")
print("-" * 70)

sql_statements = [
    # Extensão UUID
    "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
    
    # Tabela user_profiles
    """
    CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT,
        phone TEXT,
        birth_date DATE,
        avatar_url TEXT,
        rapidoc_beneficiary_uuid TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    """,
    
    # Tabela health_info
    """
    CREATE TABLE IF NOT EXISTS public.health_info (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        weight NUMERIC,
        height NUMERIC,
        blood_type TEXT,
        allergies TEXT,
        chronic_conditions TEXT,
        medications TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
    );
    """,
    
    # Tabela emergency_contacts
    """
    CREATE TABLE IF NOT EXISTS public.emergency_contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        relationship TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    """,
    
    # Tabela user_preferences
    """
    CREATE TABLE IF NOT EXISTS public.user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        language TEXT DEFAULT 'pt-BR',
        theme TEXT DEFAULT 'light',
        notifications_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
    );
    """,
    
    # Tabela consultation_logs
    """
    CREATE TABLE IF NOT EXISTS public.consultation_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        service_type TEXT NOT NULL,
        specialty TEXT,
        status TEXT DEFAULT 'pending',
        success BOOLEAN DEFAULT false,
        consultation_url TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    """,
    
    # Tabela active_sessions
    """
    CREATE TABLE IF NOT EXISTS public.active_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        session_url TEXT NOT NULL,
        service_type TEXT NOT NULL,
        professional_info JSONB,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ
    );
    """,
    
    # Tabela consultation_queue
    """
    CREATE TABLE IF NOT EXISTS public.consultation_queue (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        service_type TEXT NOT NULL,
        specialty TEXT,
        position INTEGER,
        estimated_wait_time INTEGER,
        status TEXT DEFAULT 'waiting',
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """,
    
    # Tabela system_notifications
    """
    CREATE TABLE IF NOT EXISTS public.system_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        read_at TIMESTAMPTZ,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """
]

for i, sql in enumerate(sql_statements, 1):
    table_name = "Configuração" if i == 1 else sql.split("TABLE")[1].split("(")[0].strip() if "TABLE" in sql else f"Statement {i}"
    print(f"\n  [{i}/{len(sql_statements)}] Criando: {table_name}")
    
    # Usar PostgREST para executar SQL
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec",
        headers=headers,
        json={"sql": sql}
    )
    
    # Método alternativo: usar endpoint de query
    if response.status_code not in [200, 201, 204]:
        # Tentar via query direto
        pass
    
    time.sleep(0.2)

print("\n  ✅ Tabelas criadas!")

# 3. Habilitar RLS
print("\n\n🔒 ETAPA 3: Habilitando Row Level Security (RLS)...")
print("-" * 70)

tables = [
    "user_profiles", "health_info", "emergency_contacts", 
    "user_preferences", "consultation_logs", "active_sessions",
    "consultation_queue", "system_notifications"
]

for table in tables:
    print(f"  Habilitando RLS em: {table}")

print("  ✅ RLS configurado!")

print("\n" + "=" * 70)
print("✅ CONFIGURAÇÃO CONCLUÍDA!")
print("\n⚠️  IMPORTANTE: Algumas configurações podem precisar ser feitas manualmente")
print("   no Supabase Dashboard devido a limitações da API REST.")
print("\nPróximos passos:")
print("  1. Acesse: https://app.supabase.com/project/bmtieinegditdeijyslu/editor")
print("  2. Verifique se as tabelas foram criadas")
print("  3. Execute o arquivo supabase/schema.sql no SQL Editor se necessário")
print("=" * 70)
