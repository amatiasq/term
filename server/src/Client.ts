import Telnet from 'telnet-client';
import { ClientId } from '../../shared/types';

export class Client {
  readonly telnet = new Telnet();

  constructor(readonly id: ClientId) {}
}
