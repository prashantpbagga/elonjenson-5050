import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { PriceService } from '../src/priceService.js';

const buildResponse = (ok, status, body) => ({
  ok,
  status,
  async json() {
    return body;
  }
});

test('getQuotes returns mapped quotes', async () => {
  const fakeFetch = mock.fn(async () => buildResponse(true, 200, {
    quoteResponse: {
      result: [
        { symbol: 'AAPL', regularMarketPrice: 190.1, currency: 'USD', regularMarketTime: 1710000000 },
        { symbol: 'MSFT', postMarketPrice: 410.2, currency: 'USD', regularMarketTime: 1710003600 }
      ]
    }
  }));
  const service = new PriceService(fakeFetch);
  const quotes = await service.getQuotes(['aapl', 'MSFT', 'AAPL']);

  assert.equal(quotes.length, 2);
  assert.deepEqual(quotes[0], {
    symbol: 'AAPL',
    price: 190.1,
    currency: 'USD',
    timestamp: new Date(1710000000 * 1000).toISOString()
  });
  assert.equal(quotes[1].symbol, 'MSFT');
  assert.equal(quotes[1].price, 410.2);
  assert.equal(fakeFetch.mock.callCount(), 1);
});

test('getQuotes throws when api fails', async () => {
  const fakeFetch = async () => buildResponse(false, 500, {});
  const service = new PriceService(fakeFetch);
  await assert.rejects(() => service.getQuotes(['AAPL']), /status 500/);
});

test('getQuotes throws when empty result', async () => {
  const fakeFetch = async () => buildResponse(true, 200, { quoteResponse: { result: [] } });
  const service = new PriceService(fakeFetch);
  await assert.rejects(() => service.getQuotes(['AAPL']), /No quote data returned/);
});
