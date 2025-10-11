export interface RapidocServiceRequest {
  serviceType: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist';
  userProfile?: {
    name: string;
    email: string;
    phone?: string;
  };
  urgency?: 'low' | 'medium' | 'high';
  specialtyArea?: string;
}

export interface RapidocServiceResponse {
  success: boolean;
  sessionId?: string;
  consultationUrl?: string;
  estimatedWaitTime?: number;
  professionalInfo?: {
    name: string;
    specialty: string;
    rating: number;
  };
  error?: string;
}

class RapidocApiService {
  private async callRapidocFunction(data: RapidocServiceRequest): Promise<RapidocServiceResponse> {
    try {
      const { supabase } = await import('./supabase');
      
      const { data: response, error } = await supabase.functions.invoke('rapidoc', {
        body: {
          action: 'request-consultation',
          serviceType: data.serviceType,
          userProfile: data.userProfile,
          urgency: data.urgency || 'medium',
          specialtyArea: data.specialtyArea,
        }
      });

      if (error) {
        console.error('RapiDoc API Error:', error);
        return {
          success: false,
          error: error.message || 'Erro na comunicação com o serviço médico'
        };
      }

      return {
        success: true,
        ...response
      };
    } catch (error) {
      console.error('RapiDoc Service Error:', error);
      return {
        success: false,
        error: 'Erro interno do serviço'
      };
    }
  }

  async requestDoctorNow(userProfile: RapidocServiceRequest['userProfile']): Promise<RapidocServiceResponse> {
    return this.callRapidocFunction({
      serviceType: 'doctor',
      userProfile,
      urgency: 'high'
    });
  }

  async requestSpecialist(
    userProfile: RapidocServiceRequest['userProfile'], 
    specialtyArea: string
  ): Promise<RapidocServiceResponse> {
    return this.callRapidocFunction({
      serviceType: 'specialist',
      userProfile,
      specialtyArea,
      urgency: 'medium'
    });
  }

  async requestPsychologist(userProfile: RapidocServiceRequest['userProfile']): Promise<RapidocServiceResponse> {
    return this.callRapidocFunction({
      serviceType: 'psychologist',
      userProfile,
      urgency: 'medium'
    });
  }

  async requestNutritionist(userProfile: RapidocServiceRequest['userProfile']): Promise<RapidocServiceResponse> {
    return this.callRapidocFunction({
      serviceType: 'nutritionist',
      userProfile,
      urgency: 'low'
    });
  }
}

export const rapidocApiService = new RapidocApiService();