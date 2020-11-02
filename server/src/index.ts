import { createServer } from 'http';

import { WebSocketServer } from '@amatiasq/socket';

import { ClientMessage } from '../../client/src/ClientMessage';
import { DEFAULT_PORT } from '../../shared/config.json';
import { ServerMessage } from './ServerMessage';

const port = process.env.PORT || DEFAULT_PORT;
const server = createServer();
const wss = new WebSocketServer<ServerMessage, ClientMessage>(server);

server.listen(port, () => console.log(`Websocket server ready at ${port}`));

wss.onConnection(ws => {
  console.log('CONNECTION');
  ws.onMessage(x => console.log(x));
  ws.onMessageType('HANDSHAKE', () => ws.send('HANDSHAKE_BACK', undefined));
});
