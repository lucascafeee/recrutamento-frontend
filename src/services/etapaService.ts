import api from './api';
import type { Etapa } from '../interfaces/vaga';

export const etapaService = {
  listarEtapas: async (vagaId: string): Promise<Etapa[]> => {
    try {
      console.log(`Buscando etapas da vaga ${vagaId}...`);
      const response = await api.get(`/vagas/${vagaId}/etapas`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar etapas da vaga ${vagaId}:`, error);
      return [];
    }
  },

  criarEtapa: async (etapa: Omit<Etapa, 'id'>): Promise<Etapa> => {
    try {
      console.log('Criando nova etapa:', etapa);
      const response = await api.post('/etapas', etapa);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
      return {
        id: Date.now().toString(),
        ...etapa
      };
    }
  },

  atualizarEtapa: async (id: string, etapa: Partial<Etapa>): Promise<Etapa> => {
    try {
      console.log(`Atualizando etapa ${id}:`, etapa);
      const response = await api.put(`/etapas/${id}`, etapa);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar etapa ${id}:`, error);
      throw error;
    }
  },

  excluirEtapa: async (id: string): Promise<void> => {
    try {
      console.log(`Excluindo etapa ${id}...`);
      await api.delete(`/etapas/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir etapa ${id}:`, error);
      return;
    }
  },
}; 