import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getKey } from "./cache";
import { CACHE_KEY } from "../config";

let io: SocketIOServer;

export const attachWs = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", async (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.join("tokens");

    const snap = await getKey(CACHE_KEY); 
    if (snap && snap.list) {
        socket.emit('initialData', snap.list);
    }
  });
  return io;
};

export const broadcastUpdates = (diffs: any[]) => {
    if (io && diffs.length > 0) {
        console.log(`Broadcasting ${diffs.length} updates to clients...`);
        io.to("tokens").emit('upd', diffs);
    }
};