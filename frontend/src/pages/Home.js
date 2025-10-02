
import React from 'react';
import Header from '../components/Header';
import { useEffect, useState, useRef } from 'react';

  // Scroll to top handler
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const section2Ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (section2Ref.current) {
        const section2Top = section2Ref.current.getBoundingClientRect().top;
        setShowScrollTop(section2Top < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Section 1: Welcome
    const sectionHeight = '60vh';
    const sectionWidth = '100%';
    const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgA1X2ZcAAAAASUVORK5CYII=';
    const parallaxBase = {
      minHeight: sectionHeight,
      width: sectionWidth,
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url(${transparentPng})`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    };
    const welcomeParallax = {
      ...parallaxBase,
      backgroundImage: `url(/bg1.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
    const howItWorksParallax = {
      ...parallaxBase,
      backgroundImage: `url(/bg2.jpeg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
    const whyParallax = {
      ...parallaxBase,
      backgroundImage: `url(/bg1.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
    const teamParallax = {
      ...parallaxBase,
      backgroundImage: `url(/bg2.jpeg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  const welcomeOverlay = {
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
  padding: '2rem 0.5rem',
  borderRadius: '1rem',
  textAlign: 'center',
  boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
  maxWidth: '320px',
  width: '100%',
  };

  // ...existing code...
  const whyOverlay = {
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    padding: '2rem 1rem',
    borderRadius: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
    maxWidth: '500px',
    width: '100%',
  };

  // Section 4: Team Details
  // ...existing code...

  return (
  <div>
      <Header />
      {/* Section 1: Welcome */}
      <div style={welcomeParallax}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '3.5rem', letterSpacing: '2px', color: 'white', marginBottom: '1rem', textShadow: '0 2px 8px rgba(0,0,0,0.18)', textAlign: 'center' }}>
          RecyConnect
        </h1>
  
        <p style={{ fontFamily: 'Roboto, Arial, sans-serif', fontSize: '1.2rem', color: 'white', marginBottom: '2rem', maxWidth: 600, textAlign: 'center', fontWeight: 700, margin: '0 auto', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          RecyConnect is a platform designed to connect people who want to recycle, donate, or find lost items within their community. Our goal is to promote sustainability, reduce waste, and help people make a positive impact by sharing resources and supporting each other. Join us in building a cleaner, greener, and more connected world!
        </p>
        
        <button 
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.1rem',
            fontWeight: 600,
            padding: '12px 32px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
            marginTop: '1rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
          }}
          onClick={() => {
            // Navigate to signup page
            window.location.href = '/signup';
          }}
        >
          Get Started
        </button>
      </div>

  {/* Section 2: How It Works */}
  <div style={howItWorksParallax} ref={section2Ref}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ color: '#007bff' }}>How RecyConnect Works</h2>
          <div className="row justify-content-center mb-5">
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">Browse & Search</h5>
                  <p className="card-text">Find reusable items posted by other students using search and filters.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">Post & Connect</h5>
                  <p className="card-text">List your own items and chat with interested buyers or donors.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">Verified & Safe</h5>
                  <p className="card-text">All listings are cross-verified for authenticity and safety.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Why Us (Parallax) */}
      <div style={whyParallax}>
        <div style={{ ...whyOverlay, background: 'rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontWeight: 'bold' }}>Why Choose Us?</h2>
          <ul className="list-group list-group-flush mt-3">
            <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Eco-friendly campus initiative</li>
            <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Safe and verified exchanges</li>
            <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Easy communication with built-in chat</li>
            <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Admin moderation for safety</li>
          </ul>
        </div>
      </div>

      {/* Section 4: Team Details */}      
      <div style={teamParallax}>
        <div className="container">
          <h4 className="card-title text-center mb-4" style={{ color: '#007bff' }}>Meet the Team</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 220, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <h5 style={{ marginBottom: 8 }}>Aanchal</h5>
              <p style={{ margin: 0 }}>Roll Number: 2310990342</p>
              <p style={{ margin: 0, marginBottom: 8 }}>Contact: 88xxxxxx54</p>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 12, marginBottom: 8 }}>
                <span>
                  <a href="https://www.linkedin.com/in/aanchal-bansal-449086368/" target="_blank" rel="noopener noreferrer">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" width="32" height="32" />
                  </a>
                </span>
                <span>
                  <a href="https://github.com/aanchalbansal23" target="_blank" rel="noopener noreferrer">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" width="32" height="32" />
                  </a>
                </span>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 220, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <h5 style={{ marginBottom: 8 }}>Ashna Sharma</h5>
              <p style={{ margin: 0 }}>Roll Number: 2310990391</p>
              <p style={{ margin: 0, marginBottom: 8 }}>Contact: 79xxxxxx23</p>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 12 }}>
                <span>
                  <a href="https://www.linkedin.com/in/ashna-sharma-662971291" target="_blank" rel="noopener noreferrer">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" width="32" height="32" />
                  </a>
                </span>
                <span>
                  <a href="https://github.com/AshnaSharma24" target="_blank" rel="noopener noreferrer">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" width="32" height="32" />
                  </a>
                </span>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', minWidth: 220, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <h5 style={{ marginBottom: 8 }}>Astha</h5>
              <p style={{ margin: 0 }}>Roll Number: 2310990392</p>
              <p style={{ margin: 0, marginBottom: 8 }}>Contact: 702xxxxxx44</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <a href="https://www.linkedin.com/in/astha-balda-40735b291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" width="32" height="32" />
                </a>
                <a href="https://github.com/Astha-Balda" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" width="32" height="32" />
                </a>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'right', minWidth: 220, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <h5 style={{ marginBottom: 8 }}>Drishti</h5>
              <p style={{ margin: 0 }}>Roll Number: 2310990415</p>
              <p style={{ margin: 0, marginBottom: 8 }}>Contact: 62xxxxxx10</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <a href="https://www.linkedin.com/in/drishti-singla-a3881a29a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" width="32" height="32" />
                </a>
                <a href="https://github.com/Drishti-Singla" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" width="32" height="32" />
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          style={{
            position: 'fixed',
            right: '2rem',
            bottom: '2.5rem',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            zIndex: 1000,
          }}
          aria-label="Scroll to top"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      )}
      {/* Footer */}
      <footer style={{ background: '#007bff', color: 'white', textAlign: 'center', padding: '1rem 0' }}>
        <small>&copy; 2025 RecyConnect. All rights reserved. This is a fake copyright notice.</small>
      </footer>
    </div>
  );
}

export default Home;