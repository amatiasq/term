import { TriggerContext } from './TriggerContext';
import {
  PatternContext,
  PatternHandler,
  PatternTrigger,
} from './PatternTrigger';

export class TriggerCollection {
  private readonly patterns = new Set<PatternTrigger>();
  private readonly context = {};

  add(pattern: RegExp | string, handler: PatternHandler) {
    const fixed = normalizeToRegex(pattern);
    const instance = new PatternTrigger(fixed, handler);
    this.patterns.add(instance);
    return () => this.patterns.delete(instance);
  }

  expect(pattern: RegExp | string) {
    const fixed = normalizeToRegex(pattern);
    return new Promise<PatternContext>(resolve => {
      const remove = this.add(fixed, context => {
        remove();
        resolve(context);
      });
    });
  }

  process(content: string) {
    for (const pattern of this.patterns) {
      if (pattern.test(content)) {
        console.log(`[EXECUTE] ${pattern.name}`);
        pattern.execute(this.context);
      }
    }
  }
}

function normalizeToRegex(value: RegExp | string) {
  if (typeof value === 'string') {
    value = toRegex(value);
  }

  return fixGlobalRegex(value);
}

function toRegex(value: string) {
  return new RegExp(escapeRegex(value), 'g');
}

function fixGlobalRegex(value: RegExp) {
  return value.global ? value : new RegExp(value.source, `${value.flags}g`);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
