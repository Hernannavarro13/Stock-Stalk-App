export const formatNumber = (value, isLargeNumber = false) => {
  if (!value && value !== 0) return 'N/A';
  
  if (isLargeNumber) {
    const billion = 1000000000;
    const million = 1000000;
    const thousand = 1000;
    
    if (value >= billion) {
      return `${(value / billion).toFixed(2)}B`;
    } else if (value >= million) {
      return `${(value / million).toFixed(2)}M`;
    } else if (value >= thousand) {
      return `${(value / thousand).toFixed(2)}K`;
    }
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatPercent = (value) => {
  if (!value && value !== 0) return 'N/A';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  const formatted = (number * 100).toFixed(2);
  return `${formatted}%`;
}; 