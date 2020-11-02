import { Message } from '@amatiasq/socket';

export type ClientMessage =
  | Message<'ERROR', { message: string }>
  | Message<'HANDSHAKE'>;
