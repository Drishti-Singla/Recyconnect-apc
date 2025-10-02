import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../components/logo.png';
import { donatedItemAPI } from '../services/api';

function Donate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    quantity: '',
    pickupLocation: '',
    anonymity: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get user ID (consistent with other pages)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      let userId = currentUser.id;

      if (!userId) {
        // If no user in localStorage, user needs to log in first
        setSubmitError('Please log in to post an item.');
        setIsSubmitting(false);
        return;
      }

      // Prepare donation data for the donated_items table
      const { anonymity, ...itemData } = formData;
      const donationData = { 
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        condition: itemData.condition,
        location: formData.pickupLocation, // Map pickupLocation to location
        image: null // For now, we'll handle images later
      };

      console.log('=== DONATION DEBUG ===');
      console.log('Donation data being sent:', donationData);
      console.log('User ID:', userId);

      const result = await donatedItemAPI.createDonatedItem(donationData);
      
      console.log('Donation posted successfully:', result);
      alert('Item donated successfully!');
      navigate('/explore');
      
    } catch (error) {
      console.error('Error submitting donation:', error);
      setSubmitError(error.message || 'Failed to post donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.category && formData.condition && formData.quantity && formData.pickupLocation;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.65)', borderBottom: '1px solid #eee', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          style={{ background: 'none', border: 'none', color: '#222', fontSize: '1rem', cursor: 'pointer', fontWeight: 500, zIndex: 2 }}
          onClick={() => navigate('/explore')}
        >
          &larr; Back to Explore
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 auto' }}>
          <img src={logo} alt="RecyConnect Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff', letterSpacing: '2px' }}>RecyConnect</span>
        </div>
        <div style={{ width: '120px' }}></div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f8f9fa', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#007bff', fontWeight: 'bold' }}> Donate Your Item</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>
            Give your item a new life! Help others in the community by donating items you no longer need.
          </p>
          
          <form>
            {/* Basic Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>📝 Item Information</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Item Title *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="What are you donating?" 
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select category</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="books">Books</option>
                    <option value="clothing">Clothing</option>
                    <option value="toys">Toys & Games</option>
                    <option value="sports">Sports Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Quantity Available *</label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="How many items?" 
                    min="1"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Condition *</label>
                  <select 
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select condition</option>
                    <option value="brand-new">Brand New</option>
                    <option value="like-new">Like New</option>
                    <option value="gently-used">Gently Used</option>
                    <option value="heavily-used">Heavily Used</option>
                    <option value="needs-repair">Needs Repair</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Description *</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your item... Why are you donating it? What condition is it in?" 
                  rows="4"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2, resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>📍 Pickup Location</h4>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Pickup location *</label>
                  <input 
                    type="text" 
                    value={formData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    placeholder="e.g., Campus Gate 2, Hostel Block A" 
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
              </div>
            </div>

            {/* Anonymous Donation */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🔒 Privacy Options</h4>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Would you like to make this an anonymous donation?</label>
                  <select 
                    value={formData.anonymity}
                    onChange={(e) => handleInputChange('anonymity', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select option</option>
                    <option value="public">No - Show my profile publicly</option>
                    <option value="anonymous">Yes - Keep my identity private</option>
                    <option value="partial">Partial - Show first name only</option>
                  </select>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
                    • <strong>Public:</strong> Your name and profile will be visible to recipients
                    <br />
                    • <strong>Anonymous:</strong> Your donation will show as "Anonymous Donor"
                    <br />
                    • <strong>Partial:</strong> Only your first name will be shown
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '12px', 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                border: '1px solid #f5c6cb', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              disabled={!isFormValid || isSubmitting}
              style={{ 
                width: '100%', 
                padding: '16px 0', 
                borderRadius: 24, 
                background: (isFormValid && !isSubmitting) ? '#007bff' : '#D9D9D9', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 18, 
                border: 'none', 
                marginTop: '2rem',
                opacity: (isFormValid && !isSubmitting) ? 1 : 0.7, 
                cursor: (isFormValid && !isSubmitting) ? 'pointer' : 'not-allowed', 
                transition: 'background 0.2s' 
              }}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Posting Donation...' : '� Post Donation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Donate;