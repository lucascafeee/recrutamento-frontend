import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';

let isVerifyingAuth = false;

export function useAuthRequired() {
  const navigate = useNavigate();
  const { token, user, checkAuth, isLoading, authVerified } = useAuthStore();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (isVerifyingAuth) {
        console.log('[useAuthRequired] Verificação já em andamento, ignorando');
        return;
      }

      if (!token) {
        console.log('[useAuthRequired] Sem token, redirecionando para login');
        navigate('/login');
        return;
      }

      if (authVerified && !!user) {
        console.log('[useAuthRequired] Já verificado anteriormente: autenticado');
        setVerified(true);
        return;
      }

      try {
        console.log('[useAuthRequired] Verificando autenticação');
        isVerifyingAuth = true;
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
          console.log('[useAuthRequired] Autenticação falhou, redirecionando');
          navigate('/login');
        } else {
          console.log('[useAuthRequired] Autenticação bem-sucedida');
          setVerified(true);
        }
      } finally {
        isVerifyingAuth = false;
      }
    };

    verifyAuth();
  }, [token, user, checkAuth, navigate, authVerified]);

  return { isLoading, isAuthenticated: verified || (!!token && !!user) };
} 