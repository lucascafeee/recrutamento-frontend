import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { useAuthStore } from '../contexts/authStore';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { register, error, isLoading, token, checkAuth, emailAlreadyExists, clearErrors } = useAuthStore();
  
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          navigate('/dashboard');
        }
      }
      setIsCheckingAuth(false);
    };
    
    verifyAuth();
  }, [token, checkAuth, navigate]);
  
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  useEffect(() => {
    console.log('[Register] Estado atualizado - emailAlreadyExists:', emailAlreadyExists);
  }, [emailAlreadyExists]);

  useEffect(() => {
    console.log('[Register] Estado atualizado - error:', error);
  }, [error]);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailAlreadyExists) {
      clearErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    console.log('[Register] Tentando registrar usuário com email:', email);
    
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      console.error('[Register] Erro capturado ao registrar:', err);
    }
  };

  if (isCheckingAuth) {
    return <Loading message="Verificando autenticação..." />;
  }

  console.log('[Register] Renderizando com estados:', { emailAlreadyExists, error });

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-header">
          <h2>Cadastro</h2>
          <p>Crie sua conta para acessar o sistema</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {emailAlreadyExists ? (
            <div className="email-exists-message">
              <p>Este e-mail já está cadastrado no sistema.</p>
              <p>Você já possui uma conta? <Link to="/login" className="login-link">Faça login aqui</Link></p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : null}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nome (opcional)</label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              type="email"
              className={`form-control ${emailAlreadyExists ? 'error' : ''}`}
              value={email}
              onChange={handleEmailChange}
              required
              placeholder="Seu e-mail"
            />
            {emailAlreadyExists && <div className="error-text">Este e-mail já está cadastrado</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Crie uma senha"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirme sua senha"
            />
            {passwordError && <div className="error-text">{passwordError}</div>}
          </div>
          
          <button 
            type="submit" 
            className={`btn ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading} 
            style={{ width: '100%', color: 'black' }}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Já possui uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register; 