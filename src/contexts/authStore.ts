import { create } from 'zustand';
import type { AuthState, AuthResponse } from '../interfaces/auth';
import authService from '../services/authService';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse | void>;
  register: (email: string, password: string, name?: string) => Promise<AuthResponse | void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  setToken: (token: string | null) => void;
  authVerified: boolean;
  emailAlreadyExists: boolean;
  clearErrors: () => void;
}

let lastAuthCheck = 0;
const MIN_AUTH_CHECK_INTERVAL = 3000;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  authVerified: false,
  emailAlreadyExists: false,
  
  clearErrors: () => {
    set({ error: null, emailAlreadyExists: false });
  },

  setToken: (token: string | null) => {
    set({ token });
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null, emailAlreadyExists: false });
      const response = await authService.login({ email, password });
      set({ 
        user: response.user,
        token: response.token,
        isLoading: false,
        authVerified: true
      });
      return response;
    } catch (error: any) {
      console.error('[AuthStore] Erro ao login:', error);
      
      set({ 
        error: error?.response?.data?.message || error?.message || 'Erro ao fazer login',
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true, error: null, emailAlreadyExists: false });
      const response = await authService.register({ email, password, name });
      set({ 
        user: response.user,
        token: response.token,
        isLoading: false,
        authVerified: true
      });
      return response;
    } catch (error: any) {
      console.error('[AuthStore] Erro ao registrar:', error);
      
      // Logs mais detalhados para uma melhor depuração
      const errorResponse = error?.response;
      console.log('[AuthStore] Detalhes completos do erro:', {
        hasAxiosError: error.isAxiosError === true,
        status: errorResponse?.status,
        statusText: errorResponse?.statusText,
        errorMessage: error.message,
        responseData: errorResponse?.data,
        hasFlag: !!errorResponse?.data?.isEmailExists
      });
      
      const isEmailExists = !!errorResponse?.data?.isEmailExists;
      
      let errorMessage;
      if (isEmailExists) {
        errorMessage = 'Este e-mail já está cadastrado no sistema.';
      } else {
        errorMessage = errorResponse?.data?.message || error?.message || 'Erro ao registrar usuário';
      }
      
      console.log(`[AuthStore] Definindo estados - emailAlreadyExists: ${isEmailExists}, error: ${errorMessage}`);
      
      set({ 
        error: errorMessage,
        isLoading: false,
        emailAlreadyExists: isEmailExists
      });
      
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, authVerified: false });
  },

  checkAuth: async () => {
    const currentState = get();
    const now = Date.now();
    
    if (!currentState.token) {
      console.log('[AuthStore] checkAuth: Sem token, retornando false');
      set({ user: null, authVerified: true, isLoading: false });
      return false;
    }
    
    if (currentState.authVerified && 
        currentState.user && 
        currentState.token && 
        now - lastAuthCheck < MIN_AUTH_CHECK_INTERVAL) {
      console.log('[AuthStore] checkAuth: Verificação recente, reusando resultado (autenticado)');
      return true;
    }
    
    if (currentState.authVerified && 
        !currentState.user && 
        now - lastAuthCheck < MIN_AUTH_CHECK_INTERVAL) {
      console.log('[AuthStore] checkAuth: Verificação recente, reusando resultado (não autenticado)');
      return false;
    }
    
    try {
      console.log('[AuthStore] checkAuth: Executando verificação completa');
      set({ isLoading: true });
      lastAuthCheck = now;
      
      const isValid = await authService.validateToken();
      
      if (isValid) {
        const user = await authService.getCurrentUser();
        set({ user, isLoading: false, authVerified: true });
        return true;
      } else {
        set({ user: null, token: null, isLoading: false, authVerified: true });
        return false;
      }
    } catch (error) {
      set({ 
        user: null, 
        token: null, 
        isLoading: false,
        authVerified: true,
        error: error instanceof Error ? error.message : 'Erro ao verificar autenticação'
      });
      return false;
    }
  }
})); 