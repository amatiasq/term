import { ClientId } from './../../shared/types';
import { Client } from './Client';
import { createServer } from 'http';
import WebSocket, { Server } from 'ws';

import {
  ClientMessage,
  ClientMessageType,
} from '../../shared/communication/ClientMessage';
import {
  ServerMessage,
  ServerMessageType,
} from '../../shared/communication/ServerMessage';
import { DEFAULT_PORT } from '../../shared/config.json';
import { parseJson } from '../../shared/parseJson';
import { addClient, getClient } from './clients';

const port = process.env.PORT || DEFAULT_PORT;
const server = createServer();
const wss = new Server({ server });

server.listen(port, () => console.log(`Websocket server ready at ${port}`));

wss.on('connection', (ws, req) => {
  console.log('connection open');

  ws.on('close', onClose);
  ws.on('message', onMessage);

  function onClose() {
    console.log('connection closed');
  }

  function onMessage(payload: WebSocket.Data) {
    const msg = parseJson(payload as string) as ClientMessage;

    if (msg.type === ClientMessageType.CONNECT) {
      onClienConnected(ws);
    } else if (msg.type === ClientMessageType.RECONNECT) {
      onClientRecconect(ws, msg.data);
    } else {
      console.error('Unexpected message', msg.type);
    }

    ws.off('close', onClose);
    ws.off('message', onMessage);
  }
});

function onClienConnected(ws: WebSocket) {
  const client = addClient();
  listenClient(ws, client);
}

function onClientRecconect(ws: WebSocket, id: ClientId) {
  const client = getClient(id) || addClient(id);
  listenClient(ws, client);
}

function listenClient(ws: WebSocket, client: Client) {
  ws.on('close', () => console.log(`Client[${client.id}] Disconnected`));

  ws.on('message', payload => {
    const msg = parseJson(payload as string) as ClientMessage;

    console.log(`Client[${client.id}] MESSAGE`, msg);

    // const Type = ClientMessageType;
    // switch (msg.type) {}
  });

  send({
    type: ServerMessageType.CONNECTED,
    data: client.id,
  });

  function send(data: ServerMessage) {
    ws.send(JSON.stringify(data));
  }
}
