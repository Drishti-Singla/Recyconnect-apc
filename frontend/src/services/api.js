// Simple API service to connect frontend to backend
const API_BASE_URL = 'http://localhost:8080/api';

// Token management functions
export const authUtils = {
  // Store token in localStorage
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('authToken');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  console.log('🔗 Making API call:', { endpoint, method, data });
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 Full URL:', url);
    
    const response = await fetch(url, config);
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      // Create a more detailed error object
      const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    
    // Handle responses with no content (like DELETE operations)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      console.log('✅ Success response: No content');
      return null;
    }
    
    const result = await response.json();
    console.log('✅ Success response:', result);
    return result;
  } catch (error) {
    console.error('💥 API call failed:', error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  // Get all users (consistent naming with other APIs)
  getAll: () => apiCall('/users'),
  
  // Get all users (legacy method name)
  getAllUsers: () => apiCall('/users'),
  
  // Register a new user
  register: (userData) => apiCall('/users', 'POST', userData),
  
  // Login user
  login: (credentials) => apiCall('/users/login', 'POST', credentials),
  
  // Get user profile (requires authentication)
  getProfile: () => apiCall('/users/profile'),

  // Get user by ID
  getUserById: (id) => apiCall(`/users/${id}`),

  // Update user by ID
  updateUser: (id, userData) => apiCall(`/users/${id}`, 'PUT', userData),

  // Update user profile
  updateProfile: (userData) => apiCall('/users/profile', 'PUT', userData),

  // Change user password
  changePassword: (passwordData) => apiCall('/users/change-password', 'PUT', passwordData),

  // Delete user account
  deleteAccount: () => apiCall('/users/profile', 'DELETE'),
};

// Item API functions
export const itemAPI = {
  // Get all items with optional filtering
  getAllItems: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/items${params ? '?' + params : ''}`);
  },
  
  // Create a new item (authentication required)
  createItem: (itemData) => apiCall('/items', 'POST', itemData),
  
  // Get item by ID
  getItem: (id) => apiCall(`/items/${id}`),

  // Get current user's items
  getUserItems: (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/items/user/${userId}${queryParams ? '?' + queryParams : ''}`);
  },

  // Update item (authentication required, user must own item)
  updateItem: (id, itemData) => apiCall(`/items/${id}`, 'PUT', itemData),

  // Delete item (authentication required, user must own item)
  deleteItem: (id) => apiCall(`/items/${id}`, 'DELETE'),
};

// Donated Item API functions
export const donatedItemAPI = {
  // Get all donated items (public)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/donated-items${queryParams ? '?' + queryParams : ''}`);
  },

  getAllDonatedItems: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/donated-items${queryParams ? '?' + queryParams : ''}`);
  },

  // Create a new donated item (authentication required)
  createDonatedItem: (donatedItemData) => apiCall('/donated-items', 'POST', donatedItemData),

  // Get user's donated items (authentication required)
  getUserDonatedItems: () => apiCall('/donated-items/user'),

  // Update donated item (authentication required, user must own item)
  updateDonatedItem: (id, donatedItemData) => apiCall(`/donated-items/${id}`, 'PUT', donatedItemData),

  // Delete donated item (authentication required, user must own item)
  deleteDonatedItem: (id) => apiCall(`/donated-items/${id}`, 'DELETE'),
};

// Message API functions
export const messageAPI = {
  // Send a new message
  sendMessage: (messageData) => apiCall('/messages', 'POST', messageData),
  
  // Get user's conversations
  getConversations: () => apiCall('/messages/conversations'),
  
  // Get conversation with specific user
  getConversation: (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/messages/conversation/${userId}${queryParams ? '?' + queryParams : ''}`);
  },
  
  // Get messages for a specific item
  getItemMessages: (itemId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/messages/item/${itemId}${queryParams ? '?' + queryParams : ''}`);
  },
  
  // Mark message as read
  markAsRead: (messageId) => apiCall(`/messages/${messageId}/read`, 'PATCH'),
  
  // Delete message
  deleteMessage: (messageId) => apiCall(`/messages/${messageId}`, 'DELETE'),
  
  // Get unread messages count
  getUnreadCount: () => apiCall('/messages/unread-count'),
};

// Reported Item API functions (unified lost/found/reported items)
export const reportedItemAPI = {
  // Get all reported items (public)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/reported${queryParams ? '?' + queryParams : ''}`);
  },

  getAllReportedItems: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/reported${queryParams ? '?' + queryParams : ''}`);
  },

  // Create a new reported item (authentication required)
  createReportedItem: (reportedItemData) => apiCall('/reported', 'POST', reportedItemData),

  // Get user's reported items (authentication required)
  getUserReportedItems: () => apiCall('/reported/my-reported'),

  // Update reported item status (authentication required, user must own item)
  updateReportedItemStatus: (id, statusData) => apiCall(`/reported/${id}`, 'PATCH', statusData),

  // Admin function to update status
  updateStatus: (id, status) => apiCall(`/reported/${id}`, 'PATCH', { status }),

  // Delete reported item (authentication required, user must own item)
  deleteReportedItem: (id) => apiCall(`/reported/${id}`, 'DELETE'),
};

// User Concern API functions (for raising concerns about users/items/issues)
export const userConcernAPI = {
  // Submit a new user concern (authentication required)
  createUserConcern: (concernData) => apiCall('/concerns', 'POST', concernData),

  // Get user's own concerns (authentication required)
  getUserOwnConcerns: () => apiCall('/concerns/my-concerns'),

  // Get all concerns (admin view with filtering)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/concerns${queryParams ? '?' + queryParams : ''}`);
  },

  getAllUserConcerns: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/concerns${queryParams ? '?' + queryParams : ''}`);
  },

  // Update concern status (admin/moderator function)
  updateConcernStatus: (id, statusData) => apiCall(`/concerns/${id}`, 'PATCH', statusData),

  // Delete concern (authentication required, user must own concern)
  deleteConcern: (id) => apiCall(`/concerns/${id}`, 'DELETE'),
};

// Flag API functions (for flagging content/users for moderation)
export const flagAPI = {
  // Create a new flag (authentication required)
  createFlag: (flagData) => apiCall('/flags', 'POST', flagData),

  // Get all flags (admin function with filtering)
  getAllFlags: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/flags${queryParams ? '?' + queryParams : ''}`);
  },

  // Get flags by user (authentication required)
  getUserFlags: (userId) => apiCall(`/flags/user/${userId}`),

  // Get flags for a specific target
  getTargetFlags: (targetType, targetId) => apiCall(`/flags/target/${targetType}/${targetId}`),

  // Update flag status (admin function)
  updateFlag: (id, updateData) => apiCall(`/flags/${id}`, 'PATCH', updateData),

  // Delete flag (admin function)
  deleteFlag: (id) => apiCall(`/flags/${id}`, 'DELETE'),

  // Get flag counts for a target
  getFlagCounts: (targetType, targetId) => apiCall(`/flags/count/${targetType}/${targetId}`),
};

export default { userAPI, itemAPI, donatedItemAPI, messageAPI, reportedItemAPI, userConcernAPI, authUtils };
