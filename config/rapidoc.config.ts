export const RAPIDOC_CONFIG = {
  BASE_URL: process.env.RAPIDOC_BASE_URL || 'https://api.rapidoc.tech/tema/api/',
  baseUrl: process.env.RAPIDOC_BASE_URL || 'https://api.rapidoc.tech/tema/api/',
  CLIENT_ID: process.env.RAPIDOC_CLIENT_ID || '540e4b44-d68d-4ade-885f-fd4940a3a045',
  clientId: process.env.RAPIDOC_CLIENT_ID || '540e4b44-d68d-4ade-885f-fd4940a3a045',
  TOKEN: process.env.RAPIDOC_TOKEN || 'eyJhbGciOiJSUzUxMiJ9.eyJjbGllbnQiOiJBSUxVTiBURUNOT0xPR0lBIn0.Wkzl4kZkBhTCHoSI_9r5TDmTY9ZHrxIj7kyCUvWeXM9FKIhpf9vY464wFwb4u0K_ys_TtB00awXU42duDxEz_KJ4oloJbklLsIaiHW6OgGnrv5iLN1wNYb9uTPDJjCkiNBtNIr0F5_7U8gV6qwztAWn5vY8qrt7DxOoaO_8uIe-jydSZYjl9jMtMjWd3phmjjxfoDLqLGRKoSgw01Efk6ivkzndB2gcdmZIz6tgwhTfwuQLRkhMmqCv188twAkP2Dyt8A_OREr8iyiXHlBNlZnLcYlng5_9PHDUww2exl_QC6RuhB2k-vwsZ4eOxjOThpkCWT-E4zomUMpVuoEFtN_yt3vGiTwr_WHWjleDnOR1CeGCtxRCDmzU7IGmwa7fEhOrx7VUXPKZKidmF2HGicBq4QK22JvAimuDstuAcHIepr9gs8abm0p93_-BbnZDoM4edmhFLvBykfbV-rXVhen0nJVm5c9av4QP8tb41lglrs3DVa7KCqESG8kB47uCf74K8GJLpHzgk2ERHH_E3o1I_NdFwf1qZTAxiCCGIi0wjtVkU9zTrEyNb5HNpSgXn3Hj7IyMiCvHTzrweY7aizFF9uyrIf_5-SY-jmE-XuhvZiOuRQO-7XnCWHtuuuHXUVxKEFmG7EQWvI-e7z62cAJdQZhlxEBtepSgzpC_GKPc',
  token: process.env.RAPIDOC_TOKEN || 'eyJhbGciOiJSUzUxMiJ9.eyJjbGllbnQiOiJBSUxVTiBURUNOT0xPR0lBIn0.Wkzl4kZkBhTCHoSI_9r5TDmTY9ZHrxIj7kyCUvWeXM9FKIhpf9vY464wFwb4u0K_ys_TtB00awXU42duDxEz_KJ4oloJbklLsIaiHW6OgGnrv5iLN1wNYb9uTPDJjCkiNBtNIr0F5_7U8gV6qwztAWn5vY8qrt7DxOoaO_8uIe-jydSZYjl9jMtMjWd3phmjjxfoDLqLGRKoSgw01Efk6ivkzndB2gcdmZIz6tgwhTfwuQLRkhMmqCv188twAkP2Dyt8A_OREr8iyiXHlBNlZnLcYlng5_9PHDUww2exl_QC6RuhB2k-vwsZ4eOxjOThpkCWT-E4zomUMpVuoEFtN_yt3vGiTwr_WHWjleDnOR1CeGCtxRCDmzU7IGmwa7fEhOrx7VUXPKZKidmF2HGicBq4QK22JvAimuDstuAcHIepr9gs8abm0p93_-BbnZDoM4edmhFLvBykfbV-rXVhen0nJVm5c9av4QP8tb41lglrs3DVa7KCqESG8kB47uCf74K8GJLpHzgk2ERHH_E3o1I_NdFwf1qZTAxiCCGIi0wjtVkU9zTrEyNb5HNpSgXn3Hj7IyMiCvHTzrweY7aizFF9uyrIf_5-SY-jmE-XuhvZiOuRQO-7XnCWHtuuuHXUVxKEFmG7EQWvI-e7z62cAJdQZhlxEBtepSgzpC_GKPc',
  CONTENT_TYPE: 'application/vnd.rapidoc.tema-v2+json',
  contentType: 'application/vnd.rapidoc.tema-v2+json',
  
  get HEADERS() {
    return {
      'Authorization': `Bearer ${this.TOKEN}`,
      'clientId': this.CLIENT_ID,
      'Content-Type': this.CONTENT_TYPE,
    };
  },

  get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'clientId': this.clientId,
      'Content-Type': this.contentType,
    };
  },

  // Configurações de Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_SECOND: 10,
    BURST_LIMIT: 20
  },

  // Configurações de Cache
  CACHE: {
    SPECIALTIES_DURATION: 5 * 60 * 1000, // 5 minutos
    AVAILABILITY_DURATION: 2 * 60 * 1000, // 2 minutos
    REFERRALS_DURATION: 2 * 60 * 1000, // 2 minutos
  }
};

export const SERVICE_TYPE_CONFIG = {
  G: {
    name: 'Clínico 24h',
    price: 49.90,
    includes: {
      clinical: true,
      specialists: false,
      psychology: false,
      nutrition: false,
    }
  },
  GP: {
    name: 'Clínico + Psicologia',
    price: 89.90,
    includes: {
      clinical: true,
      specialists: false,
      psychology: true,
      nutrition: false,
    }
  },
  GS: {
    name: 'Clínico + Especialistas',
    price: 79.90,
    includes: {
      clinical: true,
      specialists: true,
      psychology: false,
      nutrition: false,
    }
  },
  GSP: {
    name: 'Completo (Clínico + Especialistas + Psicologia)',
    price: 119.90,
    includes: {
      clinical: true,
      specialists: true,
      psychology: true,
      nutrition: false,
    }
  }
};