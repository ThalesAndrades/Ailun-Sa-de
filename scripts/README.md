# Scripts - Notas de Depreciação

## Scripts Legados

Os seguintes scripts foram criados para migração e configuração inicial:

- `vincular-thales-gs-ativo.js` - Script de migração específico para usuário Thales (LEGADO)
- `assign-subscriptions-to-beneficiaries.js/ts` - Scripts de migração de assinaturas (LEGADO)

**ATENÇÃO**: Esses scripts contêm valores hardcoded (ex: 89.90) que não refletem o sistema atual de preços dinâmicos. Eles foram mantidos apenas para referência histórica, mas NÃO devem ser executados em produção.

## Scripts Ativos

Scripts que ainda são úteis:
- `test-rapidoc-api.js` - Testa conexão com API Rapidoc
- `test-supabase.js` - Testa conexão com Supabase
- `validate-config.js` - Valida configurações do ambiente

## Sistema de Preços Atual

O sistema agora usa cálculo dinâmico de preços baseado em:
- Serviços selecionados (Clínico, Especialistas, Psicologia, Nutrição)
- Número de membros da família
- Descontos progressivos por volume

Ver: `utils/plan-calculator.ts` para detalhes da lógica de preços.
