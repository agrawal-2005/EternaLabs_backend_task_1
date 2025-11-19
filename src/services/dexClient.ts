import axios from "axios";
import { retry } from "../utils/backoff";
import { DEX } from "../config";

async function fetchJson(url:string): Promise<any> {
    return retry(async () => {
        const res = await axios.get(url, {timeout: 5000});
        return res.data;
    }, 4);
}

export async function fetchDexScreener(query = "") {
    const url = `${DEX.dexscreener}${encodeURIComponent(query)}`;
    try {
        return await fetchJson(url);
    } catch (err) {
        console.log("DexScreener fetch failed:", err);
        return { pairs: [] }
    }
}

export async function fetchJupiter(query = "") {
    const url = `${DEX.jupiter}${encodeURIComponent(query)}`;
    try {
        return await fetchJson(url);
    } catch (err) {
        console.log("Jupiter fetch failed:", err);
        return { data: [] }
    }
}