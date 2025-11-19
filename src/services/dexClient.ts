import axios from "axios";
import { retry } from "../utils/backoff";
import { DEX } from "../config";

async function fetchJson(url:string): Promise<any> {
    return retry(async () => {
        const res = await axios.get(url, {timeout: 5000});
        return res.data;
    }, 4);
}

export async function fetchDexScreener(query:string) {
    const url = `${DEX.dexscreener}${encodeURIComponent(query)}`;
    try {
        return await fetchJson(url);
    } catch (err) {
        console.log("DexScreener fetch failed:", err);
        return { pairs: [] }
    }
}

export async function fetchGeckoTerminal(query:string) {
    const url = `${DEX.geckoterminal}?page=1&include=base_token,quote_token&sort=h24_volume_usd_desc`;
    try {
        return await fetchJson(url);
    } catch (err) {
        console.log("GeckoTerminal fetch failed:", err);
        return { data: [], included: [] }
    }
}