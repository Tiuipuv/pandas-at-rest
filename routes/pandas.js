import express from 'express';
import { get_image } from './supports/gather_icon.js';
import db from '../db/db.js';
import { broadcast, WS_EVENTS } from '../ws.js';

const router = express.Router();

//---------
// Routes
//---------
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
    panda,
    function (err) {
      // initiate stable diffusion request for image generation
      get_image({ id: this.lastID, ...panda });
      handleResponse(err, { status: 'ok' }, res, WS_EVENTS.panda_created);
    });
});

router.put(':id', (req, res) => {
  res.json({ message: 'Got a PUT request for pandas!' });
  // here is where you would do an UPDATE sql statement
});

router.delete(':id?', (req, res) => {
  if (req.params.id)
    db.get('DELETE from pandas WHERE ROWID = ?', req.params.id,
      (err, row) => handleResponse(err, row, res, WS_EVENTS.panda_deleted));
  else
    db.all('DELETE from pandas', (err, rows) => handleResponse(err, rows, res, WS_EVENTS.panda_deleted));
});

//-------------------
// Helper functions
//-------------------
function handleResponse(err, data, res, ws_event) {
  if (err) {
    console.log('Request error:\n' + err.message);
    return res.status(500).json({ error: err.message });
  }
  if (ws_event)
    broadcast(ws_event, data);
  res.json(data);
}

function parseNum(val) {
  const out = parseInt(val);
  if (isNaN(out))
    return undefined;
  return out;
}

export default router;