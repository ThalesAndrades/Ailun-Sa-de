/**
 * Serviço de Gerenciamento de Tokens
 * Gerencia tokens de autenticação de forma segura
 * NÃO armazena senhas em texto plano
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const LAST_CPF_KEY = 'last_cpf';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  cpf: string;
}

class TokenService {
  /**
   * Salva tokens de autenticação de forma segura
   * @param tokens - Tokens de autenticação
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Em web, usar localStorage (menos seguro, mas funcional)
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
        localStorage.setItem(USER_ID_KEY, tokens.userId);
        localStorage.setItem(LAST_CPF_KEY, tokens.cpf);
      } else {
        // Em mobile, usar SecureStore (criptografado)
        await SecureStore.setItemAsync(TOKEN_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
        await SecureStore.setItemAsync(USER_ID_KEY, tokens.userId);
        await SecureStore.setItemAsync(LAST_CPF_KEY, tokens.cpf);
      }
      logger.debug('Tokens salvos com sucesso');
    } catch (error) {
      logger.error('Erro ao salvar tokens', error as Error);
      throw error;
    }
  }

  /**
   * Recupera o token de acesso
   */
  async getAccessToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      logger.error('Erro ao recuperar access token', error as Error);
      return null;
    }
  }

  /**
   * Recupera o refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      logger.error('Erro ao recuperar refresh token', error as Error);
      return null;
    }
  }

  /**
   * Recupera o ID do usuário
   */
  async getUserId(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(USER_ID_KEY);
      } else {
        return await SecureStore.getItemAsync(USER_ID_KEY);
      }
    } catch (error) {
      logger.error('Erro ao recuperar user ID', error as Error);
      return null;
    }
  }

  /**
   * Recupera o último CPF usado
   */
  async getLastCPF(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(LAST_CPF_KEY);
      } else {
        return await SecureStore.getItemAsync(LAST_CPF_KEY);
      }
    } catch (error) {
      logger.error('Erro ao recuperar último CPF', error as Error);
      return null;
    }
  }

  /**
   * Remove todos os tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(LAST_CPF_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_ID_KEY);
        await SecureStore.deleteItemAsync(LAST_CPF_KEY);
      }
      logger.info('Tokens removidos com sucesso');
    } catch (error) {
      logger.error('Erro ao remover tokens', error as Error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Verifica se o token está expirado
   * @param token - Token JWT
   */
  isTokenExpired(token: string): boolean {
    try {
      // Decodificar JWT (formato: header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;

      if (!exp) {
        return false; // Token sem expiração
      }

      // Verificar se expirou (exp está em segundos)
      return Date.now() >= exp * 1000;
    } catch (error) {
      logger.error('Erro ao verificar expiração do token', error as Error);
      return true; // Em caso de erro, considerar expirado
    }
  }

  /**
   * Recupera todos os tokens
   */
  async getAllTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      const userId = await this.getUserId();
      const cpf = await this.getLastCPF();

      if (!accessToken || !userId || !cpf) {
        return null;
      }

      return {
        accessToken,
        refreshToken: refreshToken || undefined,
        userId,
        cpf,
      };
    } catch (error) {
      logger.error('Erro ao recuperar todos os tokens', error as Error);
      return null;
    }
  }
}

export const tokenService = new TokenService();
export default tokenService;

