import React from 'react';
import { formatNumber, formatPercent } from '../utils/formatters';

const WatchList = ({ watchlist, onRemove, onSelect, selectedSymbol }) => {
  if (watchlist.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Your watchlist is empty</p>
        <p className="text-sm mt-2">Use the search above to add stocks</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
      <div className="divide-y">
        {watchlist.map((stock) => {
          const priceChange = stock.priceChange || 0;
          const isPriceUp = priceChange >= 0;
          const isSelected = stock.symbol === selectedSymbol;

          return (
            <div
              key={stock.symbol}
              className={`p-4 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(stock)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-gray-600">{stock.name}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(stock.symbol);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between items-baseline">
                <div className="text-lg font-medium">
                  ${formatNumber(stock.last_price)}
                </div>
                <div
                  className={`text-sm ${
                    isPriceUp ? 'stock-up' : 'stock-down'
                  }`}
                >
                  {isPriceUp ? '↑' : '↓'} {formatPercent(stock.percentChange)}
                </div>
              </div>

              {stock.predicted_price && (
                <div className="mt-2 text-sm text-gray-600">
                  Predicted: ${formatNumber(stock.predicted_price)}
                  <span className="ml-2">
                    (Accuracy: {formatPercent(stock.model_accuracy)})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WatchList;