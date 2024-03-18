import express from 'express';
import 'dotenv/config';

// All API routes imported here
import routerPandas from './routes/pandas.js';

const port = 8080;

const app = express();

app.use(express.json());

app.use('/api/*', (req, res, next) => {
  console.log(`${req.method} ${req.baseUrl}`);
  next();
});
app.use('/api/pandas', routerPandas);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Unknown API route '${req.url}'` });
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Pandas app listening on port ${port}`);
});

console.log(`Stable diffusion configured at ${process.env.DIFFUSION_URL}:${process.env.DIFFUSION_PORT}`)