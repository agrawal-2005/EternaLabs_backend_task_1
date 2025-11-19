import { mergeList } from "../utils/merge";
import { fetchDexScreener, fetchJupiter } from "./dexClient";

export async function refresh(){
    console.log("refresh() fetching raw data....");

    const dsRaw = await fetchDexScreener("sol");
    const jpRaw = await fetchJupiter("sol");

    console.log("Dex Screener raw count:", dsRaw?.pairs?.length);
    console.log("Jupiter raw count:", jpRaw?.data?.length);

    // normalize DexScreener data
    const dsList = (dsRaw?.pairs || []).map((p: any) => ({
        token_address: p.baseToken?.address,
        token_name: p.baseToken?.name,
        token_ticker: p.baseToken?.symbol,
        price_sol: Number(p.price) || 0,
        volume_sol: Number(p.volume?.h24 || 0),
        liquidity_sol: Number(p.liquidity?.usd || 0),
        market_cap_sol: Number(p.marketCap || 0),
        transaction_count: Number(p.txns?.h24 || 0),
        sources: ["dexscreener"]
    }));

    // normalize Jupiter data
    const jpList = (jpRaw?.data || []).map((t: any) => ({
        token_address: t.address,
        token_name: t.name,
        token_ticker: t.symbol,
        price_sol: Number(t.price) || 0,
        volume_sol: Number(t.volumeUsd || 0),
        liquidity_sol: Number(t.liquidityUsd || 0),
        market_cap_sol: Number(t.marketCap || 0),
        transaction_count: 0,
        sources: ["jupiter"]
    }));

    console.log("Normalised Lists: ", {
        ds: dsList.length,
        jp: jpList.length
    });

    // merge both (ds + jp) lists using mergeList
    const merged = mergeList([dsList, jpList]);
    console.log("Merged tokens:", merged.length);
}