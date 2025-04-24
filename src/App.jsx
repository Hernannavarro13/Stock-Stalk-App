import React, { useState, useEffect } from 'react';
import './App.css';
import StockSearch from './components/StockSearch';
import WatchList from './components/WatchList';
import StockDetails from './components/StockDetails';
import { getStockDetails } from './api/stocksApi';

function App() {
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });
  const [selectedStock, setSelectedStock] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Auto-refresh watchlist stocks every 60 seconds (when market is open)
  useEffect(() => {
    // Clear any existing timer
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    // Only start refresh timer if we have stocks in the watchlist
    if (watchlist.length > 0) {
      const timer = setInterval(async () => {
        // Check if market is likely open (Mon-Fri, 9:30 AM - 4:00 PM ET)
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const isWeekday = day > 0 && day < 6;
        const isMarketHours = hour >= 9 && hour < 16; // Simplified check
        
        // Only refresh during likely market hours to reduce API calls
        if (isWeekday && isMarketHours) {
          refreshWatchlistData();
        }
      }, 60000); // 60 seconds
      
      setRefreshTimer(timer);
      
      // Clean up on unmount
      return () => clearInterval(timer);
    }
  }, [watchlist]);

  const refreshWatchlistData = async () => {
    const updatedWatchlist = [...watchlist];
    
    for (let i = 0; i < updatedWatchlist.length; i++) {
      try {
        const stockData = await getStockDetails(updatedWatchlist[i].id);
        updatedWatchlist[i] = {
          ...updatedWatchlist[i],
          last_price: stockData.last_price
        };
        
        // Also update selected stock if it's the one we're refreshing
        if (selectedStock && selectedStock.id === updatedWatchlist[i].id) {
          setSelectedStock(stockData);
        }
      } catch (error) {
        console.error(`Failed to refresh ${updatedWatchlist[i].symbol}:`, error);
      }
    }
    
    setWatchlist(updatedWatchlist);
  };

  const addToWatchlist = (stock) => {
    if (!watchlist.some(item => item.symbol === stock.symbol)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
    if (selectedStock && selectedStock.symbol === symbol) {
      setSelectedStock(null);
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Stock Watchlist</h1>
          <button 
            onClick={refreshWatchlistData}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Refresh Data
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <StockSearch onAddStock={addToWatchlist} />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <WatchList 
                watchlist={watchlist} 
                onRemove={removeFromWatchlist}
                onSelect={handleStockSelect}
                selectedSymbol={selectedStock?.symbol}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              {selectedStock ? (
                <StockDetails stock={selectedStock} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>Select a stock to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;