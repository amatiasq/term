import { ClientStorage } from '@amatiasq/client-storage';

export function getPassword(user: string) {
  const storage = new ClientStorage<string>(`pass:${user}`);
  const stored = storage.get();

  if (stored) {
    return stored;
  }

  const input = prompt(`Password for ${user}`);

  if (!input) {
    throw new Error(`Password required`);
  }

  storage.set(input);
  return input;
}
