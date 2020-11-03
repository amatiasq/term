import { Pattern } from './Pattern';
import { PatternMatcher } from './PatternMatcher';
import { PatternMatchSubscription } from './PatternMatchSubscription';
import { PatternOptions } from './PatternOptions';
import { PatternPromise } from './PatternPromise';
import { PatternResult } from './PatternResult';

export class TriggerCollection {
  private readonly patterns = new Set<PatternMatcher>();

  add(
    pattern: Pattern,
    handler: (result: PatternResult) => void,
    options?: PatternOptions,
  ): PatternMatchSubscription {
    const entry = new PatternMatcher(pattern, handler, options);
    this.patterns.add(entry);

    return {
      unsubscribe: () => this.patterns.delete(entry),
    };
  }

  once(pattern: Pattern, options?: PatternOptions) {
    return new PatternPromise<PatternResult>(resolve => {
      const subscription = this.add(pattern, onTrigger, options);

      function onTrigger(result: PatternResult) {
        subscription.unsubscribe();
        resolve(result);
      }
    });
  }

  process(text: string) {
    const splitted = text.split('\n');
    const last = splitted.pop() as string;
    const lines = [...splitted.map(x => `${x}\n`), last];

    for (const line of lines) {
      for (const pattern of this.patterns) {
        pattern.process(line);
      }
    }
  }
}
