import { Mud } from './Mud';
import { RemoteTelnet } from './RemoteTelnet';
import { socket } from './socket';
import { Terminal } from './Terminal';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';

const { user, server } = getQueryParams();
const [host, port] = server.split(':');
const pass = getPassword(user);

const terminal = new Terminal();
const telnet = new RemoteTelnet(socket);

terminal.render(document.body);
terminal.write(`Connecting to ${host}:${port} as ${user}\n`);

telnet.onConnected(() => {
  const mud = new Mud(telnet);
  mud.login(user, pass);
  Object.assign(window, { mud });
});

telnet.onData(data => terminal.write(data));

socket.onConnected(() => {
  telnet.connect({ host, port: parseInt(port) });
  terminal.onSubmit(value => telnet.send(value));

  document.body.addEventListener('click', () => terminal.focus());

  window.onbeforeunload = () => {
    if (telnet.isConnected) {
      telnet.send('abandonar');
    }

    telnet.close();
  };
});
