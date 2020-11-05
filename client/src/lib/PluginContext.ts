import bindAll from 'lodash.bindall';
import { ExecutionAbortedError } from './ExecutionAbortedError';

import { Pattern } from './triggers/Pattern';
import { PatternMatchSubscription } from './triggers/PatternMatchSubscription';
import { PatternOptions } from './triggers/PatternOptions';
import { PatternResult } from './triggers/PatternResult';
import { TriggerCollection } from './triggers/TriggerCollection';
import { wait } from './util/wait';

export class PluginContext {
  protected readonly subscriptions: PatternMatchSubscription[] = [];
  private _printLogs = false;
  private isAborted = false;

  constructor(
    readonly name: string,
    readonly username: string,
    protected readonly triggers: TriggerCollection,
    protected readonly send: (command: string) => void,
  ) {
    bindAll(this, ['write', 'watch', 'waitFor', 'sleep', 'printLogs', 'log']);
  }

  write(command: string) {
    this.checkNotAborted();
    this.log(`[WRITE]`, command);
    this.send(command);
  }

  watch(
    pattern: Pattern,
    handler: (result: PatternResult) => void,
    options?: PatternOptions & { keepAlive?: true },
  ) {
    this.checkNotAborted();
    this.log('[WATCH]', pattern);
    const subscription = this.triggers.add(pattern, handler, options);

    if (options && options.keepAlive != true) {
      this.subscriptions.push(subscription);
    }

    return subscription;
  }

  waitFor(pattern: Pattern, options?: PatternOptions) {
    this.checkNotAborted();
    this.log('[WAIT]', pattern);
    return this.triggers.once(pattern, options);
  }

  sleep(seconds: number) {
    this.checkNotAborted();
    this.log('[SLEEP]', seconds);
    return wait(seconds);
  }

  abort() {
    this.isAborted = true;
  }

  dispose() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  printLogs() {
    this._printLogs = true;
  }

  log(...args: Parameters<Console['log']>) {
    this.checkNotAborted();
    if (this._printLogs) {
      console.log(`[${this.name}]`, ...args);
    }
  }

  protected checkNotAborted() {
    if (this.isAborted) {
      throw new ExecutionAbortedError();
    }
  }
}
