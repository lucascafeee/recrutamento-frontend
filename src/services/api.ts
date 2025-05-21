import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log('[API] Inicializando serviço com URL base:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Requisição para ${config.url} com token JWT`);
    } else {
      console.log(`[API] Requisição para ${config.url} sem token`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Erro ao configurar requisição:', error);
    return Promise.reject(error);
  }
);

const isEmailExistsError = (message: string = '') => {
  const errorMsgLower = message.toLowerCase();
  return (
    errorMsgLower.includes('já existe') ||
    errorMsgLower.includes('already exists') ||
    errorMsgLower.includes('já cadastrado') ||
    errorMsgLower.includes('already registered') ||
    errorMsgLower.includes('duplicate') ||
    errorMsgLower.includes('já está sendo usado') ||
    errorMsgLower.includes('already in use') ||
    errorMsgLower.includes('email') && (
      errorMsgLower.includes('duplicado') ||
      errorMsgLower.includes('usado') ||
      errorMsgLower.includes('cadastrado')
    )
  );
};

const deepInspectErrorData = (data: any): boolean => {
  console.log('[API] Inspecionando dados de erro:', data);
  
  if (!data) return false;
  
  if (typeof data.message === 'string' && isEmailExistsError(data.message)) {
    return true;
  }
  
  if (Array.isArray(data.errors)) {
    for (const err of data.errors) {
      if (typeof err.message === 'string' && isEmailExistsError(err.message)) {
        return true;
      }
      if (typeof err.msg === 'string' && isEmailExistsError(err.msg)) {
        return true;
      }
      if (typeof err === 'string' && isEmailExistsError(err)) {
        return true;
      }
    }
  }
  
  if (data.errors && typeof data.errors === 'object') {
    if (data.errors.email && typeof data.errors.email === 'string' && isEmailExistsError(data.errors.email)) {
      return true;
    }
    if (Array.isArray(data.errors.email) && data.errors.email.some((msg: string) => isEmailExistsError(msg))) {
      return true;
    }
  }
  
  if (typeof data.error === 'string' && isEmailExistsError(data.error)) {
    return true;
  }
  
  if (typeof data.detail === 'string' && isEmailExistsError(data.detail)) {
    return true;
  }
  
  return false;
};

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Resposta de ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('[API] Erro de rede/conexão:', {
        message: error.message,
        code: error.code,
        url: error.config?.url
      });
      return Promise.reject({
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.'
      });
    }
    
    const { response } = error;
    
    console.error(`[API] Erro na resposta de ${error.config?.url}:`, {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      completeData: JSON.stringify(response?.data)
    });

    let isEmailExists = false;
    
    if (response.status === 409) {
      isEmailExists = true;
      console.log('[API] Detectado conflito (409) - possível email já cadastrado');
    }
    else if (
      response.status === 400 && 
      error.config?.url?.includes('/auth/register')
    ) {
      isEmailExists = deepInspectErrorData(response.data);
      
      if (isEmailExists) {
        console.log('[API] Detectado email já cadastrado em erro 400 BadRequest');
      }
    }
    else if (response?.data?.message && isEmailExistsError(response.data.message)) {
      isEmailExists = true;
      console.log('[API] Detectado email já cadastrado pela mensagem:', response.data.message);
    }
    
    else if (
      error.config?.url?.includes('/auth/register') && 
      response.status === 422
    ) {
      const errorMessage = 
        response?.data?.message || 
        (response?.data?.errors && response.data.errors[0]?.message) ||
        '';
      
      if (isEmailExistsError(errorMessage)) {
        isEmailExists = true;
        console.log('[API] Detectado email já cadastrado em erro de validação:', errorMessage);
      }
    }
    
    if (isEmailExists) {
      return Promise.reject({
        ...error,
        response: {
          ...response,
          data: {
            ...response?.data,
            isEmailExists: true,
            message: 'Este e-mail já está cadastrado no sistema.'
          }
        }
      });
    }

    if (response.status === 401 || response.status === 403) {
      console.warn('[API] Erro de autenticação, removendo credenciais');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        console.log('[API] Redirecionando para tela de login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 