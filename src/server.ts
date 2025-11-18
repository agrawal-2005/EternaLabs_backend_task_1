import http from 'http';
import app from './app';

const port = Number(process.env.PORT) || 5251;

const srv = http.createServer(app);

srv.listen(port, () => {
  console.log(`server running on port ${port}`);
});