/**
 * Stock Data Loader
 * Loads real-time stock performance data from static JSON file
 * 
 * This file:
 * 1. Fetches stock-data.json (updated daily/weekly)
 * 2. Displays stock returns on the website
 * 3. Updates Top Performers section
 * 4. Uses caching to avoid repeated fetches
 */

let stockData = null;
let portfolioAllocations = null;

/**
 * Load portfolio allocations from JSON file
 */
async function loadPortfolioAllocations() {
  if (portfolioAllocations) {
    return portfolioAllocations;
  }
  
  try {
    const response = await fetch('./data/portfolio-allocations.json');
    const data = await response.json();
    portfolioAllocations = data;
    return data;
  } catch (error) {
    console.error('❌ Failed to load portfolio allocations:', error);
    throw new Error('Portfolio allocations file not found');
  }
}

/**
 * Load stock data from JSON file
 */
async function loadStockData() {
  // Check if already loaded
  if (stockData) {
    return stockData;
  }
  
  // Check localStorage cache (max 1 hour)
  const cached = localStorage.getItem('stockDataCache');
  const cacheTime = localStorage.getItem('stockDataCacheTime');
  
  if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    const oneHour = 60 * 60 * 1000;
    
    if (age < oneHour) {
      const cachedData = JSON.parse(cached);
      // CRITICAL: Invalidate cache if baseline date changed (from June 2024 to rolling)
      if (cachedData.metadata && cachedData.metadata.baselineDate === '2024-06-01') {
        localStorage.removeItem('stockDataCache');
        localStorage.removeItem('stockDataCacheTime');
      } else {
        stockData = cachedData;
        return stockData;
      }
    }
  }
  
  // Fetch from JSON file
  try {
    const response = await fetch('./data/stock-data.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache in memory and localStorage
    stockData = data;
    localStorage.setItem('stockDataCache', JSON.stringify(data));
    localStorage.setItem('stockDataCacheTime', Date.now().toString());
    
    return data;
    
  } catch (error) {
    console.error('❌ Failed to load stock data:', error);
    throw new Error('Stock data fetch failed: ' + error.message);
  }
}

/**
 * Get top N performers
 */
function getTopPerformers(data, count = 3) {
  if (!data || !data.stocks) return [];
  
  return data.stocks
    .filter(stock => stock.stockReturn > 0)
    .slice(0, count);
}

/**
 * Calculate portfolio-weighted return for different timeframes
 * @param {Object} stockData - Real-time stock data from API
 * @param {Object} portfolioData - Portfolio allocations
 * @param {string} timeframe - '1M', '3M', or '12M'
 * @returns {number} Weighted portfolio return percentage
 */
function calculatePortfolioReturn(stockData, portfolioData, timeframe = '12M') {
  if (!stockData || !portfolioData || !portfolioData.holdings) {
    console.warn(`Missing data for portfolio calculation: stockData=${!!stockData}, portfolioData=${!!portfolioData}, holdings=${!!portfolioData?.holdings}`);
    return null;
  }
  
  // Create a map of stock returns
  const stockReturns = {};
  stockData.stocks.forEach(stock => {
    stockReturns[stock.ticker] = {
      oneMonth: stock.oneMonthReturn || 0,
      threeMonth: stock.threeMonthReturn || 0,
      total: stock.stockReturn || 0
    };
  });
  
  // Calculate weighted average return
  let weightedReturn = 0;
  let totalAllocation = 0;
  
  portfolioData.holdings.forEach(holding => {
    const returns = stockReturns[holding.ticker];
    if (returns) {
      let returnValue = 0;
      
      switch(timeframe) {
        case '1M':
          returnValue = returns.oneMonth;
          break;
        case '3M':
          returnValue = returns.threeMonth;
          break;
        case '12M':
        default:
          returnValue = returns.total;
          break;
      }
      
      weightedReturn += (holding.allocation / 100) * returnValue;
      totalAllocation += holding.allocation;
    }
  });
  
  // Normalize if total allocation isn't exactly 100%
  if (totalAllocation > 0) {
    weightedReturn = (weightedReturn / totalAllocation) * 100;
  }
  
  return weightedReturn;
}

/**
 * Update Hero Performance Card
 */
function updateHeroPerformanceCard(stockData, portfolioData) {
  if (!stockData || !portfolioData) return;
  
  // Calculate REAL portfolio returns for all timeframes
  const oneMonthPerf = calculatePortfolioReturn(stockData, portfolioData, '1M');
  const threeMonthPerf = calculatePortfolioReturn(stockData, portfolioData, '3M');
  const twelveMonthPerf = calculatePortfolioReturn(stockData, portfolioData, '12M');
  
  if (twelveMonthPerf === null) {
    console.warn('Could not calculate portfolio return');
    return;
  }
  
  // Update main return number
  const perfValue = document.querySelector('.perf-hero-number .perf-value');
  if (perfValue) {
    perfValue.textContent = `+${twelveMonthPerf.toFixed(1)}%`;
  }
  
  // Update percentages
  const perfPercentages = document.querySelectorAll('.perf-percentage');
  if (perfPercentages.length >= 3) {
    const oneMonthText = (oneMonthPerf !== null && oneMonthPerf !== undefined) ? `+${oneMonthPerf.toFixed(1)}%` : 'N/A';
    const threeMonthText = (threeMonthPerf !== null && threeMonthPerf !== undefined) ? `+${threeMonthPerf.toFixed(1)}%` : 'N/A';
    const twelveMonthText = (twelveMonthPerf !== null && twelveMonthPerf !== undefined) ? `+${twelveMonthPerf.toFixed(1)}%` : 'N/A';
    
    perfPercentages[0].textContent = oneMonthText;
    perfPercentages[1].textContent = threeMonthText;
    perfPercentages[2].textContent = twelveMonthText;
  }
  
  // Update bar widths (relative to 12-month)
  const perfFills = document.querySelectorAll('.perf-fill');
  if (perfFills.length >= 3) {
    const maxReturn = twelveMonthPerf;
    perfFills[0].style.width = `${(oneMonthPerf / maxReturn) * 100}%`;
    perfFills[0].setAttribute('data-width', Math.round((oneMonthPerf / maxReturn) * 100));
    perfFills[1].style.width = `${(threeMonthPerf / maxReturn) * 100}%`;
    perfFills[1].setAttribute('data-width', Math.round((threeMonthPerf / maxReturn) * 100));
    perfFills[2].style.width = '100%';
    perfFills[2].setAttribute('data-width', '100');
  }
  
  // Update subheadline with dynamic return
  const subheadline = document.querySelector('.subheadline');
  if (subheadline) {
    const currentText = subheadline.innerHTML;
    const updatedText = currentText.replace(/\+\d+(\.\d+)?%\s+returns\s+in\s+12\s+months/g, 
      `+${twelveMonthPerf.toFixed(1)}% returns in 12 months`);
    subheadline.innerHTML = updatedText;
  }
}

/**
 * Update Top Performers section in the DOM
 */
function updateTopPerformersSection(data) {
  const container = document.querySelector('.top-performers-box');
  if (!container) {
    console.warn('Top performers container not found');
    return;
  }
  
  const topPerformers = getTopPerformers(data, 3);
  
  if (topPerformers.length === 0) {
    console.warn('No top performers data');
    return;
  }
  
  // Update the HTML - match exact structure from index.html
  const medals = ['🥇', '🥈', '🥉'];
  const classes = ['gold', 'silver', 'bronze'];
  const grid = container.querySelector('.performers-grid');
  
  if (!grid) {
    console.warn('Performers grid not found');
    return;
  }
  
  grid.innerHTML = topPerformers.map((stock, index) => `
    <div class="performer-card ${classes[index]}">
      <div class="performer-rank">${medals[index]}</div>
      <div class="performer-ticker">${stock.ticker}</div>
      <div class="performer-name">${stock.name}</div>
      <div class="performer-return">+${stock.stockReturn.toFixed(1)}%</div>
    </div>
  `).join('');
}

/**
 * Update Final CTA (currently static, function kept for future use)
 */
function updateFinalCTAPerformance(portfolioData) {
  // Final CTA is now static with creative messaging
  // Function kept for potential future dynamic updates
}

/**
 * Update data timestamp footer
 */
function updateDataTimestamp(data) {
  if (!data || !data.metadata) return;
  
  const timestamp = document.querySelector('.perf-data-source .data-source-text');
  if (timestamp) {
    const date = new Date(data.metadata.lastUpdated);
    const formatted = date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    timestamp.textContent = `Live market data • Updated ${formatted}`;
  }
}

/**
 * Update holdings table with stock returns
 */
function updateHoldingsTable(stockData, portfolioData) {
  if (!stockData || !stockData.stocks) return;
  
  const table = document.querySelector('.holdings-table tbody');
  if (!table) {
    console.warn('Holdings table not found');
    return;
  }
  
  // Create a map for quick lookup
  const stockMap = {};
  stockData.stocks.forEach(stock => {
    stockMap[stock.ticker] = stock;
  });
  
  // Update each row with real return data
  const rows = table.querySelectorAll('tr');
  let updatedCount = 0;
  
  rows.forEach(row => {
    const tickerCell = row.querySelector('td:first-child');
    if (!tickerCell) return;
    
    const ticker = tickerCell.textContent.trim();
    const stockInfo = stockMap[ticker];
    
    if (stockInfo) {
      // Update return percentage (last column)
      const cells = row.querySelectorAll('td');
      const returnCell = cells[cells.length - 1]; // Last cell
      
      if (returnCell) {
        const returnValue = stockInfo.stockReturn;
        returnCell.textContent = `${returnValue >= 0 ? '+' : ''}${returnValue.toFixed(2)}%`;
        
        // Add color styling
        returnCell.style.color = returnValue >= 0 ? '#10b981' : '#ef4444';
        returnCell.style.fontWeight = '600';
        
        updatedCount++;
      }
      
      // Optionally update current price (if you have a price column)
      const priceCell = cells[2]; // Assuming 3rd column is price
      if (priceCell && stockInfo.currentPrice) {
        priceCell.textContent = `$${stockInfo.currentPrice.toFixed(2)}`;
      }
    }
  });
}

/**
 * Merge real-time stock data with portfolio allocations
 * This creates a SINGLE SOURCE OF TRUTH with real data
 */
function mergeStockAndPortfolioData(stockData, portfolioData) {
  if (!stockData || !portfolioData) return null;
  
  // Create a map of stock data
  const stockMap = {};
  stockData.stocks.forEach(stock => {
    stockMap[stock.ticker] = stock;
  });
  
  // Merge: Take allocations from portfolio, returns from API
  const mergedHoldings = portfolioData.holdings.map(holding => {
    const liveStock = stockMap[holding.ticker];
    
    if (liveStock) {
      return {
        ...holding,
        // OVERRIDE with real API data
        totalReturn: liveStock.stockReturn,
        oneMonthReturn: liveStock.oneMonthReturn,
        threeMonthReturn: liveStock.threeMonthReturn,
        currentPrice: liveStock.currentPrice,
        baselinePrice: liveStock.baselinePrice,
        lastUpdated: liveStock.lastUpdated
      };
    }
    
    // Fallback to portfolio data if stock not found in API
    console.warn(`⚠️  ${holding.ticker} not found in API data`);
    return holding;
  });
  
  // Return merged data structure (no metrics here - will be added in init)
  return {
    ...portfolioData,
    holdings: mergedHoldings,
    lastUpdated: stockData.metadata.lastUpdated,
    dataSource: 'LIVE_API' // Flag to indicate this is live data
  };
}

/**
 * Show error message if data fetch fails
 */
function showDataFetchError(errorMessage) {
  const errorHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fee;
      border: 2px solid #c00;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      z-index: 9999;
      max-width: 500px;
    ">
      <h2 style="color: #c00; margin: 0 0 16px 0;">⚠️ Data Loading Failed</h2>
      <p style="margin: 0 0 16px 0; color: #333;">${errorMessage}</p>
      <p style="margin: 0; font-size: 0.875rem; color: #666;">
        Please contact the site administrator or try again later.
      </p>
      <button onclick="location.reload()" style="
        margin-top: 20px;
        padding: 10px 20px;
        background: #c00;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Retry</button>
    </div>
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9998;
    "></div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', errorHTML);
}

/**
 * Initialize on page load
 */
async function initStockData() {
  try {
    // Load both allocations and stock data
    const [allocations, data] = await Promise.all([
      loadPortfolioAllocations(),
      loadStockData()
    ]);
    
    // CRITICAL: Merge real stock data with portfolio allocations
    const mergedData = mergeStockAndPortfolioData(data, allocations);
    
    if (!mergedData) {
      throw new Error('Failed to merge stock and portfolio data');
    }
    
    // Calculate dynamic metrics
    const oneMonthReturn = calculatePortfolioReturn(data, allocations, '1M');
    const threeMonthReturn = calculatePortfolioReturn(data, allocations, '3M');
    const oneYearReturn = calculatePortfolioReturn(data, allocations, '12M');
    
    // Create the final portfolio performance object
    const portfolioPerformance = {
      ...allocations,
      lastUpdated: data.metadata.lastUpdated,
      dataSource: 'LIVE_API',
      sectorColors: allocations.sectorColors || {},
      metrics: {
        oneMonth: {
          portfolio: oneMonthReturn,
          benchmark: 0, // Not tracking benchmark
          difference: oneMonthReturn
        },
        threeMonth: {
          portfolio: threeMonthReturn,
          benchmark: 0,
          difference: threeMonthReturn
        },
        oneYear: {
          portfolio: oneYearReturn,
          benchmark: 0,
          difference: oneYearReturn
        }
      },
      holdings: mergedData.holdings
    };
    
    // SET the global portfolioPerformance with REAL DATA
    window.portfolioPerformance = portfolioPerformance;
    
    // Update all sections
    updateHeroPerformanceCard(data, portfolioPerformance);
    updateTopPerformersSection(data);
    updateDataTimestamp(data);
    updateHoldingsTable(data, portfolioPerformance);
    updateFinalCTAPerformance(portfolioPerformance);
    
    // Trigger a custom event so main.js can re-render charts if needed
    window.dispatchEvent(new CustomEvent('stockDataUpdated', { detail: portfolioPerformance }));
    
    // Call renderHoldingsTable if it exists (after stockDataUpdated event)
    if (typeof window.renderHoldingsTable === 'function') {
      window.renderHoldingsTable();
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    console.error('Stack trace:', error.stack);
    showDataFetchError(error.message || 'Unknown error occurred');
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStockData);
} else {
  initStockData();
}

/**
 * Get pie chart data for Chart.js
 * Used by main.js to create pie charts
 */
function getPieChartData() {
  if (!window.portfolioPerformance || !window.portfolioPerformance.holdings) {
    console.error('Portfolio data not loaded yet');
    return { labels: [], datasets: [] };
  }
  
  const holdings = window.portfolioPerformance.holdings;
  const sectorColors = window.portfolioPerformance.sectorColors || {};
  
  const labels = holdings.map(h => h.ticker);
  const data = holdings.map(h => h.allocation);
  const backgroundColor = holdings.map(h => 
    sectorColors[h.sector] || '#6B7280'
  );
  
  return {
    labels,
    datasets: [{
      data,
      backgroundColor,
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 15,
      hoverBorderWidth: 3
    }]
  };
}

// Export functions globally
window.getPieChartData = getPieChartData;

window.stockDataAPI = {
  load: loadStockData,
  getTopPerformers: getTopPerformers,
  refresh: async function() {
    // Clear cache and reload
    localStorage.removeItem('stockDataCache');
    localStorage.removeItem('stockDataCacheTime');
    stockData = null;
    portfolioAllocations = null;
    return await initStockData();
  }
};

