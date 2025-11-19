import express from 'express';
import { getKey } from '../services/cache';
import { CACHE_KEY } from '../config';
import { encodeCursor, decodeCursor } from '../utils/cursor';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const metric = String(req.query.sort || "volume"); 
    const order = String(req.query.order || "desc");
    const period = String(req.query.period || "24h");
    const cursor = String(req.query.cursor || "");

    const snap = await getKey(CACHE_KEY);
    console.log(`API Debug - Cache Hit? ${!!snap}, Item Count: ${snap?.list?.length}`);

    const list = snap?.list || [];
    let filtered = [...list];

    // FILTERING
    const minLiq = parseFloat(req.query.min_liq as string) || 0;
    const minVol = parseFloat(req.query.min_vol as string) || 0;

    if (minLiq > 0) {
        filtered = filtered.filter((t: any) => (t.liquidity_sol || 0) >= minLiq);
    }
    if (minVol > 0) {
        filtered = filtered.filter((t: any) => (t.volume_sol || 0) >= minVol);
    }

    // DYNAMIC Sorting Implementation
    filtered.sort((a: any, b: any) => {
      let sortField: string;

      if (metric === "volume") {
        sortField = "volume_sol";
      } else if (metric === "market_cap") {
        sortField = "market_cap_sol";
      } else if (metric === "price_change") {
        if (period === "1h") {
          sortField = "price_1hr_change";
        } else if (period === "7d") {
          sortField = "price_7d_change";
        } else {
          sortField = "price_24hr_change"; 
        }
      } else {
        sortField = `${metric}_sol` in a ? `${metric}_sol` : "volume_sol";
      }

      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      
      return (valB - valA);
    });

    if (order === "asc") filtered.reverse();

    // Cursor Pagination
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