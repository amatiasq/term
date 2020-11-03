import { TriggerContext } from './TriggerContext';
import {
  RegexPatternHandler,
  RegexPatternTrigger,
} from './RegexPatternTrigger';

export class TriggerCollection {
  private readonly patterns = new Set<RegexPatternTrigger>();

  constructor(private readonly context: TriggerContext) {}

  addPattern(pattern: RegExp, handler: RegexPatternHandler) {
    const fixed = fixGlobalRegex(pattern);
    const instance = new RegexPatternTrigger(fixed, handler);
    this.patterns.add(instance);
    return () => this.patterns.delete(instance);
  }

  expectPattern(pattern: RegExp, handler: RegexPatternHandler) {
    return new Promise(resolve => {
      const remove = this.addPattern(pattern, context => {
        remove();
        resolve();
        handler(context);
      });
    });
  }

  process(content: string) {
    for (const pattern of this.patterns) {
      if (pattern.test(content)) {
        console.log(`[EXECUTE] ${pattern.name} on ${content.substr(0, 100)}`);
        pattern.execute(this.context);
      }
    }
  }
}

function fixGlobalRegex(value: RegExp) {
  return value.global ? value : new RegExp(value.source, `${value.flags}g`);
}
