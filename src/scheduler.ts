import { POLL_INTERVAL, QUERY_DEXSCREENER, QUERY_GTNETWORK } from "./config";
import { refresh } from "./services/agg";
import { broadcastUpdates } from "./services/webSockets";

export function startScheduler() {
    console.log("Scheduler started. Running initial fetch...");
    
    const runJob = async () => {
        try {
            const diffs = await refresh(QUERY_DEXSCREENER, QUERY_GTNETWORK);
            // Broadcast the changes returned by refresh
            if (diffs && diffs.length > 0) {
                broadcastUpdates(diffs);
            }
        } catch (err) {
            console.error("Scheduler refresh failed:", err);
        }
    };

    runJob();

    setInterval(runJob, POLL_INTERVAL);
}