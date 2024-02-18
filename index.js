import express from 'express';

// All API routes imported here
import routerPandas from './routes/pandas.js';

const app = express();
const port = 8080;

app.use('/api/pandas', routerPandas);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Unknown API route '${req.url}'`});
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
