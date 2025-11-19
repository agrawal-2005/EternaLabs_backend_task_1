import { CACHE_KEY } from "../config";
import { mergeList } from "../utils/merge";
import { getKey, setKey } from "./cache";
import { fetchDexScreener, fetchGeckoTerminal } from "./dexClient";

export async function refresh() {
  console.log("refresh() fetching raw data....");

  const dsRaw = await fetchDexScreener("sol").catch(() => null);
  const gtRaw = await fetchGeckoTerminal("sol").catch(() => null); 

  const dsArr = Array.isArray(dsRaw?.pairs) ? dsRaw.pairs : [];
  const gtArr = Array.isArray(gtRaw?.data) ? gtRaw.data : []; 
  const gtIncluded = Array.isArray(gtRaw?.included) ? gtRaw.included : []; 

  console.log("Dex Screener raw count:", dsArr.length);
  console.log("Gecko Terminal raw pool count:", gtArr.length);

  const getGtTokenMeta = (type: string, id: string) => {
    return gtIncluded.find((i: any) => i.type === type && i.id === id)?.attributes;
  };

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

  const gtList = gtArr.map((p: any) => {
    const attr = p.attributes;
    const baseTokenId = p.relationships?.base_token?.data?.id;
    const meta = baseTokenId ? getGtTokenMeta('token', baseTokenId) : {};
    
    return {
      token_address: meta?.address,
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

  console.log("Normalised Lists:", {
    ds: dsList.length,
    gt: gtList.length,
  });

  const merged = mergeList([dsList, gtList]);

  const oldSnap = await getKey(CACHE_KEY);
  const oldList = oldSnap?.list || [];

  const newSnap = {
    ts: Date.now(),
    list: merged,
  };

  const diffs = merged.filter((n: any) => {
    const o = oldList.find((x: any) => x.token_address === n.token_address);
    if (!o) return true;
    
    return (
      o.price_sol !== n.price_sol || 
      o.volume_sol !== n.volume_sol ||
      o.price_1hr_change !== n.price_1hr_change ||
      o.price_24hr_change !== n.price_24hr_change ||
      o.price_7d_change !== n.price_7d_change
    );
  });

  await setKey(CACHE_KEY, newSnap);
  await setKey("tokens:diffs", diffs);

  return merged;
}