import { trimEnd } from '../util/trimEnd';
import { TriggerContext, TriggerHandler } from './TriggerContext';

const BUFFER_LENGTH = 100;

export type RegexPatternHandler = TriggerHandler<{ match: RegExpMatchArray }>;

export class RegexPatternTrigger {
  private history = '';

  get name() {
    return this.pattern.toString();
  }

  constructor(
    readonly pattern: RegExp,
    private readonly handler: RegexPatternHandler,
  ) {}

  test(content: string) {
    this.history = trimEnd(this.history + content, BUFFER_LENGTH);
    return this.pattern.test(this.history);
  }

  execute(context: TriggerContext) {
    // FIXME: stupid bug requires this
    this.history.match(this.pattern);

    for (const match of this.history.matchAll(this.pattern)) {
      const a = match.groups;

      this.handler({ ...context, match });
    }

    this.history = '';
  }
}
