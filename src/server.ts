import http from 'http';
import app from './app';
import { PORT } from './config';
import { attachWs } from './services/webSockets';
import { startScheduler } from './scheduler';

const server = http.createServer(app);
attachWs(server);

server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  startScheduler();
});