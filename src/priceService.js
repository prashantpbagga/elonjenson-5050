export class PriceService {
  constructor(fetchImpl) {
    this.fetch = fetchImpl;
    this.endpoint = 'https://query1.finance.yahoo.com/v7/finance/quote';
  }

  async getQuotes(symbols) {
    const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];
    const url = `${this.endpoint}?symbols=${encodeURIComponent(uniqueSymbols.join(','))}`;
    const response = await this.fetch(url);
    if (!response.ok) {
      throw new Error(`Quote request failed with status ${response.status}`);
    }
    const json = await response.json();
    const results = json?.quoteResponse?.result || [];
    if (!results.length) {
      throw new Error('No quote data returned');
    }
    return results.map((item) => ({
      symbol: item.symbol,
      price: Number(item.regularMarketPrice ?? item.postMarketPrice ?? 0),
      currency: item.currency || 'USD',
      timestamp: item.regularMarketTime ? new Date(item.regularMarketTime * 1000).toISOString() : new Date().toISOString()
    }));
  }
}
