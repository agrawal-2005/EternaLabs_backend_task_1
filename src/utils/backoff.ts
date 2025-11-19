export async function retry<T>(fn: () => Promise<T>, max = 4, base = 200): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > max) throw err;
      const jitter = Math.floor(Math.random() * 100);
      const wait = base * (2 ** (attempt - 1)) + jitter;
      await new Promise(r => setTimeout(r, wait));
    }
  }
}