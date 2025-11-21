const basket = [];
const basketContainer = document.getElementById('basket');
const performanceChart = document.getElementById('performanceChart');
let chart;

function renderBasket() {
  basketContainer.innerHTML = '';
  basket.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'basket-card';
    card.innerHTML = `
      <header>
        <div>
          <strong>${item.company}</strong> <span class="muted">(${item.ticker.toUpperCase()})</span>
        </div>
        <span class="weight">${item.weight}%</span>
      </header>
      <p>${item.summary}</p>
      <div class="strategy-pill">${item.strategyLabel}</div>
      <button class="btn ghost" data-index="${index}">Remove</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      basket.splice(index, 1);
      renderBasket();
      updateChart();
    });
    basketContainer.appendChild(card);
  });
}

function updateChart() {
  const months = Array.from({ length: 24 }, (_, i) => `${i + 1}m`);
  const baseLine = months.map((_, i) => 100 * Math.pow(1 + 0.006, i));
  const nasdaqLine = months.map((_, i) => 100 * Math.pow(1 + 0.008, i));
  const basketBoost = basket.reduce((acc, item) => acc + item.weight * 0.00005, 0);
  const basketLine = months.map((_, i) => 100 * Math.pow(1 + 0.0065 + basketBoost, i));

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Basket',
        data: basketLine,
        borderColor: '#8af7d0',
        backgroundColor: 'rgba(138, 247, 208, 0.12)',
        tension: 0.35,
        borderWidth: 3,
        fill: true,
      },
      {
        label: 'S&P 500',
        data: baseLine,
        borderColor: '#8cc8ff',
        backgroundColor: 'rgba(140, 200, 255, 0.08)',
        tension: 0.35,
        borderDash: [5, 4],
      },
      {
        label: 'NASDAQ',
        data: nasdaqLine,
        borderColor: '#f6a5ff',
        backgroundColor: 'rgba(246, 165, 255, 0.08)',
        tension: 0.35,
        borderDash: [8, 4],
      },
    ],
  };

  if (chart) chart.destroy();
  chart = new Chart(performanceChart, {
    type: 'line',
    data,
    options: {
      plugins: {
        legend: {
          labels: {
            color: '#e8edf5',
          },
        },
      },
      scales: {
        x: { ticks: { color: '#aeb8cc' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#aeb8cc' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

function addCompany() {
  const company = document.getElementById('company').value.trim();
  const ticker = document.getElementById('ticker').value.trim();
  const weight = Number(document.getElementById('weight').value);
  const strategy = document.getElementById('strategy').value;

  if (!company || !ticker || !weight) return;

  const strategyMap = {
    steady: 'Recurring cadence',
    opportunistic: 'Async deployments on signals',
    value: 'Value tilt with guardrails',
    growth: 'Growth tilt with momentum bias',
  };

  const summary = `${weight}% allocated to ${company} (${ticker.toUpperCase()}) with ${strategyMap[strategy].toLowerCase()}.`;

  basket.push({ company, ticker, weight, strategyLabel: strategyMap[strategy], summary });
  renderBasket();
  updateChart();
}

function simulateProjection() {
  const growth = Number(document.getElementById('growth').value) / 100;
  const years = Number(document.getElementById('projection').value);
  const frequency = document.getElementById('frequency').value;
  const baseContribution = 500;
  const cadenceMultiplier = { monthly: 12, weekly: 52, quarterly: 4, 'one-time': 1 }[frequency];

  const contributions = baseContribution * cadenceMultiplier;
  let total = 0;
  let invested = 0;

  for (let year = 1; year <= years; year++) {
    invested += contributions;
    total = (total + contributions) * (1 + growth);
  }

  const projection = document.getElementById('projection-output');
  const projectedIndex = total.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  const investedFmt = invested.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const gain = (((total - invested) / invested) * 100).toFixed(1);

  projection.innerHTML = `Projected balance: <strong>${projectedIndex}</strong><br/>Contributed: ${investedFmt}<br/>Estimated gain: <strong>${gain}%</strong> at ${document
    .getElementById('frequency')
    .value} cadence.`;

  document.getElementById('proj-target').textContent = `+${gain}%`;
}

function bindActions() {
  document.getElementById('add-company').addEventListener('click', addCompany);
  document.getElementById('simulate').addEventListener('click', simulateProjection);
  document.getElementById('start-plan').addEventListener('click', () => {
    window.scrollTo({ top: document.querySelector('.panel').offsetTop, behavior: 'smooth' });
  });
  document.getElementById('learn-more').addEventListener('click', () => {
    simulateProjection();
    document.getElementById('projection-output').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('start-recurring').addEventListener('click', () => alert('Recurring plan scheduled.'));
  document.getElementById('start-async').addEventListener('click', () => alert('Async reserve armed.'));
  document.getElementById('set-guardrail').addEventListener('click', () => alert('Performance guardrail saved.'));
}

function initDefaults() {
  const defaults = [
    { company: 'Apple', ticker: 'AAPL', weight: 30, strategy: 'steady' },
    { company: 'NVIDIA', ticker: 'NVDA', weight: 25, strategy: 'growth' },
    { company: 'Tesla', ticker: 'TSLA', weight: 20, strategy: 'opportunistic' },
    { company: 'Costco', ticker: 'COST', weight: 25, strategy: 'value' },
  ];
  defaults.forEach((item) => {
    const strategyMap = {
      steady: 'Recurring cadence',
      opportunistic: 'Async deployments on signals',
      value: 'Value tilt with guardrails',
      growth: 'Growth tilt with momentum bias',
    };
    basket.push({
      ...item,
      strategyLabel: strategyMap[item.strategy],
      summary: `${item.weight}% allocated to ${item.company} (${item.ticker}) with ${strategyMap[item.strategy].toLowerCase()}.`,
    });
  });
  renderBasket();
  updateChart();
}

bindActions();
initDefaults();
simulateProjection();
