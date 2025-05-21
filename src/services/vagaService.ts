import api from './api';
import { VagaStatus } from '../interfaces/vaga';
import type { Vaga, VagaCompleta, Etapa, Candidato } from '../interfaces/vaga';
    
const mockData: { [key: string]: VagaCompleta } = {
  '1': {
    id: '1',
    titulo: 'Desenvolvedor Frontend React',
    descricao: 'Vaga para desenvolvedor frontend com experiência em React, TypeScript e design responsivo.',
    status: VagaStatus.ATIVA,
    created_at: '2023-06-15T00:00:00.000Z',
    updated_at: '2023-06-15T00:00:00.000Z',
    etapas: [
      {
        id: '101',
        nome: 'Triagem de Currículos',
        ordem: 1,
        vaga_id: '1'
      },
      {
        id: '102',
        nome: 'Entrevista Técnica',
        ordem: 2,
        vaga_id: '1'
      },
      {
        id: '103',
        nome: 'Entrevista Final',
        ordem: 3,
        vaga_id: '1'
      }
    ],
    candidatos: [
      {
        id: '201',
        nome: 'João Silva',
        telefone: '(11) 98765-4321',
        email: 'joao.silva@exemplo.com',
        vaga_id: '1',
        etapa_id: '101'
      },
      {
        id: '202',
        nome: 'Maria Santos',
        telefone: '(11) 91234-5678',
        email: 'maria.santos@exemplo.com',
        vaga_id: '1',
        etapa_id: '102'
      }
    ]
  },
  '2': {
    id: '2',
    titulo: 'Desenvolvedor Backend Node.js',
    descricao: 'Buscamos desenvolvedor com experiência em Node.js, Express e bancos de dados SQL e NoSQL.',
    status: VagaStatus.CONGELADA,
    created_at: '2023-06-10T00:00:00.000Z',
    updated_at: '2023-06-10T00:00:00.000Z',
    etapas: [
      {
        id: '201',
        nome: 'Análise de CV',
        ordem: 1,
        vaga_id: '2'
      },
      {
        id: '202',
        nome: 'Teste Técnico',
        ordem: 2,
        vaga_id: '2'
      }
    ],
    candidatos: [
      {
        id: '301',
        nome: 'Carlos Oliveira',
        telefone: '(21) 99876-5432',
        email: 'carlos.oliveira@exemplo.com',
        vaga_id: '2',
        etapa_id: '201'
      }
    ]
  }
};

export const vagaService = {
  listarVagas: async (): Promise<Vaga[]> => {
    try {
      console.log('Buscando todas as vagas...');
      const response = await api.get('/vagas');
      
      let statusLocais: Record<string, VagaStatus> = {};
      try {
        statusLocais = JSON.parse(localStorage.getItem('vaga_status_local') || '{}');
      } catch (e) {
        console.error("Erro ao carregar status locais:", e);
      }

      const vagasComStatusAtualizados = response.data.map((vaga: Vaga) => {
        if (statusLocais[vaga.id]) {
          console.log(`Aplicando status local para vaga ${vaga.id}: ${statusLocais[vaga.id]}`);
          return {
            ...vaga,
            status: statusLocais[vaga.id]
          };
        }
        return vaga;
      });
      
      return vagasComStatusAtualizados;
    } catch (error) {
      console.error('Erro ao listar vagas:', error);
      return Object.values(mockData);
    }
  },

  obterVaga: async (id: string): Promise<VagaCompleta> => {
    try {
      console.log(`Buscando detalhes da vaga ${id}...`);
      const response = await api.get(`/vagas/${id}`);
      console.log(`Resposta da API para vaga ${id}:`, response.data);
      
      const vagaData = response.data;
      if (!vagaData.etapas) {
        console.warn(`Vaga ${id} não possui a propriedade 'etapas'`);
      }
      if (!vagaData.candidatos) {
        console.warn(`Vaga ${id} não possui a propriedade 'candidatos'`);
      }
      
      let statusLocal: VagaStatus | null = null;
      try {
        const statusLocais: Record<string, VagaStatus> = JSON.parse(localStorage.getItem('vaga_status_local') || '{}');
        statusLocal = statusLocais[id];
      } catch (e) {
        console.error("Erro ao carregar status local:", e);
      }
      
      return {
        ...vagaData,
        status: statusLocal || vagaData.status,
        etapas: vagaData.etapas || [],
        candidatos: vagaData.candidatos || []
      };
    } catch (error) {
      console.error(`Erro ao obter vaga ${id}:`, error);
      if (mockData[id]) {
        console.log(`Usando dados simulados para vaga ${id}`);
        return mockData[id];
      }
      
      const mockVaga: VagaCompleta = {
        id,
        titulo: `Vaga ${id}`,
        descricao: 'Esta é uma vaga simulada para desenvolvimento.',
        status: VagaStatus.ATIVA,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        etapas: [
          {
            id: `${id}01`,
            nome: 'Análise de CV',
            ordem: 1,
            vaga_id: id
          },
          {
            id: `${id}02`,
            nome: 'Entrevista',
            ordem: 2,
            vaga_id: id
          }
        ],
        candidatos: []
      };
      
      return mockVaga;
    }
  },

  criarVaga: async (vaga: Omit<Vaga, 'id' | 'created_at' | 'updated_at'>): Promise<Vaga> => {
    try {
      console.log('Criando nova vaga:', vaga);
      const response = await api.post('/vagas', vaga);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      const novaVaga: Vaga = {
        id: Date.now().toString(),
        ...vaga,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novaVaga;
    }
  },

  atualizarVaga: async (id: string, vaga: Partial<Vaga>): Promise<Vaga> => {
    try {
      console.log(`Atualizando vaga ${id}:`, vaga);
      const response = await api.put(`/vagas/${id}`, vaga);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar vaga ${id}:`, error);
      throw error;
    }
  },

  excluirVaga: async (id: string): Promise<void> => {
    try {
      console.log(`Excluindo vaga ${id}...`);
      await api.delete(`/vagas/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir vaga ${id}:`, error);
      throw error;
    }
  },

  alterarStatus: async (id: string, status: VagaStatus): Promise<Vaga> => {
    try {
      console.log(`Alterando status da vaga ${id} para ${status}...`);
      
      const vagaAtual = await vagaService.obterVaga(id);
      const statusAnterior = vagaAtual.status;
      
      const vagaAtualizada = {
        titulo: vagaAtual.titulo,
        descricao: vagaAtual.descricao || '', 
        status: status
      };
      
      console.log(`Atualizando vaga ${id} com:`, vagaAtualizada);
      await vagaService.atualizarVaga(id, vagaAtualizada);
      
      const vagaDepoisDeAtualizar = await vagaService.obterVaga(id);
      
      if (vagaDepoisDeAtualizar.status === statusAnterior && vagaDepoisDeAtualizar.status !== status) {
        console.warn(`API não alterou o status da vaga ${id} para ${status}. Usando versão local.`);
        
        try {
          const statusLocais: Record<string, VagaStatus> = JSON.parse(localStorage.getItem('vaga_status_local') || '{}');
          statusLocais[id] = status;
          localStorage.setItem('vaga_status_local', JSON.stringify(statusLocais));
        } catch (e) {
          console.error("Erro ao salvar status local:", e);
        }
        
        return {
          ...vagaDepoisDeAtualizar,
          status: status
        };
      }
      
      return vagaDepoisDeAtualizar;
    } catch (error) {
      console.error(`Erro ao alterar status da vaga ${id}:`, error);
      throw error;
    }
  }
}; 