import { PluginContext } from './PluginContext';
import { wait } from './util/wait';

export async function login(
  { write, watch, waitFor, log }: PluginContext,
  username: string,
  password: string,
) {
  const subscription = watch('Pulsa [ENTER]', () => write(' '));

  write(username);
  log('Username sent, waiting for password request');
  await waitFor('Password:');
  write(password);
  log(`Logged in as ${username}`);

  wait(2).then(() => subscription.unsubscribe());
}
