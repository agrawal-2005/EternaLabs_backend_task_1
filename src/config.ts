export const PORT = Number(process.env.PORT) || 3000;

export const REDIS_URL = process.env.REDIS_URL || '';

if (!REDIS_URL) {
  console.warn(
    'REDIS_URL is missing. Set your Redis URL in .env.'
  );
}

export const REDIS_TOKEN = process.env.REDIS_TOKEN || '';
if (!REDIS_TOKEN) {
  console.warn(
    'REDIS_TOKEN is missing. Set your Redis TOKEN in .env.'
  );
}

export const CACHE_KEY = 'tokens:snapshot';
export const TTL = Number(process.env.TTL_SEC || 30);
