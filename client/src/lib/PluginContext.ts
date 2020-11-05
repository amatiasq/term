import { Pattern } from './triggers/Pattern';
import { PatternMatchSubscription } from './triggers/PatternMatchSubscription';
import { PatternOptions } from './triggers/PatternOptions';
import { PatternResult } from './triggers/PatternResult';
import { TriggerCollection } from './triggers/TriggerCollection';
import { wait } from './util/wait';

export class PluginContext {
  protected readonly subscriptions: PatternMatchSubscription[] = [];

  printLogs = false;

  constructor(
    readonly name: string,
    readonly username: string,
    protected readonly triggers: TriggerCollection,
    protected readonly send: (command: string) => void,
  ) {}

  write(command: string) {
    this.log(`[WRITE]`, command);
    this.send(command);
  }

  watch(
    pattern: Pattern,
    handler: (result: PatternResult) => void,
    options?: PatternOptions & { keepAlive?: true },
  ) {
    this.log('[WATCH]', pattern);
    const subscription = this.triggers.add(pattern, handler, options);

    if (options && options.keepAlive === true) {
      this.subscriptions.push(subscription);
    }

    return subscription;
  }

  waitFor(pattern: Pattern, options?: PatternOptions) {
    this.log('[WAIT]', pattern);
    return this.triggers.once(pattern, options);
  }

  sleep(seconds: number) {
    this.log('[SLEEP]', seconds);
    return wait(seconds);
  }

  dispose() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  log(...args: Parameters<Console['log']>) {
    if (this.printLogs) {
      console.log(`[${this.name}]`, ...args);
    }
  }
}
