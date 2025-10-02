import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import { itemAPI, donatedItemAPI, userAPI } from '../services/api';
import logo from '../components/logo.png';
import "./Explore.css";

// Default avatar for items
const defaultAvatar = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";

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

export default function Explore() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Recent");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [donationFilter, setDonationFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loadingSellerInfo, setLoadingSellerInfo] = useState(false);
  const navigate = useNavigate();
  const { currentColors } = useTheme();

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

  // Sample data for development
  const sampleItems = [
    {
      id: 1,
      title: "iPhone 13 Pro",
      description: "Excellent condition iPhone 13 Pro with 256GB storage. Comes with original charger and case.",
      price: "₹45,000",
      category: "Electronics",
      condition: "Like New",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300",
      owner: { name: "Rahul Sharma" },
      location: "Campus Block A",
      date: new Date().toLocaleDateString(),
      urgent: true
    },
    {
      id: 2,
      title: "Study Desk",
      description: "Wooden study desk in good condition. Perfect for students.",
      price: "₹3,500",
      category: "Furniture",
      condition: "Good",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
      owner: { name: "Priya Singh" },
      location: "Campus Block B",
      date: new Date().toLocaleDateString(),
      urgent: false
    },
    {
      id: 3,
      title: "Engineering Textbooks",
      description: "Complete set of CSE textbooks for 2nd year. All in excellent condition.",
      price: "₹2,000",
      category: "Books",
      condition: "Excellent",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      owner: { name: "Amit Kumar" },
      location: "Library Area",
      date: new Date().toLocaleDateString(),
      urgent: false
    },
    {
      id: 4,
      title: "Gaming Laptop",
      description: "High-performance gaming laptop with RTX graphics. Perfect for gaming and development.",
      price: "₹75,000",
      category: "Electronics",
      condition: "Excellent",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
      owner: { name: "Vikash Gupta" },
      location: "Hostel Block C",
      date: new Date().toLocaleDateString(),
      urgent: true
    }
  ];

  // Load items from API
  useEffect(() => {
    const loadItems = async () => {
      try {
        // Load regular items first
        const regularItemsResponse = await itemAPI.getAllItems();
        
        console.log('Loaded items response:', regularItemsResponse);
        
        let regularItems = [];
        if (regularItemsResponse) {
          // apiCall returns the JSON directly, so it should be the array
          regularItems = Array.isArray(regularItemsResponse) ? regularItemsResponse : [];
        }
        
        // Try to load donated items, but don't fail if not available
        let donatedItems = [];
        try {
          const donatedItemsResponse = await donatedItemAPI.getAllDonatedItems();
          
          // Handle different response structures - API returns array directly
          if (Array.isArray(donatedItemsResponse)) {
            donatedItems = donatedItemsResponse;
          }
        } catch (donatedError) {
          console.warn('Donated items API not available:', donatedError.message);
        }
        
        // Add a type field to distinguish between regular and donated items
        const regularItemsWithType = regularItems.map(item => ({
          ...item,
          type: 'sale',
          isDonated: false,
          // Map backend camelCase to frontend expected fields
          asking_price: item.askingPrice,
          created_at: item.createdAt,
          location: item.pickupLocation,
          seller_name: item.sellerName || 'Unknown Seller'
        }));
        
        const donatedItemsWithType = donatedItems.map(item => ({
          ...item,
          type: 'donated',
          isDonated: true,
          seller_name: item.donorName || 'Anonymous Donor',
          price: 'Donated Item' // Override price for donated items
        }));
        
        // Combine both arrays
        const allItems = [...regularItemsWithType, ...donatedItemsWithType];
        
        console.log(`Regular items loaded: ${regularItems.length}`);
        console.log(`Donated items loaded: ${donatedItems.length}`);
        console.log(`Total items loaded: ${allItems.length}`);
        
        setItems(allItems.length > 0 ? allItems : sampleItems);
      } catch (error) {
        console.error('Error loading items:', error);
        setItems(sampleItems);
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, []);

  // Contact seller handler
  const handleContactSeller = async (item) => {
    setSelectedItem(item);
    setShowContactModal(true);
    setLoadingSellerInfo(true);
    setSellerInfo(null);
    
    try {
      // Fetch seller information using ownerId
      if (item.ownerId) {
        const seller = await userAPI.getUserById(item.ownerId);
        console.log('Fetched seller info:', seller);
        
        // Check if user is deleted or invalid
        if (seller && seller.role !== 'DELETED' && seller.name !== 'DELETED USER') {
          setSellerInfo(seller);
        } else {
          // Handle deleted user case
          setSellerInfo({
            name: 'User No Longer Available',
            email: 'Contact information not available',
            phone: 'Contact information not available'
          });
        }
      } else {
        // No ownerId available
        setSellerInfo({
          name: item.sellerName || 'Anonymous Seller',
          email: 'Contact information not available',
          phone: 'Contact information not available'
        });
      }
    } catch (error) {
      console.error('Error fetching seller info:', error);
      // Set fallback info if API call fails
      setSellerInfo({
        name: item.sellerName || 'Anonymous Seller',
        email: 'Contact information not available',
        phone: 'Contact information not available'
      });
    } finally {
      setLoadingSellerInfo(false);
    }
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedItem(null);
    setSellerInfo(null);
  };

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const searchTerm = search.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      (item.title || '').toLowerCase().includes(searchTerm) ||
      (item.description || '').toLowerCase().includes(searchTerm) ||
      (item.seller_name || '').toLowerCase().includes(searchTerm) ||
      (item.owner?.name || '').toLowerCase().includes(searchTerm);
    
    const matchesCategory = categoryFilter === "" || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const matchesCondition = conditionFilter === "" || (item.condition || '').toLowerCase() === conditionFilter.toLowerCase();
    const matchesDonation = donationFilter === "" || donationFilter === "all" || 
      (donationFilter === "donated" && (item.isDonated || item.type === 'donated')) ||
      (donationFilter === "for-sale" && (!item.isDonated && item.type !== 'donated'));
    
    return matchesSearch && matchesCategory && matchesCondition && matchesDonation;
  }).sort((a, b) => {
    // Apply sorting based on sortBy state
    switch (sortBy) {
      case "Price Low":
        // Handle donated items (treat as 0 price)
        const priceA = (a.isDonated || a.type === 'donated') ? 0 : parseFloat((a.asking_price || a.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        const priceB = (b.isDonated || b.type === 'donated') ? 0 : parseFloat((b.asking_price || b.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        return priceA - priceB;
      case "Price High":
        // Handle donated items (treat as 0 price, show them last)
        const priceA2 = (a.isDonated || a.type === 'donated') ? 0 : parseFloat((a.asking_price || a.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        const priceB2 = (b.isDonated || b.type === 'donated') ? 0 : parseFloat((b.asking_price || b.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        return priceB2 - priceA2;
      case "Popular":
        // For now, sort by created date as a proxy for popularity
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case "Recent":
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
  });

  return (
    <div className="explore-page" style={{ background: currentColors.background, minHeight: "100vh" }}>
      {/* Header */}
      <div 
        className="navbar"
        style={{
          padding: "1rem 2rem",
          background: currentColors.cardBackground,
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
            Explore
          </button>
          <button 
            onClick={() => navigate("/lost-found")} 
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
            Lost & Found
          </button>
          <ProfileDropdown navigate={navigate} />
        </nav>
      </div>

      {/* Header / Top Section */}
      <div className="container-fluid bg-primary text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Explore Items</h1>
              <p className="lead mb-4">
                Discover amazing items from your community! Buy, sell, donate, or find what you need.
              </p>
              
              {/* Navigation Tabs */}
              <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
                <button 
                  className="btn btn-outline-light px-4 py-2"
                  onClick={() => {
                    // Scroll to items section
                    const itemsSection = document.querySelector('.container.mt-4');
                    if (itemsSection) {
                      itemsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="fas fa-shopping-cart me-2"></i>Buy
                </button>
                <button 
                  className="btn btn-outline-light px-4 py-2"
                  onClick={() => navigate("/post-item")}
                >
                  <i className="fas fa-tag me-2"></i>Sell
                </button>
                <button 
                  className="btn btn-outline-light px-4 py-2"
                  onClick={() => navigate("/donate")}
                >
                  <i className="fas fa-heart me-2"></i>Donate
                </button>
                <button 
                  className="btn btn-outline-light px-4 py-2"
                  onClick={() => navigate("/report-user")}
                >
                  <i className="fas fa-exclamation-triangle me-2"></i>Raise Concern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Search & Filters Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* Search Bar */}
                <div className="row mb-3">
                  <div className="col-md-6 mx-auto">
                    <div className="input-group input-group-lg">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search items, categories, or sellers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button className="btn btn-primary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="books">Books</option>
                      <option value="clothing">Clothing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="col-md-3 mb-3">
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
                      <option value="needs-repair">Needs Repair</option>
                    </select>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select"
                      value={donationFilter}
                      onChange={(e) => setDonationFilter(e.target.value)}
                    >
                      <option value="all">All Items</option>
                      <option value="for-sale">For Sale</option>
                      <option value="donated">Donated Items</option>
                    </select>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Sort By</label>
                    <select 
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="Recent">Most Recent</option>
                      <option value="Price Low">Price: Low to High</option>
                      <option value="Price High">Price: High to Low</option>
                      <option value="Popular">Most Popular</option>
                    </select>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-12 mb-3 d-flex justify-content-center">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSearch("");
                        setCategoryFilter("");
                        setConditionFilter("");
                        setDonationFilter("all");
                        setSortBy("Recent");
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No items found</h5>
            <p className="text-muted">
              {search ? `No items match "${search}"` : "Be the first to post an item!"}
            </p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate("/post-item")}
            >
              Post an Item
            </button>
          </div>
        ) : (
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0" style={{ color: currentColors.text }}>
                  {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'} Found
                  {(search || categoryFilter || conditionFilter || donationFilter !== 'all') && (
                    <small className="text-muted ms-2">
                      {search && `"${search}"`}
                      {categoryFilter && ` in ${categoryFilter}`}
                      {conditionFilter && ` (${conditionFilter.replace('-', ' ')})`}
                      {donationFilter === 'donated' && ' (Donated Items)'}
                      {donationFilter === 'for-sale' && ' (Items for Sale)'}
                    </small>
                  )}
                </h4>
              </div>
              
              <div className="row">
                {filteredItems.map(item => (
                  <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100 shadow-sm">
                      {item.image && (
                        <img 
                          src={item.image} 
                          className="card-img-top" 
                          alt={item.title} 
                          style={{height: '200px', objectFit: 'cover'}} 
                        />
                      )}
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{item.title}</h5>
                          <div className="d-flex flex-column align-items-end">
                            <span className="badge bg-primary mb-1">
                              {item.category}
                            </span>
                            <span className="badge bg-success">
                              {item.condition}
                            </span>
                            {item.is_donated && (
                              <span className="badge bg-danger mt-1">
                                🎁 DONATED
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
                              <strong>Price:</strong><br />
                              <span className={(item.isDonated || item.type === 'donated') ? "text-success fw-bold" : "text-success fw-bold"}>
                                {(item.isDonated || item.type === 'donated') ? "DONATED" : (() => {
                                  const price = item.asking_price || item.price;
                                  if (typeof price === 'number') {
                                    return `₹${price.toLocaleString()}`;
                                  } else if (typeof price === 'string' && price !== '' && price !== '0') {
                                    const numPrice = parseFloat(price);
                                    return isNaN(numPrice) ? price : `₹${numPrice.toLocaleString()}`;
                                  }
                                  return "Price not listed";
                                })()}
                              </span>
                            </div>
                            <div className="col-6">
                              <strong>Seller:</strong><br />
                              <span className="text-muted">{item.seller_name || item.owner?.name || "Unknown"}</span>
                            </div>
                          </div>
                          
                          <div className="row text-sm mb-3">
                            <div className="col-6">
                              <strong>Posted:</strong><br />
                              <span className="text-muted">
                                {item.created_at 
                                  ? new Date(item.created_at).toLocaleDateString() 
                                  : item.date || "Unknown"}
                              </span>
                            </div>
                            <div className="col-6">
                              <strong>Location:</strong><br />
                              <span className="text-muted">{item.location}</span>
                            </div>
                          </div>
                          
                          <button 
                            className="btn btn-outline-primary w-100 mb-2"
                            onClick={() => handleContactSeller(item)}
                          >
                            <i className="fas fa-envelope me-2"></i>
                            Contact Seller
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Create Post Button */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1000,
        }}
      >
        <button
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "1rem 2rem",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0, 123, 255, 0.4)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onClick={() => navigate("/post-item")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px) scale(1.05)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.4)";
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: "#fff" }}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create a Post
        </button>
      </div>

      {/* Contact Seller Modal */}
      {showContactModal && selectedItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeContactModal}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Contact Seller</h3>
              <button 
                onClick={closeContactModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <img 
                  src={selectedItem.image || defaultAvatar} 
                  alt={selectedItem.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{selectedItem.title}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                    {selectedItem.askingPrice ? `₹${selectedItem.askingPrice}` : selectedItem.price || 'Price not specified'}
                  </p>
                  <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
                    Seller: {sellerInfo ? sellerInfo.name : (selectedItem.sellerName || 'Loading...')}
                  </p>
                </div>
              </div>
            </div>
            
            {loadingSellerInfo ? (
              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#666' }}>Loading seller information...</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#333' }}>Contact Information</h5>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📧 Email:</strong> {sellerInfo ? sellerInfo.email : 'Information not available'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📱 Phone:</strong> {sellerInfo ? sellerInfo.phone : 'Information not available'}
                </div>
                <div>
                  <strong>📍 Location:</strong> {selectedItem.pickupLocation || selectedItem.location || 'Location not specified'}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: sellerInfo && sellerInfo.email && sellerInfo.email !== 'Contact information not available' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: sellerInfo && sellerInfo.email && sellerInfo.email !== 'Contact information not available' ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
                disabled={!sellerInfo || !sellerInfo.email || sellerInfo.email === 'Contact information not available'}
                onClick={() => {
                  if (sellerInfo && sellerInfo.email && sellerInfo.email !== 'Contact information not available') {
                    window.open(`mailto:${sellerInfo.email}?subject=Interested in ${selectedItem.title}`);
                  }
                }}
              >
                📧 Send Email
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: sellerInfo && sellerInfo.phone && sellerInfo.phone !== 'Contact information not available' ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: sellerInfo && sellerInfo.phone && sellerInfo.phone !== 'Contact information not available' ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
                disabled={!sellerInfo || !sellerInfo.phone || sellerInfo.phone === 'Contact information not available'}
                onClick={() => {
                  if (sellerInfo && sellerInfo.phone && sellerInfo.phone !== 'Contact information not available') {
                    window.open(`tel:${sellerInfo.phone}`);
                  }
                }}
              >
                📱 Call Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}