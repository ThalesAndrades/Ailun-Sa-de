
const https = require('https'');

const RAPIDOC_CONFIG = {
  baseUrl: 'api.rapidoc.tech',
  contentType: 'application/vnd.rapidoc.tema-v2+json',
  clientId: '540e4b44-d68d-4ade-885f-fd4940a3a045',
  token: 'eyJhbGciOiJSUzUxMiJ9.eyJjbGllbnQiOiJBSUxVTiBURUNOT0xPR0lBIn0.Wkzl4kZkBhTCHoSI_9r5TDmTY9ZHrxIj7kyCUvWeXM9FKIhpf9vY464wFwb4u0K_ys_TtB00awXU42duDxEz_KJ4oloJbklLsIaiHW6OgGnrv5iLN1wNYb9uTPDJjCkiNBtNIr0F5_7U8gV6qwztAWn5vY8qrt7DxOoaO_8uIe-jydSZYjl9jMtMjWd3phmjjxfoDLqLGRKoSgw01Efk6ivkzndB2gcdmZIz6tgwhTfwuQLRkhMmqCv188twAkP2Dyt8A_OREr8iyiXHlBNlZnLcYlng5_9PHDUww2exl_QC6RuhB2k-vwsZ4eOxjOThpkCWT-E4zomUMpVuoEFtN_yt3vGiTwr_WHWjleDnOR1CeGCtxRCDmzU7IGmwa7fEhOrx7VUXPKZKidmF2HGicBq4QK22JvAimuDstuAcHIepr9gs8abm0p93_-BbnZDoM4edmhFLvBykfbV-rXVhen0nJVm5c9av4QP8tb41lglrs3DVa7KCqESG8kB47uCf74K8GJLpHzgk2ERHH_E3o1I_NdFwf1qZTAxiCCGIi0wjtVkU9zTrEyNb5HNpSgXn3Hj7IyMiCvHTzrweY7aizFF9uyrIf_5-SY-jmE-XuhvZiOuRQO-7XnCWHtuuuHXUVxKEFmG7EQWvI-e7z62cAJdQZhlxEBtepSgzpC_GKPc',
};

const getBeneficiaryByCPF = (cpf) => {
  const options = {
    hostname: RAPIDOC_CONFIG.baseUrl,
    path: `/tema/api/beneficiaries?cpf=${cpf}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RAPIDOC_CONFIG.token}`,
      'clientId': RAPIDOC_CONFIG.clientId,
      'Content-Type': RAPIDOC_CONFIG.contentType,
    },
  };

  const req = https.request(options, (res) => {
    console.log('Status da Resposta:', res.statusCode);
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Corpo da Resposta:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('Dados recebidos (JSON):', jsonData);
        if (jsonData.success) {
          const beneficiary = Array.isArray(jsonData.data) ? jsonData.data[0] : jsonData.data;
          if (!beneficiary) {
            console.log('API retornou sucesso, mas sem dados de beneficiário.');
          } else {
            console.log('Beneficiário encontrado:', beneficiary);
          }
        } else {
          console.log('API retornou erro:', jsonData.message);
        }
      } catch (e) {
        console.error('Erro ao parsear JSON:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Erro na requisição:', error.message);
  });

  req.end();
};

const cpfToTest = '05034153912';
console.log(`Testando CPF: ${cpfToTest}`);
getBeneficiaryByCPF(cpfToTest);

