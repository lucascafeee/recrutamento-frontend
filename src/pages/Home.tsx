import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../contexts/authStore';

const Home: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="home-container">
        <div className="hero-section">
          <h1>Sistema de Recrutamento & Seleção</h1>
          <p className="hero-description">
            Uma plataforma completa para gerenciar processos seletivos, candidatos e vagas de forma simples e organizada.
          </p>
          
          {!user ? (
            <div className="hero-buttons">
              <Link to="/login" className="btn">Fazer Login</Link>
              <Link to="/register" className="btn btn-outline">Criar Conta</Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn">Acessar Dashboard</Link>
            </div>
          )}
        </div>

        <div className="features-section">
          <h2>Funcionalidades</h2>
          <p className="features-subtitle">
            Nossa plataforma oferece todas as ferramentas necessárias para otimizar seu processo de recrutamento e seleção.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>Gestão de Candidatos</h3>
              <p>Cadastre, organize e acompanhe candidatos em diferentes estágios do processo seletivo com uma interface intuitiva e moderna.</p>
            </div>
            
            <div className="feature-card">
              <h3>Controle de Vagas</h3>
              <p>Gerencie vagas abertas, requisitos, prazos e candidaturas para cada posição com ferramentas avançadas de filtragem e categorização.</p>
            </div>
            
            <div className="feature-card">
              <h3>Etapas do Processo</h3>
              <p>Configure fluxos personalizados com múltiplas etapas para cada processo seletivo e monitore o progresso em tempo real.</p>
            </div>
          </div>
        </div>
        
        <div className="cta-section">
          <h2>Comece a usar hoje mesmo</h2>
          <p className="cta-description">
            Transforme sua forma de recrutar e selecionar talentos com nossa plataforma completa.
            Cadastre-se gratuitamente e comece a gerenciar seus processos seletivos.
          </p>
          
          {!user ? (
            <Link style={{ color: 'black' }} to="/register" className="btn cta-button">Criar Conta Grátis</Link>
          ) : (
            <Link style={{ color: 'black' }} to="/dashboard" className="btn cta-button">Ir para o Dashboard</Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home; 