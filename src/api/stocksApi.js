const API_BASE_URL = '/api';

export const searchStocks = async (query) => {
  const response = await fetch(`${API_BASE_URL}/stocks/search/?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search stocks');
  }
  return response.json();
};

export const getStockDetails = async (stockId) => {
  const response = await fetch(`${API_BASE_URL}/stocks/${stockId}/details/`);
  if (!response.ok) {
    throw new Error('Failed to fetch stock details');
  }
  return response.json();
};

export const predictStockPrice = async (stockId) => {
  const response = await fetch(`${API_BASE_URL}/stocks/${stockId}/predict_price/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to predict stock price');
  }
  return response.json();
};
