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

// export async function fetchJupiter(query:string) {
//     if (!DEX.jupiter) {
//         console.error("Jupiter API URL not defined in config");
//         return { data: [] };
//     }
//     const url = `${DEX.jupiter}${encodeURIComponent(query)}`;
//     try {
//         return await fetchJson(url);
//     } catch (err) {
//         console.log("Jupiter fetch failed:", err);
//         return { data: [] }
//     }
// }

export async function fetchGeckoTerminal(
    network: string, 
    page: number = 1, 
    sort: string = 'h24_volume_usd_desc'
) {
    // Handle common aliases (e.g., 'sol' to 'solana')
    const chain = network.toLowerCase() === 'sol' ? 'solana' : network;

    // Constructs the dynamic URL using network, page, and sort parameters
    const url = `${DEX.geckoterminal}/${chain}/pools?page=${page}&include=base_token,quote_token&sort=${sort}`;
    
    try {
        return await fetchJson(url);
    } catch (err) {
        console.log(`GeckoTerminal fetch failed for ${chain} (Page ${page}):`, err);
        return { data: [], included: [] }
    }
}