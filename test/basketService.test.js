import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { BasketService } from '../src/basketService.js';

const mockPriceService = (quotes) => ({
  getQuotes: mock.fn(async () => quotes)
});

test('buildAllocation computes weights and shares', async () => {
  const priceService = mockPriceService([
    { symbol: 'AAPL', price: 180, currency: 'USD', timestamp: '2024-03-01T00:00:00Z' },
    { symbol: 'MSFT', price: 300, currency: 'USD', timestamp: '2024-03-01T00:00:00Z' }
  ]);
  const basketService = new BasketService(priceService);

  const result = await basketService.buildAllocation(
    [
      { symbol: 'aapl', allocation: 60 },
      { symbol: 'msft', allocation: 40 }
    ],
    1000
  );

  assert.equal(result.totalAllocation, 100);
  assert.equal(result.contribution, 1000);
  assert.equal(result.positions.length, 2);
  assert.equal(priceService.getQuotes.mock.callCount(), 1);
  const [apple, msft] = result.positions;
  assert.equal(apple.weight, 0.6);
  assert.equal(msft.weight, 0.4);
  assert.equal(apple.estimatedShares, Number((600 / 180).toFixed(4)));
  assert.equal(msft.estimatedShares, Number((400 / 300).toFixed(4)));
});

test('buildAllocation rejects invalid basket', async () => {
  const priceService = mockPriceService([]);
  const basketService = new BasketService(priceService);
  await assert.rejects(() => basketService.buildAllocation([], 500), /at least one valid/);
});

test('buildAllocation rejects when missing quotes', async () => {
  const priceService = mockPriceService([{ symbol: 'AAPL', price: 180, currency: 'USD', timestamp: '2024-03-01T00:00:00Z' }]);
  const basketService = new BasketService(priceService);
  await assert.rejects(
    () => basketService.buildAllocation([{ symbol: 'AAPL', allocation: 50 }, { symbol: 'MSFT', allocation: 50 }], 1000),
    /Missing quote/
  );
});
