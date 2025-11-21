export class BasketService {
  constructor(priceService) {
    this.priceService = priceService;
  }

  async buildAllocation(basket, contribution = 0) {
    const normalized = basket.map((entry) => ({
      symbol: entry.symbol?.toUpperCase?.() || '',
      allocation: Number(entry.allocation)
    })).filter((entry) => entry.symbol && entry.allocation > 0);

    if (!normalized.length) {
      throw new Error('Basket requires at least one valid position');
    }

    const totalAllocation = normalized.reduce((sum, entry) => sum + entry.allocation, 0);
    if (totalAllocation <= 0) {
      throw new Error('Total allocation must be greater than zero');
    }

    const quotes = await this.priceService.getQuotes(normalized.map((e) => e.symbol));
    const quoteLookup = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    const positions = normalized.map((entry) => {
      const quote = quoteLookup.get(entry.symbol);
      if (!quote) {
        throw new Error(`Missing quote for ${entry.symbol}`);
      }
      const weight = entry.allocation / totalAllocation;
      const allocatedContribution = contribution * weight;
      const shares = quote.price > 0 ? allocatedContribution / quote.price : 0;
      return {
        symbol: entry.symbol,
        weight: Number(weight.toFixed(4)),
        latestPrice: quote.price,
        currency: quote.currency,
        estimatedShares: Number(shares.toFixed(4)),
        timestamp: quote.timestamp
      };
    });

    return {
      totalAllocation: Number(totalAllocation.toFixed(2)),
      contribution,
      positions
    };
  }
}
