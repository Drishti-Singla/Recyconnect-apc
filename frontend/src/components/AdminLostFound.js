import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { reportedItemAPI } from '../services/api';

function AdminLostFound() {
  const { currentColors } = useTheme();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified, resolved
  const [itemTypeFilter, setItemTypeFilter] = useState('all'); // all, lost, found
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, filter, itemTypeFilter]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await reportedItemAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (filter !== 'all') {
      filtered = filtered.filter(item => {
        switch (filter) {
          case 'pending': return item.status === 'active';
          case 'verified': return item.status === 'verified';
          case 'resolved': return item.status === 'resolved';
          default: return true;
        }
      });
    }

    if (itemTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.itemType === itemTypeFilter);
    }

    setFilteredItems(filtered);
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      console.log(`Updating item ${itemId} status to: ${newStatus}`);
      await reportedItemAPI.updateStatus(itemId, newStatus);
      
      // Update local state
      setItems(items.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      ));
      
      // Update selected item if it's the one being updated
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
      
      setShowModal(false);
      console.log(`Successfully updated item ${itemId} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#ffa502';
      case 'verified': return '#3742fa';
      case 'resolved': return '#2ed573';
      default: return currentColors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Pending Verification';
      case 'verified': return 'Verified & Active';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading lost & found items...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: 0 }}>
          Lost & Found Management
        </h2>
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
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified & Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Type:
          </label>
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
        </div>

        <div style={{ color: currentColors.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            style={{
              backgroundColor: currentColors.surface,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${currentColors.border}`,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ color: currentColors.text, margin: 0, fontSize: '16px' }}>
                {item.title}
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  backgroundColor: item.itemType === 'lost' ? '#ff475720' : '#2ed57320',
                  color: item.itemType === 'lost' ? '#ff4757' : '#2ed573',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {item.itemType?.toUpperCase()}
                </span>
              </div>
            </div>

            <p style={{
              color: currentColors.textSecondary,
              fontSize: '14px',
              margin: '0 0 10px 0',
              maxHeight: '40px',
              overflow: 'hidden'
            }}>
              {item.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                color: getStatusColor(item.status),
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getStatusLabel(item.status)}
              </span>
              
              <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                {item.category}
              </span>
            </div>

            {item.locationLost && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                  📍 Lost at: {item.locationLost}
                </span>
              </div>
            )}

            {item.locationFound && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                  📍 Found at: {item.locationFound}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: currentColors.textSecondary
        }}>
          No items found matching the current filters.
        </div>
      )}

      {/* Item Detail Modal */}
      {showModal && selectedItem && (
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
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '2px solid #e0e0e0',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            color: '#333333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#333333', margin: 0 }}>
                {selectedItem.title}
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
              <strong style={{ color: '#333333' }}>Description:</strong>
              <p style={{ color: '#666666', margin: '5px 0' }}>
                {selectedItem.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#333333' }}>Type:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedItem.itemType}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Category:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedItem.category}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Status:</strong>
                <p style={{ color: getStatusColor(selectedItem.status), margin: '2px 0' }}>
                  {getStatusLabel(selectedItem.status)}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Reported:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {new Date(selectedItem.reportedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedItem.color && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#333333' }}>Color:</strong>
                <span style={{ color: '#666666', marginLeft: '8px' }}>
                  {selectedItem.color}
                </span>
              </div>
            )}

            {selectedItem.brand && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#333333' }}>Brand:</strong>
                <span style={{ color: '#666666', marginLeft: '8px' }}>
                  {selectedItem.brand}
                </span>
              </div>
            )}

            {selectedItem.contactInfo && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333333' }}>Contact Info:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedItem.contactInfo}
                </p>
              </div>
            )}

            {/* Admin Actions */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              paddingTop: '15px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <strong style={{ color: '#333333', width: '100%', marginBottom: '10px' }}>
                Admin Actions:
              </strong>
              
              {selectedItem.status === 'active' && (
                <button
                  onClick={() => handleStatusUpdate(selectedItem.id, 'verified')}
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
                  ✓ Verify Item
                </button>
              )}

              {selectedItem.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusUpdate(selectedItem.id, 'resolved')}
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
                onClick={() => {
                  // Contact functionality would go here
                  alert('Contact functionality would be implemented here');
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
                📧 Contact Reporter
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to flag this item as suspicious?')) {
                    alert('Flag functionality would be implemented here');
                  }
                }}
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
                🚩 Flag Suspicious
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLostFound;