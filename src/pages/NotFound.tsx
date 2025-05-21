import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Página Não Encontrada</h2>
        <p>A página que você está procurando não existe ou foi removida.</p>
        <Link to="/" className="btn">Voltar para o início</Link>
      </div>
    </Layout>
  );
};

export default NotFound; 