import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportedItemAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../components/logo.png';
import './Explore.css'; // Import CSS for styling

const ProfileDropdown = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, timeoutId]);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 3000);
    setTimeoutId(id);
  };

  const handleMenuSelect = (option) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(false);
    switch (option) {
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "Raise Concern":
        navigate("/report-user");
        break;
      case "Logout":
        // Clear all authentication data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginTime');
        // Navigate to home page instead of login to avoid auto-redirect loops
        navigate("/");
        break;
      default:
        break;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="profile-dropdown" 
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        style={{
          background: "transparent",
          border: "2px solid #007bff",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backgroundColor: isOpen ? "#007bff" : "transparent",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: isOpen ? "#fff" : "#007bff" }}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div
          className="profile-dropdown-menu"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "#fff",
            border: "2px solid #e0e0e0",
            borderRadius: "22px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            minWidth: "180px",
            marginTop: "8px",
          }}
        >
          {["Dashboard", "Raise Concern", "Logout"].map((option, index) => (
            <div
              key={index}
              className="profile-dropdown-option"
              style={{
                padding: "0.75rem 1rem",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                borderBottom: index < 2 ? "1px solid #f0f0f0" : "none",
                borderTopLeftRadius: index === 0 ? "20px" : "0",
                borderTopRightRadius: index === 0 ? "20px" : "0",
                borderBottomLeftRadius: index === 2 ? "20px" : "0",
                borderBottomRightRadius: index === 2 ? "20px" : "0",
                color: option === "Logout" ? "#dc3545" : "#333",
                fontWeight: option === "Logout" ? "500" : "normal",
              }}
              onClick={() => handleMenuSelect(option)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = option === "Logout" ? "#fff5f5" : "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LostFound = () => {
  const navigate = useNavigate();
  const { currentColors } = useTheme();
  
  // State variables
  const [activeTab, setActiveTab] = useState('lost');
  const [isLoading, setIsLoading] = useState(true);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('Recent');
  const [conditionFilter, setConditionFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    color: '',
    brand: '',
    location_lost: '',
    location_found: '',
    date_lost: '',
    date_found: '',
    time_lost: '',
    time_found: '',
    contact_info: '',
    current_location: ''
  });
  
  // Load items on component mount and when activeTab or showReportForm changes
  useEffect(() => {
    if (!showReportForm) {
      loadItems();
    }
  }, [showReportForm, activeTab]);
  
  // Filter items when search term, selected category, or items change
  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, conditionFilter, sortBy, lostItems, foundItems, reportedItems, activeTab]);
  
  // Load all items from the unified reported_items table
  const loadItems = async () => {
    setIsLoading(true);
    try {
      // Fetch all reported items (both lost and found)
      const reportedResponse = await reportedItemAPI.getAllReportedItems();
      // Handle both response.data format and direct array response
      const allItems = Array.isArray(reportedResponse) ? reportedResponse : (reportedResponse.data || []);
      
      console.log('API Response:', reportedResponse);
      console.log('All items:', allItems);
      if (allItems.length > 0) {
        console.log('First item structure:', allItems[0]);
        console.log('First item keys:', Object.keys(allItems[0]));
      }
      
      // Separate items by type
      const lost = allItems.filter(item => item.item_type === 'lost');
      const found = allItems.filter(item => item.item_type === 'found');
      
      setLostItems(lost);
      setFoundItems(found);
      setReportedItems(allItems); // Keep all items for reference
      
      console.log('Loaded items from unified table:', {
        lost: lost.length,
        found: found.length,
        total: allItems.length
      });
    } catch (error) {
      console.error('Error loading items:', error);
      // Set empty arrays on error
      setLostItems([]);
      setFoundItems([]);
      setReportedItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter items based on search term, category, condition, and sort order
  const filterItems = () => {
    // Get items for the active tab from the unified data
    let items = [];
    
    if (activeTab === 'lost') {
      items = lostItems;
    } else {
      items = foundItems;
    }
    
    // Apply filters using Explore.js style logic
    const filtered = items.filter(item => {
      const term = searchTerm.toLowerCase().trim();
      // Search match (similar to Explore.js)
      const matchesSearch = term === "" || 
        (item.title || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term) ||
        (item.brand || '').toLowerCase().includes(term) ||
        (item.color || '').toLowerCase().includes(term) ||
        (item.location_lost || '').toLowerCase().includes(term) ||
        (item.location_found || '').toLowerCase().includes(term) ||
        (item.current_location || '').toLowerCase().includes(term);
      
      // Category match
      const matchesCategory = selectedCategory === 'all' || selectedCategory === '' || 
        (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
      
      // Condition match (if we add condition field later)
      const matchesCondition = conditionFilter === "" || 
        (item.condition || '').toLowerCase() === conditionFilter.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesCondition;
    }).sort((a, b) => {
      // Apply sorting like in Explore.js
      switch (sortBy) {
        case 'Oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'AZ':
          return (a.title || '').localeCompare(b.title || '');
        case 'ZA':
          return (b.title || '').localeCompare(a.title || '');
        case 'Recent':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
    
    setFilteredItems(filtered);
  };
  
  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form data:', formData);
      
      // Prepare data for the backend - use camelCase field names
      const apiData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        brand: formData.brand,
        itemType: activeTab, // Changed from item_type to itemType
        contactInfo: formData.contact_info, // Changed from contact_info to contactInfo
        status: 'active'
      };
      
      // Add specific fields based on item type
      if (activeTab === 'lost') {
        apiData.locationLost = formData.location_lost; // Changed from location_lost to locationLost
        apiData.dateLost = formData.date_lost; // Changed from date_lost to dateLost
        apiData.timeLost = formData.time_lost; // Changed from time_lost to timeLost
        // Set found fields to null for lost items
        apiData.locationFound = null;
        apiData.dateFound = null;
        apiData.timeFound = null;
        apiData.currentLocation = null;
      } else {
        apiData.locationFound = formData.location_found; // Changed from location_found to locationFound
        apiData.dateFound = formData.date_found; // Changed from date_found to dateFound
        apiData.timeFound = formData.time_found; // Changed from time_found to timeFound
        apiData.currentLocation = formData.current_location; // Changed from current_location to currentLocation
        // Set lost fields to null for found items
        apiData.locationLost = null;
        apiData.dateLost = null;
        apiData.timeLost = null;
      }
      
      // Log what we're submitting for debugging
      console.log('Submitting to API with new unified structure:', apiData);
      
      // Submit to reported items API
      const response = await reportedItemAPI.createReportedItem(apiData);
      console.log('Item reported successfully:', response);
      
      // Reset form and show success message
      setFormData({
        title: '',
        description: '',
        category: '',
        color: '',
        brand: '',
        location_lost: '',
        location_found: '',
        date_lost: '',
        date_found: '',
        time_lost: '',
        time_found: '',
        contact_info: '',
        current_location: ''
      });
      
      setShowSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setShowReportForm(false); // Return to listings
      }, 5000);
      
    } catch (error) {
      console.error('Error reporting item:', error);
      alert('Failed to submit item recovery. Please try again.');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCategory('all');
    setSearchTerm('');
  };
  
  // Render component
  return (
    <div className="lost-found-page" style={{ background: currentColors?.background || "#f8f9fa", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div 
        className="navbar"
        style={{
          padding: "1rem 2rem",
          background: currentColors?.cardBackground || "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src={logo} alt="Logo" style={{ width: 64, height: 64, marginRight: 10, objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '2px', color: '#007bff', fontSize: '1.3rem' }}>
            RecyConnect
          </h2>
        </div>

        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <button 
            onClick={() => navigate("/explore")} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "#333", 
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              transition: "background-color 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Explore
          </button>
          <button 
            onClick={() => navigate("/lost-found")} 
            style={{ 
              background: "#007bff", 
              color: "#fff",
              border: "none", 
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold"
            }}
          >
            Lost & Found
          </button>
          <ProfileDropdown navigate={navigate} />
        </nav>
      </div>

      {/* Page Header */}
      <div className="bg-primary text-white py-5 mb-4">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                <i className="fas fa-search me-2"></i>
                Lost & Found
              </h1>
              <p className="lead mb-4">
                Lost something or found an item? Report it here or browse through the listings.
              </p>
              
              {/* Navigation Tabs - Similar to Explore page */}
              <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
                <button 
                  className={`btn ${activeTab === 'lost' ? 'btn-light text-primary' : 'btn-outline-light'} px-4 py-2`}
                  onClick={() => {
                    handleTabChange('lost');
                    setShowReportForm(false);
                    // Scroll to items section
                    const itemsSection = document.querySelector('.container.mt-4');
                    if (itemsSection) {
                      itemsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="fas fa-search me-2"></i>Lost Items
                </button>
                <button 
                  className={`btn ${activeTab === 'found' ? 'btn-light text-primary' : 'btn-outline-light'} px-4 py-2`}
                  onClick={() => {
                    handleTabChange('found');
                    setShowReportForm(false);
                    // Scroll to items section
                    const itemsSection = document.querySelector('.container.mt-4');
                    if (itemsSection) {
                      itemsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="fas fa-hand-holding me-2"></i>Found Items
                </button>
                <button 
                  className={`btn ${showReportForm ? 'btn-light text-primary' : 'btn-outline-light'} px-4 py-2`}
                  onClick={() => setShowReportForm(!showReportForm)}
                >
                  <i className="fas fa-plus-circle me-2"></i>Item Recovery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Search & Filter Bar */}
        {!showReportForm && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  {/* Search Bar - Matches Explore.js */}
                  <div className="row mb-3">
                    <div className="col-md-6 mx-auto">
                      <div className="input-group input-group-lg">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search items, categories, or locations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="button">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filters - Matches Explore.js structure */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Category</label>
                      <select 
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        <option value="electronics">Electronics</option>
                        <option value="jewelry">Jewelry</option>
                        <option value="clothing">Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="documents">Documents</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Condition</label>
                      <select 
                        className="form-select"
                        value={conditionFilter}
                        onChange={(e) => setConditionFilter(e.target.value)}
                      >
                        <option value="">Any Condition</option>
                        <option value="brand-new">Brand New</option>
                        <option value="like-new">Like New</option>
                        <option value="gently-used">Gently Used</option>
                        <option value="heavily-used">Heavily Used</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Sort By</label>
                      <select 
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="Recent">Most Recent</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="AZ">A-Z</option>
                        <option value="ZA">Z-A</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-12 mb-3 d-flex justify-content-center">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setConditionFilter('');
                          setSortBy('Recent');
                        }}
                      >
                        <i className="fas fa-times me-1"></i> Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Item Listings / Cards */}
        {!showReportForm && (
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  {activeTab === 'lost' ? 'Lost Items' : 'Found Items'} 
                  <span className="badge bg-secondary ms-2">{filteredItems.length}</span>
                </h4>
              </div>
              
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No items found</h5>
                  <p className="text-muted">Try adjusting your filters or be the first to report an item!</p>
                </div>
              ) : (
                <div className="row">
                  {filteredItems.map(item => {
                    // Determine if this item is from the reported items table
                    const isReportedItem = item.hasOwnProperty('item_type');
                    // Get the appropriate status and location based on item type
                    const itemStatus = isReportedItem 
                      ? item.item_type || item.status
                      : activeTab;
                    const itemLocation = isReportedItem
                      ? (itemStatus === 'lost' ? item.location_lost : item.location_found)
                      : (activeTab === 'lost' ? item.location_lost : item.location_found);
                    
                    return (
                      <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow-sm">
                          <div className="card-body d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title mb-0">{item.title}</h5>
                              <div className="d-flex flex-column align-items-end">
                                <span className="badge bg-primary mb-1">
                                  {item.category}
                                </span>
                                <span className="badge bg-success">
                                  {item.color || 'No Color'}
                                </span>
                                {itemStatus === 'lost' && (
                                  <span className="badge bg-danger mt-1">
                                    🔍 LOST
                                  </span>
                                )}
                                {itemStatus === 'found' && (
                                  <span className="badge bg-success mt-1">
                                    ✅ FOUND
                                  </span>
                                )}
                                {item.urgent && (
                                  <span className="badge bg-warning text-dark mt-1">URGENT</span>
                                )}
                              </div>
                            </div>
                            
                            <p className="card-text text-muted flex-grow-1">{item.description}</p>
                            
                            <div className="mt-auto">
                              <div className="row text-sm mb-3">
                                <div className="col-6">
                                  <strong>Status:</strong><br />
                                  <span className={(itemStatus === 'lost') ? "text-danger fw-bold" : "text-success fw-bold"}>
                                    {itemStatus === 'lost' ? "LOST ITEM" : "FOUND ITEM"}
                                  </span>
                                </div>
                                <div className="col-6">
                                  <strong>Reporter:</strong><br />
                                  <span className="text-muted">{item.reporter_name || item.owner?.name || "Unknown"}</span>
                                </div>
                              </div>
                              
                              <div className="row text-sm mb-3">
                                <div className="col-6">
                                  <strong>Posted:</strong><br />
                                  <span className="text-muted">
                                    {item.created_at 
                                      ? new Date(item.created_at).toLocaleDateString() 
                                      : (itemStatus === 'lost' 
                                          ? (item.date_lost ? new Date(item.date_lost).toLocaleDateString() : "Unknown")
                                          : (item.date_found ? new Date(item.date_found).toLocaleDateString() : "Unknown")
                                        )}
                                  </span>
                                </div>
                                <div className="col-6">
                                  <strong>Location:</strong><br />
                                  <span className="text-muted">{itemLocation}</span>
                                </div>
                              </div>
                              
                              <button 
                                className="btn btn-outline-primary w-100 mb-2"
                                onClick={() => alert('Contact feature coming soon!')}
                              >
                                <i className="fas fa-envelope me-2"></i>
                                Contact Seller
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Item Recovery Form */}
        {showReportForm && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className={`fas ${activeTab === 'lost' ? 'fa-search' : 'fa-hand-holding'} me-2`}></i>
                    Item Recovery - {activeTab === 'lost' ? 'Lost' : 'Found'} Item
                  </h4>
                </div>
                <div className="card-body">
                  {showSuccess && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>Success!</strong> Your report has been submitted successfully!
                      <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
                    </div>
                  )}
                  
                  <form onSubmit={handleFormSubmit}>
                    {/* Item Type Toggle */}
                    <div className="mb-4">
                      <label className="form-label">Item Type *</label>
                      <div className="d-flex">
                        <div className="btn-group w-100" role="group">
                          <button
                            type="button"
                            className={`btn ${activeTab === 'lost' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('lost')}
                          >
                            <i className="fas fa-search me-2"></i>Lost Item
                          </button>
                          <button
                            type="button"
                            className={`btn ${activeTab === 'found' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('found')}
                          >
                            <i className="fas fa-hand-holding me-2"></i>Found Item
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="title" className="form-label">Item Title *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="category" className="form-label">Category *</label>
                        <select 
                          className="form-select" 
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="electronics">Electronics</option>
                          <option value="jewelry">Jewelry</option>
                          <option value="clothing">Clothing</option>
                          <option value="accessories">Accessories</option>
                          <option value="documents">Documents</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description *</label>
                      <textarea 
                        className="form-control" 
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      <div className="form-text">
                        Please provide as much detail as possible to help identify the item.
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="color" className="form-label">Color</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="brand" className="form-label">Brand</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="brand"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    {activeTab === 'lost' ? (
                      // Lost item specific fields
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="location_lost" className="form-label">Location Lost *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="location_lost"
                            name="location_lost"
                            value={formData.location_lost}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="date_lost" className="form-label">Date Lost *</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            id="date_lost"
                            name="date_lost"
                            value={formData.date_lost}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="time_lost" className="form-label">Time Lost (approximate)</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            id="time_lost"
                            name="time_lost"
                            value={formData.time_lost}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    ) : (
                      // Found item specific fields
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="location_found" className="form-label">Location Found *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="location_found"
                            name="location_found"
                            value={formData.location_found}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="date_found" className="form-label">Date Found *</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            id="date_found"
                            name="date_found"
                            value={formData.date_found}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="time_found" className="form-label">Time Found (approximate)</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            id="time_found"
                            name="time_found"
                            value={formData.time_found}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="current_location" className="form-label">Current Item Location *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="current_location"
                            name="current_location"
                            value={formData.current_location}
                            onChange={handleInputChange}
                            placeholder="Where is the item being kept?"
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <label htmlFor="contact_info" className="form-label">Contact Information *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="contact_info"
                        name="contact_info"
                        value={formData.contact_info}
                        onChange={handleInputChange}
                        placeholder="Phone number or email address"
                        required
                      />
                    </div>
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setShowReportForm(false)}
                      >
                        <i className="fas fa-times me-2"></i>Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        <i className="fas fa-paper-plane me-2"></i>Submit Report
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LostFound;