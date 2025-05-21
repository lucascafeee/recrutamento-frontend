import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { useAuthStore } from '../contexts/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { login, error, isLoading, token, checkAuth } = useAuthStore();
  
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
    if (email && formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
    if (password && formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [email, password, formErrors]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Digite um e-mail válido';
    }
    
    if (!password) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
    }
  };

  if (isCheckingAuth) {
    return <Loading message="Verificando autenticação..." />;
  }

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Entre com suas credenciais para acessar o sistema</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              type="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Seu e-mail"
            />
            {formErrors.email && <div className="error-text">{formErrors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              type="password"
              className={`form-control ${formErrors.password ? 'error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Sua senha"
            />
            {formErrors.password && <div className="error-text">{formErrors.password}</div>}
          </div>
          
          <button 
            type="submit" 
            className={`btn ${isLoading ? 'btn-loading' : ''}`} 
            disabled={isLoading} 
            style={{ width: '100%', color: 'black' }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Não possui uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 