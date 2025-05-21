import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vagaService } from '../services/vagaService';
import type { Vaga } from '../interfaces/vaga';
import { VagaStatus } from '../interfaces/vaga';
import '../assets/styles/dashboard.css';
import { useAuthStore } from '../contexts/authStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    status: VagaStatus;
  }>({
    titulo: '',
    descricao: '',
    status: VagaStatus.ATIVA,
  });

  useEffect(() => {
    carregarVagas();
  }, []);

  const carregarVagas = async () => {
    try {
      setLoading(true);
      const vagasData = await vagaService.listarVagas();
      setVagas(vagasData);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
      setError('Não foi possível carregar as vagas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vagaService.criarVaga(formData);
      setShowModal(false);
      setFormData({
        titulo: '',
        descricao: '',
        status: VagaStatus.ATIVA,
      });
      await carregarVagas();
    } catch (err) {
      console.error('Erro ao criar vaga:', err);
      setError('Não foi possível criar a vaga. Por favor, tente novamente.');
    }
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        await vagaService.excluirVaga(id);
        await carregarVagas();
      } catch (err) {
        console.error(`Erro ao excluir vaga ${id}:`, err);
        setError('Não foi possível excluir a vaga. Por favor, tente novamente.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const renderStatusBadge = (status: VagaStatus) => {
    const statusClasses = {
      [VagaStatus.ATIVA]: 'badge badge-success',
      [VagaStatus.CONGELADA]: 'badge badge-frozen',
      [VagaStatus.CONCLUIDA]: 'badge badge-completed',
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

  if (loading && vagas.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">Painel de Vagas</h1>
              <p className="welcome-message">
                Olá, {user?.name || user?.email || 'Usuário'}!
              </p>
            </div>
            <div className="header-right">
              <button style={{ color: 'black' }} onClick={handleGoHome} className="btn btn-outline">
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Voltar para Início
              </button>
              <button style={{ color: 'black' }} onClick={handleLogout} className="btn btn-secondary">
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main container">
        <div className="dashboard-actions">
          <div className="vaga-count">
            <p>Total de vagas: <strong>{vagas.length}</strong></p>
          </div>
          <button 
            style={{ color: 'black' }}
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <span className="btn-icon">+</span> Nova Vaga
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <div className="alert-content">
              <span className="alert-icon">!</span>
              <p>{error}</p>
              <button onClick={() => carregarVagas()} className="btn-reload">
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {vagas.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-svg">
                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="empty-title">Nenhuma vaga encontrada</h3>
            <p className="empty-description">Crie sua primeira vaga para começar a gerenciar seus processos seletivos</p>
            <button 
              onClick={() => setShowModal(true)}
              className="btn btn-primary btn-large"
            >
              <span className="btn-icon">+</span> Criar primeira vaga
            </button>
          </div>
        ) : (
          <div className="vaga-grid">
            {vagas.map((vaga) => (
              <div 
                key={vaga.id} 
                className="vaga-card"
              >
                <div className="vaga-content">
                  <div className="vaga-header">
                    <h2 className="vaga-titulo">{vaga.titulo}</h2>
                    {renderStatusBadge(vaga.status)}
                  </div>
                  
                  <div className="vaga-descricao-container">
                    <p className="vaga-descricao">
                      {vaga.descricao || 'Sem descrição'}
                    </p>
                  </div>
                  
                  <div className="vaga-data">
                    <svg className="icon-calendar" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {new Date(vaga.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  <div className="vaga-acoes">
                    <Link 
                      to={`/vagas/${vaga.id}`} 
                      className="btn-link btn-view"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ver detalhes
                    </Link>
                    <button 
                      onClick={() => handleExcluir(vaga.id)}
                      className="btn-link btn-delete"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Vaga</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close"
                aria-label="Fechar"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label" htmlFor="titulo">
                  Título
                </label>
                <input
                  id="titulo"
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  placeholder="Digite o título da vaga"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="descricao">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className="form-control"
                  rows={4}
                  placeholder="Descreva os detalhes da vaga"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <div className="select-wrapper">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
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
                  style={{ color: 'black' }}
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  style={{ color: 'black' }}
                  type="submit"
                  className="btn btn-primary"
                >
                  Criar Vaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 