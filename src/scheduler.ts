import { POLL_INTERVAL } from "./config";
import { refresh } from "./services/agg";

export function startScheduler() {
    // console.log("scheduler started. Polling every", POLL_INTERVAL, "ms");

    setInterval(async () => {
        try {
        await refresh();
        } catch (err) {
        console.error("Scheduler refresh failed:", err);
        }
    }, POLL_INTERVAL);
}