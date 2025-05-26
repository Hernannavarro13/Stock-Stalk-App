import React, { useState, useEffect } from 'react';
import { getStockDetails } from '../api/stocksApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber, formatDate, formatPercent } from '../utils/formatters';

const StockDetails = ({ stock, onPredictPrice }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStockData() {
      if (!stock || !stock.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getStockDetails(stock.id);
        setStockData(data);
      } catch (err) {
        console.error('Error fetching stock details:', err);
        setError('Failed to load stock details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStockData();
  }, [stock]);
  
  if (loading) {
    return <div className="flex justify-center py-12">Loading stock details...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center py-12">{error}</div>;
  }
  
  if (!stockData) {
    return <div className="text-center py-12">Select a stock to view details</div>;
  }

  const priceChange = stockData.priceChange || 0;
  const isPriceUp = priceChange >= 0;
  const predictionAge = stockData.prediction_date ? 
    Math.round((new Date() - new Date(stockData.prediction_date)) / (1000 * 60)) : null;

  // Format chart data
  const chartData = stockData.price_history ? stockData.price_history.map(item => ({
    date: item.date,
    price: parseFloat(item.close_price)
  })) : [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{stockData.name}</h2>
          <p className="text-gray-600">{stockData.symbol}</p>
        </div>
        <button
          onClick={onPredictPrice}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Prediction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Current Price</h3>
          <div className="space-y-2">
            <p className="text-3xl font-bold">
              ${formatNumber(stockData.last_price)}
              <span className={`ml-2 text-sm ${isPriceUp ? 'stock-up' : 'stock-down'}`}>
                {isPriceUp ? '↑' : '↓'} {formatPercent(stockData.percentChange)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Day Range: ${formatNumber(stockData.dayLow)} - ${formatNumber(stockData.dayHigh)}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Price Prediction</h3>
          {stockData.predicted_price ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold">
                ${formatNumber(stockData.predicted_price)}
                <span className="text-sm text-gray-600 ml-2">
                  {predictionAge < 60 ? `${predictionAge}m ago` : 'Needs update'}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Model Accuracy: {formatPercent(stockData.model_accuracy)}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Click "Update Prediction" to generate a price prediction</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Market Cap</h3>
          <p className="text-xl">${formatNumber(stockData.marketCap, true)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">P/E Ratio</h3>
          <p className="text-xl">{stockData.peRatio ? formatNumber(stockData.peRatio) : 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Volume</h3>
          <p className="text-xl">{formatNumber(stockData.volume)}</p>
        </div>
      </div>

      {stockData.price_history && stockData.price_history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Price History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Open</th>
                  <th className="px-4 py-2 text-right">High</th>
                  <th className="px-4 py-2 text-right">Low</th>
                  <th className="px-4 py-2 text-right">Close</th>
                  <th className="px-4 py-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {stockData.price_history.map((price) => (
                  <tr key={price.date} className="border-t">
                    <td className="px-4 py-2">{formatDate(price.date)}</td>
                    <td className="px-4 py-2 text-right">${formatNumber(price.open_price)}</td>
                    <td className="px-4 py-2 text-right">${formatNumber(price.high_price)}</td>
                    <td className="px-4 py-2 text-right">${formatNumber(price.low_price)}</td>
                    <td className="px-4 py-2 text-right">${formatNumber(price.close_price)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(price.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format large numbers (like market cap)
function formatLargeNumber(num) {
  if (!num) return 'N/A';
  
  num = parseFloat(num);
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export default StockDetails;