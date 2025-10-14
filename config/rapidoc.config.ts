export const RAPIDOC_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_RAPIDOC_API_BASE_URL || 'https://sandbox.rapidoc.tech/tema/api/',
  CLIENT_ID: process.env.EXPO_PUBLIC_RAPIDOC_CLIENT_ID || '540e4b44-d68d-4ade-885f-fd4940a3a045',
  TOKEN: process.env.EXPO_PUBLIC_RAPIDOC_API_TOKEN || 'YOUR_RAPIDOC_TOKEN_HERE',
  CONTENT_TYPE: 'application/vnd.rapidoc.tema-v2+json',
  loginUrl: 'https://api.rapidoc.tech/login',
  
  get HEADERS() {
    return {
      'Authorization': `Bearer ${this.TOKEN}`,
      'clientId': this.CLIENT_ID,
      'Content-Type': this.CONTENT_TYPE,
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