import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '100px auto' }}>
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>登录</h2>
          
          {error && <div className="error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span>还没有账号？</span>
            <Link to="/register" style={{ marginLeft: '5px', color: '#007bff' }}>立即注册</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;