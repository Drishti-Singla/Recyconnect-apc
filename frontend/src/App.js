import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import PostItem from './pages/PostItem';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LostFound from './pages/LostFound';
import Donate from './pages/Donate';
import ReportUser from './pages/ReportUser';
import Debug from './pages/Debug';
import FlagDemo from './components/FlagDemo';

function App() {
  // Add global logout function for debugging/emergency use
  window.clearSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTime');
    window.location.href = '/';
    console.log('🔄 Session cleared! Redirecting to home...');
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/post-item" element={<PostItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/report-user" element={<ReportUser />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/flag-demo" element={<FlagDemo />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
