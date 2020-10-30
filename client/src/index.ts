import { ClientId } from './../../shared/types';
import { ServerMessageType } from './../../shared/communication/ServerMessage';
import { ResilientSocket } from '@amatiasq/resilient-socket';

import {
  ClientMessage,
  ClientMessageType,
} from '../../shared/communication/ClientMessage';
import { ServerMessage } from '../../shared/communication/ServerMessage';
import { DEFAULT_PORT } from '../../shared/config.json';
import { parseJson } from '../../shared/parseJson';

let FORCE_PROD_SERVER = false;
// FORCE_PROD_SERVER = true;

const serverUri =
  location.origin === 'https://amatiasq.github.io' || FORCE_PROD_SERVER
    ? 'wss://ts-socket.amatiasq.com'
    : `ws://localhost:${DEFAULT_PORT}`;

const socket = openSocket(serverUri);
const client: any = {};

function openSocket(uri: string) {
  const socket = new ResilientSocket(uri);

  socket.onClose(event => console.log('Socket closed'));
  socket.onError(event => console.log('Reconnection failed'));

  socket.onOpen(event => {
    console.log('Socket open');
    send({ type: ClientMessageType.CONNECT, data: null });
  });

  socket.onReconnect(event => {
    const time = Date.now() - Number(event.disconnectedTime);
    console.log(`Disconnected for ${time} milliseconds`);

    if (client.id) {
      send({ type: ClientMessageType.RECONNECT, data: client.id });
    } else {
      send({ type: ClientMessageType.CONNECT, data: null });
    }
  });

  socket.onMessage(event => {
    const msg = parseJson(event.data) as ServerMessage;
    const Type = ServerMessageType;

    switch (msg.type) {
      case Type.CONNECTED:
        client.id = msg.data;
        ready();
        break;
    }
  });

  return socket;
}

function send(message: ClientMessage) {
  console.log('sending', message);
  socket.send(JSON.stringify(message));
}

function ready() {
  console.log('ready', client.id);

  send({
    type: ClientMessageType.OPEN,
    data: {
      server: 'mud.balzhur.org',
      port: 5400,
    },
  });
}
