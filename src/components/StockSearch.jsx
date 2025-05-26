import React, { useState } from 'react';
import { searchStocks } from '../api/stocksApi';

const StockSearch = ({ onAddStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchStocks(query);
      setResults(searchResults);
    } catch (err) {
      console.error('Error searching stocks:', err);
      setError('Failed to search stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (stock) => {
    onAddStock(stock);
    setResults([]);
    setQuery('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {results.length > 0 && (
        <div className="border rounded divide-y">
          {results.map((stock) => (
            <div
              key={stock.symbol}
              className="p-3 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.name}</div>
              </div>
              <button
                onClick={() => handleAddStock(stock)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          No stocks found matching "{query}"
        </div>
      )}
    </div>
  );
};

export default StockSearch;
