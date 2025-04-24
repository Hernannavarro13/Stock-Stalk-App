import React, { useState } from 'react';
import { searchStocks } from '../api/stocksApi';

function StockSearch({ onAddStock }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchStocks(query);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError("No stocks found for your query. Try another symbol.");
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setError("Failed to search for stocks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Search Stocks</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
            className="flex-grow p-2 border border-gray-300 rounded-l"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {loading && <p className="text-center py-4">Loading...</p>}
      
      {error && <p className="text-center text-red-500 py-2">{error}</p>}
      
      {searchResults.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Results:</h3>
          <ul className="divide-y">
            {searchResults.map(stock => (
              <li key={stock.symbol} className="py-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">${stock.last_price ? parseFloat(stock.last_price).toFixed(2) : 'N/A'}</span>
                    <button 
                      onClick={() => onAddStock(stock)}
                      className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StockSearch;
