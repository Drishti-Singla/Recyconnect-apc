import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../components/logo.png';
import { userConcernAPI } from '../services/api';

function ReportUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    concernType: '',
    userInQuestion: '',
    itemInvolved: '',
    description: '',
    urgency: '',
    contactMethod: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      // Submit concern to backend API
      const concernData = {
        concernType: formData.concernType,
        userInQuestion: formData.userInQuestion,
        itemInvolved: formData.itemInvolved,
        description: formData.description,
        urgency: formData.urgency,
        contactMethod: formData.contactMethod
      };

      console.log('Submitting concern data:', concernData);
      const response = await userConcernAPI.createUserConcern(concernData);
      
      if (response && response.id) {
        console.log('Concern submitted successfully:', response);
        setSubmitSuccess(`Concern submitted successfully! Your concern ID is ${response.id}. Our team will review it within 24-48 hours.`);
        
        // Clear form after successful submission
        setTimeout(() => {
          navigate('/explore');
        }, 3000);
      } else {
        throw new Error('Failed to submit concern');
      }
      
    } catch (error) {
      console.error('Error submitting concern:', error);
      setSubmitError(error.message || 'Failed to submit concern. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.concernType && formData.description && formData.urgency;

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
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#dc3545', fontWeight: 'bold' }}>⚠️ Raise a Concern</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>
            Help us maintain a safe and trustworthy community. Raise any concerns about suspicious activity, fraud, or policy violations.
          </p>
          
          <form>
            {/* Report Type */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #dc3545', paddingBottom: '0.5rem' }}>📋 Type of Concern</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>What is your concern? *</label>
                  <select 
                    value={formData.concernType}
                    onChange={(e) => handleInputChange('concernType', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select concern type</option>
                    <option value="user">Concern about a User</option>
                    <option value="item">Concern about an Item/Listing</option>
                    <option value="fraud">Suspected Fraud</option>
                    <option value="harassment">Harassment/Abuse</option>
                    <option value="spam">Spam/Fake Listings</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>User/Seller in Question (if applicable)</label>
                  <input 
                    type="text" 
                    value={formData.userInQuestion}
                    onChange={(e) => handleInputChange('userInQuestion', e.target.value)}
                    placeholder="Username or contact info" 
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Item/Listing Involved (if applicable)</label>
                <input 
                  type="text" 
                  value={formData.itemInvolved}
                  onChange={(e) => handleInputChange('itemInvolved', e.target.value)}
                  placeholder="Item name or listing title" 
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #dc3545', paddingBottom: '0.5rem' }}>📝 Details</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Describe the issue in detail *</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide as much detail as possible... What happened? When did it occur? Include any relevant dates, times, or conversations." 
                  rows="6"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2, resize: 'vertical' }}
                />
                <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
                  • Be specific and factual
                  <br />
                  • Include timeline of events
                  <br />
                  • Mention any attempts to resolve the issue
                </div>
              </div>
            </div>

            {/* Urgency & Contact */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #dc3545', paddingBottom: '0.5rem' }}>⏱ Priority & Contact</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Urgency Level *</label>
                  <select 
                    value={formData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select urgency</option>
                    <option value="high">High - Immediate threat/fraud</option>
                    <option value="medium">Medium - Ongoing issue</option>
                    <option value="low">Low - General concern</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Preferred Contact Method</label>
                  <select 
                    value={formData.contactMethod}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select method</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="in-app">In-app notification</option>
                    <option value="no-contact">No contact needed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Messages */}
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

            {submitSuccess && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '12px', 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                border: '1px solid #c3e6cb', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {submitSuccess}
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
                background: (isFormValid && !isSubmitting) ? '#dc3545' : '#D9D9D9', 
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
              {isSubmitting ? 'Submitting Concern...' : '⚠️ Submit Concern'}
            </button>
          </form>

          {/* Disclaimer */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef',
            fontSize: '13px',
            color: '#666'
          }}>
            <strong>Privacy Notice:</strong> Your report will be reviewed by our moderation team. We take all reports seriously and will investigate appropriately. False reports may result in account restrictions.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportUser;