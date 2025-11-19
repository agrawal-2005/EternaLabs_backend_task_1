import Redis from "ioredis";
import { REDIS_URL } from '../config';

const client = new Redis(REDIS_URL);

export async function getKey(key:string): Promise<any | null> {
    const val = await client.get(key);
    if(!val) return null;

    try{
        return JSON.parse(val);
    } catch{
        return null;
    }
}

export async function setKey(key:string, value: any): Promise<void> {
    await client.set(key, JSON.stringify(value));
}

export default client