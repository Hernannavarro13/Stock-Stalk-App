const API_BASE_URL = 'http://localhost:8000/api';

export const searchStocks = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/search/?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to search stocks');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
};

export const getStockDetails = async (stockId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${stockId}/details/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch stock details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock details:', error);
    throw error;
  }
};
