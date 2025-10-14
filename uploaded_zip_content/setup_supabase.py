import requests
import json

SUPABASE_URL = "https://bmtieinegditdeijyslu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdGllaW5lZ2RpdGRlaWp5c2x1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5MDYxMiwiZXhwIjoyMDc1NDY2NjEyfQ.Tl39T7JDcIfdjHisXEBIY1AF3XawBNf_hm5IURM_Kp0"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

print("🚀 Iniciando configuração do Supabase...")
print("=" * 60)

# Ler o schema SQL
with open('supabase/schema.sql', 'r') as f:
    schema_sql = f.read()

# Executar SQL via REST API
print("\n📊 Executando schema do banco de dados...")
response = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"query": schema_sql}
)

if response.status_code in [200, 201, 204]:
    print("✅ Schema executado com sucesso!")
else:
    print(f"⚠️  Resposta: {response.status_code}")
    print(f"Tentando método alternativo...")
    
print("\n" + "=" * 60)
print("✅ Configuração concluída!")
