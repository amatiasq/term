import { LoginMachine } from './machines/Login';
import { TriggerCollection } from './triggers/TriggerCollection';
import { RemoteTelnet } from './RemoteTelnet';
import { socket } from './socket';
import { Terminal } from './Terminal';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';
import { initMachines, initTriggers } from './config';

const { user, server } = getQueryParams();
const [host, port] = server.split(':');
const pass = getPassword(user);

const telnet = new RemoteTelnet(socket);
const terminal = new Terminal();

const triggers = new TriggerCollection({
  send: (text: string) => telnet.send(text),
});

terminal.render(document.body);
terminal.write(`Connecting to ${host}:${port} as ${user}\n`);

telnet.onConnected(async () => {
  const login = new LoginMachine(triggers, telnet);
  await login.start(user, pass);
  console.log(`Logged in as ${user}`);

  initTriggers(triggers);
  initMachines(triggers);
});

telnet.onData(data => {
  triggers.process(data);
  terminal.write(data);
});

socket.onConnected(() => {
  telnet.connect({ host, port: parseInt(port) });

  terminal.onSubmit(value => {
    terminal.write(`${value}\n`);
    telnet.send(value);
  });

  document.body.addEventListener('click', () => terminal.focus());

  window.onbeforeunload = () => {
    if (telnet.isConnected) {
      telnet.send('abandonar');
    }

    telnet.close();
  };
});

function loadMachines() {}
