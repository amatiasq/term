import { Message } from '@amatiasq/socket';

export type ServerMessage =
  | Message<'ERROR', string>
  | Message<'OUTPUT', string>
  | Message<'CONNECTED'>
  | Message<'DISCONNECTED'>;
