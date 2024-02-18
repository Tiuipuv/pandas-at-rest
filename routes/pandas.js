import express from 'express';

const router = express.Router();

router.get('/:id?', (req, res) => {
  console.log(req.params.id);
  res.send('Hello World!');
});

router.post('/', (req, res) => {
  res.send('Got a POST request');
});

router.put(':id', (req, res) => {
  res.json({ message: 'Got a PUT request for pandas!' });
});

router.delete(':id', (req, res) => {
  res.json({ message: `Got a DELETE request for panda '${req.params.id}' :(` });
});

export default router;