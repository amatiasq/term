import { InventoryMachine } from './machines/InventoryMachine';
import { emitter } from '@amatiasq/emitter';

import { DrinkMachine } from './machines/Drink';
import { LoginMachine } from './machines/Login';
import { RemoteTelnet } from './RemoteTelnet';
import { PatternHandler } from './triggers/PatternTrigger';
import { TriggerCollection } from './triggers/TriggerCollection';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly machines = {
    inventory: new InventoryMachine(this),
    drink: new DrinkMachine(this),
  };

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  constructor(private readonly telnet: RemoteTelnet) {
    this.telnet.onData(x => this.triggers.process(removeNoise(x)));
  }

  async login(user: string, pass: string) {
    const login = new LoginMachine(this);
    await login.start(user, pass);
    console.log(`Logged in as ${user}`);

    this.initMachines();
  }

  when(pattern: RegExp | string, handler: PatternHandler) {
    return this.triggers.add(pattern, handler);
  }

  expect(pattern: RegExp | string) {
    return this.triggers.expect(pattern);
  }

  send(text: string) {
    this.emitCommand(text);
    this.telnet.send(text);
  }

  get<Key extends keyof Mud['machines']>(key: Key): Mud['machines'][Key] {
    return this.machines[key];
  }

  private initMachines() {
    Object.values(this.machines).forEach(x => x.start());
  }
}

function removeNoise(text: string) {
  return removeAsciiCodes(text).replace(/\r/g, '');
}

function removeAsciiCodes(text: string) {
  return text.replace(/\u001b\[.*?m/g, '');
}
