import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';

// Flag para evitar múltiplas verificações simultâneas
let isVerifyingRedirect = false;

export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const { token, checkAuth, isLoading, user, authVerified } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        return;
      }
      
      if (authVerified && user) {
        console.log('[useRedirectIfAuthenticated] Já verificado: autenticado, redirecionando');
        navigate('/dashboard');
        return;
      }
      
      if (isVerifyingRedirect) {
        console.log('[useRedirectIfAuthenticated] Verificação já em andamento');
        return;
      }
      
      try {
        console.log('[useRedirectIfAuthenticated] Verificando autenticação para redirecionamento');
        isVerifyingRedirect = true;
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
          console.log('[useRedirectIfAuthenticated] Autenticado, redirecionando para dashboard');
          navigate('/dashboard');
        } else {
          console.log('[useRedirectIfAuthenticated] Não autenticado, permanecendo na página atual');
        }
      } finally {
        isVerifyingRedirect = false;
      }
    };

    verifyAuth();
  }, [token, checkAuth, navigate, user, authVerified]);

  return { isLoading };
} 