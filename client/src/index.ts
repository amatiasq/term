import { emitter } from '@amatiasq/emitter';
import { Mud } from './Mud';
import { RemoteTelnet } from './RemoteTelnet';
import { socket } from './socket';
import { renderUserInterface } from './ui';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';
import { train } from './scripts/train';

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

  document.body.addEventListener('click', () => terminal.focus());

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

  const hp = emitter<number>();
  controls.addMeter('red', hp.subscribe);

  const mana = emitter<number>();
  controls.addMeter('blue', mana.subscribe);

  const mv = emitter<number>();
  controls.addMeter('green', mv.subscribe);

  mud.get('stats').onUpdate(stats => {
    hp(stats.getPercent('hp'));
    mana(stats.getPercent('mana'));
    mv(stats.getPercent('mv'));
  });

  controls.addButton('Entrenar', () => mud.runScript(train));

  Object.assign(window, { mud });
}
