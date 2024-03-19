import express from 'express';
import 'dotenv/config';
import routerPandas from './routes/pandas.js';

const port = 8080;
const app = express();

// Automatically parse all json based requests
app.use(express.json());

// Log API requests
app.use('/api/*', (req, res, next) => {
  console.log(`${req.method} ${req.baseUrl}`);
  next();
});

// Bind our router file to pandas api route
app.use('/api/pandas', routerPandas);

// All other requests that dont match an API route give a 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Unknown API route '${req.url}'` });
});

// Serve the public folder for all other requests
app.use(express.static('public'));

// Start the server, and announce configs.
app.listen(port, () => {
  console.log(`Pandas app listening on port ${port}`);
  console.log(`Stable diffusion configured at ${process.env.DIFFUSION_URL}:${process.env.DIFFUSION_PORT}`);
  if (process.env.DIFFUSION_MODEL)
    console.log(`Using custom model '${process.env.DIFFUSION_MODEL}'`);
});
