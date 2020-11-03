export interface TriggerContext {}

export type TriggerHandler<T extends TriggerContext = TriggerContext> = (
  context: T,
) => void;
