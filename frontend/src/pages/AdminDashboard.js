import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI, donatedItemAPI, reportedItemAPI, userConcernAPI } from '../services/api';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import Header from '../components/Header';
import AdminLostFound from '../components/AdminLostFound';
import AdminDonations from '../components/AdminDonations';
import AdminConcerns from '../components/AdminConcerns';
import AdminUsers from '../components/AdminUsers';
import AdminFlags from '../components/AdminFlags';

function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode, currentColors } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    itemsDonated: 0,
    lostFoundReports: 0,
    concernsRaised: 0,
    activeExchanges: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time updates handler
  const handleRealTimeUpdate = (data) => {
    console.log('🔄 Real-time update received in AdminDashboard:', data);
    
    if (data.type === 'STATS_UPDATE') {
      console.log('📊 Updating dashboard stats:', data.data);
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: data.data.users || prevStats.totalUsers,
        itemsDonated: data.data.donatedItems || prevStats.itemsDonated,
        lostFoundReports: data.data.reportedItems || prevStats.lostFoundReports,
        concernsRaised: data.data.concerns || prevStats.concernsRaised,
        activeExchanges: prevStats.activeExchanges // Calculate this separately if needed
      }));
    } else if (data.type === 'USER_UPDATE') {
      console.log('👤 User update received, refreshing dashboard...');
      // Optionally refresh the entire dashboard or just user count
      loadDashboardData();
    }
  };

  // Initialize real-time updates
  const { isConnected } = useRealTimeUpdates(handleRealTimeUpdate);

  useEffect(() => {
    console.log('🔐 AdminDashboard: Checking authentication...');
    
    const userData = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    console.log('🔐 Auth data:', { 
      hasUserData: !!userData, 
      isAdmin, 
      isLoggedIn 
    });
    
    if (!userData || isAdmin !== 'true' || isLoggedIn !== 'true') {
      console.log('❌ Admin access denied. Redirecting to login...');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('👤 Parsed user:', parsedUser);
      
      // Check if user is admin (checking both our admin flag and role)
      if (!parsedUser.isAdmin && parsedUser.role !== 'admin' && parsedUser.role !== 'ADMIN') {
        console.log('❌ User is not an admin. Redirecting...');
        navigate('/login');
        return;
      }

      setUser(parsedUser);
      console.log('✅ Admin authenticated:', parsedUser.email);
      loadDashboardData();
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Loading dashboard data...');
      
      // Load statistics from real APIs
      const [donatedItems, reportedItems, concerns, users] = await Promise.all([
        donatedItemAPI.getAll().catch(err => {
          console.error('❌ Failed to load donated items:', err);
          return [];
        }),
        reportedItemAPI.getAll().catch(err => {
          console.error('❌ Failed to load reported items:', err);
          return [];
        }),
        userConcernAPI.getAll().catch(err => {
          console.error('❌ Failed to load concerns:', err);
          return [];
        }),
        userAPI.getAll().catch(err => {
          console.error('❌ Failed to load users:', err);
          return [];
        })
      ]);

      console.log('📊 Dashboard data loaded:', {
        donatedItems: donatedItems.length,
        reportedItems: reportedItems.length,
        concerns: concerns.length,
        users: users.length
      });

      setStats({
        totalUsers: users.length,
        itemsDonated: donatedItems.length,
        lostFoundReports: reportedItems.length,
        concernsRaised: concerns.length,
        activeExchanges: donatedItems.filter(item => !item.claimedBy && !item.claimedByID).length
      });

      // Create recent activity feed
      const activities = [
        ...donatedItems.slice(-5).map(item => ({
          type: 'donation',
          title: `New donation: ${item.title}`,
          time: item.createdAt || new Date().toISOString(),
          category: item.category
        })),
        ...reportedItems.slice(-5).map(item => ({
          type: 'lost_found',
          title: `${item.itemType}: ${item.title}`,
          time: item.reportedDate || new Date().toISOString(),
          status: item.status
        })),
        ...concerns.slice(-5).map(concern => ({
          type: 'concern',
          title: `Concern: ${concern.concernType}`,
          time: concern.createdAt || new Date().toISOString(),
          urgency: concern.urgency
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

      setRecentActivity(activities);

      // Create notifications for pending items
      const pendingNotifications = [
        ...concerns.filter(c => c.status === 'pending').map(c => ({
          type: 'concern',
          message: `Urgent concern requires attention: ${c.concernType}`,
          urgency: c.urgency
        })),
        ...reportedItems.filter(r => r.status === 'active').map(r => ({
          type: 'lost_found',
          message: `New ${r.itemType} report: ${r.title}`,
          status: r.status
        }))
      ];

      setNotifications(pendingNotifications);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const sidebarSections = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'explore', label: 'Explore Management', icon: '🔍' },
    { id: 'lost-found', label: 'Lost & Found', icon: '🔍' },
    { id: 'donations', label: 'Donated Items', icon: '🎁' },
    { id: 'concerns', label: 'User Concerns', icon: '⚠️' },
    { id: 'flags', label: 'Flagged Content', icon: '🚩' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleString();
    } catch {
      return 'Recently';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'donation': return '🎁';
      case 'lost_found': return '🔍';
      case 'concern': return '⚠️';
      default: return '📝';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return currentColors.text;
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: currentColors.background, 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: currentColors.text
      }}>
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentColors.background, minHeight: '100vh' }}>
      <Header />
      
      <div style={{ display: 'flex', paddingTop: '60px' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: currentColors.surface,
          minHeight: 'calc(100vh - 60px)',
          borderRight: `1px solid ${currentColors.border}`,
          padding: '20px 0'
        }}>
          <div style={{ padding: '0 20px', marginBottom: '30px' }}>
            <h3 style={{ 
              color: currentColors.primary, 
              margin: '0 0 10px 0',
              fontSize: '18px'
            }}>
              Admin Panel
            </h3>
            <p style={{ 
              color: currentColors.textSecondary, 
              fontSize: '14px',
              margin: 0
            }}>
              Welcome, {user?.name}
            </p>
          </div>

          {sidebarSections.map(section => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                backgroundColor: activeSection === section.id ? currentColors.primary + '20' : 'transparent',
                borderLeft: activeSection === section.id ? `3px solid ${currentColors.primary}` : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: activeSection === section.id ? currentColors.primary : currentColors.text,
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>{section.icon}</span>
              <span style={{ fontSize: '14px' }}>{section.label}</span>
            </div>
          ))}

          <div style={{ padding: '20px', marginTop: 'auto' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '20px' }}>
          {activeSection === 'dashboard' && (
            <div>
              <h2 style={{ color: currentColors.text, marginBottom: '20px' }}>
                Admin Dashboard
              </h2>

              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3742fa' },
                  { label: 'Items Donated', value: stats.itemsDonated, icon: '🎁', color: '#2ed573' },
                  { label: 'Lost & Found Reports', value: stats.lostFoundReports, icon: '🔍', color: '#ffa502' },
                  { label: 'Concerns Raised', value: stats.concernsRaised, icon: '⚠️', color: '#ff4757' },
                  { label: 'Active Exchanges', value: stats.activeExchanges, icon: '🔄', color: '#a55eea' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: currentColors.surface,
                      padding: '20px',
                      borderRadius: '10px',
                      border: `1px solid ${currentColors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: stat.color + '20',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <h3 style={{ 
                        color: currentColors.text, 
                        margin: '0 0 5px 0',
                        fontSize: '24px'
                      }}>
                        {stat.value}
                      </h3>
                      <p style={{ 
                        color: currentColors.textSecondary, 
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity and Notifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Recent Activity */}
                <div style={{
                  backgroundColor: currentColors.surface,
                  padding: '20px',
                  borderRadius: '10px',
                  border: `1px solid ${currentColors.border}`
                }}>
                  <h3 style={{ color: currentColors.text, marginBottom: '15px' }}>
                    Recent Activity
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 0',
                          borderBottom: index < recentActivity.length - 1 ? `1px solid ${currentColors.border}` : 'none'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>
                          {getActivityIcon(activity.type)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            color: currentColors.text, 
                            margin: '0 0 2px 0',
                            fontSize: '14px'
                          }}>
                            {activity.title}
                          </p>
                          <p style={{ 
                            color: currentColors.textSecondary, 
                            margin: 0,
                            fontSize: '12px'
                          }}>
                            {formatTime(activity.time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div style={{
                  backgroundColor: currentColors.surface,
                  padding: '20px',
                  borderRadius: '10px',
                  border: `1px solid ${currentColors.border}`
                }}>
                  <h3 style={{ color: currentColors.text, marginBottom: '15px' }}>
                    Notifications ({notifications.length})
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
                        No pending notifications
                      </p>
                    ) : (
                      notifications.map((notification, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: notification.urgency === 'high' ? '#ff475720' : currentColors.background,
                            borderRadius: '6px',
                            border: `1px solid ${currentColors.border}`
                          }}
                        >
                          <p style={{ 
                            color: currentColors.text, 
                            margin: 0,
                            fontSize: '13px'
                          }}>
                            {notification.message}
                          </p>
                          {notification.urgency && (
                            <span style={{
                              fontSize: '10px',
                              color: getUrgencyColor(notification.urgency),
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            }}>
                              {notification.urgency} Priority
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'dashboard' && (
            <div>
              {activeSection === 'lost-found' && <AdminLostFound />}
              {activeSection === 'donations' && <AdminDonations />}
              {activeSection === 'concerns' && <AdminConcerns />}
              {activeSection === 'users' && <AdminUsers />}
              {activeSection === 'flags' && <AdminFlags />}
              {!['lost-found', 'donations', 'concerns', 'users', 'flags'].includes(activeSection) && (
                <div style={{
                  backgroundColor: currentColors.surface,
                  padding: '40px',
                  borderRadius: '10px',
                  border: `1px solid ${currentColors.border}`,
                  textAlign: 'center'
                }}>
                  <h3 style={{ color: currentColors.text, marginBottom: '10px' }}>
                    {sidebarSections.find(s => s.id === activeSection)?.label}
                  </h3>
                  <p style={{ color: currentColors.textSecondary }}>
                    This section is under development. The {sidebarSections.find(s => s.id === activeSection)?.label} 
                    functionality will be implemented here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;