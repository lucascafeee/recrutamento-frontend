import api from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../interfaces/auth';
import { isTokenExpired, clearSensitiveData } from '../utils/securityUtils';

// Cache para armazenar o resultado da validação de token
interface TokenValidationCache {
  isValid: boolean;
  timestamp: number;
  token: string;
}

// Cache para 5 minutos (em milissegundos)
const TOKEN_CACHE_TTL = 5 * 60 * 1000;
let tokenValidationCache: TokenValidationCache | null = null;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Tentando fazer login com email:', credentials.email);
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      console.log('[AuthService] Login bem-sucedido:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Atualiza o cache de validação após o login
      tokenValidationCache = {
        isValid: true,
        timestamp: Date.now(),
        token: response.data.token
      };
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Erro ao fazer login:', error);
      throw error;
    }
  },

  async register(userData: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Tentando registrar usuário:', userData.email);
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      console.log('[AuthService] Registro bem-sucedido:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Atualiza o cache de validação após o registro
      tokenValidationCache = {
        isValid: true,
        timestamp: Date.now(),
        token: response.data.token
      };
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Erro ao registrar usuário:', error);
      throw error;
    }
  },

  async validateToken(): Promise<boolean> {
    try {
      console.log('[AuthService] Iniciando validação de token...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('[AuthService] Token não encontrado no localStorage');
        return false;
      }
      
      // Verificação de expiração local (sempre executada)
      if (isTokenExpired(token)) {
        console.log('[AuthService] Token expirado (verificação local)');
        this.logout();
        return false;
      }
      
      // Verificar o cache de validação
      if (tokenValidationCache && 
          tokenValidationCache.token === token && 
          Date.now() - tokenValidationCache.timestamp < TOKEN_CACHE_TTL) {
        console.log('[AuthService] Usando resultado de validação em cache:', 
          tokenValidationCache.isValid ? 'válido' : 'inválido',
          `(${Math.round((Date.now() - tokenValidationCache.timestamp) / 1000)}s atrás)`);
        return tokenValidationCache.isValid;
      }
      
      // Se chegamos aqui, precisamos validar o token com o servidor
      console.log('[AuthService] Cache expirado ou ausente, validando token no servidor...');
      
      try {
        const response = await api.get('/auth/validate');
        console.log('[AuthService] Validação de token bem-sucedida:', response.data);
        
        // Atualiza o cache de validação
        tokenValidationCache = {
          isValid: true,
          timestamp: Date.now(),
          token: token
        };
        
        return true;
      } catch (error) {
        console.error('[AuthService] Erro ao validar token no servidor:', error);
        
        // Atualiza o cache como inválido
        tokenValidationCache = {
          isValid: false,
          timestamp: Date.now(),
          token: token
        };
        
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('[AuthService] Erro na verificação local do token:', error);
      this.logout();
      return false;
    }
  },

  async getCurrentUser() {
    try {
      console.log('[AuthService] Obtendo usuário atual...');
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        console.log('[AuthService] Usuário encontrado no localStorage');
        return JSON.parse(storedUser);
      }

      const token = localStorage.getItem('token');
      if (token && !isTokenExpired(token)) {
        console.log('[AuthService] Buscando dados do usuário da API...');
        const response = await api.get('/auth/me');
        console.log('[AuthService] Dados do usuário recebidos:', response.data);
        
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      console.log('[AuthService] Nenhum usuário autenticado');
      return null;
    } catch (error) {
      console.error('[AuthService] Erro ao buscar usuário:', error);
      this.logout();
      return null;
    }
  },

  logout() {
    console.log('[AuthService] Realizando logout');
    // Limpa o cache de validação
    tokenValidationCache = null;
    clearSensitiveData();
  },
};

export default authService; 