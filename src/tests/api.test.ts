import request from 'supertest';
import app from '../app';
import * as cacheService from '../services/cache';
import { Token } from '../utils/types';

const mockTokens: any[] = [
  { 
    token_address: 't1', name: 'Bitcoin', ticker: 'BTC', 
    volume_sol: 5000, price_1hr_change: 10, price_24hr_change: 5, 
    market_cap_sol: 100000, liquidity_sol: 50000 
  },
  { 
    token_address: 't2', name: 'Ethereum', ticker: 'ETH', 
    volume_sol: 4000, price_1hr_change: 20, price_24hr_change: 15, 
    market_cap_sol: 80000, liquidity_sol: 40000 
  },
  { 
    token_address: 't3', name: 'Solana', ticker: 'SOL', 
    volume_sol: 3000, price_1hr_change: 5, price_24hr_change: 25, 
    market_cap_sol: 60000, liquidity_sol: 30000 
  },
  { 
    token_address: 't4', name: 'Pepe', ticker: 'PEPE', 
    volume_sol: 2000, price_1hr_change: -10, price_24hr_change: -5, 
    market_cap_sol: 10000, liquidity_sol: 500 
  },
  { 
    token_address: 't5', name: 'Doge', ticker: 'DOGE', 
    volume_sol: 1000, price_1hr_change: 0, price_24hr_change: 0, 
    market_cap_sol: 5000, liquidity_sol: 100 
  }
];

describe('GET /tokens Endpoint', () => {
  // Reset cache mock before every test
  beforeEach(() => {
    jest.spyOn(cacheService, 'getKey').mockResolvedValue({
      ts: Date.now(),
      list: mockTokens
    });
  });

  afterEach(() => jest.restoreAllMocks());

  // --- Happy Paths (7 Tests) ---

  it('1. Should return 200 and full list structure by default', async () => {
    const res = await request(app).get('/tokens');
    expect(res.statusCode).toEqual(200);
    expect(res.body.items.length).toEqual(5);
    expect(res.body).toHaveProperty('nextCursor');
  });

  it('2. Should sort by Volume (Descending) by default', async () => {
    const res = await request(app).get('/tokens');
    expect(res.body.items[0].ticker).toBe('BTC'); // 5000 vol
    expect(res.body.items[4].ticker).toBe('DOGE'); // 1000 vol
  });

  it('3. Should sort by Price Change 24h (Descending)', async () => {
    const res = await request(app).get('/tokens?sort=price_change&period=24h&order=desc');
    expect(res.body.items[0].ticker).toBe('SOL'); // 25% change
    expect(res.body.items[4].ticker).toBe('PEPE'); // -5% change
  });

  it('4. Should sort by Market Cap (Ascending)', async () => {
    const res = await request(app).get('/tokens?sort=market_cap&order=asc');
    expect(res.body.items[0].ticker).toBe('DOGE'); // 5000 mcap
    expect(res.body.items[4].ticker).toBe('BTC'); // 100000 mcap
  });

  it('5. Should filter by Minimum Liquidity', async () => {
    // Filter out t4(500) and t5(100), keep others (>1000)
    const res = await request(app).get('/tokens?min_liq=1000');
    expect(res.body.items.length).toEqual(3);
    expect(res.body.items.find((t: any) => t.ticker === 'DOGE')).toBeUndefined();
  });

  it('6. Should filter by Minimum Volume', async () => {
    const res = await request(app).get('/tokens?min_vol=4500');
    expect(res.body.items.length).toEqual(1);
    expect(res.body.items[0].ticker).toBe('BTC');
  });

  it('7. Should handle Pagination (Limit & Cursor)', async () => {
    // Request first 2 items
    const res1 = await request(app).get('/tokens?limit=2');
    expect(res1.body.items.length).toEqual(2);
    const cursor = res1.body.nextCursor;

    // Request next 2 items using cursor
    const res2 = await request(app).get(`/tokens?limit=2&cursor=${cursor}`);
    expect(res2.body.items.length).toEqual(2);
    expect(res2.body.items[0].ticker).toBe('SOL'); // 3rd item in mock list
  });

  // --- Edge Cases (4 Tests) ---

  it('8. Edge Case: Should return empty list if cache is null (Cold Start)', async () => {
    jest.spyOn(cacheService, 'getKey').mockResolvedValue(null);
    const res = await request(app).get('/tokens');
    expect(res.statusCode).toEqual(200);
    expect(res.body.items).toEqual([]);
  });

  it('9. Edge Case: Should handle invalid sort param gracefully (Fallback to Volume)', async () => {
    const res = await request(app).get('/tokens?sort=invalid_metric');
    expect(res.statusCode).toEqual(200);
    // Should default to volume sort (BTC first)
    expect(res.body.items[0].ticker).toBe('BTC');
  });

  it('10. Edge Case: Should cap max limit at 100', async () => {
    // Request 1000 items
    const res = await request(app).get('/tokens?limit=1000');
    // Logic caps at 100, but since we only have 5 items, it returns 5. 
    // We verify it doesn't crash or return error.
    expect(res.statusCode).toEqual(200);
    expect(res.body.items.length).toEqual(5);
  });

  it('11. Edge Case: Should handle invalid cursor string gracefully', async () => {
    const res = await request(app).get('/tokens?cursor=invalid_base64');
    expect(res.statusCode).toEqual(200);
    // Should default to start index 0
    expect(res.body.items[0].ticker).toBe('BTC');
  });
});