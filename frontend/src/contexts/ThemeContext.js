import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Light mode colors
      light: {
        background: '#f3f6f8',
        cardBackground: '#ffffff',
        text: '#333333',
        textSecondary: '#666666',
        border: '#dddddd',
        primary: '#007bff',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        muted: '#6c757d',
        highlight: '#f8f9fa',
        shadow: 'rgba(0,0,0,0.1)'
      },
      // Dark mode colors
      dark: {
        background: '#1a1a1a',
        cardBackground: '#2d2d2d',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#404040',
        primary: '#4dabf7',
        success: '#51cf66',
        warning: '#ffd43b',
        danger: '#ff6b6b',
        info: '#74c0fc',
        muted: '#868e96',
        highlight: '#3d3d3d',
        shadow: 'rgba(0,0,0,0.3)'
      }
    }
  };

  const currentColors = isDarkMode ? theme.colors.dark : theme.colors.light;

  return (
    <ThemeContext.Provider value={{ ...theme, currentColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
