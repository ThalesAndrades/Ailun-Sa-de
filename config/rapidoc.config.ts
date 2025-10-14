export const RAPIDOC_CONFIG = {
    baseUrl: 'https://sandbox.rapidoc.tech/tema/api/',
  loginUrl: 'https://api.rapidoc.tech/login',
  clientId: '540e4b44-d68d-4ade-885f-fd4940a3a045',
  token: process.env.EXPO_PUBLIC_RAPIDOC_TOKEN || 'YOUR_RAPIDOC_TOKEN_HERE',
  contentType: 'application/vnd.rapidoc.tema-v2+json',
  
  get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'clientId': this.clientId,
      'Content-Type': this.contentType,
    };
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