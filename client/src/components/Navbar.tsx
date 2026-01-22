import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#343a40',
      padding: '1rem 0',
      marginBottom: '2rem'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <Link 
              to="/dashboard" 
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              日历应用
            </Link>
            
            {user && (
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <Link 
                  to="/dashboard" 
                  style={{
                    color: isActive('/dashboard') ? '#007bff' : 'white',
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    backgroundColor: isActive('/dashboard') ? 'white' : 'transparent'
                  }}
                >
                  日历
                </Link>
                <Link 
                  to="/checkin" 
                  style={{
                    color: isActive('/checkin') ? '#007bff' : 'white',
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    backgroundColor: isActive('/checkin') ? 'white' : 'transparent'
                  }}
                >
                  签到
                </Link>
              </div>
            )}
          </div>
          
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'white'
            }}>
              <span>欢迎, {user.username}</span>
              <button 
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                退出
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <Link to="/login" className="btn btn-secondary">登录</Link>
              <Link to="/register" className="btn btn-primary">注册</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;