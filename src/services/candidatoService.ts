import api from './api';
import type { Candidato } from '../interfaces/vaga';

export const candidatoService = {
  // Listar candidatos de uma vaga
  listarCandidatos: async (vagaId: string): Promise<Candidato[]> => {
    try {
      console.log(`Buscando candidatos da vaga ${vagaId}...`);
      const response = await api.get(`/vagas/${vagaId}/candidatos`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar candidatos da vaga ${vagaId}:`, error);
      return [];
    }
  },

  // Criar um novo candidato
  criarCandidato: async (candidato: Omit<Candidato, 'id'>): Promise<Candidato> => {
    try {
      console.log('Criando novo candidato:', candidato);
      const response = await api.post('/candidatos', candidato);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      // Simulação de criação com mock
      return {
        id: Date.now().toString(),
        ...candidato
      };
    }
  },

  // Atualizar um candidato existente
  atualizarCandidato: async (id: string, candidato: Partial<Candidato>): Promise<Candidato> => {
    try {
      console.log(`Atualizando candidato ${id}:`, candidato);
      const response = await api.put(`/candidatos/${id}`, candidato);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar candidato ${id}:`, error);
      throw error;
    }
  },

  // Excluir um candidato
  excluirCandidato: async (id: string): Promise<void> => {
    try {
      console.log(`Excluindo candidato ${id}...`);
      await api.delete(`/candidatos/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir candidato ${id}:`, error);
      // Simulação - não faz nada, apenas simula sucesso
      return;
    }
  },

  // Mover candidato para outra etapa
  moverParaEtapa: async (candidatoId: string, etapaId: string): Promise<Candidato> => {
    try {
      console.log(`Movendo candidato ${candidatoId} para etapa ${etapaId}...`);
      const response = await api.patch(`/candidatos/${candidatoId}/mover`, { etapa_id: etapaId });
      return response.data;
    } catch (error) {
      console.error(`Erro ao mover candidato ${candidatoId} para etapa ${etapaId}:`, error);
      // Simulação - retorna um candidato com etapa atualizada
      return {
        id: candidatoId,
        nome: 'Candidato Simulado',
        telefone: '(00) 00000-0000',
        email: 'candidato@exemplo.com',
        vaga_id: '1',
        etapa_id: etapaId
      };
    }
  }
}; 