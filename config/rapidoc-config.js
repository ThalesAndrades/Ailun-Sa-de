// config/rapidoc-config.js
const RAPIDOC_CLIENT_ID = '540e4b44-d68d-4ade-885f-fd4940a3a045';
const RAPIDOC_TOKEN = 'eyJhbGciOiJSUzUxMiJ9.eyJjbGllbnQiOiJBSUxVTiBURUNOT0xPR0lBIn0.Wkzl4kZkBhTCHoSI_9r5TDmTY9ZHrxIj7kyCUvWeXM9FKIhpf9vY464wFwb4u0K_ys_TtB00awXU42duDxEz_KJ4oloJbklLsIaiHW6OgGnrv5iLN1wNYb9uTPDJjCkiNBtNIr0F5_7U8gV6qwztAWn5vY8qrt7DxOoaO_8uIe-jydSZYjl9jMtMjWd3phmjjxfoDLqLGRKoSgw01Efk6ivkzndB2gcdmZIz6tgwhTfwuQLRkhMmqCv188twAkP2Dyt8A_OREr8iyiXHlBNlZnLcYlng5_9PHDUww2exl_QC6RuhB2k-vwsZ4eOxjOThpkCWT-E4zomUMpVuoEFtN_yt3vGiTwr_WHWjleDnOR1CeGCtxRCDmzU7IGmwa7fEhOrx7VUXPKZKidmF2HGicBq4QK22JvAimuDstuAcHIepr9gs8abm0p93_-BbnZDoM4edmhFLvBykfbV-rXVhen0nJVm5c9av4QP8tb41lglrs3DVa7KCqESG8kB47uCf74K8GJLpHzgk2ERHH_E3o1I_NdFwf1qZTAxiCCGIi0wjtVkU9zTrEyNb5HNpSgXn3Hj7IyMiCvHTzrweY7aizFF9uyrIf_5-SY-jmE-XuhvZiOuRQO-7XnCWHtuuuHXUVxKEFmG7EQWvI-e7z62cAJdQZhlxEBtepSgzpC_GKPc';

const RAPIDOC_CONFIG = {
  BASE_URL: 'https://api.rapidoc.tech/tema/api/',
  baseUrl: 'https://api.rapidoc.tech/tema/api/',
  LOGIN_URL: 'https://api.rapidoc.tech/login',
  CLIENT_ID: RAPIDOC_CLIENT_ID,
  TOKEN: RAPIDOC_TOKEN,
  token: RAPIDOC_TOKEN,
  clientId: RAPIDOC_CLIENT_ID,
  CONTENT_TYPE: 'application/vnd.rapidoc.tema-v2+json',
  contentType: 'application/vnd.rapidoc.tema-v2+json',
  HEADERS: {
    'Authorization': `Bearer ${RAPIDOC_TOKEN}`,
    'clientId': RAPIDOC_CLIENT_ID,
    'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
  },
  headers: {
    'Authorization': `Bearer ${RAPIDOC_TOKEN}`,
    'clientId': RAPIDOC_CLIENT_ID,
    'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
  }
};

module.exports = { RAPIDOC_CONFIG };

