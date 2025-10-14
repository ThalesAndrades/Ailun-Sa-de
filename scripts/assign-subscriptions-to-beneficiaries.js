/**
 * Script para Atribuir Assinaturas a Beneficiários Específicos
 * 
 * Este script:
 * 1. Recebe uma lista de beneficiários como entrada.
 * 2. Para cada beneficiário, faz uma chamada PUT para a API da Rapidoc para obter o serviceType real.
 * 3. Atribui/atualiza uma assinatura no Supabase com base no serviceType retornado.
 */

const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const { RAPIDOC_CONFIG } = require("../config/rapidoc-config");

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Buscar beneficiário por CPF no Supabase
 */
async function getBeneficiaryByCPF(cpf) {
  try {
    const cleanCPF = cpf.replace(/\D/g, "");
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("cpf", cleanCPF)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`[getBeneficiaryByCPF] Erro ao buscar CPF ${cpf}:`, error);
    return null;
  }
}

/**
 * Atualizar beneficiário na Rapidoc e obter serviceType real
 */
async function updateBeneficiaryInRapidoc(beneficiaryUuid, beneficiaryData) {
  try {
    const response = await axios.put(
      `${RAPIDOC_CONFIG.BASE_URL}beneficiaries/${beneficiaryUuid}`,
      beneficiaryData,
      {
        headers: RAPIDOC_CONFIG.HEADERS,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`[updateBeneficiaryInRapidoc] Erro para UUID ${beneficiaryUuid}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Mapear serviceType para configurações de plano
 */
function mapServiceTypeToPlanConfig(serviceType) {
  const baseConfig = {
    include_clinical: true,
    include_specialists: false,
    include_psychology: false,
    include_nutrition: false,
  };

  switch (serviceType) {
    case "G":
      return {
        ...baseConfig,
        plan_name: "Clínico 24h",
        base_price: 49.9,
      };
    case "GP":
      return {
        ...baseConfig,
        include_psychology: true,
        plan_name: "Clínico + Psicologia",
        base_price: 89.9,
      };
    case "GS":
      return {
        ...baseConfig,
        include_specialists: true,
        plan_name: "Clínico + Especialistas",
        base_price: 79.9,
      };
    case "GSP":
      return {
        ...baseConfig,
        include_specialists: true,
        include_psychology: true,
        plan_name: "Completo (Clínico + Especialistas + Psicologia)",
        base_price: 119.9,
      };
    default:
      return {
        ...baseConfig,
        plan_name: "Clínico 24h",
        base_price: 49.9,
      };
  }
}

/**
 * Criar ou atualizar plano de assinatura no Supabase
 */
async function createOrUpdateSubscriptionPlan(beneficiary, serviceType) {
  try {
    const planConfig = mapServiceTypeToPlanConfig(serviceType);

    // Verificar se já existe um plano ativo para este beneficiário
    const { data: existingPlan, error: existingPlanError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("beneficiary_id", beneficiary.id)
      .eq("status", "active")
      .single();

    if (existingPlanError && existingPlanError.code !== "PGRST116") {
      throw existingPlanError;
    }

    let planResult;
    if (existingPlan) {
      // Atualizar plano existente
      const { data, error } = await supabase
        .from("subscription_plans")
        .update({
          plan_name: planConfig.plan_name,
          service_type: serviceType,
          include_clinical: planConfig.include_clinical,
          include_specialists: planConfig.include_specialists,
          include_psychology: planConfig.include_psychology,
          include_nutrition: planConfig.include_nutrition,
          base_price: planConfig.base_price,
          total_price: planConfig.base_price,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPlan.id)
        .select()
        .single();
      planResult = { data, error };
      console.log(`✅ Plano atualizado para beneficiário ${beneficiary.full_name} (${beneficiary.cpf})`);
    } else {
      // Criar novo plano
      const { data, error } = await supabase
        .from("subscription_plans")
        .insert({
          user_id: beneficiary.user_id,
          beneficiary_id: beneficiary.id,
          plan_name: planConfig.plan_name,
          service_type: serviceType,
          include_clinical: planConfig.include_clinical,
          include_specialists: planConfig.include_specialists,
          include_psychology: planConfig.include_psychology,
          include_nutrition: planConfig.include_nutrition,
          member_count: 1,
          discount_percentage: 0,
          base_price: planConfig.base_price,
          total_price: planConfig.base_price,
          billing_cycle: "monthly",
          status: "active",
          psychology_limit: 2,
          nutrition_limit: 1,
          psychology_used: 0,
          nutrition_used: 0,
        })
        .select()
        .single();
      planResult = { data, error };
      console.log(`✅ Plano criado para beneficiário ${beneficiary.full_name} (${beneficiary.cpf})`);
    }

    if (planResult.error) {
      throw planResult.error;
    }

    return { success: true, data: planResult.data };
  } catch (error) {
    console.error(`❌ Erro ao criar/atualizar plano para ${beneficiary.full_name}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Atualizar serviceType do beneficiário no Supabase
 */
async function updateBeneficiaryServiceType(beneficiaryId, serviceType) {
  try {
    const { error } = await supabase
      .from("beneficiaries")
      .update({ service_type: serviceType, updated_at: new Date().toISOString() })
      .eq("id", beneficiaryId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`[updateBeneficiaryServiceType] Erro:`, error);
  }
}

/**
 * Processar uma lista específica de beneficiários
 */
async function processSpecificBeneficiaries(beneficiariesToProcess) {
  console.log("🚀 Iniciando processo de atribuição de assinaturas para beneficiários específicos...\n");

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (const inputBeneficiary of beneficiariesToProcess) {
    console.log(`\n🔄 Processando: ${inputBeneficiary.full_name} (${inputBeneficiary.cpf})`);

    // 1. Buscar beneficiário no Supabase
    const supabaseBeneficiary = await getBeneficiaryByCPF(inputBeneficiary.cpf);

    if (!supabaseBeneficiary) {
      console.log(`   ⚠️  Beneficiário ${inputBeneficiary.full_name} (${inputBeneficiary.cpf}) não encontrado no Supabase. Pulando.`);
      errorCount++;
      results.push({ ...inputBeneficiary, status: "skipped", reason: "Beneficiário não encontrado no Supabase" });
      continue;
    }

    // 2. Atualizar na Rapidoc para obter serviceType real
    // Usamos o serviceType "GS" como padrão para o PUT, mas o retorno é o que importa.
    const rapidocResponse = await updateBeneficiaryInRapidoc(
      supabaseBeneficiary.beneficiary_uuid,
      {
        cpf: supabaseBeneficiary.cpf.replace(/\D/g, ""),
        name: supabaseBeneficiary.full_name,
        birthDate: supabaseBeneficiary.birth_date,
        email: supabaseBeneficiary.email,
        phone: supabaseBeneficiary.phone,
        serviceType: "GS", // Padrão para o PUT
      }
    );

    if (!rapidocResponse) {
      console.log(`   ⚠️  Não foi possível obter serviceType da Rapidoc para ${supabaseBeneficiary.full_name}. Pulando.`);
      errorCount++;
      results.push({ ...inputBeneficiary, status: "failed", reason: "Erro ao obter serviceType da Rapidoc" });
      continue;
    }

    const realServiceType = rapidocResponse.serviceType;
    console.log(`   ✅ ServiceType obtido da Rapidoc: ${realServiceType}`);

    // 3. Criar/Atualizar plano no Supabase
    const planResult = await createOrUpdateSubscriptionPlan(supabaseBeneficiary, realServiceType);

    if (planResult.success) {
      // 4. Atualizar serviceType do beneficiário no Supabase
      await updateBeneficiaryServiceType(supabaseBeneficiary.id, realServiceType);
      successCount++;
      results.push({ ...inputBeneficiary, status: "success", service_type_assigned: realServiceType });
    } else {
      errorCount++;
      results.push({ ...inputBeneficiary, status: "failed", reason: planResult.error });
    }

    // Pequeno delay para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumo final
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DO PROCESSAMENTO");
  console.log("=".repeat(60));
  console.log(`Total de beneficiários solicitados: ${beneficiariesToProcess.length}`);
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Erros/Pulados: ${errorCount}`);
  console.log("=".repeat(60));

  return results;
}

// Executar o script
if (require.main === module) {
  const beneficiaries = require("../data/beneficiaries_to_process.json");
  processSpecificBeneficiaries(beneficiaries)
    .then((results) => {
      console.log("\n✅ Processo concluído com sucesso!");
      console.log("\n📋 Resultados Finais:");
      console.table(results);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Erro no processo:", error);
      process.exit(1);
    });
}

module.exports = { processSpecificBeneficiaries };

