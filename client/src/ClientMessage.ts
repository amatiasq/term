import { Message } from '@amatiasq/socket';

export type ClientMessage =
  | Message<'ERROR', string>
  | Message<'OPEN', { host: string; port: number }>
  | Message<'INPUT', string>;
