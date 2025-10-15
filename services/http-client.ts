/**
 * Cliente HTTP para a API RapiDoc
 * Implementa rate limiting, interceptors e tratamento de erros
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RAPIDOC_CONFIG } from '../config/rapidoc.config';
import { createServiceLogger } from '../utils/logger';

export class RapidocHttpClient {
  private client: AxiosInstance;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_DELAY = 100; // ms entre requisições
  private logger = createServiceLogger('RapidocHttpClient');

  constructor() {
    this.client = axios.create({
      baseURL: RAPIDOC_CONFIG.BASE_URL,
      timeout: 30000,
      headers: RAPIDOC_CONFIG.HEADERS
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        await this.enforceRateLimit();
        this.logRequest(config);
        return config;
      },
      (error) => {
        this.logError('Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para logging e tratamento de erros
    this.client.interceptors.response.use(
      (response) => {
        this.logResponse(response);
        return response;
      },
      (error) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve =>
        setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private logRequest(config: AxiosRequestConfig): void {
    this.logger.apiRequest(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      { requestId: this.requestCount }
    );
  }

  private logResponse(response: AxiosResponse): void {
    this.logger.apiResponse(
      response.status,
      response.config.url || '',
      undefined,
      { requestId: this.requestCount }
    );
  }

  private handleResponseError(error: any): void {
    this.logger.apiError(
      error.config?.method || 'UNKNOWN',
      error.config?.url || '',
      error,
      { 
        statusText: error.response?.statusText,
        requestId: this.requestCount
      }
    );

    // Tratamento específico por código de erro
    switch (error.response?.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 429:
        this.handleRateLimit();
        break;
      case 500:
        this.handleServerError();
        break;
    }
  }

  private handleUnauthorized(): void {
    this.logger.error('Token de autenticação inválido ou expirado');
  }

  private handleRateLimit(): void {
    this.logger.warn('Rate limit atingido, implementando backoff');
  }

  private handleServerError(): void {
    this.logger.error('Erro interno do servidor Rapidoc');
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public getRequestStats(): { count: number; lastRequest: number } {
    return {
      count: this.requestCount,
      lastRequest: this.lastRequestTime
    };
  }
}

// Instância singleton
export const rapidocHttpClient = new RapidocHttpClient();

