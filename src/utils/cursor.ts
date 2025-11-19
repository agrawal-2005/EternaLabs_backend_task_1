import base64url from 'base64url';

export function encodeCursor(n: number): string {
  return base64url.encode(String(n));
}

export function decodeCursor(s?: string): number {
  if (!s) return 0;
  try {
    const dec = base64url.decode(s);
    const n = Number(dec);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}
