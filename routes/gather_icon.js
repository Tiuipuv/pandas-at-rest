import db from '../db/db.js'
import { WS_EVENTS, broadcast } from '../ws.js';

let ws;

export async function get_image(panda) {
  let prompt = 'panda, photorealistic, vivid, highly detailed';
  if (panda.$outfit)
    prompt += `, wearing a ${panda.$outfit}`;
  if (panda.$biome)
    prompt += `, in the ${panda.$biome}`
  if (panda.$food)
    prompt += `, eating ${panda.$food}`;
  if (panda.$sleepiness > 6)
    prompt += ', sleeping under the stars';
  else if (panda.$sleepiness < 4)
    prompt += ', excited, jumping around';
  const payload = {
    prompt: prompt,
    steps: 30,
    //seed: 1234,
    cfg_scale: 8,
    width: 512,
    height: 512,
    //restore_faces: true,
    override_settings: {
      sd_model_checkpoint: 'v1-5-pruned-emaonly'//"sd_xl_base_1.0"
    }
  }
  const url = `http://${process.env.DIFFUSION_URL}:${process.env.DIFFUSION_PORT}/sdapi/v1/txt2img`;
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
  try {
    const results = await fetch(url, config);
    console.log(results)
    const parsed = await results.json();
    console.log(parsed)
    //Insert into db
    db.run(`UPDATE pandas SET image = $image where ROWID = $id`, { $image: parsed.images[0], $id: panda.id}, (err) =>
    {
      if (err)
        return console.log(err)
      broadcast(WS_EVENTS.image_generated, parsed)
    })
  }
  catch (err)
  {
    console.error(err);
  }
}

export function set_ws(ws_instance) {
  ws = ws_instance;
}