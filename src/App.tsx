import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, MapPin } from 'lucide-react';
import { generateHistoricalData, generatePredictions } from './utils/arimaSimulation';
import { REGIONS, getBasePrice } from './utils/constants';
import PriceChart from './components/PriceChart';

function App() {
  const [cropName, setCropName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Maharashtra');
  const [basePrice, setBasePrice] = useState(2000); // Base price in rupees
  const [historicalDates, setHistoricalDates] = useState<string[]>([]);
  const [historicalPrices, setHistoricalPrices] = useState<number[]>([]);
  const [predictions, setPredictions] = useState<number[]>([]);

  useEffect(() => {
    if (!cropName) return;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // Start from 60 days ago
    
    const regionalMultiplier = getBasePrice(selectedRegion);
    const adjustedBasePrice = Math.round(basePrice * regionalMultiplier);
    
    const { dates, prices } = generateHistoricalData(
      startDate,
      60,
      adjustedBasePrice,
      selectedRegion
    );
    
    const predictedPrices = generatePredictions(prices, 90); // 90 days prediction
    
    setHistoricalDates(dates);
    setHistoricalPrices(prices);
    setPredictions(predictedPrices);
  }, [cropName, selectedRegion, basePrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const priceInput = form.elements.namedItem('basePrice') as HTMLInputElement;
    const newBasePrice = parseInt(priceInput.value, 10);
    setBasePrice(newBasePrice);
  };

  // Calculate price changes for insights
  const getInsights = () => {
    if (!predictions.length || !historicalPrices.length) return null;

    const currentPrice = historicalPrices[historicalPrices.length - 1];
    const oneMonthPrice = predictions[29];
    const twoMonthPrice = predictions[59];
    const threeMonthPrice = predictions[89];

    const getChangePercent = (newPrice: number, oldPrice: number) => {
      return ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
    };

    return {
      oneMonth: {
        price: oneMonthPrice,
        change: getChangePercent(oneMonthPrice, currentPrice)
      },
      twoMonth: {
        price: twoMonthPrice,
        change: getChangePercent(twoMonthPrice, currentPrice)
      },
      threeMonth: {
        price: threeMonthPrice,
        change: getChangePercent(threeMonthPrice, currentPrice)
      }
    };
  };

  const insights = getInsights();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Sprout className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Indian Crop Price Prediction
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label htmlFor="cropName" className="block text-sm font-medium text-gray-700">
                Crop Name
              </label>
              <input
                type="text"
                id="cropName"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Enter crop name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 ">
              <label htmlFor="basePrice" className=" text-sm font-medium text-gray-700">
                Base Price (₹/quintal)
              </label>
              <input
                type="number"
                id="basePrice"
                defaultValue={basePrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Enter base price"
                min="1"
                required
              />
              
            </div>
            <div className="md:mt-8">
              <button
                type="submit"
                className="w-full md:w-auto px-14 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Update Prediction
              </button>
            </div>

            
          </form>

          {cropName && insights && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Price Trends & Predictions for {cropName}
                </h2>
                <div className="flex items-center gap-1 ml-4 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedRegion}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { period: '1 Month', data: insights.oneMonth },
                  { period: '2 Months', data: insights.twoMonth },
                  { period: '3 Months', data: insights.threeMonth }
                ].map((forecast) => (
                  <div key={forecast.period} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600">{forecast.period} Forecast</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{forecast.data.price.toLocaleString()}
                      </span>
                      <span className={`ml-2 text-sm ${
                        parseFloat(forecast.data.change) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {forecast.data.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* <PriceChart
                dates={historicalDates}
                prices={historicalPrices}
                predictions={predictions}
              /> */}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Market Insights
                </h3>
                <p className="text-gray-600">
                  Based on our ARIMA model analysis, {cropName.toLowerCase()} prices in {selectedRegion} are expected to 
                  {parseFloat(insights.threeMonth.change) >= 0 ? ' increase ' : ' decrease '}
                  over the next three months. The model predicts a price of ₹{insights.threeMonth.price.toLocaleString()}/quintal 
                  by the end of this period, representing a {Math.abs(parseFloat(insights.threeMonth.change))}% 
                  {parseFloat(insights.threeMonth.change) >= 0 ? ' rise' : ' decline'} from current prices.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;