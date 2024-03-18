import { WebSocketServer } from 'ws';

const ws_port = 8081;
const wss = new WebSocketServer({ port: ws_port });

console.log(`Web Socket listening on port ${ws_port}`);

wss.on('connection', ws => {
  console.log('client connected')
  ws.on('message', (data) => {
    console.log('received: %s', data);
  });
})

export function broadcast(event, data) {
  wss.clients.forEach(client => {
    client.send(JSON.stringify({event: event, data: data}))
  })
}

export const WS_EVENTS = {
  image_generated: 1
}