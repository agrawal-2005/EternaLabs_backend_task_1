import http from 'http';
import app from './app';
import { PORT } from './config';

const srv = http.createServer(app);

srv.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});