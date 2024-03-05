import express from 'express';
import sqlite3 from 'sqlite3';

const router = express.Router();
const db = new sqlite3.Database('./db/zoo.db');

router.get('/:id?', (req, res) => {
  if (req.params.id)
    db.get('SELECT * from pandas WHERE ROWID = ?', req.params.id,
      (err, row) => handleResponse(err, row, res));
  else
    db.all('SELECT * from pandas', (err, rows) => handleResponse(err, rows, res));
});

router.post('/', (req, res) => {
  if (req.body?.sleepiness < 5)
    return res.json({ error: 'sleepiness cannot be less than 5/10.' });
  const panda = {
    $name: req.body.name || 'Chester',
    $size: req.body.size || 30,
    $squishability: req.body.squishability ?? 7,
    $favorite_bamboo_type: req.body.favoriteBambooType ?? 'original',
    $sleepiness: req.body.sleepiness || 6
  };
  db.run('INSERT INTO pandas (name, size, squishability, favorite_bamboo_type, sleepiness) ' +
    'VALUES ($name, $size, $squishability, $favorite_bamboo_type, $sleepiness)',
    panda, (err) => handleResponse(err, { status: 'ok' }, res));
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