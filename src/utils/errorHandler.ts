import axios, { AxiosError } from 'axios';

/**
 * Função para extrair mensagens de erro das respostas de API
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response?.data) {
      const { message, error: errorMessage } = axiosError.response.data;
      if (message) return message;
      if (errorMessage) return errorMessage;
    }
    
    switch (axiosError.response?.status) {
      case 400:
        return 'Requisição inválida. Verifique os dados enviados.';
      case 401:
        return 'Não autorizado. Faça login novamente.';
      case 403:
        return 'Acesso negado. Você não tem permissão para acessar este recurso.';
      case 404:
        return 'Recurso não encontrado.';
      case 422:
        return 'Dados inválidos. Verifique as informações fornecidas.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return 'Erro ao se comunicar com o servidor. Tente novamente.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ocorreu um erro desconhecido. Tente novamente.';
}; 