import { ClientId } from './../types';
import { Message } from './Message';

export enum ServerMessageType {
  ERROR = 'ERROR',
  CONNECTED = 'CONNECTED',
}

interface ServerMessage__ERROR extends Message<ServerMessageType> {
  type: ServerMessageType.ERROR;
  data: {
    message: string;
  };
}

interface ServerMessage__CONNECTED extends Message<ServerMessageType> {
  type: ServerMessageType.CONNECTED;
  data: ClientId;
}

export type ServerMessage = ServerMessage__ERROR | ServerMessage__CONNECTED;
