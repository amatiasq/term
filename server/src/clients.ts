import { ClientId } from './../../shared/types';
import { Client } from './Client';

const clients = new Map<ClientId, Client>();
let lastId = 0;

export function addClient(id: ClientId = getNextId()) {
  const client = new Client(id);
  removeClient(id);
  clients.set(client.id, client);
  return client;
}

export function removeClient(id: ClientId) {
  if (!clients.has(id)) {
    return false;
  }

  const client = clients.get(id)!;
  clients.delete(id);
  client.telnet.destroy();
  return true;
}

export function getClient(id: ClientId) {
  return clients.get(id);
}

function getNextId(): ClientId {
  return ++lastId as any;
}
