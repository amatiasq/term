import { Message } from '@amatiasq/socket';

export type ServerMessage =
  | Message<'ERROR', { message: string }>
  | Message<'HANDSHAKE_BACK'>;
