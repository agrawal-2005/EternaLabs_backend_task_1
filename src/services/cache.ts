import { Redis } from "@upstash/redis";
import { REDIS_URL, REDIS_TOKEN } from "../config";

export const client = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export async function getKey(key: string): Promise<any | null> {
  const val = await client.get<string>(key);
  if (!val) return null;

  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

export async function setKey(key: string, value: any): Promise<void> {
  await client.set(key, JSON.stringify(value));
}