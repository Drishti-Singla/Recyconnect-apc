import React, { useState } from 'react';
import logo from '../components/logo.png';
import { useNavigate } from 'react-router-dom';
import { userAPI, authUtils } from '../services/api';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showMeme, setShowMeme] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const phoneRegex = /^\d{10}$/;
  const showPhoneError = phone && (!phoneRegex.test(phone));

  const isEmailValid = email.endsWith('@chitkara.edu.in');
  const isFormValid = profile && isEmailValid && phone && password.length >= 8;
  const showEmailError = email && !isEmailValid;
  const showPasswordError = password && password.length < 8;

  // Handle the actual signup process
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError('');

    try {
      // Clear any existing user data first
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      authUtils.removeToken();

      // Create user object for the backend
      const userData = {
        name: profile,
        email: email,
        password: password,
        phone: phone,
      };

      // Call the backend API to register user
      const response = await userAPI.register(userData);
      console.log('Registration response:', response);
      
      // The response is the user object directly, not wrapped in data
      const newUser = response;
      
      // Store user data in localStorage
      if (newUser && newUser.id) {
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('isLoggedIn', 'true');
        console.log('New user data stored:', newUser);
      } else {
        throw new Error('Invalid user data received from server');
      }
      
      // Show success message
      alert('Account created successfully! Redirecting to dashboard...');
      
      // Force a complete page refresh to ensure clean state
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Failed to create account. Please try again.');
      // Clear any partial data on error
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      authUtils.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    showMeme ? (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: `url(/meme2.jpg) center center / cover no-repeat`,
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
          color: '#FFD600',
          fontWeight: 'bold',
          fontSize: '3rem',
          textShadow: '0 2px 8px rgba(0,0,0,0.45)',
          lineHeight: 1.2,
          textAlign: 'left',
          zIndex: 10000,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          We’re trying<br />
          <span style={{ fontWeight: 700, fontSize: '2rem', marginTop: 12, display: 'block' }}>
            but even ChatGPT said<br />
            <span style={{ fontWeight: 700, fontSize: '2.2rem', color: '#FFD600', display: 'block', marginTop: 8 }}>
              ‘bro, idk’
            </span>
          </span>
        </div>
        <audio src="/meme2.mp3" autoPlay loop style={{ display: 'none' }} />
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
      <div style={{ height: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header with navigation and centered logo/app name */}
        <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.65)', borderBottom: '1px solid #eee', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            style={{ background: 'none', border: 'none', color: '#222', fontSize: '1rem', cursor: 'pointer', fontWeight: 500, zIndex: 2 }}
            onClick={() => navigate('/')}
          >
            &larr; Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 auto' }}>
            <img src={logo} alt="RecyConnect Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff', letterSpacing: '2px' }}>RecyConnect</span>
          </div>
          <span style={{ fontSize: '1rem', color: '#222', fontWeight: 500, cursor: 'pointer', zIndex: 2 }} onClick={() => navigate('/login')}>
            Already have an account?
          </span>
        </div>
        <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100%' }}>
          <div style={{ width: '100vw', height: '100%', background: '#fff', borderRadius: 0, boxShadow: 'none', padding: '32px 0 24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <form>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>What should we call you?</label>
                  <input type="text" value={profile} onChange={e => setProfile(e.target.value)} placeholder="Enter your profile name" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>What's your email?</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: showEmailError ? '2px solid #ff5252' : '1px solid #ccc',
                      fontSize: 16,
                      outline: 'none',
                      marginTop: 2,
                      background: '#fff',
                      color: '#222',
                    }}
                  />
                  {showEmailError && (
                    <div style={{ color: '#ff5252', fontSize: 13, marginTop: 6, fontWeight: 400 }}>
                      Please enter your university email address
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Which number should we use to connect with you?</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: showPhoneError ? '2px solid #ff5252' : '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                />
                {showPhoneError && (
                  <div style={{ color: '#ff5252', fontSize: 13, marginTop: 6 }}>
                    Please enter a valid phone number
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Create a password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: showPasswordError ? '2px solid #ff5252' : '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  />
                  <span
                    style={{ position: 'absolute', right: 16, top: 44, cursor: 'pointer', color: '#888', fontSize: 18, display: 'flex', alignItems: 'center' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '🙉'}
                  </span>
                  {showPasswordError && (
                    <div style={{ color: '#ff5252', fontSize: 13, marginTop: 6, fontWeight: 400 }}>
                      Password must be at least 8 characters long
                    </div>
                  )}
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div style={{ color: '#ff5252', fontSize: 14, marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                style={{ 
                  width: '100%', 
                  padding: '14px 0', 
                  borderRadius: 24, 
                  background: (isFormValid && !isLoading) ? '#007bff' : '#D9D9D9', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: 18, 
                  border: 'none', 
                  marginBottom: 24, 
                  opacity: (isFormValid && !isLoading) ? 1 : 0.7, 
                  cursor: (isFormValid && !isLoading) ? 'pointer' : 'not-allowed', 
                  transition: 'background 0.2s' 
                }}
                onClick={handleSignup}
              >
                {isLoading ? 'Creating Account...' : 'Create an account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', fontSize: 16, color: '#888', marginBottom: 18 }}>OR</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #ccc', borderRadius: 24, padding: '10px 24px', background: '#fff', fontWeight: 500, fontSize: 16, cursor: 'pointer' }} onClick={() => setShowMeme(true)}>
                <img src="/google.png" alt="Google" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default Signup;
