import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>R&S<span className="logo-highlight"> System</span></h1>
          </Link>
        </div>

        <nav className="nav">
          {user ? (
            <>
              <div className="user-info">
                <span>Olá, {user.name || user.email.split('@')[0]}</span>
              </div>
              <Link to="/dashboard" className="btn-link">Dashboard</Link>
              <button className="btn-link logout-btn" onClick={handleLogout}>
                <span>Sair</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-link">
                Login
              </Link>
              <Link style={{color: 'black'}} to="/register" className="btn btn-sm">
                Criar Conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 