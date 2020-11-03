import { Pattern } from '../trigger/Pattern';
import { PatternMatchSubscription } from '../trigger/PatternMatchSubscription';
import { PatternOptions } from '../trigger/PatternOptions';
import { PatternResult } from '../trigger/PatternResult';
import { TriggerCollection } from '../trigger/TriggerCollection';
import { wait } from '../util/wait';

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
    options?: PatternOptions,
  ) {
    this.log('[WATCH]', pattern);
    const subscription = this.triggers.add(pattern, handler, options);
    this.subscriptions.push(subscription);
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
