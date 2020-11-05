import { wait } from '../util/wait';
import { PatternMatchSubscription } from './PatternMatchSubscription';
import { PatternPromiseTimeoutError } from './PatternPromiseTimeoutError';

export class PatternPromise<T>
  extends Promise<T>
  implements PatternMatchSubscription {
  private forceReject!: (reason?: any) => void;

  constructor(
    executor: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    let _reject!: (reason?: any) => void;

    super((resolve, reject) => {
      _reject = reject;
      executor(resolve, reject);
    });

    this.forceReject = _reject;
  }

  timeout(seconds: number) {
    wait(seconds).then(() =>
      this.forceReject(new PatternPromiseTimeoutError()),
    );

    return this as Promise<T>;
  }

  wait(seconds: number) {
    return Promise.race([this, wait(seconds)]);
  }

  unsubscribe(): void {
    this.forceReject('aborted');
  }
}
