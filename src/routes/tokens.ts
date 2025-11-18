import express from 'express';

const r = express.Router();

r.get('/', (req, res) => {
  res.json({ msg: 'token route placeholder' });
});

export default r;