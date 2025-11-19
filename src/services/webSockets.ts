import "dotenv/config";
import { Server } from "socket.io";
import { getKey, setKey } from "./cache";
import { POLL_INTERVAL } from "../config";

export function attachWs(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // console.log("client connected");
    socket.join("tokens");
  });

  /**
   * Upstash Redis Pub/Sub
   * subscribe(channel, callback)
   */

  //poll reads every 1 second
  setInterval(async () => {
    const diffs = await getKey("tokens:diffs");
    if(diffs && diffs.length > 0){
        io.to("tokens").emit("upd", diffs);

        await setKey("tokens:diffs", []);
    }
  }, POLL_INTERVAL)

  return io;
}
