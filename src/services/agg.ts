import { CACHE_KEY, QUERY_DEXSCREENER, QUERY_GTNETWORK } from "../config";
import { mergeList } from "../utils/merge";
import { getKey, setKey } from "./cache";
import { fetchDexScreener, fetchGeckoTerminal } from "./dexClient";

export async function refresh(
  dsQuery: string = QUERY_DEXSCREENER, 
  gtNetwork: string = QUERY_GTNETWORK,
  gtPage: number = 1, 
  gtSort: string = "h24_volume_usd_desc"
) {
  console.log(`refresh() fetching raw data for DS:${dsQuery} and GT:${gtNetwork}...`);

  const dsRaw = await fetchDexScreener(dsQuery).catch(() => null);
  const gtRaw = await fetchGeckoTerminal(gtNetwork, gtPage, gtSort).catch(() => null); 

  const dsArr = Array.isArray(dsRaw?.pairs) ? dsRaw.pairs : [];
  const gtArr = Array.isArray(gtRaw?.data) ? gtRaw.data : []; 
  const gtIncluded = Array.isArray(gtRaw?.included) ? gtRaw.included : []; 

  console.log("Dex Screener raw count:", dsArr.length);
  console.log("Gecko Terminal raw pool count:", gtArr.length);

  const getGtTokenMeta = (type: string, id: string) => {
    return gtIncluded.find((i: any) => i.type === type && i.id === id)?.attributes;
  };

  // 1. Normalize DexScreener
  const dsList = dsArr.map((p: any) => ({
    token_address: p.baseToken?.address,
    token_name: p.baseToken?.name,
    token_ticker: p.baseToken?.symbol,
    price_sol: Number(p.price) || 0,
    volume_sol: Number(p.volume?.h24 || 0),
    liquidity_sol: Number(p.liquidity?.usd || 0),
    market_cap_sol: Number(p.fdv || 0),
    transaction_count: Number((p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0)),
    price_1hr_change: Number(p.priceChange?.h1 || 0),
    price_24hr_change: Number(p.priceChange?.h24 || 0),
    price_7d_change: 0, 
    sources: ["dexscreener"]
  }));

  // 2. Normalize GeckoTerminal
  const gtList = gtArr.map((p: any) => {
    const attr = p.attributes;
    const baseTokenId = p.relationships?.base_token?.data?.id;
    const meta = baseTokenId ? getGtTokenMeta('token', baseTokenId) : {};
    
    return {
      token_address: p.id, 
      token_name: meta?.name,
      token_ticker: meta?.symbol,
      price_sol: Number(attr?.base_token_price_usd || 0),
      volume_sol: Number(attr?.volume_usd?.h24 || 0),
      liquidity_sol: Number(attr?.reserve_in_usd || 0),
      market_cap_sol: Number(meta?.market_cap_usd || 0),
      transaction_count: Number(attr?.transactions?.h24 || 0),
      price_1hr_change: Number(attr?.price_change_percentage?.h1 || 0),
      price_24hr_change: Number(attr?.price_change_percentage?.h24 || 0),
      price_7d_change: Number(attr?.price_change_percentage?.h7 || 0), 
      sources: ["geckoterminal"]
    }
  }).filter((t: any) => t.token_address);

  console.log("Normalised Lists:", { ds: dsList.length, gt: gtList.length });

  // 3. Merge & Cache
  const merged = mergeList([dsList, gtList]);

  // 4. Calculate Diffs
  const oldSnap = await getKey(CACHE_KEY);
  const oldList = oldSnap?.list || [];
  
  const diffs = merged.filter((n: any) => {
    const o = oldList.find((x: any) => x.token_address === n.token_address);
    if (!o) return true;
    return (
      o.price_sol !== n.price_sol || 
      o.volume_sol !== n.volume_sol ||
      o.price_1hr_change !== n.price_1hr_change
    );
  });

  await setKey(CACHE_KEY, { ts: Date.now(), list: merged });
  await setKey("tokens:diffs", diffs);

  // Return diffs so Scheduler can broadcast them
  return diffs;
}