import { emitter } from '@amatiasq/emitter';

import { Mud } from './lib/Mud';
import { RemoteTelnet } from './lib/remote/RemoteTelnet';
import { registerWorkflows } from './registerWorkflows';
import { socket } from './socket';
import { renderUserInterface } from './ui';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';

const { user, server } = getQueryParams();
const [host, port] = server.split(':');
const pass = getPassword(user);

const { terminal, controls } = renderUserInterface(document.body);
const telnet = new RemoteTelnet(socket);

terminal.write(`Connecting to ${host}:${port} as ${user}\n`);
telnet.onConnected(initializeMud);
telnet.onData(data => terminal.write(data));

socket.onConnected(() => {
  telnet.connect({ host, port: parseInt(port) });
  terminal.onSubmit(value => telnet.send(value));

  window.onbeforeunload = () => {
    if (telnet.isConnected) {
      telnet.send('abandonar');
    }

    telnet.close();
  };
});

function initializeMud() {
  const mud = new Mud(telnet);
  mud.login(user, pass);
  mud.onCommand(x => terminal.write(`${x}\n`));

  registerWorkflows(mud);
  connectStats();
  connectButtons();

  Object.assign(window, { mud });

  function connectStats() {
    const hp = emitter<number>();
    controls.addMeter('red', hp.subscribe);

    const mana = emitter<number>();
    controls.addMeter('blue', mana.subscribe);

    const mv = emitter<number>();
    controls.addMeter('green', mv.subscribe);

    mud.getPlugin('prompt').onUpdate(x => {
      hp(x.hp.percent);
      mana(x.mana.percent);
      mv(x.mv.percent);
    });
  }

  function connectButtons() {
    controls.addButton('Entrenar', () => mud.invokeWorkflow('train'));
  }
}
