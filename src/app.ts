import express from 'express';
import tokens from './routes/tokens'

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

//load empty routes
app.use('/tokens', tokens)

export default app;