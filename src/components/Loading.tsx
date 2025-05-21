import React from 'react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...', fullScreen = false }) => {
  const loaderClass = fullScreen ? 'loader-fullscreen' : 'loader';

  return (
    <div className={loaderClass}>
      <div className="loading-content">
        <div className="spinner"></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default Loading; 