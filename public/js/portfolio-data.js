/**
 * Portfolio Data - AI Industry Pie Allocations (Legacy)
 * NOTE: This file is NO LONGER USED for performance data
 * Real-time data now comes from stock-data-loader.js + Yahoo Finance API
 * This file only exists for backward compatibility
 */

const portfolioPerformance = {
  lastUpdated: '2025-10-08', // From T212 export
  
  // Portfolio timeline
  startDate: '2024-06-01',
  monthsActive: 16,
  
  // Performance metrics for cards - AI Pie Performance
  metrics: {
    oneMonth: {
      portfolio: 20.8,
      benchmark: 1.2,
      difference: 19.6
    },
    threeMonth: {
      portfolio: 30.7,
      benchmark: 4.2,
      difference: 26.5
    },
    oneYear: {
      portfolio: 61.0,
      benchmark: 12.1,
      difference: 48.9
    }
  },
  
  // Holdings data - LEGACY (No longer used)
  // Real data now comes from stock-data-loader.js
  holdings: [
    // 🚀 TOP PERFORMER - Palantir dominates due to exceptional growth
    {
      name: 'Palantir Technologies',
      ticker: 'PLTR',
      sector: 'AI Software',
      allocation: 22.51,
      aiCategory: 'AI Platforms',
      description: 'AIP platform, government & enterprise AI solutions',
      totalReturn: 460.7
    },
    
    // AI Chips & GPUs
    {
      name: 'NVIDIA Corp.',
      ticker: 'NVDA',
      sector: 'AI Chips',
      allocation: 9.97,
      currentValue: 1839.02,
      aiCategory: 'AI Chips & GPUs',
      description: 'Leading AI chip manufacturer, powers 95% of AI training',
      totalReturn: 67.9
    },
    {
      name: 'Tesla Inc.',
      ticker: 'TSLA',
      sector: 'AI Applications',
      allocation: 7.85,
      currentValue: 1448.57,
      aiCategory: 'Autonomous AI',
      description: 'FSD AI, Dojo supercomputer, Optimus humanoid robots',
      totalReturn: 95.2
    },
    {
      name: 'Apple Inc.',
      ticker: 'AAPL',
      sector: 'AI Products',
      allocation: 6.17,
      currentValue: 1138.74,
      aiCategory: 'Consumer AI',
      description: 'Apple Intelligence, Neural Engine, on-device AI',
      totalReturn: 24.3
    },
    {
      name: 'Alphabet Inc. Class A',
      ticker: 'GOOGL',
      sector: 'AI Research',
      allocation: 5.43,
      currentValue: 1002.16,
      aiCategory: 'AI Research & Products',
      description: 'DeepMind, Gemini AI, Google Cloud AI, Search AI',
      totalReturn: 40.1
    },
    {
      name: 'Amazon.com Inc.',
      ticker: 'AMZN',
      sector: 'Cloud AI',
      allocation: 5.30,
      currentValue: 976.97,
      aiCategory: 'AI Infrastructure',
      description: 'AWS AI services, Bedrock, Trainium chips, AI logistics',
      totalReturn: 10.9
    },
    {
      name: 'Advanced Micro Devices',
      ticker: 'AMD',
      sector: 'AI Chips',
      allocation: 4.74,
      currentValue: 875.30,
      aiCategory: 'AI Accelerators',
      description: 'MI300 AI chips, NVIDIA competitor in datacenter AI',
      totalReturn: 24.8
    },
    {
      name: 'Taiwan Semiconductor',
      ticker: 'TSM',
      sector: 'AI Chips',
      allocation: 3.23,
      currentValue: 596.72,
      aiCategory: 'Chip Manufacturing',
      description: 'Manufactures chips for NVIDIA, Apple, AMD - AI foundry',
      totalReturn: 50.0
    },
    {
      name: 'Micron Technology',
      ticker: 'MU',
      sector: 'AI Chips',
      allocation: 3.04,
      currentValue: 561.40,
      aiCategory: 'AI Memory',
      description: 'HBM memory for AI chips, critical for GPU performance',
      totalReturn: 68.2
    },
    {
      name: 'Synopsys Inc.',
      ticker: 'SNPS',
      sector: 'AI Software',
      allocation: 2.71,
      currentValue: 500.67,
      aiCategory: 'Chip Design AI',
      description: 'AI-powered chip design tools, EDA software',
      totalReturn: 0.3
    },
    {
      name: 'Rekor Systems',
      ticker: 'REKR',
      sector: 'AI Applications',
      allocation: 2.70,
      currentValue: 497.46,
      aiCategory: 'AI Vision',
      description: 'AI-powered vehicle recognition, smart city infrastructure',
      totalReturn: 22.9
    },
    {
      name: 'IBM Corp.',
      ticker: 'IBM',
      sector: 'AI Software',
      allocation: 2.61,
      currentValue: 480.72,
      aiCategory: 'Enterprise AI',
      description: 'Watson AI, hybrid cloud AI solutions',
      totalReturn: 15.7
    },
    {
      name: 'Intel Corp.',
      ticker: 'INTC',
      sector: 'AI Chips',
      allocation: 2.56,
      currentValue: 472.16,
      aiCategory: 'AI Chips',
      description: 'Gaudi AI accelerators, AI PC processors',
      totalReturn: 46.7
    },
    {
      name: 'C3.ai Inc.',
      ticker: 'AI',
      sector: 'AI Software',
      allocation: 2.52,
      currentValue: 464.46,
      aiCategory: 'Enterprise AI',
      description: 'Enterprise AI applications, predictive analytics',
      totalReturn: -34.5  // Currently negative
    },
    {
      name: 'Microsoft Corp.',
      ticker: 'MSFT',
      sector: 'Cloud AI',
      allocation: 2.45,
      currentValue: 451.14,
      aiCategory: 'AI Cloud Services',
      description: 'Azure AI, OpenAI partnership, Copilot AI products',
      totalReturn: 13.7
    },
    {
      name: 'Oracle Corp.',
      ticker: 'ORCL',
      sector: 'Cloud AI',
      allocation: 2.37,
      currentValue: 437.88,
      aiCategory: 'Database AI',
      description: 'Cloud infrastructure for AI, NVIDIA partnership',
      totalReturn: 54.8
    },
    {
      name: 'Meta Platforms Inc.',
      ticker: 'META',
      sector: 'AI Research',
      allocation: 2.33,
      currentValue: 430.18,
      aiCategory: 'Open Source AI',
      description: 'Llama open source models, AI-powered ads, Reality Labs',
      totalReturn: 17.4
    },
    {
      name: 'Arista Networks',
      ticker: 'ANET',
      sector: 'AI Infrastructure',
      allocation: 2.11,
      currentValue: 389.61,
      aiCategory: 'AI Networking',
      description: 'High-speed networking for AI datacenters',
      totalReturn: 40.3
    },
    {
      name: 'ASML Holding',
      ticker: 'ASML',
      sector: 'AI Chips',
      allocation: 1.78,
      currentValue: 328.24,
      aiCategory: 'Chip Equipment',
      description: 'EUV lithography machines, essential for AI chip production',
      totalReturn: 18.2
    },
    {
      name: 'Qualcomm Inc.',
      ticker: 'QCOM',
      sector: 'AI Chips',
      allocation: 1.64,
      currentValue: 302.25,
      aiCategory: 'Edge AI',
      description: 'On-device AI chips for smartphones, automotive AI',
      totalReturn: -8.1  // Currently negative
    },
    {
      name: 'Veritone Inc.',
      ticker: 'VERI',
      sector: 'AI Software',
      allocation: 1.59,
      currentValue: 293.44,
      aiCategory: 'AI OS',
      description: 'AI operating system, media & content AI solutions',
      totalReturn: 79.1
    },
    {
      name: 'ServiceNow Inc.',
      ticker: 'NOW',
      sector: 'AI Software',
      allocation: 1.57,
      currentValue: 290.33,
      aiCategory: 'Enterprise AI',
      description: 'AI-powered workflow automation for enterprises',
      totalReturn: 1.0
    },
    {
      name: 'Marvell Technology',
      ticker: 'MRVL',
      sector: 'AI Chips',
      allocation: 1.53,
      currentValue: 282.65,
      aiCategory: 'Data Infrastructure',
      description: 'Custom AI chips, datacenter networking for AI workloads',
      totalReturn: 1.8
    },
    {
      name: 'CoreWeave Inc.',
      ticker: 'CRWV',
      sector: 'AI Infrastructure',
      allocation: 1.28,
      currentValue: 236.68,
      aiCategory: 'GPU Cloud',
      description: 'Specialized GPU cloud infrastructure for AI training',
      totalReturn: -5.2  // Currently negative
    }
  ],
  
  // AI-focused sector colors for pie chart
  sectorColors: {
    'AI Chips': '#8B5CF6',      // Purple - chip manufacturing
    'Cloud AI': '#2E5BFF',       // Blue - cloud services  
    'AI Research': '#10B981',    // Green - research & development
    'AI Software': '#F4B942',    // Gold - software platforms
    'AI Infrastructure': '#EC4899' // Pink - infrastructure
  }
};

// Calculate pie chart data from holdings
function getPieChartData() {
  const labels = portfolioPerformance.holdings.map(h => h.ticker);
  const data = portfolioPerformance.holdings.map(h => h.allocation);
  const backgroundColor = portfolioPerformance.holdings.map(h => 
    portfolioPerformance.sectorColors[h.sector] || '#6B7280'
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

// Export for use in main.js
window.portfolioPerformance = portfolioPerformance;
window.getPieChartData = getPieChartData;

