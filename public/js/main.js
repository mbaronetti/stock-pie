/**
 * Main JavaScript - Trading 212 Pie Landing Page
 * Handles all interactive features, charts, animations, and tracking
 */

// Function to initialize everything
function initializeApp() {
  // ===========================================
  // Initialize Charts
  // ===========================================
  
  // Hero Pie Chart - Enhanced with center text and animations
  const heroPieCtx = document.getElementById('hero-pie-chart');
  if (heroPieCtx && typeof Chart !== 'undefined') {
    // Custom plugin for center text
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: function(chart) {
        const ctx = chart.ctx;
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Main text - "25 AI Stocks"
        ctx.font = 'bold 24px Inter';
        ctx.fillStyle = '#1A1A1A';
        ctx.fillText('25 AI', centerX, centerY - 15);
        
        // Subtext - "Stocks"
        ctx.font = '16px Inter';
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Stocks', centerX, centerY + 10);
        
        ctx.restore();
      }
    };
    
    new Chart(heroPieCtx, {
      type: 'doughnut',
      data: window.getPieChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',  // Larger center hole for text
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            bodySpacing: 4,
            callbacks: {
              title: function(context) {
                const holding = window.portfolioPerformance.holdings.find(h => h.ticker === context[0].label);
                return holding.name;
              },
              label: function(context) {
                const holding = window.portfolioPerformance.holdings.find(h => h.ticker === context.label);
                const returnSign = holding.totalReturn >= 0 ? '+' : '';
                return [
                  `Category: ${holding.aiCategory}`,
                  `Allocation: ${holding.allocation.toFixed(2)}%`,
                  `Total Return: ${returnSign}${holding.totalReturn.toFixed(1)}%`,
                  `Sector: ${holding.sector}`
                ];
              }
            }
          }
        },
        onHover: (event, activeElements) => {
          event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        }
      },
      plugins: [centerTextPlugin]
    });
  }
  
  // Target Allocation Chart (What you copy - equal weight)
  const targetCtx = document.getElementById('target-allocation-chart');
  if (targetCtx && typeof Chart !== 'undefined') {
    const targetCenterText = {
      id: 'targetCenterText',
      afterDraw: function(chart) {
        const ctx = chart.ctx;
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = 'bold 22px Inter';
        ctx.fillStyle = '#1A1A1A';
        ctx.fillText('Equal Weight', centerX, centerY - 15);
        
        ctx.font = '16px Inter';
        ctx.fillStyle = '#8B5CF6';
        ctx.fillText('~4.2% each', centerX, centerY + 10);
        
        ctx.restore();
      }
    };
    
    // Create equal-weight data (25 stocks × 4% = 100%)
    const equalWeight = 100 / window.portfolioPerformance.holdings.length;
    const targetData = {
      labels: window.portfolioPerformance.holdings.map(h => h.ticker),
      datasets: [{
        data: window.portfolioPerformance.holdings.map(() => equalWeight),
        backgroundColor: window.portfolioPerformance.holdings.map(h => 
          window.portfolioPerformance.sectorColors[h.sector] || '#6B7280'
        ),
        borderWidth: 0,
        hoverOffset: 10
      }]
    };
    
    new Chart(targetCtx, {
      type: 'doughnut',
      data: targetData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        animation: {
          animateRotate: true,
          duration: 1500
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(139, 92, 246, 0.95)',
            padding: 12,
            callbacks: {
              title: function(context) {
                const ticker = context[0].label;
                const holding = window.portfolioPerformance.holdings.find(h => h.ticker === ticker);
                return holding.name;
              },
              label: function(context) {
                return [
                  `Target: ${equalWeight.toFixed(2)}%`,
                  `Equal weight allocation`,
                  `What you'll copy`
                ];
              }
            }
          }
        }
      },
      plugins: [targetCenterText]
    });
  }
  
  // Current Allocation Chart (Dashboard) - Real allocations after growth
  const currentCtx = document.getElementById('current-allocation-chart');
  let currentChart;
  if (currentCtx && typeof Chart !== 'undefined') {
    // Custom plugin for center text in dashboard chart
    const dashboardCenterText = {
      id: 'dashboardCenterText',
      afterDraw: function(chart) {
        const ctx = chart.ctx;
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Check if hovering over a segment
        const activeElements = chart.getActiveElements();
        if (activeElements.length > 0) {
          const dataIndex = activeElements[0].index;
          const holding = window.portfolioPerformance.holdings[dataIndex];
          
          // Show ticker
          ctx.font = 'bold 28px Inter';
          ctx.fillStyle = '#1A1A1A';
          ctx.fillText(holding.ticker, centerX, centerY - 25);
          
          // Show allocation
          ctx.font = 'bold 20px JetBrains Mono';
          ctx.fillStyle = '#8B5CF6';
          ctx.fillText(holding.allocation.toFixed(1) + '%', centerX, centerY + 5);
          
          // Show total return
          const returnColor = holding.totalReturn >= 0 ? '#10B981' : '#EF4444';
          const returnSign = holding.totalReturn >= 0 ? '+' : '';
          ctx.font = 'bold 14px Inter';
          ctx.fillStyle = returnColor;
          ctx.fillText(`${returnSign}${holding.totalReturn.toFixed(1)}%`, centerX, centerY + 28);
          
          // Show hint
          ctx.font = '11px Inter';
          ctx.fillStyle = '#6B7280';
          ctx.fillText('Click for details', centerX, centerY + 48);
        } else {
          // Default display - Total value or pie name
          ctx.font = 'bold 22px Inter';
          ctx.fillStyle = '#1A1A1A';
          ctx.fillText('AI Pie', centerX, centerY - 15);
          
          ctx.font = '14px Inter';
          ctx.fillStyle = '#6B7280';
          ctx.fillText('25 Holdings', centerX, centerY + 10);
        }
        
        ctx.restore();
      }
    };
    
    currentChart = new Chart(currentCtx, {
      type: 'doughnut',
      data: window.getPieChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '70%',  // Larger center for text
        spacing: 2,      // Small gap between segments
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 12,
              font: {
                size: 11,
                family: 'Inter'
              },
              usePointStyle: true,
              pointStyle: 'circle',
              generateLabels: function(chart) {
                const data = chart.data;
                const holdings = window.portfolioPerformance.holdings;
                return data.labels.map((label, i) => {
                  const holding = holdings.find(h => h.ticker === label);
                  return {
                    text: `${label} ${data.datasets[0].data[i]}%`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
            },
            onClick: function(e, legendItem, legend) {
              // Highlight segment on legend click
              const chart = legend.chart;
              const index = legendItem.index;
              
              // Remove previous highlights
              chart.data.datasets[0].borderWidth = chart.data.labels.map(() => 0);
              
              // Highlight clicked segment
              chart.data.datasets[0].borderWidth[index] = 4;
              chart.data.datasets[0].borderColor = '#fff';
              
              chart.update();
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: 16,
            titleFont: {
              size: 15,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            bodySpacing: 6,
            callbacks: {
              title: function(context) {
                const ticker = context[0].label;
                const holding = window.portfolioPerformance.holdings.find(h => h.ticker === ticker);
                return holding.name;
              },
              label: function(context) {
                const ticker = context.label;
                const holding = window.portfolioPerformance.holdings.find(h => h.ticker === ticker);
                return [
                  `Ticker: ${holding.ticker}`,
                  `Category: ${holding.aiCategory}`,
                  `Allocation: ${context.parsed}%`,
                  `1Y Return: +${holding.returns['1Y']}%`
                ];
              },
              afterLabel: function(context) {
                const ticker = context.label;
                const holding = window.portfolioPerformance.holdings.find(h => h.ticker === ticker);
                return `\n${holding.description}`;
              }
            }
          }
        },
        onHover: (event, activeElements, chart) => {
          event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
          
          // Trigger redraw to update center text on hover
          if (activeElements.length > 0) {
            chart.update('none');
          }
        },
        onClick: (event, activeElements, chart) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            const holding = window.portfolioPerformance.holdings[index];
            
            // Scroll to holdings table and highlight row
            const holdingsSection = document.querySelector('.holdings-section');
            if (holdingsSection) {
              holdingsSection.scrollIntoView({ behavior: 'smooth' });
              
              // Highlight the row after scroll
              setTimeout(() => {
                const rows = document.querySelectorAll('.holdings-table tbody tr');
                rows.forEach((row, i) => {
                  row.style.backgroundColor = i === index ? 'rgba(139, 92, 246, 0.1)' : '';
                });
              }, 500);
            }
            
            trackEvent('pie_chart_click', { ticker: holding.ticker });
          }
        }
      },
      plugins: [dashboardCenterText]
    });
  }
  
  // Performance Line Chart - REMOVED
  // We don't have accurate month-by-month data, so we removed this chart
  // to maintain accuracy and credibility. Only showing data we can verify.
  
  // ===========================================
  // Holdings Table
  // ===========================================
  
  const holdingsTableBody = document.getElementById('holdings-tbody');
  const holdingsCardsContainer = document.getElementById('holdings-cards');
  
  // Make renderHoldingsTable globally accessible so stock-data-loader can call it
  window.renderHoldingsTable = function renderHoldingsTable() {
    if (!window.portfolioPerformance || !window.portfolioPerformance.holdings) {
      console.warn('Portfolio data not loaded yet - skipping table render');
      return;
    }
    
    // Smart sorting: Top 3 performers + Next 6 alphabetically (9 total visible)
    const allHoldings = [...window.portfolioPerformance.holdings];
    
    // Sort by performance (highest first)
    const sortedByPerformance = allHoldings.sort((a, b) => 
      (b.totalReturn || 0) - (a.totalReturn || 0)
    );
    
    // Take top 3 performers (always show these first)
    const top3 = sortedByPerformance.slice(0, 3);
    
    // Take next 6 stocks (positions 4-9), sort them alphabetically
    const next6 = sortedByPerformance.slice(3, 9).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    // Rest remain hidden behind CTA (15 stocks)
    const remaining = sortedByPerformance.slice(9);
    
    // Final order: Top 3 + Alphabetical 6 + Hidden 15
    const holdings = [...top3, ...next6, ...remaining];
    
    // Render desktop table
    if (holdingsTableBody) {
      holdingsTableBody.innerHTML = holdings.map((holding, index) => {
        const returnClass = holding.totalReturn >= 0 ? 'return-positive' : 'return-negative';
        const returnSign = holding.totalReturn >= 0 ? '+' : '';
        
        return `
        <tr>
          <td><strong>${holding.name}</strong></td>
          <td><code>${holding.ticker}</code></td>
          <td class="${returnClass}">
            <strong>${returnSign}${holding.totalReturn.toFixed(1)}%</strong>
          </td>
          <td class="allocation-cell">${holding.allocation}%</td>
          <td class="description-cell">${holding.description}</td>
        </tr>
        `;
      }).join('');
    }
    
    // Render mobile cards
    if (holdingsCardsContainer) {
      holdingsCardsContainer.innerHTML = holdings.map((holding, index) => {
        const returnClass = holding.totalReturn >= 0 ? 'return-positive' : 'return-negative';
        const returnSign = holding.totalReturn >= 0 ? '+' : '';
        
        return `
        <div class="holding-card">
          <div class="holding-card-header">
            <div class="holding-name"><strong>${holding.name}</strong></div>
            <div class="holding-ticker"><code>${holding.ticker}</code></div>
          </div>
          <div class="holding-stats">
            <div class="holding-allocation">
              <span class="stat-label">${document.documentElement.lang.startsWith('es') ? 'Asignación:' : 'Allocation:'}</span>
              <span class="stat-value">${holding.allocation}%</span>
            </div>
            <div class="holding-return">
              <span class="stat-label">${document.documentElement.lang.startsWith('es') ? 'Retorno 12 Meses:' : '12-Month Return:'}</span>
              <span class="stat-value ${returnClass}"><strong>${returnSign}${holding.totalReturn.toFixed(1)}%</strong></span>
            </div>
          </div>
          <div class="holding-description">${holding.description}</div>
        </div>
        `;
      }).join('');
    }
  }
  
  // Don't render immediately - wait for data to load via stock-data-loader
  // renderHoldingsTable(); // Now called after stockDataUpdated event
  // Note: Table is automatically sorted by performance (highest return first)
  
  // ===========================================
  // Count-Up Animation for Performance Cards
  // ===========================================
  
  function animateCountUp(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = (current >= 0 ? '+' : '') + current.toFixed(1) + '%';
    }, 16);
  }
  
  // Intersection Observer for count-up animation
  const performanceCards = document.querySelectorAll('.performance-card');
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const returnElement = entry.target.querySelector('.main-return');
        const target = parseFloat(entry.target.querySelector('.main-return').dataset.countUp);
        animateCountUp(returnElement, target);
        entry.target.dataset.animated = 'true';
      }
    });
  }, observerOptions);
  
  performanceCards.forEach(card => cardObserver.observe(card));
  
  // ===========================================
  // FAQ Accordion
  // ===========================================
  
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Close all other FAQs
      faqQuestions.forEach(q => {
        if (q !== this) {
          q.setAttribute('aria-expanded', 'false');
          q.nextElementSibling?.classList.remove('active');
        }
      });
      
      // Toggle current FAQ
      if (isExpanded) {
        this.setAttribute('aria-expanded', 'false');
        answer?.classList.remove('active');
      } else {
        this.setAttribute('aria-expanded', 'true');
        answer?.classList.add('active');
        trackEvent('faq_open', { question: this.textContent.trim() });
      }
    });
  });
  
  // ===========================================
  // Email Modal
  // ===========================================
  
  const emailModal = document.getElementById('email-modal');
  const emailModalBtn = document.getElementById('email-capture-btn');
  const modalClose = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');
  const emailForm = document.getElementById('email-form');
  
  function openModal() {
    emailModal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trackEvent('modal_open', { trigger: 'email_capture' });
  }
  
  function closeModal() {
    emailModal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  emailModalBtn?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', closeModal);
  
  // Handle email form submission
  emailForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email-input');
    const email = emailInput?.value;
    
    // TODO: Integrate with ConvertKit or your email service
    alert('Thank you for subscribing! You\'ll receive updates monthly.');
    closeModal();
    emailInput.value = '';
    
    trackEvent('email_signup', { location: 'modal', email });
  });
  
  // ===========================================
  // Sticky Mobile CTA
  // ===========================================
  
  const stickyCTA = document.getElementById('sticky-cta');
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateStickyCTA() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show sticky CTA after scrolling 50% of page
    if (scrollY > windowHeight * 0.5 && scrollY < documentHeight - windowHeight * 1.5) {
      stickyCTA?.setAttribute('aria-hidden', 'false');
    } else {
      stickyCTA?.setAttribute('aria-hidden', 'true');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateStickyCTA);
      ticking = true;
    }
  });
  
  // ===========================================
  // Smooth Scrolling for Anchor Links
  // ===========================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        trackEvent('anchor_click', { target: href });
      }
    });
  });
  
  // ===========================================
  // CTA Click Tracking
  // ===========================================
  
  const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
  ctaButtons.forEach(button => {
    button.addEventListener('click', function() {
      const location = this.id || 'unknown';
      const text = this.textContent.trim();
      trackEvent('cta_click', { location, text });
    });
  });
  
  // ===========================================
  // Scroll Depth Tracking
  // ===========================================
  
  const scrollDepths = [25, 50, 75, 100];
  const trackedDepths = new Set();
  
  function trackScrollDepth() {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    scrollDepths.forEach(depth => {
      if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        trackEvent('scroll_depth', { percentage: depth });
      }
    });
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(trackScrollDepth);
      ticking = true;
    }
  });
  
  // ===========================================
  // Analytics Tracking Helper
  // ===========================================
  
  function trackEvent(eventName, params = {}) {
    // Google Analytics 4 (if GTM is installed)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
    
    // Can add other analytics services here (Plausible, Fathom, etc.)
  }
  
  // Track page view
  trackEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href
  });
  
  // ===========================================
  // Update Last Updated Date
  // ===========================================
  
  const lastUpdateElement = document.getElementById('last-update-date');
  if (lastUpdateElement) {
    lastUpdateElement.textContent = window.portfolioPerformance.lastUpdated;
  }
  
  // Update current year in footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // ===========================================
  // Responsive Table/Cards Toggle
  // ===========================================
  
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Re-render holdings on resize to ensure proper display
      renderHoldingsTable();
    }, 250);
  });
  
  // ===========================================
  // Hero Performance Card - Animate bars on load
  // ===========================================
  
  const perfBars = document.querySelectorAll('.hero-performance-card .perf-fill');
  if (perfBars.length > 0) {
    // Reset bars to 0
    perfBars.forEach(bar => {
      bar.style.width = '0%';
    });
    
    // Animate bars after a short delay
    setTimeout(() => {
      perfBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-width');
        bar.style.width = targetWidth + '%';
      });
    }, 300);
  }
  
  // ===========================================
  // Final CTA - Copy Instructions Modal
  // ===========================================
  
  const finalCTACopy = document.getElementById('final-cta-copy');
  const copyModal = document.getElementById('copy-instructions');
  
  if (finalCTACopy && copyModal) {
    finalCTACopy.addEventListener('click', function(e) {
      e.preventDefault();
      copyModal.style.display = 'flex';
      trackEvent('copy_instructions_opened', { source: 'final_cta' });
    });
  }
  
  // ===========================================
  // Holdings Reveal Functionality
  // ===========================================
  
  const revealContainer = document.querySelector('.holdings-reveal-container');
  const revealOverlay = document.getElementById('holdings-reveal-overlay');
  const revealCTABtn = document.getElementById('reveal-cta');
  
  if (revealCTABtn && revealOverlay) {
    // Track when user clicks the reveal CTA
    revealCTABtn.addEventListener('click', function() {
      trackEvent('holdings_cta_click', { location: 'reveal_overlay' });
    });
  }
}

// Wait for stock data to be loaded, then initialize
// This ensures all charts and tables use REAL data
window.addEventListener('stockDataUpdated', function(event) {
  initializeApp();
});

// Also listen for DOM ready as fallback
document.addEventListener('DOMContentLoaded', function() {
  // Check if stock data is already loaded (might be if script runs fast)
  if (window.portfolioPerformance?.dataSource === 'LIVE_API') {
    initializeApp();
  }
  // Otherwise, wait for stockDataUpdated event
});

