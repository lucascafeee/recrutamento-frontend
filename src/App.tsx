import React, { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './contexts/authStore';
import Loading from './components/Loading';

const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('[App] Verificando autenticação inicial');
      try {
        await checkAuth();
      } catch (error) {
        console.error('[App] Erro na verificação inicial:', error);
      } finally {
        setInitializing(false);
      }
    };
    
    initAuth();
  }, []);

  if (initializing) {
    return <Loading message="Carregando aplicação..." />;
  }

  return <AppRoutes />;
};

export default App;
