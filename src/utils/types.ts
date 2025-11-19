export interface Token {
  addr: string;     // Token Address (Pool or Contract)
  name: string;     // Token Name
  ticker: string;   // Token Symbol
  price: number;    // Price in USD/Native
  mCap: number;     // Market Cap
  vol24h: number;   // 24h Volume
  liq: number;      // Liquidity
  txCnt: number;    // 24h Transaction Count
  chg1h: number;    // 1 Hour Price Change %
  chg24h: number;   // 24 Hour Price Change %
  chg7d: number;    // 7 Day Price Change %
  proto: string;    // Protocol/DEX Name
  src: string;      // Source identifier (e.g., 'dexscreener')
  ts: number;       // Timestamp of update
  sources?: string[]; // List of aggregated sources
}