import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { donatedItemAPI } from '../services/api';

function AdminDonations() {
  const { currentColors } = useTheme();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, claimed, completed
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, statusFilter, categoryFilter]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await donatedItemAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch (statusFilter) {
          case 'available': return !item.claimedBy;
          case 'claimed': return item.claimedBy && !item.claimedDate;
          case 'completed': return item.claimedBy && item.claimedDate;
          default: return true;
        }
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(items.map(item => item.category))];
    return categories.filter(Boolean);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getStatusColor = (item) => {
    if (item.claimedBy && item.claimedDate) return '#2ed573'; // Completed
    if (item.claimedBy) return '#ffa502'; // Claimed but not completed
    return '#3742fa'; // Available
  };

  const getStatusLabel = (item) => {
    if (item.claimedBy && item.claimedDate) return 'Completed';
    if (item.claimedBy) return 'Claimed - Pending Pickup';
    return 'Available';
  };

  const updateItemStatus = async (itemId, status, claimedBy = null) => {
    try {
      // This would need corresponding API endpoints
      const updatedItem = {
        ...items.find(item => item.id === itemId),
        claimedBy: status === 'claimed' ? claimedBy : status === 'available' ? null : items.find(item => item.id === itemId).claimedBy,
        claimedDate: status === 'completed' ? new Date().toISOString() : null
      };

      setItems(items.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading donated items...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: 0 }}>
          Donated Items Management
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
            <option value="available">Available</option>
            <option value="claimed">Claimed - Pending Pickup</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Category:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div style={{ color: currentColors.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {[
          { 
            label: 'Available Items', 
            value: items.filter(item => !item.claimedBy).length, 
            color: '#3742fa' 
          },
          { 
            label: 'Pending Pickup', 
            value: items.filter(item => item.claimedBy && !item.claimedDate).length, 
            color: '#ffa502' 
          },
          { 
            label: 'Completed', 
            value: items.filter(item => item.claimedBy && item.claimedDate).length, 
            color: '#2ed573' 
          },
          { 
            label: 'Total Items', 
            value: items.length, 
            color: '#a55eea' 
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
              <span style={{
                backgroundColor: getStatusColor(item) + '20',
                color: getStatusColor(item),
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getStatusLabel(item)}
              </span>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: currentColors.text, fontSize: '14px' }}>
                📁 {item.category}
              </span>
              
              <span style={{ color: currentColors.text, fontSize: '14px' }}>
                🏷️ {item.condition}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                📍 {item.pickupLocation}
              </span>
              
              <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                ⭐ {item.condition}
              </span>
            </div>

            <div style={{ marginTop: '8px', fontSize: '12px', color: currentColors.textSecondary }}>
              Posted: {new Date(item.createdAt).toLocaleDateString()}
            </div>
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
                <strong style={{ color: '#333333' }}>Category:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedItem.category}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Condition:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedItem.condition}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Status:</strong>
                <p style={{ color: getStatusColor(selectedItem), margin: '2px 0' }}>
                  {getStatusLabel(selectedItem)}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#333333' }}>Pickup Location:</strong>
              <p style={{ color: '#666666', margin: '5px 0' }}>
                {selectedItem.pickupLocation}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#333333' }}>Posted:</strong>
              <span style={{ color: '#666666', marginLeft: '8px' }}>
                {new Date(selectedItem.createdAt).toLocaleString()}
              </span>
            </div>

            {selectedItem.claimedBy && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333333' }}>Claimed By:</strong>
                <span style={{ color: '#666666', marginLeft: '8px' }}>
                  User ID: {selectedItem.claimedBy}
                </span>
                {selectedItem.claimedDate && (
                  <div>
                    <strong style={{ color: '#333333' }}>Completed:</strong>
                    <span style={{ color: '#666666', marginLeft: '8px' }}>
                      {new Date(selectedItem.claimedDate).toLocaleString()}
                    </span>
                  </div>
                )}
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
              
              {selectedItem.claimedBy && !selectedItem.claimedDate && (
                <button
                  onClick={() => updateItemStatus(selectedItem.id, 'completed')}
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
                  ✓ Mark as Completed
                </button>
              )}

              {selectedItem.claimedBy && (
                <button
                  onClick={() => updateItemStatus(selectedItem.id, 'available')}
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
                  🔄 Make Available Again
                </button>
              )}

              <button
                onClick={() => {
                  alert('Assign volunteer functionality would be implemented here');
                }}
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
                👥 Assign Volunteer
              </button>

              <button
                onClick={() => {
                  alert('Contact donor functionality would be implemented here');
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
                📧 Contact Donor
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to archive this donation?')) {
                    alert('Archive functionality would be implemented here');
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
                🗃️ Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDonations;