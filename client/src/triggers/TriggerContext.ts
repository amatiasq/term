export interface TriggerContext {
  send(text: string): void;
}

export type TriggerHandler<T = {}> = (context: TriggerContext & T) => void;
