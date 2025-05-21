/**
 * Verifica se o token JWT está expirado
 * @param token Token JWT
 * @returns boolean
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    return exp ? Date.now() >= exp * 1000 : false;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return true;
  }
};

/**
 * Sanitiza strings para evitar XSS
 * @param input String a ser sanitizada
 * @returns String sanitizada
 */
export const sanitizeInput = (input: string): string => {
  const element = document.createElement('div');
  element.innerText = input;
  return element.innerHTML;
};

/**
 * Limpa dados sensíveis do armazenamento ao fazer logout
 */
export const clearSensitiveData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  document.cookie.split(';').forEach(cookie => {
    document.cookie = cookie
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
}; 