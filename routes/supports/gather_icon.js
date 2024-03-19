import db from '../../db/db.js';
import { WS_EVENTS, broadcast } from '../../ws.js';

/**
 * Given a panda object, generate an image from stable diffusion, and broadcast
 * its creation to all WebSocket listeners.
 * @param {object} panda panda object
 */
export async function get_image(panda) {
  // Create prompt from panda definition
  let prompt = 'panda, photorealistic, vivid, highly detailed';
  if (panda.$outfit)
    prompt += `, wearing a ${panda.$outfit}`;
  if (panda.$biome)
    prompt += `, in the ${panda.$biome}`;
  if (panda.$food)
    prompt += `, eating ${panda.$food}`;
  if (panda.$sleepiness > 6)
    prompt += ', sleeping under the stars';
  else if (panda.$sleepiness < 4)
    prompt += ', excited, jumping around';

  // Create stable diffusion payload, url, and fetch config
  const payload = {
    prompt: prompt,
    steps: 30,
    cfg_scale: 8,
    width: process.env.DIFFUSION_MODEL === 'sd_xl_base_1.0' ? 1024 : 512,
    height: process.env.DIFFUSION_MODEL === 'sd_xl_base_1.0' ? 1024 : 512,
    override_settings: {
      sd_model_checkpoint: process.env.DIFFUSION_MODEL ?? 'v1-5-pruned-emaonly'
    }
  };
  const url = `http://${process.env.DIFFUSION_URL}:${process.env.DIFFUSION_PORT}/sdapi/v1/txt2img`;
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
  try {
    // Send the request to stable diffusion server, parse results
    const results = await fetch(url, config);
    const parsed = await results.json();

    // Update the pandas image in the db. once done, broadcast it
    db.run('UPDATE pandas SET image = $image where ROWID = $id',
      { $image: parsed.images[0], $id: panda.id },
      (err) => {
        if (err)
          return console.log(err);
        console.log(panda.name + '\'s profile photo created!');
        console.log('Prompt: ' + prompt);
        broadcast(WS_EVENTS.panda_updated);
      });
  }
  catch (err) {
    console.error(err);
  }
}
