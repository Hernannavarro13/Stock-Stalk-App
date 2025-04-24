import React, { useState, useEffect } from 'react';
import { getStockDetails } from '../api/stocksApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockDetails({ stock }) {
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

  // Format price change as positive or negative
  const priceChange = stockData.priceChange ? parseFloat(stockData.priceChange).toFixed(2) : '0.00';
  const percentChange = stockData.percentChange ? (parseFloat(stockData.percentChange) * 100).toFixed(2) : '0.00';
  const changeColor = priceChange > 0 ? 'text-green-500' : priceChange < 0 ? 'text-red-500' : 'text-gray-500';
  
  // Format chart data
  const chartData = stockData.price_history ? stockData.price_history.map(item => ({
    date: item.date,
    price: parseFloat(item.close_price)
  })) : [];
  
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
          <p className="text-lg text-gray-700">{stockData.name}</p>
          {stockData.sector && (
            <p className="text-sm text-gray-500">{stockData.sector} • {stockData.industry || 'N/A'}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${parseFloat(stockData.last_price).toFixed(2)}</div>
          <div className={`${changeColor}`}>
            {priceChange > 0 ? '+' : ''}{priceChange} ({percentChange}%)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Market Cap</div>
          <div className="font-medium">
            {stockData.marketCap ? formatLargeNumber(stockData.marketCap) : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">P/E Ratio</div>
          <div className="font-medium">
            {stockData.peRatio ? parseFloat(stockData.peRatio).toFixed(2) : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Day Range</div>
          <div className="font-medium">
            {stockData.dayLow && stockData.dayHigh 
              ? `$${parseFloat(stockData.dayLow).toFixed(2)} - $${parseFloat(stockData.dayHigh).toFixed(2)}` 
              : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">52 Week Range</div>
          <div className="font-medium">
            {stockData.yearLow && stockData.yearHigh 
              ? `$${parseFloat(stockData.yearLow).toFixed(2)} - $${parseFloat(stockData.yearHigh).toFixed(2)}` 
              : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Volume</div>
          <div className="font-medium">
            {stockData.volume ? stockData.volume.toLocaleString() : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Avg. Volume</div>
          <div className="font-medium">
            {stockData.avgVolume ? stockData.avgVolume.toLocaleString() : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Dividend Yield</div>
          <div className="font-medium">
            {stockData.dividendYield 
              ? `${(parseFloat(stockData.dividendYield) * 100).toFixed(2)}%` 
              : 'N/A'}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Price History (30 Days)</h3>
        <div className="bg-gray-50 p-4 rounded h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    return `${date.getMonth()+1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(tick) => `$${tick}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  dot={false} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No historical data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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