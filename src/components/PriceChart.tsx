import React, { useState } from 'react';
import { Link as Line } from 'lucide-react';

interface PriceChartProps {
  dates: string[];
  prices: number[];
  predictions: number[];
}

const PriceChart: React.FC<PriceChartProps> = ({ dates, prices, predictions }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    price: number;
    date: string;
    isPrediction: boolean;
  } | null>(null);

  const allPrices = [...prices, ...predictions];
  const maxPrice = Math.max(...allPrices) * 1.1;
  const minPrice = Math.min(...allPrices) * 0.9;
  
  // Adjusted dimensions for better spacing
  const margin = { top: 40, right: 60, bottom: 60, left: 80 };
  const width = 800;
  const height = 400;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const getY = (price: number) => {
    return margin.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
  };
  
  const getX = (index: number, total: number) => {
    return margin.left + (index / (total - 1)) * chartWidth;
  };

  // Generate data points for both historical and prediction data
  const historicalPoints = prices.map((price, i) => ({
    x: getX(i, dates.length),
    y: getY(price),
    price,
    date: dates[i],
    isPrediction: false
  }));

  const predictionPoints = predictions.map((price, i) => ({
    x: getX(i + prices.length, dates.length + predictions.length),
    y: getY(price),
    price,
    date: new Date(dates[dates.length - 1])
      .addDays(i + 1)
      .toISOString()
      .split('T')[0],
    isPrediction: true
  }));
  
  const historicalPath = historicalPoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
    
  const predictionPath = predictionPoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Generate grid lines with more spacing
  const gridLines = [];
  const numGridLines = 6;
  for (let i = 0; i <= numGridLines; i++) {
    const y = margin.top + (i * (chartHeight / numGridLines));
    const price = Math.round(maxPrice - (i * ((maxPrice - minPrice) / numGridLines)));
    gridLines.push(
      <React.Fragment key={i}>
        <line
          x1={margin.left}
          y1={y}
          x2={width - margin.right}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4"
        />
        <text
          x={margin.left - 10}
          y={y + 4}
          textAnchor="end"
          className="text-sm fill-gray-600"
        >
          ₹{price.toLocaleString()}
        </text>
      </React.Fragment>
    );
  }

  // Generate date labels
  const dateLabels = [];
  const numDateLabels = 6;
  for (let i = 0; i <= numDateLabels; i++) {
    const x = margin.left + (i * (chartWidth / numDateLabels));
    const dateIndex = Math.floor((i * (dates.length - 1)) / numDateLabels);
    const date = dates[dateIndex];
    dateLabels.push(
      <text
        key={i}
        x={x}
        y={height - margin.bottom + 20}
        textAnchor="middle"
        className="text-sm fill-gray-600"
      >
        {date}
      </text>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Price Trends</h3>
        <p className="text-sm text-gray-600">Historical data and predictions based on ARIMA model</p>
      </div>
      
      <svg
        width={width}
        height={height}
        className="w-full"
        viewBox={`0 0 ${width} ${height}`}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {/* Grid */}
        {gridLines}
        {dateLabels}
        
        {/* Axes */}
        <line 
          x1={margin.left} 
          y1={margin.top} 
          x2={margin.left} 
          y2={height - margin.bottom} 
          stroke="#94a3b8" 
          strokeWidth="2" 
        />
        <line 
          x1={margin.left} 
          y1={height - margin.bottom} 
          x2={width - margin.right} 
          y2={height - margin.bottom} 
          stroke="#94a3b8" 
          strokeWidth="2" 
        />
        
        {/* Historical data line */}
        <path
          d={historicalPath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          className="transition-all duration-300 ease-in-out"
        />
        
        {/* Prediction line */}
        <path
          d={predictionPath}
          fill="none"
          stroke="#dc2626"
          strokeWidth="3"
          strokeDasharray="6"
          className="transition-all duration-300 ease-in-out"
        />

        {/* Data points - Historical */}
        {historicalPoints.map((point, i) => (
          <g key={`hist-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#2563eb"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:r-8"
              onMouseEnter={() => setHoveredPoint(point)}
            />
          </g>
        ))}

        {/* Data points - Predictions */}
        {predictionPoints.map((point, i) => (
          <g key={`pred-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#dc2626"
              className="cursor-pointer transition-all duration-300 ease-in-out hover:r-8"
              onMouseEnter={() => setHoveredPoint(point)}
            />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredPoint && (
          <g>
            <rect
              x={hoveredPoint.x - 80}
              y={hoveredPoint.y - 45}
              width="160"
              height="35"
              fill="rgba(0,0,0,0.8)"
              rx="6"
            />
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 22}
              textAnchor="middle"
              className="text-sm fill-white font-medium"
            >
              {hoveredPoint.date}
            </text>
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 8}
              textAnchor="middle"
              className="text-sm fill-white"
            >
              ₹{hoveredPoint.price.toLocaleString()}
            </text>
          </g>
        )}
        
        {/* Axis Labels */}
        <text 
          x={width / 2} 
          y={height - 10} 
          textAnchor="middle" 
          className="text-sm font-medium fill-gray-700"
        >
          Date
        </text>
        <text 
          x={-height / 2} 
          y={25} 
          textAnchor="middle" 
          transform={`rotate(-90)`}
          className="text-sm font-medium fill-gray-700"
        >
          Price (₹/quintal)
        </text>
      </svg>
      
      <div className="flex justify-center gap-8 mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-6 h-2 bg-blue-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Historical Data</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-2 bg-red-600 rounded-full border-dashed"></div>
          <span className="text-sm font-medium text-gray-700">Predicted Prices</span>
        </div>
      </div>
    </div>
  );
};

// Helper method to add days to Date
declare global {
  interface Date {
    addDays(days: number): Date;
  }
}

Date.prototype.addDays = function(days: number): Date {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export default PriceChart;