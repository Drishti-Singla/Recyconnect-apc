import React, { useState, useEffect } from 'react';
import logo from './logo.png';

function Header() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const userData = localStorage.getItem('user');
      const adminStatus = localStorage.getItem('isAdmin');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      console.log('🔍 Header: Checking auth status:', { 
        hasUserData: !!userData, 
        adminStatus, 
        isLoggedIn 
      });
      
      if (userData && isLoggedIn === 'true') {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAdmin(adminStatus === 'true');
          console.log('✅ Header: User authenticated:', parsedUser.email);
        } catch (error) {
          console.error('❌ Header: Error parsing user data:', error);
          // Clear corrupted data
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'isLoggedIn' || e.key === 'isAdmin') {
        console.log('🔄 Header: Storage changed, rechecking auth...');
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTime');
    setUser(null);
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
  <header style={{ background: 'rgba(255,255,255,0.45)', padding: '0.2rem 0', marginBottom: '1.2rem', height: '56px' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 2rem' }}>
    {/* Left: Logo and Website Name */}
    <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', justifyContent: 'flex-start' }}>
      <img src={logo} alt="RecyConnect Logo" style={{ width: 64, height: 64, marginRight: 10, objectFit: 'contain' }} />
      <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '2px', color: '#007bff', fontSize: '1.3rem' }}>RecyConnect</h2>
    </div>
    {/* Right: Buttons and Profile Icon */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 0%', justifyContent: 'flex-end' }}>
      {user ? (
        <>
          <span style={{ color: '#007bff', fontWeight: '500' }}>
            Welcome, {user.name || user.email}
          </span>
          {isAdmin && (
            <a href="/admin" className="btn btn-warning" style={{ fontSize: '0.9rem' }}>
              Admin Panel
            </a>
          )}
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Logout
          </button>
        </>
      ) : (
        <>
          <a href="/login" className="btn btn-outline-primary">Login</a>
          <a href="/signup" className="btn btn-primary">Sign Up</a>
        </>
      )}
  {/* ...existing code... */}
    </div>
      </div>
    </header>
  );
}

export default Header;