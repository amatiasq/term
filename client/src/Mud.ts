import { emitter } from '@amatiasq/emitter';
import { ChatMachine } from './machines/ChatMachine';

import { DrinkMachine } from './machines/Drink';
import { InventoryMachine } from './machines/InventoryMachine';
import { LoginMachine } from './machines/Login';
import { NavigationMachine } from './machines/NavigationMachine';
import { StatsMachine } from './machines/StatsMachine';
import { TrainMachine } from './machines/Train';
import { RemoteTelnet } from './RemoteTelnet';
import { PatternContext, PatternHandler } from './triggers/PatternTrigger';
import { TriggerCollection } from './triggers/TriggerCollection';
import { TriggerOptions } from './triggers/TriggerOptions';
import { wait } from './util/wait';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly machines = {
    chat: new ChatMachine(this),
    drink: new DrinkMachine(this),
    inventory: new InventoryMachine(this),
    navigation: new NavigationMachine(this),
    stats: new StatsMachine(this),
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

    this.initTriggers();
    this.initMachines();
  }

  async train() {
    const train = new TrainMachine(this);
    await train.start();
    console.log('train over');
  }

  when(
    pattern: RegExp | string,
    handler: PatternHandler,
    options?: TriggerOptions,
  ) {
    return this.triggers.add(pattern, handler, options);
  }

  expect(
    pattern: RegExp | string,
    options?: TriggerOptions & { timeout?: number },
  ) {
    const result = this.triggers.expect(pattern, options);

    if (!options || !options.timeout) {
      return result;
    }

    return new Promise<PatternContext>((resolve, reject) => {
      result.then(resolve, reject);
      wait(options.timeout!).then(reject);
    });
  }

  send(text: string) {
    this.emitCommand(text);
    this.telnet.send(text);
  }

  get<Key extends keyof Mud['machines']>(key: Key): Mud['machines'][Key] {
    return this.machines[key];
  }

  runScript(script: () => Promise<void>): void {}

  private initTriggers() {
    this.when('Desapareces en la nada.', () => this.send('mirar'));
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
