import { ClientId } from './../types';
import { Message } from './Message';

export enum ClientMessageType {
  ERROR = 'ERROR',
  CONNECT = 'CONNECT',
  RECONNECT = 'RECONNECT',
  OPEN = 'OPEN',
}

interface ClientMessage__ERROR extends Message<ClientMessageType> {
  type: ClientMessageType.ERROR;
  data: { message: string };
}

interface ClientMessage__CONNECT extends Message<ClientMessageType> {
  type: ClientMessageType.CONNECT;
  data: null;
}

interface ClientMessage__RECONNECT extends Message<ClientMessageType> {
  type: ClientMessageType.RECONNECT;
  data: ClientId;
}

interface ClientMessage__OPEN extends Message<ClientMessageType> {
  type: ClientMessageType.OPEN;
  data: {
    server: string;
    port: number;
  };
}

export type ClientMessage =
  | ClientMessage__ERROR
  | ClientMessage__CONNECT
  | ClientMessage__RECONNECT
  | ClientMessage__OPEN;
