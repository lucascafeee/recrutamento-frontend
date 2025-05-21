export enum VagaStatus {
  ATIVA = 'ativa',
  CONGELADA = 'congelada',
  CONCLUIDA = 'concluida'
}

export interface Vaga {
  id: string;
  titulo: string;
  descricao?: string;
  status: VagaStatus;
  created_at: string;
  updated_at: string;
}

export interface Etapa {
  id: string;
  nome: string;
  ordem: number;
  vaga_id: string;
}

export interface Candidato {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  vaga_id: string;
  etapa_id: string;
  etapa?: Etapa;
}

export interface VagaCompleta extends Vaga {
  etapas: Etapa[];
  candidatos: Candidato[];
} 