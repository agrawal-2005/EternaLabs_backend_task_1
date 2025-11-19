import express from 'express';
import { getKey } from '../services/cache';
import { CACHE_KEY } from '../config';
import { encodeCursor, decodeCursor } from '../utils/cursor';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const sort = String(req.query.sort || "volume");
    const order = String(req.query.order || "desc");
    const period = String(req.query.period || "24h");
    const cursor = String(req.query.cursor || "");

    const snap = await getKey(CACHE_KEY);
    const list = snap?.list || [];

    let filtered = [...list];

    // period filter
    if (period === "1h") {
      filtered = filtered.filter((t) => t.price_1hr_change !== undefined);
    }

    // sorting
    filtered.sort((a: any, b: any) => {
      if (sort === "volume") {
        return (b.volume_sol || 0) - (a.volume_sol || 0);
      }
      if (sort === "price_change") {
        return (b.price_1hr_change || 0) - (a.price_1hr_change || 0);
      }
      return (b.market_cap_sol || 0) - (a.market_cap_sol || 0);
    });

    if (order === "asc") filtered.reverse();

    // cursor pagination
    const start = decodeCursor(cursor) || 0;
    const items = filtered.slice(start, start + limit);

    const nextCursor =
      start + limit < filtered.length
        ? encodeCursor(start + limit)
        : null;

    res.json({
      items,
      nextCursor,
    });
  } catch (err) {
    console.error("Error in /tokens route:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;