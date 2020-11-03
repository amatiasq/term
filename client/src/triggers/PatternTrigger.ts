import { trimEnd } from '../util/trimEnd';
import { TriggerContext, TriggerHandler } from './TriggerContext';

const BUFFER_LENGTH = 100;

export type PatternContext = TriggerContext & { match: RegExpMatchArray };
export type PatternHandler = TriggerHandler<PatternContext>;

export class PatternTrigger {
  private history = '';

  get name() {
    return this.pattern.toString();
  }

  constructor(
    readonly pattern: RegExp,
    private readonly handler: PatternHandler,
  ) {}

  test(content: string) {
    this.history = updateBuffer(content, this.history, BUFFER_LENGTH);
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

function updateBuffer(content: string, buffer: string, length: number) {
  return content.length > length ? content : trimEnd(buffer + content, length);
}
