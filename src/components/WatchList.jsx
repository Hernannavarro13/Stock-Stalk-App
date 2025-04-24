import React from 'react';

function WatchList({ watchlist, onRemove, onSelect, selectedSymbol }) {
  if (watchlist.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">My Watchlist</h2>
        <p className="text-gray-500 text-center py-4">No stocks in watchlist</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Watchlist</h2>
      <ul className="divide-y">
        {watchlist.map(stock => (
          <li 
            key={stock.symbol} 
            className={`py-3 cursor-pointer ${stock.symbol === selectedSymbol ? 'bg-blue-50' : ''}`}
            onClick={() => onSelect(stock)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.name}</div>
              </div>
              <div className="flex items-center">
                <span className="font-medium">
                  ${stock.last_price ? parseFloat(stock.last_price).toFixed(2) : 'N/A'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(stock.symbol);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WatchList;