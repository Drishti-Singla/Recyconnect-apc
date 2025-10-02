import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userConcernAPI } from '../services/api';

function AdminConcerns() {
  const { currentColors } = useTheme();
  const [concerns, setConcerns] = useState([]);
  const [filteredConcerns, setFilteredConcerns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadConcerns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [concerns, statusFilter, urgencyFilter, typeFilter]);

  const loadConcerns = async () => {
    try {
      setIsLoading(true);
      const data = await userConcernAPI.getAll();
      setConcerns(data);
    } catch (error) {
      console.error('Error loading concerns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...concerns];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(concern => concern.status === statusFilter);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(concern => concern.urgency === urgencyFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(concern => concern.concernType === typeFilter);
    }

    // Sort by urgency and creation date
    filtered.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      const urgencyDiff = (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
      if (urgencyDiff !== 0) return urgencyDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredConcerns(filtered);
  };

  const getUniqueTypes = () => {
    const types = [...new Set(concerns.map(concern => concern.concernType))];
    return types.filter(Boolean);
  };

  const handleConcernClick = (concern) => {
    setSelectedConcern(concern);
    setResponseText(concern.adminResponse || '');
    setShowModal(true);
  };

  const updateConcernStatus = async (concernId, newStatus, adminResponse = '') => {
    try {
      // This would need corresponding API endpoints
      const updatedConcern = {
        ...concerns.find(c => c.id === concernId),
        status: newStatus,
        adminResponse: adminResponse || concerns.find(c => c.id === concernId).adminResponse,
        resolvedDate: newStatus === 'resolved' ? new Date().toISOString() : null
      };

      setConcerns(concerns.map(concern => 
        concern.id === concernId ? updatedConcern : concern
      ));
      setShowModal(false);
      setResponseText('');
    } catch (error) {
      console.error('Error updating concern:', error);
    }
  };

  const assignToModerator = async (concernId, moderatorId) => {
    try {
      const updatedConcern = {
        ...concerns.find(c => c.id === concernId),
        assignedTo: moderatorId,
        status: 'in_progress'
      };

      setConcerns(concerns.map(concern => 
        concern.id === concernId ? updatedConcern : concern
      ));
    } catch (error) {
      console.error('Error assigning concern:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return currentColors.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'in_progress': return '#3742fa';
      case 'resolved': return '#2ed573';
      case 'escalated': return '#ff4757';
      default: return currentColors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'escalated': return 'Escalated';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading user concerns...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: 0 }}>
          User Concerns Management
        </h2>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {[
          { 
            label: 'Total Concerns', 
            value: concerns.length, 
            color: '#3742fa' 
          },
          { 
            label: 'Pending', 
            value: concerns.filter(c => c.status === 'pending').length, 
            color: '#ffa502' 
          },
          { 
            label: 'In Progress', 
            value: concerns.filter(c => c.status === 'in_progress').length, 
            color: '#3742fa' 
          },
          { 
            label: 'High Priority', 
            value: concerns.filter(c => c.urgency === 'high').length, 
            color: '#ff4757' 
          },
          { 
            label: 'Resolved', 
            value: concerns.filter(c => c.status === 'resolved').length, 
            color: '#2ed573' 
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: currentColors.surface,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${currentColors.border}`,
              textAlign: 'center'
            }}
          >
            <h3 style={{ 
              color: stat.color, 
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
        ))}
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: currentColors.surface,
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Urgency:
          </label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Type:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Types</option>
            {getUniqueTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div style={{ color: currentColors.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          Showing {filteredConcerns.length} of {concerns.length} concerns
        </div>
      </div>

      {/* Concerns List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredConcerns.map(concern => (
          <div
            key={concern.id}
            onClick={() => handleConcernClick(concern)}
            style={{
              backgroundColor: currentColors.surface,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${currentColors.border}`,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              borderLeft: `4px solid ${getUrgencyColor(concern.urgency)}`
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: currentColors.text, margin: '0 0 5px 0', fontSize: '16px' }}>
                  {concern.concernType}
                </h4>
                <p style={{
                  color: currentColors.textSecondary,
                  fontSize: '14px',
                  margin: '0 0 10px 0',
                  maxHeight: '60px',
                  overflow: 'hidden'
                }}>
                  {concern.description}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  backgroundColor: getUrgencyColor(concern.urgency) + '20',
                  color: getUrgencyColor(concern.urgency),
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {concern.urgency} Priority
                </span>
                
                <span style={{
                  backgroundColor: getStatusColor(concern.status) + '20',
                  color: getStatusColor(concern.status),
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {getStatusLabel(concern.status)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ color: currentColors.textSecondary }}>
                  📅 {new Date(concern.createdAt).toLocaleDateString()}
                </span>
                
                {concern.contactMethod && (
                  <span style={{ color: currentColors.textSecondary }}>
                    📞 {concern.contactMethod}
                  </span>
                )}
                
                {concern.assignedTo && (
                  <span style={{ color: currentColors.textSecondary }}>
                    👤 Assigned to: {concern.assignedTo}
                  </span>
                )}
              </div>
              
              <span style={{ color: currentColors.textSecondary }}>
                ID: {concern.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredConcerns.length === 0 && (
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: currentColors.textSecondary
        }}>
          No concerns found matching the current filters.
        </div>
      )}

      {/* Concern Detail Modal */}
      {showModal && selectedConcern && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '2px solid #e0e0e0',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            color: '#333333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#333333', margin: 0 }}>
                Concern Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#333333' }}>Type:</strong>
              <p style={{ color: '#666666', margin: '5px 0' }}>
                {selectedConcern.concernType}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#333333' }}>Description:</strong>
              <p style={{ color: '#666666', margin: '5px 0' }}>
                {selectedConcern.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#333333' }}>Urgency:</strong>
                <p style={{ color: getUrgencyColor(selectedConcern.urgency), margin: '2px 0', fontWeight: 'bold' }}>
                  {selectedConcern.urgency?.toUpperCase()}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Status:</strong>
                <p style={{ color: getStatusColor(selectedConcern.status), margin: '2px 0' }}>
                  {getStatusLabel(selectedConcern.status)}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Contact Method:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedConcern.contactMethod || 'N/A'}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Submitted:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {new Date(selectedConcern.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedConcern.userInQuestion && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333333' }}>User in Question:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedConcern.userInQuestion}
                </p>
              </div>
            )}

            {selectedConcern.itemInvolved && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333333' }}>Item Involved:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedConcern.itemInvolved}
                </p>
              </div>
            )}

            {selectedConcern.evidenceFiles && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333333' }}>Evidence Files:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedConcern.evidenceFiles}
                </p>
              </div>
            )}

            {/* Admin Response */}
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#333333' }}>Admin Response:</strong>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Enter your response to this concern..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f8f9fa',
                  color: '#333333',
                  resize: 'vertical',
                  marginTop: '5px'
                }}
              />
            </div>

            {/* Admin Actions */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              paddingTop: '15px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <strong style={{ color: currentColors.text, width: '100%', marginBottom: '10px' }}>
                Admin Actions:
              </strong>
              
              {selectedConcern.status === 'pending' && (
                <button
                  onClick={() => updateConcernStatus(selectedConcern.id, 'in_progress', responseText)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#3742fa',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📋 Start Working
                </button>
              )}

              {selectedConcern.status !== 'resolved' && (
                <button
                  onClick={() => updateConcernStatus(selectedConcern.id, 'resolved', responseText)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#2ed573',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✓ Mark as Resolved
                </button>
              )}

              <button
                onClick={() => updateConcernStatus(selectedConcern.id, 'escalated', responseText)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ff4757',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🚨 Escalate
              </button>

              <button
                onClick={() => {
                  const moderatorId = prompt('Enter moderator ID to assign to:');
                  if (moderatorId) {
                    assignToModerator(selectedConcern.id, moderatorId);
                  }
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#a55eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                👥 Assign to Moderator
              </button>

              <button
                onClick={() => {
                  updateConcernStatus(selectedConcern.id, selectedConcern.status, responseText);
                  alert('Response saved!');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffa502',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                💾 Save Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminConcerns;