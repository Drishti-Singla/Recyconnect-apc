import React, { useState } from 'react';
import logo from '../components/logo.png';
import { useNavigate } from 'react-router-dom';
import { userAPI, authUtils } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeHeader, setActiveHeader] = useState('');
  const [showMeme, setShowMeme] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simple email validation
  const showEmailError = email && !email.endsWith('@chitkara.edu.in');
  const isEmailValid = email.endsWith('@chitkara.edu.in');
  const isPasswordValid = password.length > 0;
  const canLogin = isEmailValid && isPasswordValid && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canLogin) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login for:', email);
      
      // Clear any existing user data first
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      authUtils.removeToken();
      
      // Always go through the backend API for authentication
      const credentials = {
        email: email,
        password: password
      };

      const response = await userAPI.login(credentials);
      
      console.log('✅ Login successful:', response);
      
      // Store the JWT token
      if (response.data && response.data.token) {
        authUtils.setToken(response.data.token);
      }
      
      // Update to handle the actual response structure
      if (response && response.id) {
        const user = response; // The response is the user object directly
        console.log('User details:', user);

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Check if user is admin based on backend response
        const isAdminUser = user.role === 'admin' || user.role === 'ADMIN' || user.isAdmin;
        localStorage.setItem('isAdmin', isAdminUser ? 'true' : 'false');
        
        // Navigate based on admin status
        if (isAdminUser) {
          navigate('/admin');
        } else {
          navigate('/explore');
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ position: 'relative', minHeight: '100vh', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {showMeme ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: `url(/meme.jpg) center center / cover no-repeat`,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            padding: '2.5rem 2rem 0 2rem',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '3.5rem',
            textShadow: '0 2px 8px rgba(0,0,0,0.45)',
            lineHeight: 1.2,
            textAlign: 'left',
            zIndex: 10000,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            We’re working on it<br />
            <span style={{ fontWeight: 400, fontSize: '2rem', marginTop: 12, display: 'block' }}>
              (slowly, like Windows updates)
            </span>
          </div>
          <audio src="/meme.mp3" autoPlay loop style={{ display: 'none' }} />
          <button
            style={{
              marginBottom: '3rem',
              padding: '1rem 2.5rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: '2rem',
              border: 'none',
              background: '#fff',
              color: '#007bff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              opacity: 0.95,
            }}
            onClick={() => setShowMeme(false)}
          >
            Thank you for understanding
          </button>
        </div>
      ) : (
        <>
          {/* Header with navigation and centered logo/app name */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '1rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.65)',
              borderBottom: '1px solid #eee',
              zIndex: 10,
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                color: activeHeader === 'back' ? '#007bff' : '#222',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 500,
                zIndex: 2,
              }}
              onClick={() => {
                setActiveHeader('back');
                navigate('/');
                    }}
                    onMouseDown={() => setActiveHeader('back')}
                    onMouseUp={() => setActiveHeader('')}
                  >
                    &larr; Back
                  </button>
                  <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                    <img src={logo} alt="RecyConnect Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff', letterSpacing: '2px' }}>RecyConnect</span>
                  </div>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: activeHeader === 'create' ? '#007bff' : '#222',
                      fontWeight: 500,
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                    onClick={() => {
                      setActiveHeader('create');
                      navigate('/signup');
                    }}
                    onMouseDown={() => setActiveHeader('create')}
                    onMouseUp={() => setActiveHeader('')}
                  >
                    Create an account
                  </span>
                </div>
                {/* Main Container - Centered Login Box */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    width: '700px',
                    maxWidth: '95vw',
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    gap: '2rem',
                  }}
                >
                    {/* Left: Email/Password Login */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ width: '100%', maxWidth: 320 }}>
                        <h3
                          style={{
                            textAlign: 'center',
                            fontWeight: 600,
                            marginBottom: '2rem',
                            color: '#222',
                          }}
                        >
                          Login to your account
                        </h3>
                        <form onSubmit={handleSubmit} autoComplete="off">
                          {error && (
                            <div style={{
                              background: '#ffebee',
                              color: '#c62828',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              marginBottom: '1rem',
                              fontSize: '0.9rem',
                              textAlign: 'center'
                            }}>
                              {error}
                            </div>
                          )}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <label
                              htmlFor="email"
                              style={{
                                display: 'block',
                                marginBottom: 6,
                                color: '#222',
                                fontWeight: 500,
                              }}
                            >
                              Email address
                            </label>
                            <input
                              type="email"
                              id="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 8,
                                border: showEmailError ? '2px solid #ff5252' : '1px solid #ccc',
                                fontSize: '1rem',
                                marginBottom: 2,
                                background: isLoading ? '#f5f5f5' : '#fff',
                                color: '#222',
                                opacity: isLoading ? 0.7 : 1,
                              }}
                            />
                            {showEmailError && (
                              <div style={{ color: '#ff5252', fontSize: '0.85rem', marginTop: 6, fontWeight: 400 }}>
                                Please enter your university email ID
                              </div>
                            )}
                          </div>
                          <div style={{ marginBottom: '1.5rem' }}>
                            <label
                              htmlFor="password"
                              style={{
                                display: 'block',
                                marginBottom: 6,
                                color: '#222',
                                fontWeight: 500,
                              }}
                            >
                              Password
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: 8,
                                  border: '1px solid #ccc',
                                  fontSize: '1rem',
                                  background: isLoading ? '#f5f5f5' : '#fff',
                                  opacity: isLoading ? 0.7 : 1,
                                }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  right: 12,
                                  color: '#888',
                                  fontSize: '1.3rem',
                                  cursor: isLoading ? 'not-allowed' : 'pointer',
                                  userSelect: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  opacity: isLoading ? 0.5 : 1,
                                }}
                                onClick={() => !isLoading && setShowPassword((s) => !s)}
                              >
                             {showPassword ? '🙈' : '🙉'} 
                              </span>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={!canLogin}
                            style={{
                              width: '100%',
                              background: canLogin ? '#007bff' : '#bdbdbd',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '0.75rem',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              marginBottom: '1rem',
                              cursor: canLogin ? 'pointer' : 'not-allowed',
                              transition: 'background 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            {isLoading && (
                              <div style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid #ffffff40',
                                borderTop: '2px solid #ffffff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                              }} />
                            )}
                            {isLoading ? 'Logging in...' : 'Log in'}
                          </button>
                        </form>
                      </div>
                    </div>
                    {/* Divider */}
                    <div
                      style={{
                        position: 'relative',
                        width: 1,
                        background: '#e0e0e0',
                        margin: '0 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#fff',
                          color: '#888',
                          fontSize: '0.95rem',
                          padding: '0 8px',
                          borderRadius: 8,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        or
                      </span>
                    </div>
                    {/* Right: Social Login */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1.2rem',
                      }}
                    >
                      <div style={{ width: '100%', maxWidth: 320 }}>
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: '#222',
                            border: '1px solid #ccc',
                            borderRadius: 24,
                            padding: '0.75rem',
                            fontWeight: 500,
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                          }}
                          onClick={() => setShowMeme(true)}
                        >
                          <img
                            src="/google.png"
                            alt="Google"
                            style={{ width: 24, height: 24, objectFit: 'contain' }}
                          />
                          Continue with Google
                        </button>
                        <div
                          style={{
                            textAlign: 'center',
                            marginTop: '2rem',
                            fontSize: '0.9rem',
                            color: '#888',
                          }}
                        >
                          Secure Login with reCAPTCHA subject to{' '}
                          <a
                            href="#"
                            style={{ color: '#007bff', textDecoration: 'underline' }}
                          >
                            Google Terms & Privacy
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
              </>
            )}
      </div>
    </>
  );
}

export default Login;
