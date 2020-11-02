export function getPassword(user: string) {
  const key = `pass:${user}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    return stored;
  }

  const input = prompt(`Password for ${user}`);

  if (!input) {
    throw new Error(`Password required`);
  }

  localStorage.setItem(key, input);
  return input;
}
