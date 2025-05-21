import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  reconnecting: boolean;
}

/**
 * Hook que monitora o status da conexão com a internet
 * @returns estado atual da conexão
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [reconnecting, setReconnecting] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnecting(true);
      
      setTimeout(() => {
        setReconnecting(false);
      }, 2000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, reconnecting };
} 