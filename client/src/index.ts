import { RemoteTelnet } from './RemoteTelnet';
import { socket } from './socket';
import { Terminal } from './Terminal';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';

const telnet = new RemoteTelnet(socket);
const terminal = new Terminal();

terminal.render(document.body);

const { user, server } = getQueryParams();
const [host, port] = server.split(':');
const pass = getPassword(user);

telnet.onConnected(() => telnet.send(`${user}\n${pass}\n \n \n`));
telnet.onData(data => terminal.write(data));

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
