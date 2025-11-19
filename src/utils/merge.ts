import base64url from 'base64url';

export function encodeCursor(n: number): string {
  return base64url.encode(String(n));
}

export function decodeCursor(s?: string): number {
  if (!s) return 0;
  try {
    const dec = base64url.decode(s);
    const n = Number(dec);
        // Ensure decoded cursor is a valid, non-negative integer
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}


export function mergeList(lists: any[][]) {
  const mpp = new Map<string, any>();

  for(const list of lists){
    for(const t of list){
      const id = t.token_address || t.address || t.id;

      if(!id) continue;

      if(!mpp.has(id)){
        mpp.set(id, {...t, sources: t.sources ? [...t.sources] : []}); 
        continue;
      }

      //if token already exist ---> then merge fields
      const old_token = mpp.get(id);

      const merged = {
        token_address: id,

        token_name: old_token.token_name || t.token_name,
        token_ticker: old_token.token_ticker || t.token_ticker,

        price_sol: t.price_sol ?? old_token.price_sol,   

        volume_sol: Math.max(old_token.volume_sol || 0, t.volume_sol || 0), 
        liquidity_sol: Math.max(old_token.liquidity_sol || 0, t.liquidity_sol || 0),
        market_cap_sol: Math.max(old_token.market_cap_sol || 0, t.market_cap_sol || 0),
        
        transaction_count: (old_token.transaction_count || 0) + (t.transaction_count || 0),

        price_1hr_change: t.price_1hr_change ?? old_token.price_1hr_change,
        price_24hr_change: t.price_24hr_change ?? old_token.price_24hr_change,
        price_7d_change: t.price_7d_change ?? old_token.price_7d_change,

        sources: Array.from(new Set([...(old_token.sources || []), ...(t.sources || [])]))
      }
      mpp.set(id, merged)
    }
  }
  return Array.from(mpp.values());
}