import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatus: React.FC = () => {
  const { isOnline, reconnecting } = useNetworkStatus();

  if (isOnline && !reconnecting) {
    return null;
  }

  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
      {!isOnline ? (
        <p>Você está offline. Verifique sua conexão com a internet.</p>
      ) : (
        <p>Conexão restabelecida!</p>
      )}
    </div>
  );
};

export default NetworkStatus; 