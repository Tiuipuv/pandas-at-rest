import express from 'express';
import { get_image } from './gather_icon.js';
import db from '../db/db.js'

const router = express.Router();

function parseNum(val)
{
  const out = parseInt(val)
  if (isNaN(out))
    return undefined;
  return out;
}

router.get('/:id?', (req, res) => {
  if (req.params.id)
    db.get('SELECT * from pandas WHERE ROWID = ?', req.params.id,
      (err, row) => handleResponse(err, row, res));
  else
    db.all('SELECT * from pandas', (err, rows) => handleResponse(err, rows, res));
});

router.post('/', (req, res) => {
  const panda = {
    $name: req.body.name || 'Chester',
    $biome: req.body.biome || 'rainforest',
    $outfit: req.body.outfit,
    $food: req.body.food || 'original',
    $sleepiness: parseNum(req.body.sleepiness) ?? 6
  };
  db.run('INSERT INTO pandas (name, biome, outfit, food, sleepiness) ' +
    'VALUES ($name, $biome, $outfit, $food, $sleepiness)',
    panda, function (err) {
       // initiate stable diffusion request for image generation
       get_image({id: this.lastID, ...panda});
       handleResponse(err, { status: 'ok' }, res);
    });
});

router.put(':id', (req, res) => {
  res.json({ message: 'Got a PUT request for pandas!' });
  // here is where you would do an UPDATE sql statement
});

router.delete(':id?', (req, res) => {
  if (req.params.id)
    db.get('DELETE from pandas WHERE ROWID = ?', req.params.id,
      (err, row) => handleResponse(err, row, res));
  else
    db.all('DELETE from pandas', (err, rows) => handleResponse(err, rows, res));
});

function handleResponse(err, data, res) {
  if (err)
  {
    console.log('Request error:\n' + err.message);
    return res.status(500).json({ error: err.message });
  }
  res.json(data);
}

export default router;