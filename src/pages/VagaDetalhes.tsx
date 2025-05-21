import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vagaService } from '../services/vagaService';
import { etapaService } from '../services/etapaService';
import { candidatoService } from '../services/candidatoService';
import type { VagaCompleta, Etapa, Candidato } from '../interfaces/vaga';
import { VagaStatus } from '../interfaces/vaga';
import '../assets/styles/vagaDetalhes.css';

const VagaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vaga, setVaga] = useState<VagaCompleta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditarVagaModal, setShowEditarVagaModal] = useState<boolean>(false);
  const [showNovaEtapaModal, setShowNovaEtapaModal] = useState<boolean>(false);
  const [showNovoCandidatoModal, setShowNovoCandidatoModal] = useState<boolean>(false);
  const [showMoverCandidatoModal, setShowMoverCandidatoModal] = useState<boolean>(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);

  const [vagaForm, setVagaForm] = useState<{
    titulo: string;
    descricao: string;
    status: VagaStatus;
  }>({
    titulo: '',
    descricao: '',
    status: VagaStatus.ATIVA,
  });

  const [etapaForm, setEtapaForm] = useState<{
    nome: string;
    ordem: number;
  }>({
    nome: '',
    ordem: 0,
  });

  const [candidatoForm, setCandidatoForm] = useState<{
    nome: string;
    telefone: string;
    email: string;
    etapa_id: string;
  }>({
    nome: '',
    telefone: '',
    email: '',
    etapa_id: '',
  });

  const [novaEtapaId, setNovaEtapaId] = useState<string>('');

  useEffect(() => {
    if (id) {
      carregarVaga(id);
    }
  }, [id]);

  useEffect(() => {
    if (vaga) {
      setVagaForm({
        titulo: vaga.titulo,
        descricao: vaga.descricao || '',
        status: vaga.status,
      });

      if (vaga.etapas?.length > 0) {
        setCandidatoForm(prev => ({
          ...prev,
          etapa_id: vaga.etapas[0].id
        }));
      }
    }
  }, [vaga]);

  const carregarVaga = async (vagaId: string) => {
    try {
      setLoading(true);
      const vagaData = await vagaService.obterVaga(vagaId);
      
      // Garantir que etapas e candidatos estão presentes
      const vagaCompleta = {
        ...vagaData,
        etapas: vagaData.etapas || [],
        candidatos: vagaData.candidatos || []
      };
      
      setVaga(vagaCompleta);
      setError(null);
    } catch (err) {
      console.error(`Erro ao carregar vaga ${vagaId}:`, err);
      setError('Não foi possível carregar os detalhes da vaga. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVagaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVagaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEtapaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEtapaForm(prev => ({
      ...prev,
      [name]: name === 'ordem' ? parseInt(value, 10) : value
    }));
  };

  const handleCandidatoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCandidatoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAtualizarVaga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      await vagaService.atualizarVaga(id, vagaForm);
      await carregarVaga(id);
      setShowEditarVagaModal(false);
    } catch (err) {
      console.error(`Erro ao atualizar vaga ${id}:`, err);
      setError('Não foi possível atualizar a vaga. Por favor, tente novamente.');
    }
  };

  const handleAlterarStatus = async (status: VagaStatus) => {
    if (!id) return;
    
    try {
      await vagaService.alterarStatus(id, status);
      await carregarVaga(id);
    } catch (err) {
      console.error(`Erro ao alterar status da vaga ${id}:`, err);
      setError(`Não foi possível alterar o status para ${status}. Por favor, tente novamente.`);
    }
  };

  const handleCriarEtapa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const novaEtapa = {
        ...etapaForm,
        vaga_id: id
      };
      await etapaService.criarEtapa(novaEtapa);
      await carregarVaga(id);
      setShowNovaEtapaModal(false);
      setEtapaForm({
        nome: '',
        ordem: vaga?.etapas?.length ? vaga.etapas.length : 0
      });
    } catch (err) {
      console.error('Erro ao criar etapa:', err);
      setError('Não foi possível criar a etapa. Por favor, tente novamente.');
    }
  };

  const handleExcluirEtapa = async (etapaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta etapa? Todos os candidatos associados serão desvinculados.')) {
      try {
        await etapaService.excluirEtapa(etapaId);
        if (id) {
          await carregarVaga(id);
        }
      } catch (err) {
        console.error(`Erro ao excluir etapa ${etapaId}:`, err);
        setError('Não foi possível excluir a etapa. Por favor, tente novamente.');
      }
    }
  };

  const handleCriarCandidato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const novoCandidato = {
        ...candidatoForm,
        vaga_id: id
      };
      await candidatoService.criarCandidato(novoCandidato);
      await carregarVaga(id);
      setShowNovoCandidatoModal(false);
      setCandidatoForm({
        nome: '',
        telefone: '',
        email: '',
        etapa_id: vaga?.etapas[0]?.id || ''
      });
    } catch (err) {
      console.error('Erro ao criar candidato:', err);
      setError('Não foi possível adicionar o candidato. Por favor, tente novamente.');
    }
  };

  const handleExcluirCandidato = async (candidatoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      try {
        await candidatoService.excluirCandidato(candidatoId);
        if (id) {
          await carregarVaga(id);
        }
      } catch (err) {
        console.error(`Erro ao excluir candidato ${candidatoId}:`, err);
        setError('Não foi possível excluir o candidato. Por favor, tente novamente.');
      }
    }
  };

  const openMoverCandidatoModal = (candidato: Candidato) => {
    setCandidatoSelecionado(candidato);
    setNovaEtapaId(candidato.etapa_id);
    setShowMoverCandidatoModal(true);
  };

  const handleMoverCandidato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidatoSelecionado || !novaEtapaId) return;
    
    try {
      await candidatoService.moverParaEtapa(candidatoSelecionado.id, novaEtapaId);
      if (id) {
        await carregarVaga(id);
      }
      setShowMoverCandidatoModal(false);
      setCandidatoSelecionado(null);
    } catch (err) {
      console.error(`Erro ao mover candidato ${candidatoSelecionado.id}:`, err);
      setError('Não foi possível mover o candidato. Por favor, tente novamente.');
    }
  };

  const renderStatusBadge = (status: VagaStatus) => {
    const statusClasses = {
      [VagaStatus.ATIVA]: 'badge-status badge-ativa',
      [VagaStatus.CONGELADA]: 'badge-status badge-congelada',
      [VagaStatus.CONCLUIDA]: 'badge-status badge-concluida',
    };
    
    const statusTexts = {
      [VagaStatus.ATIVA]: 'Ativa',
      [VagaStatus.CONGELADA]: 'Congelada',
      [VagaStatus.CONCLUIDA]: 'Concluída',
    };
    
    return (
      <span className={statusClasses[status]}>
        {statusTexts[status]}
      </span>
    );
  };

  if (loading && !vaga) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando detalhes da vaga...</p>
        </div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <div className="alert-content">
            <div className="alert-icon">!</div>
            <span>{error || 'Vaga não encontrada.'}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">Detalhes da Vaga</h1>
              <p className="welcome-message">{vaga.titulo}</p>
            </div>
            <div className="header-right">
            <button 
  onClick={() => navigate('/dashboard')} 
  className="btn btn-outline"
  style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    color: 'black' 
  }}
>
  <svg 
    className="btn-icon" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ height: '1em', width: '1em' }} // para ajustar ao tamanho da fonte
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
  Voltar para o Dashboard
</button>

            </div>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="container">
          {error && (
            <div className="alert alert-error">
              <div className="alert-content">
                <div className="alert-icon">!</div>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Seção de detalhes da vaga */}
          <div className="detalhes-section">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <h2 className="section-title">Informações da Vaga</h2>
                {renderStatusBadge(vaga.status)}
              </div>
              
              <div style={{ marginRight: '10px' }} className="flex gap-10">
                <button 
                  style={{ color: 'black', marginRight: '15px' }}    
                  onClick={() => setShowEditarVagaModal(true)}
                  className="btn btn-primary"
                >
                  <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar
                </button>
                
                {vaga.status !== VagaStatus.CONCLUIDA && (
                  <button 
                    style={{ color: 'black', marginRight: '15px' }}
                    onClick={() => handleAlterarStatus(VagaStatus.CONCLUIDA)}
                    className="btn btn-secondary"
                  >
                    <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Finalizar
                  </button>
                )}
                
                {vaga.status === VagaStatus.ATIVA ? (
                  <button 
                    style={{ color: 'black', marginRight: '15px' }}
                    onClick={() => handleAlterarStatus(VagaStatus.CONGELADA)}
                    className="btn btn-secondary"
                  >
                    <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                    Congelar
                  </button>
                ) : vaga.status === VagaStatus.CONGELADA ? (
                  <button 
                    style={{ color: 'black', marginRight: '15px' }}
                    onClick={() => handleAlterarStatus(VagaStatus.ATIVA)}
                    className="btn btn-secondary"
                  >
                    <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    Descongelar
                  </button>
                ) : null}
              </div>
            </div>
            
            <div className="section-description">
              {vaga.descricao || 'Sem descrição'}
            </div>
            
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">{vaga.etapas.length}</div>
                <div className="stat-label">Etapas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{vaga.candidatos.length}</div>
                <div className="stat-label">Candidatos</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {new Date(vaga.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="stat-label">Data de Criação</div>
              </div>
            </div>
          </div>

          {/* Seção de etapas */}
          <div className="detalhes-section">
            <div className="section-header">
              <h2 className="section-title">Etapas do Processo</h2>
              <button 
                style={{ color: 'black' }}
                onClick={() => {
                  setEtapaForm({
                    nome: '',
                    ordem: vaga.etapas?.length || 0
                  });
                  setShowNovaEtapaModal(true);
                }}
                className="btn btn-primary"
              >
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nova Etapa
              </button>
            </div>

            {!vaga.etapas?.length ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg className="empty-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
                  </svg>
                </div>
                <h3 className="empty-title">Nenhuma etapa cadastrada</h3>
                <p className="empty-description">Crie etapas para organizar seu processo seletivo</p>
              </div>
            ) : (
              <div className="etapas-container">
                {vaga.etapas
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((etapa, index) => {
                    const candidatosNaEtapa = vaga.candidatos?.filter(c => c.etapa_id === etapa.id).length || 0;
                    
                    return (
                      <div key={etapa.id} className="etapa-card">
                        <div className="etapa-header">
                          <div>
                            <h3 style={{gap: '10px'}} className="etapa-titulo">
                              <span className="badge badge-secondary mr-2">
                                {index + 1}
                              </span>
                              {etapa.nome}
                            </h3>
                            <p className="etapa-candidates-count">
                              {candidatosNaEtapa} candidato{candidatosNaEtapa !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => handleExcluirEtapa(etapa.id)}
                            className="btn-link btn-delete"
                            disabled={candidatosNaEtapa > 0}
                            title={candidatosNaEtapa > 0 ? "Não é possível excluir etapas com candidatos" : ""}
                            style={{ color: '#dc2626' }}
                          >
                            <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        
                        {vaga.candidatos?.filter(c => c.etapa_id === etapa.id).map(candidato => (
                          <div key={candidato.id} className="candidato-item">
                            <div className="candidato-nome">{candidato.nome}</div>
                            <div className="candidato-email">{candidato.email}</div>
                            <div className="candidato-acoes">
                              <button
                                onClick={() => openMoverCandidatoModal(candidato)}
                                className="btn-link btn-view"
                                disabled={vaga.etapas.length <= 1}
                                title={vaga.etapas.length <= 1 ? "Precisa de mais de uma etapa para mover candidatos" : ""}
                                style={{ color: '#2563eb' }}
                              >
                                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5l7 7-7 7"></path>
                                </svg>
                                Mover
                              </button>
                              <button
                                onClick={() => handleExcluirCandidato(candidato.id)}
                                className="btn-link btn-delete"
                                style={{ color: '#dc2626' }}
                              >
                                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Seção de candidatos */}
          <div className="detalhes-section">
            <div className="section-header">
              <h2 className="section-title">Candidatos</h2>
              <button 
                style={{ color: 'black' }}
                onClick={() => setShowNovoCandidatoModal(true)}
                className="btn btn-primary"
                disabled={!vaga.etapas?.length}
                title={!vaga.etapas?.length ? "Crie pelo menos uma etapa antes de adicionar candidatos" : ""}
              >
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Novo Candidato
              </button>
            </div>

            {!vaga.candidatos?.length ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg className="empty-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="empty-title">Nenhum candidato cadastrado</h3>
                <p className="empty-description">Adicione candidatos para iniciar o processo seletivo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>E-mail</th>
                      <th>Etapa atual</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaga.candidatos?.map((candidato) => {
                      const etapaAtual = vaga.etapas?.find(e => e.id === candidato.etapa_id);
                      
                      return (
                        <tr key={candidato.id}>
                          <td>{candidato.nome}</td>
                          <td>{candidato.telefone}</td>
                          <td>{candidato.email}</td>
                          <td>{etapaAtual?.nome || 'Sem etapa'}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openMoverCandidatoModal(candidato)}
                                className="btn-link btn-view"
                                disabled={vaga.etapas.length <= 1}
                                title={vaga.etapas.length <= 1 ? "Precisa de mais de uma etapa para mover candidatos" : ""}
                                style={{ color: '#2563eb' }}
                              >
                                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5l7 7-7 7"></path>
                                </svg>
                                Mover
                              </button>
                              <button
                                onClick={() => handleExcluirCandidato(candidato.id)}
                                className="btn-link btn-delete"
                                style={{ color: '#dc2626' }}
                              >
                                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal de edição de vaga */}
          {showEditarVagaModal && (
            <div className="modal-backdrop" onClick={() => setShowEditarVagaModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Editar Vaga</h3>
                  <button 
                    onClick={() => setShowEditarVagaModal(false)}
                    className="modal-close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAtualizarVaga} className="form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="titulo">
                      Título
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      id="titulo"
                      value={vagaForm.titulo}
                      onChange={handleVagaInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="descricao">
                      Descrição
                    </label>
                    <textarea
                      name="descricao"
                      id="descricao"
                      value={vagaForm.descricao}
                      onChange={handleVagaInputChange}
                      className="form-control"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">
                      Status
                    </label>
                    <div className="select-wrapper">
                      <select
                        name="status"
                        id="status"
                        value={vagaForm.status}
                        onChange={handleVagaInputChange}
                        className="form-control"
                      >
                        <option value={VagaStatus.ATIVA}>Ativa</option>
                        <option value={VagaStatus.CONGELADA}>Congelada</option>
                        <option value={VagaStatus.CONCLUIDA}>Concluída</option>
                      </select>
                      <div className="select-arrow"></div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowEditarVagaModal(false)}
                      className="btn btn-secondary"
                      style={{ color: 'black' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ color: 'black' }}
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para nova etapa */}
          {showNovaEtapaModal && (
            <div className="modal-backdrop" onClick={() => setShowNovaEtapaModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Nova Etapa</h3>
                  <button 
                    onClick={() => setShowNovaEtapaModal(false)}
                    className="modal-close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCriarEtapa} className="form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="etapa-nome">
                      Nome da Etapa
                    </label>
                    <input
                      type="text"
                      name="nome"
                      id="etapa-nome"
                      value={etapaForm.nome}
                      onChange={handleEtapaInputChange}
                      className="form-control"
                      required
                      placeholder="Ex: Entrevista Técnica"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="etapa-ordem">
                      Ordem
                    </label>
                    <input
                      type="number"
                      name="ordem"
                      id="etapa-ordem"
                      value={etapaForm.ordem}
                      onChange={handleEtapaInputChange}
                      className="form-control"
                      required
                      min="0"
                    />
                    <p className="text-xs mt-1 text-light">
                      A ordem determina a posição da etapa no processo. Começando em 0.
                    </p>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowNovaEtapaModal(false)}
                      className="btn btn-secondary"
                      style={{ color: 'black' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ color: 'black' }}
                    >
                      Criar Etapa
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showNovoCandidatoModal && (
            <div className="modal-backdrop" onClick={() => setShowNovoCandidatoModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Novo Candidato</h3>
                  <button 
                    onClick={() => setShowNovoCandidatoModal(false)}
                    className="modal-close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCriarCandidato} className="form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="candidato-nome">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="nome"
                      id="candidato-nome"
                      value={candidatoForm.nome}
                      onChange={handleCandidatoInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="candidato-telefone">
                      Telefone
                    </label>
                    <input
                      type="text"
                      name="telefone"
                      id="candidato-telefone"
                      value={candidatoForm.telefone}
                      onChange={handleCandidatoInputChange}
                      className="form-control"
                      required
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="candidato-email">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="candidato-email"
                      value={candidatoForm.email}
                      onChange={handleCandidatoInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="candidato-etapa">
                      Etapa Inicial
                    </label>
                    <div className="select-wrapper">
                      <select
                        name="etapa_id"
                        id="candidato-etapa"
                        value={candidatoForm.etapa_id}
                        onChange={handleCandidatoInputChange}
                        className="form-control"
                        required
                      >
                        {vaga.etapas
                          ?.sort((a, b) => a.ordem - b.ordem)
                          .map((etapa) => (
                            <option key={etapa.id} value={etapa.id}>
                              {etapa.nome}
                            </option>
                          ))}
                      </select>
                      <div className="select-arrow"></div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowNovoCandidatoModal(false)}
                      className="btn btn-secondary"
                      style={{ color: 'black' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ color: 'black' }}
                    >
                      Adicionar Candidato
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showMoverCandidatoModal && candidatoSelecionado && (
            <div className="modal-backdrop" onClick={() => setShowMoverCandidatoModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Mover Candidato</h3>
                  <button 
                    onClick={() => setShowMoverCandidatoModal(false)}
                    className="modal-close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleMoverCandidato} className="form">
                  <p className="section-description">
                    Movendo: <strong>{candidatoSelecionado.nome}</strong>
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="etapa-mover">
                      Selecione a nova etapa:
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="etapa-mover"
                        value={novaEtapaId}
                        onChange={(e) => setNovaEtapaId(e.target.value)}
                        className="form-control"
                        required
                      >
                        {vaga.etapas
                          ?.sort((a, b) => a.ordem - b.ordem)
                          .map((etapa) => (
                            <option 
                              key={etapa.id} 
                              value={etapa.id}
                              disabled={etapa.id === candidatoSelecionado.etapa_id}
                            >
                              {etapa.nome} {etapa.id === candidatoSelecionado.etapa_id ? '(atual)' : ''}
                            </option>
                          ))}
                      </select>
                      <div className="select-arrow"></div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowMoverCandidatoModal(false)}
                      className="btn btn-secondary"
                      style={{ color: 'black' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ color: 'black' }}
                    >
                      Mover Candidato
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Sistema de Recrutamento & Seleção</p>
        </div>
      </footer>
    </div>
  );
};

export default VagaDetalhes; 