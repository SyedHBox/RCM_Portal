import axios from 'axios';
import { SearchFilters } from '../types/claim';
import { authService } from './authService';

// Make sure this URL matches your backend server address and port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('Using API base URL:', API_BASE_URL);

// Configure axios defaults for better reliability
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add a request interceptor to attach the authentication token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding auth token to request:', `Bearer ${token.substring(0, 10)}...`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetch claims from the API with optional filters
 */
export const fetchClaims = async (filters?: SearchFilters) => {
  try {
    // Build query parameters based on filters
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.patientId) {
        params.patient_id = filters.patientId;
      }
      if (filters.cptId) {
        params.cpt_id = filters.cptId;
      }
      if (filters.dos) {
        params.service_end = filters.dos; // Changed from service_start to service_end
      }
    }
    
    console.log('Fetching claims with params:', params);
    const response = await axios.get(`${API_BASE_URL}/claims`, { params });
    console.log('Claims API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching claims:', error);
    return { 
      success: false, 
      error: 'Failed to fetch claims', 
      message: error.message || 'Network error',
      data: []
    };
  }
};

/**
 * Get a single claim by ID
 */
export const fetchClaimById = async (id: string) => {
  try {
    console.log(`Fetching claim with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/claims/${id}`);
    console.log(`Claim ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching claim with ID ${id}:`, error);
    return { 
      success: false, 
      error: `Failed to fetch claim with ID ${id}`, 
      message: error.message || 'Network error',
      data: null
    };
  }
};

/**
 * Format date values to YYYY-MM-DD format required by the backend
 */
const formatDateValue = (value: any): any => {
  if (!value) return value;
  
  // Check if it's already a string in ISO format
  if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Already in YYYY-MM-DD format
      return value;
    }
    
    try {
      // Try to parse as date and format
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Failed to format date value:', value);
    }
  }
  
  return value;
};

/**
 * Update a claim with enhanced error handling and retry mechanism
 */
export const updateClaim = async (id: string, data: any, retries = 1): Promise<any> => {
  try {
    console.log(`Updating claim with ID: ${id}`, data);
    
    // Ensure the data has the correct format expected by the API
    const sanitizedData = { ...data };
    
    // Add current user information from auth service to ensure proper username in logs
    const currentUser = authService.getUserSync();
    if (currentUser) {
      sanitizedData.username = currentUser.name || 'Unknown User';
      sanitizedData.user_id = currentUser.id || '0';
    } else {
      // Fallback for when user data can't be obtained
      console.warn('Could not get current user info, using fallback values');
      sanitizedData.username = 'System User';
      sanitizedData.user_id = '0';
    }
    
    // Convert any numeric strings to actual numbers for fields that should be numbers
    const numericFields = [
      'charge_amt', 'allowed_amt', 'allowed_add_amt', 'allowed_exp_amt',
      'total_amt', 'charges_adj_amt', 'write_off_amt', 'bal_amt', 'reimb_pct',
      'prim_amt', 'prim_chk_amt', 'sec_amt', 'sec_chk_amt', 'pat_amt'
    ];
    
    numericFields.forEach(field => {
      if (field in sanitizedData && sanitizedData[field] !== undefined && sanitizedData[field] !== null) {
        if (typeof sanitizedData[field] === 'string' && sanitizedData[field].trim() !== '') {
          const numVal = parseFloat(sanitizedData[field]);
          if (!isNaN(numVal)) {
            sanitizedData[field] = numVal;
          }
        }
      }
    });
    
    // Clean up undefined and null values to prevent API errors
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        delete sanitizedData[key];
      }
    });
    
    console.log('Sending sanitized data to API:', sanitizedData);
    
    const token = authService.getToken();
    if (!token) {
      console.error('Authentication token is missing');
      return {
        success: false,
        message: 'Authentication token is missing. Please log in again.'
      };
    }
    
    // Set up the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/claims/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(sanitizedData),
        signal: controller.signal
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', result);
        // If we have retries left and it's a 5xx error (server error), retry
        if (retries > 0 && response.status >= 500 && response.status < 600) {
          console.log(`Retrying update for claim ${id}. Retries left: ${retries - 1}`);
          // Wait a bit before retrying to give the server a chance to recover
          await new Promise(r => setTimeout(r, 1000));
          return updateClaim(id, data, retries - 1);
        }
        
        throw new Error(result.message || `API Error: ${response.status}`);
      }
      
      console.log('Update successful:', result);
      return result;
    } catch (error) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);
      
      // If it's an abort error (timeout), retry if we have retries left
      if (error.name === 'AbortError' && retries > 0) {
        console.log(`Request timed out for claim ${id}. Retrying...`);
        // Wait a bit before retrying
        await new Promise(r => setTimeout(r, 1000));
        return updateClaim(id, data, retries - 1);
      }
      
      // If it's a network error and we have retries left, retry
      if (error.message && error.message.includes('Network') && retries > 0) {
        console.log(`Network error for claim ${id}. Retrying...`);
        // Wait a bit before retrying
        await new Promise(r => setTimeout(r, 1000));
        return updateClaim(id, data, retries - 1);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error in updateClaim service:', error);
    
    // Return a structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error updating claim',
      error: error
    };
  }
};

/**
 * Fetch history for a specific claim
 */
export const fetchClaimHistory = async (id: string) => {
  try {
    console.log(`Fetching history for claim with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/claims/${id}/history`);
    console.log(`History for claim ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching history for claim with ID ${id}:`, error);
    return { 
      success: false, 
      error: `Failed to fetch history for claim with ID ${id}`, 
      message: error.message || 'Network error',
      data: []
    };
  }
};

/**
 * Fetch all change history with optional filters
 */
export const fetchAllHistory = async (filters?: {
  user_id?: number;
  cpt_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params: Record<string, string | number> = {};
    
    if (filters) {
      if (filters.user_id) {
        params.user_id = filters.user_id;
      }
      if (filters.cpt_id) {
        params.cpt_id = filters.cpt_id;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.page) {
        params.page = filters.page;
      }
      if (filters.limit) {
        params.limit = filters.limit;
      }
    }
    
    console.log('Fetching change history with params:', params);
    const response = await axios.get(`${API_BASE_URL}/claims/history/all`, { params });
    console.log('History response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching change history:', error);
    return { 
      success: false, 
      error: 'Failed to fetch change history', 
      message: error.message || 'Network error',
      data: []
    };
  }
};