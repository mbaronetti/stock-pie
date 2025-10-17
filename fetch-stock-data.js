/**
 * Stock Data Fetcher - Node.js Script
 * Fetches real-time stock performance data and saves to static JSON
 * 
 * Usage:
 *   node fetch-stock-data.js
 * 
 * This script:
 * 1. Fetches historical price data for all 25 AI stocks
 * 2. Calculates returns since June 1, 2024 (pie baseline)
 * 3. Saves to public/data/stock-data.json
 * 4. Your website reads this static file (no API calls from users!)
 * 
 * Run daily/weekly to keep data fresh.
 */

const yahooFinance = require('yahoo-finance2').default;
const fs = require('fs');
const path = require('path');

// Suppress deprecation warnings
yahooFinance.suppressNotices(['ripHistorical']);

// Portfolio stocks
const PORTFOLIO_STOCKS = [
  { ticker: 'GOOGL', name: 'Alphabet Class A' },
  { ticker: 'META', name: 'Meta Platforms' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'ANET', name: 'Arista Networks' },
  { ticker: 'ASML', name: 'ASML' },
  { ticker: 'AVGO', name: 'Broadcom' },
  { ticker: 'AI', name: 'C3.ai' },
  { ticker: 'CRWV', name: 'CoreWeave' }, // CoreWeave isn't public
  { ticker: 'IBM', name: 'IBM' },
  { ticker: 'INTC', name: 'Intel' },
  { ticker: 'MRVL', name: 'Marvell Technology' },
  { ticker: 'MU', name: 'Micron Technology' },
  { ticker: 'ORCL', name: 'Oracle' },
  { ticker: 'PLTR', name: 'Palantir' },
  { ticker: 'QCOM', name: 'Qualcomm' },
  { ticker: 'REKR', name: 'Rekor Systems' },
  { ticker: 'NOW', name: 'ServiceNow' },
  { ticker: 'SNPS', name: 'Synopsys' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'VERI', name: 'Veritone' }
];

// Calculate baseline as 12 months ago from today
const today = new Date();
const twelveMonthsAgo = new Date(today);
twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
const BASELINE_DATE = twelveMonthsAgo.toISOString().split('T')[0];

console.log(`📅 Baseline Date (12 months ago): ${BASELINE_DATE}`);

/**
 * Process stock data
 */
async function processStock(stock) {
  try {
    console.log(`Fetching ${stock.ticker}...`);
    
    // Fetch historical data using yahoo-finance2
    const queryOptions = {
      period1: BASELINE_DATE,
      period2: new Date().toISOString().split('T')[0]
    };
    
    const result = await yahooFinance.historical(stock.ticker, queryOptions);
    
    if (!result || result.length === 0) {
      console.error(`❌ ${stock.ticker}: No data available`);
      return {
        ...stock,
        error: 'No data available'
      };
    }
    
    // Get baseline price (first day's close)
    const baselinePrice = result[0].close;
    
    // Get current price (most recent day's close)
    const currentPrice = result[result.length - 1].close;
    
    if (!baselinePrice || !currentPrice) {
      console.error(`❌ ${stock.ticker}: Missing price data`);
      return {
        ...stock,
        error: 'Missing price data'
      };
    }
    
    // Calculate 1-month return (30 days ago)
    const oneMonthAgoIndex = Math.max(0, result.length - 30);
    const oneMonthAgoPrice = result[oneMonthAgoIndex].close;
    const oneMonthReturn = ((currentPrice - oneMonthAgoPrice) / oneMonthAgoPrice) * 100;
    
    // Calculate 3-month return (90 days ago)
    const threeMonthAgoIndex = Math.max(0, result.length - 90);
    const threeMonthAgoPrice = result[threeMonthAgoIndex].close;
    const threeMonthReturn = ((currentPrice - threeMonthAgoPrice) / threeMonthAgoPrice) * 100;
    
    // Calculate total return since baseline
    const totalReturn = ((currentPrice - baselinePrice) / baselinePrice) * 100;
    
    console.log(`✅ ${stock.ticker}: $${baselinePrice.toFixed(2)} → $${currentPrice.toFixed(2)} = ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}% (1M: ${oneMonthReturn.toFixed(1)}%, 3M: ${threeMonthReturn.toFixed(1)}%)`);
    
    return {
      ticker: stock.ticker,
      name: stock.name,
      baselinePrice: parseFloat(baselinePrice.toFixed(2)),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      stockReturn: parseFloat(totalReturn.toFixed(2)),
      oneMonthReturn: parseFloat(oneMonthReturn.toFixed(2)),
      threeMonthReturn: parseFloat(threeMonthReturn.toFixed(2)),
      baselineDate: BASELINE_DATE,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
  } catch (error) {
    console.error(`❌ ${stock.ticker}:`, error.message);
    return {
      ...stock,
      error: error.message
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Fetching stock data for 25 AI companies...');
  console.log(`📅 Rolling 12-month window: ${BASELINE_DATE} → ${new Date().toISOString().split('T')[0]}`);
  console.log(`📊 This will take ~30 seconds (rate limiting)...\n`);
  
  const stockData = [];
  
  for (const stock of PORTFOLIO_STOCKS) {
    const result = await processStock(stock);
    stockData.push(result);
    
    // Rate limiting - wait 1 second between calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Filter out errors
  const successfulStocks = stockData.filter(s => !s.error);
  const failedStocks = stockData.filter(s => s.error);
  
  // Sort by return (highest first)
  successfulStocks.sort((a, b) => b.stockReturn - a.stockReturn);
  
  // Prepare output data
  const output = {
    metadata: {
      baselineDate: BASELINE_DATE,
      lastUpdated: new Date().toISOString(),
      totalStocks: PORTFOLIO_STOCKS.length,
      successfulFetches: successfulStocks.length,
      failedFetches: failedStocks.length
    },
    stocks: successfulStocks,
    errors: failedStocks.length > 0 ? failedStocks : undefined
  };
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save to JSON file
  const outputPath = path.join(dataDir, 'stock-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Stock data fetched successfully!');
  console.log('='.repeat(60));
  console.log(`📊 Total stocks: ${PORTFOLIO_STOCKS.length}`);
  console.log(`✅ Successful: ${successfulStocks.length}`);
  console.log(`❌ Failed: ${failedStocks.length}`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log('='.repeat(60));
  
  // Print top 5 performers
  console.log('\n🏆 Top 5 Performers:');
  successfulStocks.slice(0, 5).forEach((stock, index) => {
    console.log(`${index + 1}. ${stock.ticker} (${stock.name}): ${stock.stockReturn >= 0 ? '+' : ''}${stock.stockReturn}%`);
  });
  
  if (failedStocks.length > 0) {
    console.log('\n⚠️  Failed stocks:');
    failedStocks.forEach(stock => {
      console.log(`- ${stock.ticker} (${stock.name}): ${stock.error}`);
    });
  }
  
  console.log('\n✨ Done! Your website can now read from public/data/stock-data.json');
}

// Run
main().catch(console.error);

