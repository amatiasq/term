import { RegexPatternHandler } from './triggers/RegexPatternTrigger';
import { TriggerCollection } from './triggers/TriggerCollection';

const genericTriggers: [RegExp, RegexPatternHandler][] = [
  [/^Tienes sed.$/, ({ send }) => send('beber')],
  [/^Estas realmente sediento.$/, ({ send }) => send('beber')],
  [/^Estas MUERTO de SED!$/, ({ send }) => send('beber')],
];

export function initTriggers(triggers: TriggerCollection) {
  for (const [pattern, handler] of genericTriggers) {
    triggers.addPattern(pattern, handler);
  }
}

export function initMachines(triggers: TriggerCollection) {}
