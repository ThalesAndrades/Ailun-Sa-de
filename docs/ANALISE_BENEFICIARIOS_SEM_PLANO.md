# Análise de Beneficiários Sem Plano Ativo

## 1. Objetivo

Identificar os beneficiários existentes na plataforma AiLun Saúde que não possuem um plano de assinatura ativo no Supabase, para que possamos atribuir um plano com base no `serviceType` real obtido da API da Rapidoc.

## 2. Estratégia de Análise

A análise será realizada em duas etapas:

1.  **Listar todos os beneficiários**: Obter uma lista de todos os beneficiários cadastrados na tabela `beneficiaries`.
2.  **Verificar a existência de plano ativo**: Para cada beneficiário, verificar se existe um registro correspondente na tabela `subscription_plans` com o status `active`.

## 3. Consulta SQL para Identificação

A seguinte consulta SQL pode ser usada para identificar os beneficiários que não possuem um plano ativo:

```sql
SELECT
  b.id AS beneficiary_id,
  b.beneficiary_uuid,
  b.full_name,
  b.cpf,
  b.email,
  b.user_id
FROM
  public.beneficiaries b
LEFT JOIN
  public.subscription_plans sp ON b.id = sp.beneficiary_id AND sp.status = 'active'
WHERE
  sp.id IS NULL;
```

## 4. Resultados da Análise (Simulação)

Ao executar a consulta acima, podemos obter uma lista de beneficiários que se enquadram nos critérios. Por exemplo:

| beneficiary_id | beneficiary_uuid | full_name          | cpf           | email                  | user_id                                  |
|----------------|------------------|--------------------|---------------|------------------------|------------------------------------------|
| uuid-1234      | rapidoc-uuid-abc | João da Silva      | 123.456.789-00 | joao.silva@email.com   | auth-uuid-xyz                            |
| uuid-5678      | rapidoc-uuid-def | Maria Oliveira     | 987.654.321-00 | maria.oliveira@email.com | auth-uuid-pqr                            |

## 5. Próximos Passos

Com a lista de beneficiários sem plano ativo, o próximo passo é iterar sobre cada um deles e:

1.  Extrair o `beneficiary_uuid`.
2.  Realizar uma chamada `PUT` para `https://api.rapidoc.tech/tema/api/beneficiaries/:uuid` com o `serviceType` padrão "GS" (clínico + especialistas).
3.  Ler o `serviceType` real retornado pela API da Rapidoc.
4.  Com base no `serviceType` retornado, criar um novo registro na tabela `subscription_plans` para o beneficiário, associando-o ao plano correto.

Esta abordagem garantirá que todos os beneficiários existentes tenham uma assinatura ativa e consistente com os dados da Rapidoc.

