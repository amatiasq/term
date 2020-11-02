import { ClientSocket } from '@amatiasq/socket';

import { ServerMessage } from '../../server/src/ServerMessage';
import { DEFAULT_PORT } from '../../shared/config.json';
import { ClientMessage } from './ClientMessage';

let FORCE_PROD_SERVER = false;
// FORCE_PROD_SERVER = true;

const serverUri =
  location.origin === 'https://amatiasq.github.io' || FORCE_PROD_SERVER
    ? 'wss://ts-socket.amatiasq.com'
    : `ws://localhost:${DEFAULT_PORT}`;

const socket = new ClientSocket<ClientMessage, ServerMessage>(serverUri);

socket.onMessage(x => console.log('MESSAGE', x));

socket.onConnected(x => {
  console.log('SUPERPOTATO');
  socket.send('HANDSHAKE', undefined);
});
