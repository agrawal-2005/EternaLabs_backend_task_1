import { Redis } from "@upstash/redis"; // Now using the correct HTTP/REST client
import { REDIS_URL, REDIS_TOKEN, TTL } from "../config";

export const client = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export async function getKey(key: string): Promise<any | null> {
  try {
    const val = await client.get(key);
    
    if (!val) return null;

    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (parseErr) {
            console.error(`JSON Parse error for key ${key}`, parseErr);
            return null; 
        }
    }

    return val;
  } catch (err) {
    console.error(`Cache Read Error for ${key}:`, err);
    return null;
  }
}

export async function setKey(key: string, value: any): Promise<void> {
  try {
    const stringValue = JSON.stringify(value);
    await client.set(key, stringValue, { ex: TTL });
  } catch (err) {
    console.error(`Cache Write Error for ${key}:`, err);
  }
}