
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI, itemAPI, authUtils, reportedItemAPI, userConcernAPI, donatedItemAPI } from '../services/api';
import logo from '../components/logo.png';

function Dashboard() {
  const navigate = useNavigate();
  const { currentColors } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [notifications, setNotifications] = useState({
    newMessages: true,
    listingViews: true,
    lostFound: true,
    quietHours: false
  });
  const [privacy, setPrivacy] = useState({
    showPhone: true,
    verifiedEmailOnly: false,
    messagesFrom: 'anyone'
  });

  // Item management states
  const [editingItem, setEditingItem] = useState(null);

  // Lost & Found management states
  const [userLostFoundItems, setUserLostFoundItems] = useState([]);
  const [isLoadingLostFound, setIsLoadingLostFound] = useState(false);
  const [editingLostFoundItem, setEditingLostFoundItem] = useState(null);
  const [lostFoundLoading, setLostFoundLoading] = useState(false);

  // User Concerns management states
  const [userConcerns, setUserConcerns] = useState([]);
  const [isLoadingConcerns, setIsLoadingConcerns] = useState(false);
  const [editingConcern, setEditingConcern] = useState(null);
  const [concernLoading, setConcernLoading] = useState(false);

  // Donated Items management states
  const [userDonatedItems, setUserDonatedItems] = useState([]);
  const [isLoadingDonatedItems, setIsLoadingDonatedItems] = useState(false);
  const [editingDonatedItem, setEditingDonatedItem] = useState(null);
  const [showDeleteDonatedConfirm, setShowDeleteDonatedConfirm] = useState(null);
  const [donatedLoading, setDonatedLoading] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    const loggedInUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const token = authUtils.getToken();
    
    console.log('localStorage user:', loggedInUser);
    console.log('localStorage isLoggedIn:', isLoggedIn);
    console.log('authToken exists:', !!token);
    
    if (!loggedInUser || !isLoggedIn) {
      console.log('No user data found, redirecting to login');
      // Clear any stale data
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      authUtils.removeToken();
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(loggedInUser);
    console.log('Parsed user data:', userData);
    
    // Validate that we have essential user data
    if (!userData.id || !userData.email) {
      console.log('Invalid user data, redirecting to login');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      authUtils.removeToken();
      navigate('/login');
      return;
    }
    
    // Set user data from localStorage immediately
    setUser({
      ...userData,
      avatar: logo,
      lastLogin: new Date().toLocaleString(),
      achievements: userData.achievements || ['Trusted Seller', 'Eco Saver'],
    });
    
    const fetchUserFromDB = async () => {
      console.log('Fetching user profile from backend');
      try {
        // Use the user ID from localStorage to get fresh user data
        const userId = userData.id;
        console.log('Fetching user data for ID:', userId);

        const profileResponse = await userAPI.getUserById(userId);
        console.log('User profile fetched:', profileResponse);

        const dbUser = profileResponse; // The response is the user object directly
        console.log('User ID for loading items:', dbUser.id);

        // Update user data with fresh data from backend
        setUser({
          ...dbUser,
          avatar: logo,
          lastLogin: new Date().toLocaleString(),
          achievements: dbUser.achievements || ['Trusted Seller', 'Eco Saver'],
        });

        console.log('About to call loadUserItems');
        await loadUserItems(dbUser.id);
        console.log('loadUserItems completed');

        console.log('About to call loadUserLostFoundItems');
        await loadUserLostFoundItems();
        console.log('loadUserLostFoundItems completed');

        console.log('About to call loadUserConcerns');
        await loadUserConcerns();
        console.log('loadUserConcerns completed');

        console.log('About to call loadUserDonatedItems');
        await loadUserDonatedItems();
        console.log('loadUserDonatedItems completed');

      } catch (error) {
        console.error('Error fetching user from DB:', error);

        // Only redirect to login on authentication errors (401, 403)
        if (error.status === 401 || error.status === 403 ||
            (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')))) {
          console.log('Authentication error detected, redirecting to login');
          authUtils.removeToken();
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          navigate('/login');
        } else {
          console.log('Non-authentication error, staying on dashboard with cached user data');
          // Keep the user on dashboard with the cached user data from localStorage
          // Still try to load items with the cached user ID
          await loadUserItems(userData.id);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserFromDB();
  }, [navigate]);

  const loadUserItems = async (userId) => {
    console.log('Loading user items for user:', userId);
    console.log('User ID type:', typeof userId);
    console.log('User ID value:', userId);

    setIsLoadingItems(true);
    try {
      // Fetch user's items from the API (uses JWT token for authentication)
      console.log('Making API call to getUserItems with userId:', userId);
      const response = await itemAPI.getUserItems(userId);
      console.log('Raw API response:', response);
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);

      const items = response || []; // The response is directly the array
      console.log('Extracted items array:', items);
      console.log('Number of items found:', items.length);

      if (items.length > 0) {
        console.log('First item sample:', items[0]);
      }

      setUserItems(items);
      console.log('User items set in state');
    } catch (error) {
      console.error('Error loading user items:', error);
      console.error('Error details:', error.message);
      console.error('Error response:', error.response);
      setUserItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const loadUserLostFoundItems = async () => {
    console.log('🔄 Loading user lost & found items...');
    setIsLoadingLostFound(true);
    try {
      // Fetch user's reported items from the API (uses JWT token for authentication)
      const response = await reportedItemAPI.getUserReportedItems();
      console.log('📡 API response - user lost & found items:', response);
      
      // Handle both response.data format and direct array response
      const items = Array.isArray(response) ? response : (response.data || []);
      console.log('📊 Number of lost & found items found:', items.length);
      console.log('📋 Items data:', items);
      
      setUserLostFoundItems(items);
      console.log('✅ Lost & found items state updated');
    } catch (error) {
      console.error('❌ Error loading user lost & found items:', error);
      setUserLostFoundItems([]);
    } finally {
      setIsLoadingLostFound(false);
    }
  };

  const loadUserConcerns = async () => {
    console.log('🔄 Loading user concerns...');
    setIsLoadingConcerns(true);
    try {
      // Fetch user's concerns from the API (uses JWT token for authentication)
      const response = await userConcernAPI.getUserOwnConcerns();
      console.log('📡 API response - user concerns:', response);
      
      // The API returns the array directly, not wrapped in a data property
      const concerns = Array.isArray(response) ? response : (response.data || []);
      console.log('📊 Number of concerns found:', concerns.length);
      console.log('📋 Concerns data:', concerns);
      
      setUserConcerns(concerns);
      console.log('✅ User concerns state updated');
    } catch (error) {
      console.error('❌ Error loading user concerns:', error);
      setUserConcerns([]);
    } finally {
      setIsLoadingConcerns(false);
    }
  };

  const loadUserDonatedItems = async () => {
    console.log('🔄 Loading user donated items...');
    console.log('👤 Current user:', user);
    console.log('🔑 Auth token exists:', !!authUtils.getToken());
    
    setIsLoadingDonatedItems(true);
    try {
      // Fetch user's donated items from the API (uses JWT token for authentication)
      const response = await donatedItemAPI.getUserDonatedItems();
      console.log('📡 API response - user donated items:', response);
      
      // Handle both response.data.donatedItems format and direct array response
      const donatedItems = Array.isArray(response) ? response : (response.data?.donatedItems || response.data || []);
      console.log('📊 Number of donated items found:', donatedItems.length);
      console.log('📋 Donated items data:', donatedItems);
      
      // Ensure we're not accidentally clearing the array
      if (Array.isArray(donatedItems)) {
        setUserDonatedItems(donatedItems);
        console.log('✅ User donated items state updated successfully');
      } else {
        console.error('⚠️ Invalid data format received:', donatedItems);
        setUserDonatedItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading user donated items:', error);
      console.error('❌ Error details:', error.message);
      // Don't clear existing items on error, keep them
      console.log('🔒 Keeping existing items due to error');
    } finally {
      setIsLoadingDonatedItems(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({
      ...item,
      editedTitle: item.title,
      editedDescription: item.description,
      editedCategory: item.category,
      editedCondition: item.condition,
      editedAskingPrice: item.askingPrice || item.price || '',
      editedLocation: item.location || ''
    });
    console.log('Editing item:', item);
  };

  const handleCancelEditItem = () => {
    setEditingItem(null);
  };

  const handleSaveEditItem = async () => {
    // Client-side validation
    if (!editingItem.editedTitle || editingItem.editedTitle.trim().length < 3) {
      alert('Title must be at least 3 characters long');
      return;
    }
    
    if (!editingItem.editedDescription || editingItem.editedDescription.trim().length < 10) {
      alert('Description must be at least 10 characters long');
      return;
    }
    
    if (!editingItem.editedCategory) {
      alert('Please select a category');
      return;
    }
    
    if (!editingItem.editedCondition) {
      alert('Please select a condition');
      return;
    }

    try {
      const updatedItem = {
        title: editingItem.editedTitle,
        description: editingItem.editedDescription,
        category: editingItem.editedCategory,
        condition: editingItem.editedCondition,
        price: editingItem.editedAskingPrice ? parseFloat(editingItem.editedAskingPrice) : 0,
        location: editingItem.editedLocation || 'Not specified'
      };

      console.log('Updating item with data:', updatedItem);
      console.log('Item ID:', editingItem.id);
      console.log('Item ID type:', typeof editingItem.id);
      
      await itemAPI.updateItem(editingItem.id, updatedItem);
      setEditingItem(null);
      
      // Reload user items after update
      console.log('Reloading items after update');
      await loadUserItems(user.id);
      
      console.log('Item updated successfully');
      alert('✅ Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      
      // Try to parse the error message
      let errorMessage = 'Failed to update item. Please try again.';
      if (error.message && error.message.includes('message:')) {
        try {
          const errorData = JSON.parse(error.message.split('message: ')[1]);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error message:', parseError);
        }
      }
      
      alert('❌ ' + errorMessage);
    }
  };

  const handleEditItemChange = (field, value) => {
    setEditingItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await itemAPI.deleteItem(itemId);
        
        // Reload user items after deletion
        console.log('Reloading items after deletion');
        await loadUserItems(user.id);
        
        console.log('Item deleted successfully');
        alert('✅ Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('❌ Failed to delete item. Please try again.');
      }
    }
  };

  // Lost & Found item management functions
  const handleEditLostFoundItem = (item) => {
    setEditingLostFoundItem({
      ...item,
      editedTitle: item.title,
      editedDescription: item.description,
      editedCategory: item.category,
      editedColor: item.color,
      editedBrand: item.brand,
      editedLocationLost: item.location_lost,
      editedLocationFound: item.location_found,
      editedCurrentLocation: item.current_location,
      editedContactInfo: item.contact_info,
      editedStatus: item.status
    });
  };

  const handleSaveLostFoundItem = async (itemId) => {
    setLostFoundLoading(true);
    try {
      const updatedData = {
        title: editingLostFoundItem.editedTitle,
        description: editingLostFoundItem.editedDescription,
        category: editingLostFoundItem.editedCategory,
        color: editingLostFoundItem.editedColor,
        brand: editingLostFoundItem.editedBrand,
        location_lost: editingLostFoundItem.editedLocationLost,
        location_found: editingLostFoundItem.editedLocationFound,
        current_location: editingLostFoundItem.editedCurrentLocation,
        contact_info: editingLostFoundItem.editedContactInfo,
        status: editingLostFoundItem.editedStatus
      };

      console.log('🔄 Updating lost/found item:', itemId, updatedData);
      const response = await reportedItemAPI.updateReportedItemStatus(itemId, updatedData);
      console.log('✅ Update response:', response);
      
      // Reload user items after update
      console.log('🔄 Reloading user lost/found items...');
      await loadUserLostFoundItems();
      console.log('✅ Items reloaded successfully');
      
      setEditingLostFoundItem(null);
      alert('✅ Item updated successfully!');
    } catch (error) {
      console.error('❌ Error updating item:', error);
      alert('❌ Failed to update item. Please try again.');
    } finally {
      setLostFoundLoading(false);
    }
  };

  const handleDeleteLostFoundItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this lost/found item? This action cannot be undone.')) {
      try {
        await reportedItemAPI.deleteReportedItem(itemId);
        
        // Reload user items after deletion
        await loadUserLostFoundItems();
        
        console.log('Lost/Found item deleted successfully');
        alert('✅ Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting lost/found item:', error);
        alert('❌ Failed to delete item. Please try again.');
      }
    }
  };

  // User Concerns Management Functions
  const handleEditConcern = (concern) => {
    setEditingConcern({
      ...concern,
      editedDescription: concern.description,
      editedUrgency: concern.urgency,
      editedContactMethod: concern.contact_method || '',
      editedUserInQuestion: concern.user_in_question || '',
      editedItemInvolved: concern.item_involved || ''
    });
    console.log('Editing concern:', concern);
  };

  const handleCancelEditConcern = () => {
    setEditingConcern(null);
  };

  const handleSaveConcern = async () => {
    if (!editingConcern.editedDescription || editingConcern.editedDescription.trim().length < 10) {
      alert('Description must be at least 10 characters long');
      return;
    }

    if (!editingConcern.editedUrgency) {
      alert('Please select an urgency level');
      return;
    }

    setConcernLoading(true);
    try {
      const updateData = {
        description: editingConcern.editedDescription,
        urgency: editingConcern.editedUrgency,
        contactMethod: editingConcern.editedContactMethod,
        userInQuestion: editingConcern.editedUserInQuestion,
        itemInvolved: editingConcern.editedItemInvolved
      };

      console.log('Updating concern with data:', updateData);
      
      // Note: We'll need to add an update endpoint to the backend
      // For now, we'll just update the local state
      const updatedConcerns = userConcerns.map(concern => 
        concern.id === editingConcern.id 
          ? { 
              ...concern, 
              description: updateData.description,
              urgency: updateData.urgency,
              contact_method: updateData.contactMethod,
              user_in_question: updateData.userInQuestion,
              item_involved: updateData.itemInvolved,
              updated_at: new Date().toISOString()
            }
          : concern
      );
      setUserConcerns(updatedConcerns);
      setEditingConcern(null);
      
      console.log('Concern updated successfully');
      alert('✅ Concern updated successfully!');
    } catch (error) {
      console.error('❌ Error updating concern:', error);
      alert('❌ Failed to update concern. Please try again.');
    } finally {
      setConcernLoading(false);
    }
  };

  const handleDeleteConcern = async (concernId) => {
    if (window.confirm('Are you sure you want to delete this concern? This action cannot be undone.')) {
      try {
        await userConcernAPI.deleteConcern(concernId);
        
        // Reload user concerns after deletion
        await loadUserConcerns();
        
        console.log('Concern deleted successfully');
        alert('✅ Concern deleted successfully!');
      } catch (error) {
        console.error('Error deleting concern:', error);
        alert('❌ Failed to delete concern. Please try again.');
      }
    }
  };

  // Donated Items Handlers
  const handleEditDonatedItem = (item) => {
    // Map potentially invalid condition values to valid ones
    const conditionMapping = {
      'lightly-used': 'gently-used',
      'new': 'brand-new',
      'worn': 'needs-repair',
      'excellent': 'brand-new',
      'good': 'like-new',
      'fair': 'gently-used',
      'poor': 'needs-repair'
    };
    
    const validCondition = conditionMapping[item.condition] || item.condition;
    
    setEditingDonatedItem({
      ...item,
      editedTitle: item.title,
      editedDescription: item.description,
      editedCategory: item.category,
      editedCondition: validCondition,
      editedLocation: item.location || ''
    });
    console.log('Editing donated item:', item);
    console.log('Mapped condition from', item.condition, 'to', validCondition);
  };

  const handleSaveDonatedItem = async (donatedItem) => {
    if (!donatedItem.editedTitle?.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!donatedItem.editedDescription?.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!donatedItem.editedLocation?.trim() && !donatedItem.pickupLocation?.trim()) {
      alert('Please enter a pickup location');
      return;
    }

    // Double-check condition mapping before sending
    const conditionMapping = {
      'lightly-used': 'gently-used',
      'new': 'brand-new',
      'worn': 'needs-repair',
      'excellent': 'brand-new',
      'good': 'like-new',
      'fair': 'gently-used',
      'poor': 'needs-repair'
    };
    
    const finalCondition = conditionMapping[donatedItem.editedCondition] || donatedItem.editedCondition;
    console.log('🔧 Condition mapping:', donatedItem.editedCondition, '→', finalCondition);

    setDonatedLoading(true);
    try {
      const updateData = {
        title: donatedItem.editedTitle,
        description: donatedItem.editedDescription,
        category: donatedItem.editedCategory,
        condition: finalCondition,
        pickupLocation: donatedItem.editedLocation || donatedItem.pickupLocation || 'Not specified'
      };

      console.log('📡 Sending update data:', updateData);

      await donatedItemAPI.updateDonatedItem(donatedItem.id, updateData);
      
      // Reload donated items after update
      await loadUserDonatedItems();
      setEditingDonatedItem(null);
      
      console.log('Donated item updated successfully');
      alert('✅ Donated item updated successfully!');
    } catch (error) {
      console.error('Error updating donated item:', error);
      alert('❌ Failed to update donated item. Please try again.');
    } finally {
      setDonatedLoading(false);
    }
  };

  const handleDeleteDonatedItem = async (donatedItemId) => {
    try {
      console.log('🗑️ Attempting to delete donated item:', donatedItemId);
      await donatedItemAPI.deleteDonatedItem(donatedItemId);
      
      console.log('✅ Donated item deleted from backend successfully');
      
      // Reload donated items after deletion
      await loadUserDonatedItems();
      setShowDeleteDonatedConfirm(null);
      
      console.log('🔄 Donated items list refreshed after deletion');
      alert('✅ Donated item deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting donated item:', error);
      setShowDeleteDonatedConfirm(null);
      alert('❌ Failed to delete donated item. Please try again.');
      
      // Don't reload the list on error to preserve existing items
      console.log('🔒 Not refreshing list due to delete error');
    }
  };

  const handleLogout = () => {
    // Clear all user data and tokens
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    authUtils.removeToken();
    
    // Reset component state
    setUser(null);
    setUserItems([]);
    
    // Navigate to login
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio
    });
    setUpdateMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({});
    setUpdateMessage('');
  };

  const handleUpdateProfile = async () => {
    if (!editFormData.name || !editFormData.email) {
      setUpdateMessage('Name and email are required');
      return;
    }

    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      await userAPI.updateUser(user.id, {
        name: editFormData.name,
        phone: editFormData.phone,
        bio: editFormData.bio,
      });
      // Fetch the latest user data from backend after update
      const refreshedUserResponse = await userAPI.getUserById(user.id);
      const refreshedUser = refreshedUserResponse;
      setUser({
        ...refreshedUser,
        avatar: logo,
        lastLogin: new Date().toLocaleString(),
        achievements: refreshedUser.achievements || ['Trusted Seller', 'Eco Saver'],
      });
      localStorage.setItem('user', JSON.stringify(refreshedUser));
      setIsEditing(false);
      setUpdateMessage('Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage('Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('❌ All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('❌ New password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.message.includes('Current password is incorrect')) {
        setPasswordMessage('❌ Current password is incorrect');
      } else {
        setPasswordMessage('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n' +
      '• Your profile information\n' +
      '• All your posted items\n' +
      '• Your message history\n\n' +
      'Type "DELETE" in the prompt if you want to proceed.'
    );
    
    if (!confirmed) return;
    
    const confirmText = prompt('Please type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    try {
      await userAPI.deleteAccount();
      // Clear all user data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      alert('Your account has been deleted successfully. You will now be redirected to the login page.');
      navigate('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      alert(`Failed to delete account: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
    }
  };

  const sectionButton = (id, label, icon) => (
    <button
      onClick={() => setActiveSection(id)}
      style={{
        padding: '12px 16px',
        background: activeSection === id ? currentColors.primary : 'transparent',
        color: activeSection === id ? '#fff' : currentColors.textSecondary,
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontSize: 14,
        fontWeight: activeSection === id ? 600 : 400,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: 8,
    border: `1px solid ${currentColors.border}`,
    fontSize: 14,
    outline: 'none',
    background: currentColors.cardBackground,
    color: currentColors.text
  };

  const toggleStyle = {
    position: 'relative',
    width: 40,
    height: 20,
    borderRadius: 10,
    cursor: 'pointer',
    display: 'inline-block'
  };

  const renderMyItemsSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: currentColors.text, margin: 0, borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>📦 My Items</h3>
        <button 
          style={{ 
            background: currentColors.primary, 
            color: '#fff', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 8, 
            cursor: 'pointer', 
            fontWeight: 600 
          }}
          onClick={() => navigate('/post-item')}
        >
          + Add New Item
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.primary }}>{userItems.length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Total Items</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.success }}>{userItems.filter(item => item.verified).length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Verified</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.warning }}>0</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Messages</div>
        </div>
      </div>

      {/* Items List */}
      {isLoadingItems ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: currentColors.textSecondary }}>
          Loading your items...
        </div>
      ) : userItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h4 style={{ color: currentColors.text, marginBottom: '0.5rem' }}>No items posted yet</h4>
          <p style={{ color: currentColors.textSecondary, marginBottom: '1rem' }}>Start by posting your first item for exchange or sale</p>
          <button 
            style={{ 
              background: currentColors.primary, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600 
            }}
            onClick={() => navigate('/post-item')}
          >
            Post Your First Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {userItems.map((item) => (
            <div key={item.id} style={{ 
              background: currentColors.cardBackground, 
              border: `1px solid ${currentColors.border}`, 
              borderRadius: 8, 
              padding: '1rem'
            }}>
              {editingItem && editingItem.id === item.id ? (
                // Edit form
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Title</label>
                    <input
                      type="text"
                      value={editingItem.editedTitle}
                      onChange={(e) => handleEditItemChange('editedTitle', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Description</label>
                    <textarea
                      value={editingItem.editedDescription}
                      onChange={(e) => handleEditItemChange('editedDescription', e.target.value)}
                      rows={3}
                      placeholder="Describe your item in detail (minimum 10 characters)..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Category</label>
                      <select
                        value={editingItem.editedCategory}
                        onChange={(e) => handleEditItemChange('editedCategory', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                        <option value="furniture">Furniture</option>
                        <option value="sports">Sports</option>
                        <option value="toys">Toys</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Condition</label>
                      <select
                        value={editingItem.editedCondition}
                        onChange={(e) => handleEditItemChange('editedCondition', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="brand-new">Brand New</option>
                        <option value="like-new">Like New</option>
                        <option value="gently-used">Gently Used</option>
                        <option value="heavily-used">Heavily Used</option>
                        <option value="needs-repair">Needs Repair</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Asking Price (₹)</label>
                      <input
                        type="number"
                        value={editingItem.editedAskingPrice}
                        onChange={(e) => handleEditItemChange('editedAskingPrice', e.target.value)}
                        placeholder="Optional"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Location</label>
                      <input
                        type="text"
                        value={editingItem.editedLocation}
                        onChange={(e) => handleEditItemChange('editedLocation', e.target.value)}
                        placeholder="Item location"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      style={{ 
                        background: currentColors.textSecondary, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={handleCancelEditItem}
                    >
                      Cancel
                    </button>
                    <button 
                      style={{ 
                        background: currentColors.success, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={handleSaveEditItem}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: currentColors.text, margin: 0 }}>{item.title}</h4>
                      {item.verified && <span style={{ color: currentColors.success }}>✓</span>}
                    </div>
                    <p style={{ color: currentColors.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: currentColors.textSecondary }}>
                      <span>📂 {item.category}</span>
                      <span>📊 {item.condition}</span>
                      <span>📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</span>
                      {item.askingPrice && <span>💰 ₹{item.askingPrice}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ 
                      background: currentColors.info, 
                      color: '#fff', 
                      border: 'none', 
                      padding: '6px 12px', 
                      borderRadius: 6, 
                      cursor: 'pointer', 
                      fontSize: '0.8rem' 
                    }}
                    onClick={() => handleEditItem(item)}>
                      Edit
                    </button>
                    <button style={{ 
                      background: currentColors.danger, 
                      color: '#fff', 
                      border: 'none', 
                      padding: '6px 12px', 
                      borderRadius: 6, 
                      cursor: 'pointer', 
                      fontSize: '0.8rem' 
                    }}
                    onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDonatedItemsSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: currentColors.text, margin: 0, borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>❤️ Donated Items</h3>
        <button 
          style={{ 
            background: currentColors.primary, 
            color: '#fff', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 8, 
            cursor: 'pointer', 
            fontWeight: 600 
          }}
          onClick={() => navigate('/donate')}
        >
          + Donate Item
        </button>
      </div>

      {isLoadingDonatedItems ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: currentColors.textSecondary }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Loading donated items...
        </div>
      ) : userDonatedItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 2rem', 
          color: currentColors.textSecondary,
          border: `1px dashed ${currentColors.border}`,
          borderRadius: 12
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
          <h4 style={{ color: currentColors.text, marginBottom: '0.5rem' }}>No donated items found</h4>
          <p style={{ color: currentColors.textSecondary, marginBottom: '1rem' }}>
            This could be because:
            <br />• You haven't donated any items yet
            <br />• Items belong to a different user account
            <br />• There's an authentication issue
          </p>
          <button 
            style={{ 
              background: currentColors.primary, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600,
              marginRight: '10px'
            }}
            onClick={() => navigate('/donate')}
          >
            Donate Your First Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {userDonatedItems.map((item) => (
            <div key={item.id} style={{ 
              background: currentColors.cardBackground, 
              border: `1px solid ${currentColors.border}`, 
              borderRadius: 8, 
              padding: '1rem'
            }}>
              {editingDonatedItem && editingDonatedItem.id === item.id ? (
                // Edit form
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Title</label>
                    <input
                      type="text"
                      value={editingDonatedItem.editedTitle}
                      onChange={(e) => setEditingDonatedItem({...editingDonatedItem, editedTitle: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Description</label>
                    <textarea
                      value={editingDonatedItem.editedDescription}
                      onChange={(e) => setEditingDonatedItem({...editingDonatedItem, editedDescription: e.target.value})}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Category</label>
                      <select
                        value={editingDonatedItem.editedCategory}
                        onChange={(e) => setEditingDonatedItem({...editingDonatedItem, editedCategory: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="electronics">Electronics</option>
                        <option value="books">Books</option>
                        <option value="clothing">Clothing</option>
                        <option value="furniture">Furniture</option>
                        <option value="accessories">Accessories</option>
                        <option value="sports">Sports & Outdoors</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Condition</label>
                      <select
                        value={editingDonatedItem.editedCondition}
                        onChange={(e) => setEditingDonatedItem({...editingDonatedItem, editedCondition: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="brand-new">Brand New</option>
                        <option value="like-new">Like New</option>
                        <option value="gently-used">Gently Used</option>
                        <option value="heavily-used">Heavily Used</option>
                        <option value="needs-repair">Needs Repair</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 600 }}>Location</label>
                      <input
                        type="text"
                        value={editingDonatedItem.editedLocation || ''}
                        onChange={(e) => setEditingDonatedItem({...editingDonatedItem, editedLocation: e.target.value})}
                        placeholder="e.g., hostel, library, campus"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleSaveDonatedItem(editingDonatedItem)}
                      disabled={donatedLoading}
                      style={{
                        background: currentColors.success,
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        cursor: donatedLoading ? 'not-allowed' : 'pointer',
                        opacity: donatedLoading ? 0.6 : 1
                      }}
                    >
                      {donatedLoading ? '⏳' : '✅'} {donatedLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingDonatedItem(null)}
                      style={{
                        background: currentColors.textSecondary,
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: currentColors.text, margin: 0, flex: 1 }}>{item.title}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditDonatedItem(item)}
                        style={{
                          background: 'none',
                          border: `1px solid ${currentColors.border}`,
                          color: currentColors.primary,
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteDonatedConfirm(item.id)}
                        style={{
                          background: 'none',
                          border: `1px solid ${currentColors.danger}`,
                          color: currentColors.danger,
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ color: currentColors.textSecondary, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: currentColors.textSecondary }}>
                    <span>📂 {item.category}</span>
                    <span>🏷️ {item.condition?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                    {item.location && <span>📍 {item.location}</span>}
                  </div>
                </div>
              )}

              {/* Delete confirmation dialog */}
              {showDeleteDonatedConfirm === item.id && (
                <div style={{ 
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  background: 'rgba(0,0,0,0.5)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  zIndex: 1000 
                }}>
                  <div style={{ 
                    background: currentColors.cardBackground, 
                    padding: '2rem', 
                    borderRadius: 12, 
                    maxWidth: '400px', 
                    width: '90%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ color: currentColors.text, marginBottom: '1rem' }}>Delete Donated Item</h3>
                    <p style={{ color: currentColors.textSecondary, marginBottom: '1.5rem' }}>
                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowDeleteDonatedConfirm(null)}
                        style={{
                          background: currentColors.textSecondary,
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteDonatedItem(item.id)}
                        style={{
                          background: currentColors.danger,
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLostFoundSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: currentColors.text, margin: 0, borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>🔍 Lost & Found</h3>
        <button 
          style={{ 
            background: currentColors.primary, 
            color: '#fff', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 8, 
            cursor: 'pointer', 
            fontWeight: 600 
          }}
          onClick={() => navigate('/lost-found')}
        >
          + Item Recovery
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.primary }}>{userLostFoundItems.length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Total Reports</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.danger }}>{userLostFoundItems.filter(item => item.item_type === 'lost').length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Lost Items</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.success }}>{userLostFoundItems.filter(item => item.item_type === 'found').length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Found Items</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.warning }}>{userLostFoundItems.filter(item => item.status === 'resolved').length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Resolved</div>
        </div>
      </div>

      {/* Items List */}
      {isLoadingLostFound ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: currentColors.textSecondary }}>
          Loading your lost & found items...
        </div>
      ) : userLostFoundItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h4 style={{ color: currentColors.text, marginBottom: '0.5rem' }}>No lost or found items reported</h4>
          <p style={{ color: currentColors.textSecondary, marginBottom: '1rem' }}>Report a lost or found item to help the community</p>
          <button 
            style={{ 
              background: currentColors.primary, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600 
            }}
            onClick={() => navigate('/lost-found')}
          >
            Report Your First Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {userLostFoundItems.map((item) => (
            <div key={item.id} style={{ 
              background: currentColors.cardBackground, 
              padding: '1.5rem', 
              borderRadius: 12, 
              boxShadow: `0 2px 8px ${currentColors.shadow}`,
              border: `1px solid ${currentColors.border}`
            }}>
              {editingLostFoundItem && editingLostFoundItem.id === item.id ? (
                // Edit mode
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Title</label>
                      <input
                        type="text"
                        value={editingLostFoundItem.editedTitle}
                        onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedTitle: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Category</label>
                      <input
                        type="text"
                        value={editingLostFoundItem.editedCategory}
                        onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedCategory: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Description</label>
                    <textarea
                      value={editingLostFoundItem.editedDescription}
                      onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedDescription: e.target.value})}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Color</label>
                      <input
                        type="text"
                        value={editingLostFoundItem.editedColor || ''}
                        onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedColor: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Brand</label>
                      <input
                        type="text"
                        value={editingLostFoundItem.editedBrand || ''}
                        onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedBrand: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Status</label>
                      <select
                        value={editingLostFoundItem.editedStatus}
                        onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedStatus: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Contact Info</label>
                    <input
                      type="text"
                      value={editingLostFoundItem.editedContactInfo}
                      onChange={(e) => setEditingLostFoundItem({...editingLostFoundItem, editedContactInfo: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      style={{ 
                        background: currentColors.textSecondary, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={() => setEditingLostFoundItem(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      style={{ 
                        background: currentColors.success, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={() => handleSaveLostFoundItem(item.id)}
                      disabled={lostFoundLoading}
                    >
                      {lostFoundLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: currentColors.text, margin: 0 }}>{item.title}</h4>
                      <span style={{ 
                        background: item.item_type === 'lost' ? currentColors.danger : currentColors.success,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {item.item_type === 'lost' ? '🔍 LOST' : '✅ FOUND'}
                      </span>
                      <span style={{ 
                        background: item.status === 'resolved' ? currentColors.success : item.status === 'closed' ? currentColors.textSecondary : currentColors.warning,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: currentColors.textSecondary, margin: '0.5rem 0', fontSize: '0.9rem' }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: currentColors.textSecondary }}>
                      {item.category && <span>📂 {item.category}</span>}
                      {item.color && <span>🎨 {item.color}</span>}
                      {item.brand && <span>🏷️ {item.brand}</span>}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: currentColors.textSecondary }}>
                      📍 {item.item_type === 'lost' ? item.location_lost : item.location_found || item.current_location}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: currentColors.textSecondary }}>
                      📅 {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button 
                      style={{ 
                        background: currentColors.info, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.8rem' 
                      }}
                      onClick={() => handleEditLostFoundItem(item)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      style={{ 
                        background: currentColors.danger, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.8rem' 
                      }}
                      onClick={() => handleDeleteLostFoundItem(item.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConcernsSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: currentColors.text, margin: 0, borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>⚠️ My Concerns</h3>
        <button 
          style={{ 
            background: currentColors.danger, 
            color: '#fff', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 8, 
            cursor: 'pointer', 
            fontWeight: 600 
          }}
          onClick={() => navigate('/report-user')}
        >
          + Raise New Concern
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.primary }}>{userConcerns.length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Total Concerns</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.warning }}>{userConcerns.filter(concern => concern.status === 'pending').length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Pending</div>
        </div>
        <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentColors.success }}>{userConcerns.filter(concern => concern.status === 'resolved').length}</div>
          <div style={{ fontSize: '0.9rem', color: currentColors.textSecondary }}>Resolved</div>
        </div>
      </div>

      {/* Concerns List */}
      {isLoadingConcerns ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: currentColors.textSecondary }}>
          Loading your concerns...
        </div>
      ) : userConcerns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h4 style={{ color: currentColors.text, marginBottom: '0.5rem' }}>No concerns submitted</h4>
          <p style={{ color: currentColors.textSecondary, marginBottom: '1rem' }}>Raise concerns about users, items, or community issues</p>
          <button 
            style={{ 
              background: currentColors.danger, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600 
            }}
            onClick={() => navigate('/report-user')}
          >
            Raise Your First Concern
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {userConcerns.map((concern) => (
            <div key={concern.id} style={{ 
              background: currentColors.cardBackground, 
              padding: '1.5rem', 
              borderRadius: 12, 
              boxShadow: `0 2px 8px ${currentColors.shadow}`,
              border: `1px solid ${currentColors.border}`
            }}>
              {editingConcern && editingConcern.id === concern.id ? (
                // Edit mode
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>User in Question</label>
                      <input
                        type="text"
                        value={editingConcern.editedUserInQuestion}
                        onChange={(e) => setEditingConcern({...editingConcern, editedUserInQuestion: e.target.value})}
                        placeholder="Username or contact info"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Item Involved</label>
                      <input
                        type="text"
                        value={editingConcern.editedItemInvolved}
                        onChange={(e) => setEditingConcern({...editingConcern, editedItemInvolved: e.target.value})}
                        placeholder="Item name or listing title"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Description *</label>
                    <textarea
                      value={editingConcern.editedDescription}
                      onChange={(e) => setEditingConcern({...editingConcern, editedDescription: e.target.value})}
                      rows="4"
                      placeholder="Describe the issue in detail..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: 6,
                        background: currentColors.background,
                        color: currentColors.text,
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Urgency Level *</label>
                      <select
                        value={editingConcern.editedUrgency}
                        onChange={(e) => setEditingConcern({...editingConcern, editedUrgency: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="low">Low - General concern</option>
                        <option value="medium">Medium - Ongoing issue</option>
                        <option value="high">High - Immediate threat/fraud</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: currentColors.text, fontWeight: 500 }}>Contact Method</label>
                      <select
                        value={editingConcern.editedContactMethod}
                        onChange={(e) => setEditingConcern({...editingConcern, editedContactMethod: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: `1px solid ${currentColors.border}`,
                          borderRadius: 6,
                          background: currentColors.background,
                          color: currentColors.text,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="">Select method</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="in-app">In-app notification</option>
                        <option value="no-contact">No contact needed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                      style={{ 
                        background: currentColors.textSecondary, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={handleCancelEditConcern}
                    >
                      Cancel
                    </button>
                    <button 
                      style={{ 
                        background: currentColors.success, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={handleSaveConcern}
                      disabled={concernLoading}
                    >
                      {concernLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: concern.status === 'resolved' ? currentColors.success : 
                                   concern.status === 'reviewing' ? currentColors.info :
                                   concern.status === 'dismissed' ? currentColors.textSecondary : currentColors.warning,
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {concern.status}
                      </span>
                      <span style={{
                        background: concern.urgency === 'high' ? currentColors.danger : 
                                   concern.urgency === 'medium' ? currentColors.warning : currentColors.info,
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {concern.urgency.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    {/* Concern Type */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: currentColors.primary, fontWeight: 'bold', fontSize: '1rem' }}>
                        {concern.concern_type === 'user' ? '👤 User Concern' :
                         concern.concern_type === 'item' ? '📦 Item Concern' :
                         concern.concern_type === 'fraud' ? '🚨 Fraud Report' :
                         concern.concern_type === 'harassment' ? '⚠️ Harassment Report' :
                         concern.concern_type === 'spam' ? '📢 Spam Report' : '❓ Other Concern'}
                      </span>
                    </div>

                    {/* Details */}
                    {concern.user_in_question && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: currentColors.textSecondary, fontSize: '0.9rem' }}>
                          <strong>User:</strong> {concern.user_in_question}
                        </span>
                      </div>
                    )}
                    
                    {concern.item_involved && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: currentColors.textSecondary, fontSize: '0.9rem' }}>
                          <strong>Item:</strong> {concern.item_involved}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ color: currentColors.text, fontSize: '1rem', lineHeight: 1.5 }}>
                        {concern.description.length > 150 ? 
                          `${concern.description.substring(0, 150)}...` : 
                          concern.description
                        }
                      </div>
                    </div>

                    {/* Metadata */}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: currentColors.textSecondary }}>
                      <span>📅 Created: {new Date(concern.created_at).toLocaleDateString()}</span>
                      {concern.resolved_at && (
                        <span>✅ Resolved: {new Date(concern.resolved_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    {concern.status !== 'resolved' && (
                      <button 
                        style={{ 
                          background: currentColors.info, 
                          color: '#fff', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: 6, 
                          cursor: 'pointer', 
                          fontSize: '0.8rem' 
                        }}
                        onClick={() => handleEditConcern(concern)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    <button 
                      style={{ 
                        background: currentColors.danger, 
                        color: '#fff', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        cursor: 'pointer', 
                        fontSize: '0.8rem' 
                      }}
                      onClick={() => handleDeleteConcern(concern.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileSection = () => (
    <div>
      <h3 style={{ color: currentColors.text, marginBottom: '1.5rem', borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>👤 Profile & Settings</h3>
      
      {/* Update Message */}
      {updateMessage && (
        <div style={{ 
          background: updateMessage.includes('success') ? currentColors.success + '20' : currentColors.error + '20',
          color: updateMessage.includes('success') ? currentColors.success : currentColors.error,
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: '1.5rem',
          border: `1px solid ${updateMessage.includes('success') ? currentColors.success : currentColors.error}`
        }}>
          {updateMessage}
        </div>
      )}

      {!isEditing ? (
        /* View Mode */
        <div>
          {/* Basic Info Display */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Full Name</label>
            <div style={{ ...inputStyle, background: currentColors.background, cursor: 'default' }}>{user?.name || 'Not set'}</div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Email</label>
            <div style={{ ...inputStyle, background: currentColors.background, cursor: 'default' }}>{user?.email || 'Not set'}</div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Contact Number</label>
            <div style={{ ...inputStyle, background: currentColors.background, cursor: 'default' }}>{user?.phone || 'Not set'}</div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>About Me</label>
            <div style={{ ...inputStyle, background: currentColors.background, cursor: 'default', minHeight: 80, whiteSpace: 'pre-wrap' }}>
              {user?.bio || 'No bio added yet'}
            </div>
          </div>

          <button 
            onClick={handleEditProfile}
            style={{ 
              background: currentColors.primary, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontWeight: 600,
              marginRight: '1rem'
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      ) : (
        /* Edit Mode */
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Full Name *</label>
            <input 
              type="text" 
              name="name"
              value={editFormData.name || ''} 
              onChange={handleInputChange}
              style={inputStyle} 
              placeholder="Enter your full name"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Email *</label>
            <input 
              type="email" 
              name="email"
              value={editFormData.email || ''} 
              onChange={handleInputChange}
              style={inputStyle} 
              placeholder="Enter your email address"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Contact Number *</label>
            <input 
              type="tel" 
              name="phone"
              value={editFormData.phone || ''}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>About Me (Optional)</label>
            <textarea 
              name="bio"
              value={editFormData.bio || ''} 
              onChange={handleInputChange}
              style={{ ...inputStyle, height: 80, resize: 'vertical' }} 
              placeholder="Tell others about yourself..." 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleUpdateProfile}
              disabled={updateLoading}
              style={{ 
                background: updateLoading ? currentColors.textSecondary : currentColors.success, 
                color: '#fff', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: 8, 
                cursor: updateLoading ? 'not-allowed' : 'pointer', 
                fontWeight: 600 
              }}
            >
              {updateLoading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            
            <button 
              onClick={handleCancelEdit}
              disabled={updateLoading}
              style={{ 
                background: 'transparent', 
                color: currentColors.textSecondary, 
                border: `1px solid ${currentColors.textSecondary}`, 
                padding: '12px 24px', 
                borderRadius: 8, 
                cursor: updateLoading ? 'not-allowed' : 'pointer', 
                fontWeight: 600 
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderVerificationSection = () => (
    <div>
      <h3 style={{ color: currentColors.text, marginBottom: '1.5rem', borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>🛡️ Verification & Trust</h3>
      
      <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: currentColors.text }}>College Email Verification</span>
          {user.isVerified ? (
            <span style={{ color: currentColors.success, display: 'flex', alignItems: 'center', gap: 4 }}>
              Verified
            </span>
          ) : (
            <button style={{ background: '#ffc107', color: '#000', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>
              Verify Now
            </button>
          )}
        </div>
        <small style={{ color: '#666' }}>Verified users get priority in search results and build more trust</small>
      </div>

      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500 }}>ID Card Upload (Optional)</span>
          <button style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>
            Upload ID
          </button>
        </div>
        <small style={{ color: '#666' }}>Upload student ID for extra trust badge</small>
      </div>

      <div style={{ background: '#e8f4f8', padding: '1rem', borderRadius: 8 }}>
        <h4 style={{ color: '#007bff', marginBottom: 8 }}>🏆 Your Achievements</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {user.achievements.map((badge, index) => (
            <span key={index} style={{ background: '#007bff', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div>
      <h3 style={{ color: currentColors.text, marginBottom: '1.5rem', borderBottom: `2px solid ${currentColors.primary}`, paddingBottom: '0.5rem' }}>⚙️ Account Preferences</h3>
      
      {/* Password Message */}
      {passwordMessage && (
        <div style={{ 
          background: passwordMessage.includes('successfully') ? currentColors.success + '20' : '#ff000020',
          color: passwordMessage.includes('successfully') ? currentColors.success : '#ff0000',
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: '1.5rem',
          border: `1px solid ${passwordMessage.includes('successfully') ? currentColors.success : '#ff0000'}`,
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {passwordMessage}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: currentColors.text, marginBottom: 12 }}>Password & Security</h4>
        
        {!showChangePassword ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              style={{ background: currentColors.info, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
            <button 
              style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div style={{ background: currentColors.cardBackground, padding: '1.5rem', borderRadius: 8, border: `1px solid ${currentColors.border}` }}>
            <h5 style={{ color: currentColors.text, marginBottom: '1rem' }}>Change Password</h5>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Current Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={passwordVisibility.oldPassword ? 'text' : 'password'} 
                  name="oldPassword"
                  value={passwordData.oldPassword} 
                  onChange={handlePasswordChange}
                  style={inputStyle} 
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, oldPassword: !prev.oldPassword }))}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {passwordVisibility.oldPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={passwordVisibility.newPassword ? 'text' : 'password'} 
                  name="newPassword"
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange}
                  style={inputStyle} 
                  placeholder="Enter new password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {passwordVisibility.newPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: currentColors.text }}>Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={passwordVisibility.confirmPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange}
                  style={inputStyle} 
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {passwordVisibility.confirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleChangePassword}
                disabled={passwordLoading}
                style={{ 
                  background: passwordLoading ? currentColors.textSecondary : currentColors.success, 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {passwordLoading ? '⏳ Changing...' : '✅ Change Password'}
              </button>
              
              <button 
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordVisibility({ oldPassword: false, newPassword: false, confirmPassword: false });
                  setPasswordMessage('');
                }}
                disabled={passwordLoading}
                style={{ 
                  background: 'transparent', 
                  color: currentColors.textSecondary, 
                  border: `1px solid ${currentColors.textSecondary}`, 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: currentColors.text, marginBottom: 12 }}>Linked Accounts</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: currentColors.highlight, borderRadius: 6 }}>
            <span style={{ color: currentColors.text }}>🔗 Google Account</span>
            <button style={{ background: '#28a745', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
              Connected
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: currentColors.highlight, borderRadius: 6 }}>
            <span style={{ color: currentColors.text }}>🎓 College SSO</span>
            <button style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
              Connect
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: currentColors.highlight, padding: '1rem', borderRadius: 8 }}>
        <h4 style={{ color: currentColors.warning, marginBottom: 8 }}>🕐 Activity Log</h4>
        <div style={{ fontSize: 14, color: currentColors.textSecondary }}>
          <div>Last login: {user.lastLogin}</div>
          <div>Devices: Desktop (Current), Mobile App</div>
          <div>Recent activity: Posted 2 items, 5 messages sent</div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div>
      <h3 style={{ color: '#333', marginBottom: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🔔 Notifications</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: '#555', marginBottom: 12 }}>Alert Preferences</h4>
        
        {Object.entries({
          newMessages: 'New Messages',
          listingViews: 'Listing Views/Offers',
          lostFound: 'Lost & Found Updates',
          quietHours: 'Quiet Hours (Mute during classes/night)'
        }).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span>{label}</span>
            <div
              style={{
                ...toggleStyle,
                background: notifications[key] ? '#007bff' : '#ccc'
              }}
              onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: notifications[key] ? 22 : 2,
                transition: 'left 0.2s'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#e8f4f8', padding: '1rem', borderRadius: 8 }}>
        <h4 style={{ color: '#007bff', marginBottom: 8 }}>📱 Notification Methods</h4>
        <div style={{ fontSize: 14, color: '#666' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input type="checkbox" defaultChecked />
            Email notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input type="checkbox" defaultChecked />
            Push notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" />
            SMS alerts (premium)
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div>
      <h3 style={{ color: '#333', marginBottom: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🔒 Privacy Controls</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
          <span>Show phone number publicly</span>
          <div
            style={{
              ...toggleStyle,
              background: privacy.showPhone ? '#007bff' : '#ccc'
            }}
            onClick={() => setPrivacy(prev => ({ ...prev, showPhone: !prev.showPhone }))}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: privacy.showPhone ? 22 : 2,
              transition: 'left 0.2s'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
          <span>Show only verified email</span>
          <div
            style={{
              ...toggleStyle,
              background: privacy.verifiedEmailOnly ? '#007bff' : '#ccc'
            }}
            onClick={() => setPrivacy(prev => ({ ...prev, verifiedEmailOnly: !prev.verifiedEmailOnly }))}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: privacy.verifiedEmailOnly ? 22 : 2,
              transition: 'left 0.2s'
            }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Who can message me:</label>
        <select 
          value={privacy.messagesFrom}
          onChange={(e) => setPrivacy(prev => ({ ...prev, messagesFrom: e.target.value }))}
          style={inputStyle}
        >
          <option value="anyone">Anyone</option>
          <option value="verified">Only verified users</option>
          <option value="listings">Only on my listings</option>
        </select>
      </div>
    </div>
  );

  const renderCommunitySection = () => (
    <div>
      <h3 style={{ color: '#333', marginBottom: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🌍 Community & Support</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: '#555', marginBottom: 12 }}>📚 Help & Information</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            📋 Campus Exchange Rules & Guidelines
          </button>
          <button style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            ❓ Frequently Asked Questions
          </button>
          <button style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            💡 How to List Items & Contact Sellers
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: '#555', marginBottom: 12 }}>🚨 Issue Reporting</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ background: '#fff3cd', border: '1px solid #ffeaa7', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            👤 Report a User (fraud, spam, harassment)
          </button>
          <button style={{ background: '#fff3cd', border: '1px solid #ffeaa7', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
            📦 Report a Listing (misleading, unsafe item)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: '#555', marginBottom: 12 }}>🆘 Support Options</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: 6, cursor: 'pointer' }}>
            📧 Contact Form for Issues
          </button>
          <button style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: 6, cursor: 'pointer' }}>
            🚨 Emergency - Escalate to Admin
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'profile': return renderProfileSection();
      case 'items': return renderMyItemsSection();
      case 'donated': return renderDonatedItemsSection();
      case 'lostfound': return renderLostFoundSection();
      case 'concerns': return renderConcernsSection();
      case 'verification': return renderVerificationSection();
      case 'account': return renderAccountSection();
      case 'notifications': return renderNotificationsSection();
      case 'privacy': return renderPrivacySection();
      case 'community': return renderCommunitySection();
      default: return renderProfileSection();
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: currentColors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: currentColors.text }}>Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', background: currentColors.background, padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1rem' }}>
          <button 
            onClick={() => navigate('/explore')}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: currentColors.primary }}
          >
            ←
          </button>
          <h1 style={{ color: currentColors.primary, margin: 0, fontWeight: 700 }}>Dashboard</h1>
        </div>
        
        {/* User Info Bar */}
        <div style={{ background: currentColors.cardBackground, padding: '1rem', borderRadius: 12, boxShadow: `0 2px 8px ${currentColors.shadow}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: currentColors.text }}>{user?.name}</h3>
            <div style={{ color: currentColors.textSecondary, fontSize: 14 }}>{user?.email}</div>
          </div>
          {user?.isVerified && <span style={{ color: currentColors.success, fontSize: 20 }}></span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <span style={{ background: currentColors.primary, color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem' }}>
              {user?.role || 'USER'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div style={{ background: currentColors.cardBackground, padding: '1.5rem', borderRadius: 12, boxShadow: `0 2px 8px ${currentColors.shadow}`, height: 'fit-content' }}>
          <h4 style={{ color: currentColors.text, marginBottom: '1rem' }}>Settings Menu</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sectionButton('profile', 'Profile & Settings', '👤')}
            {sectionButton('items', 'My Items', '📦')}
            {sectionButton('donated', 'Donated Items', '❤️')}
            {sectionButton('lostfound', 'Lost & Found', '🔍')}
            {sectionButton('concerns', 'My Concerns', '⚠️')}
            {sectionButton('verification', 'Verification & Trust', '🛡️')}
            {sectionButton('account', 'Account Preferences', '⚙️')}
            {sectionButton('notifications', 'Notifications', '🔔')}
            {sectionButton('privacy', 'Privacy Controls', '🔒')}
            {sectionButton('community', 'Community & Support', '🌍')}
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '1.5rem', padding: '12px 0', borderTop: `1px solid ${currentColors.border}` }}>
            <h5 style={{ color: currentColors.text, marginBottom: '12px', fontSize: 14, fontWeight: 600 }}>Quick Actions</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                style={{ background: currentColors.primary, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                onClick={() => navigate('/explore')}
              >
                🏠 Back to Home
              </button>
              <button 
                style={{ background: currentColors.success, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                onClick={() => navigate('/post-item')}
              >
                ➕ Post Item
              </button>
              <button 
                style={{ background: currentColors.warning, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                onClick={() => navigate('/lost-found')}
              >
                🔍 Lost & Found
              </button>
              <button 
                style={{ background: currentColors.danger, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ background: currentColors.cardBackground, padding: '2rem', borderRadius: 12, boxShadow: `0 2px 8px ${currentColors.shadow}` }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
