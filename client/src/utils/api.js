/**
 * API utility functions for making requests to the server
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://readmegeneratorbackend.vercel.app/api';

/**
 * Make a POST request to the API
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {object} data - The data to send in the request body
 * @returns {Promise<object>} - The response data
 */
export async function postRequest(endpoint, data) {
  try {
    // console.log(`Making POST request to ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    // console.log(`Received response from ${endpoint}:`, responseData);

    if (!response.ok) {
      // Extract the most specific error message available
      const errorMessage = responseData.error || 
                          responseData.message || 
                          `Server returned ${response.status}: ${response.statusText}`;
      
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    
    // Check if it's a network error (server not available)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(
        'Cannot connect to the server. Please try again later.'
      );
    }
    
    // Pass through the specific error message
    throw error;
  }
}

/**
 * Check if the server is available
 * @returns {Promise<boolean>} - True if the server is available
 */
export async function checkServerAvailability() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`, { 
      method: 'GET',
      // Set a timeout of 2 seconds
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
