import { PluginContext } from '../engine/PluginContext';
import { PluginMap } from '../plugins/index';
import { TriggerCollection } from '../trigger/TriggerCollection';
import { MissingPluginError } from './MissingPluginError';

type WorkflowRunner = <T>(name: string, params: any[]) => Promise<T>;

export class Context extends PluginContext {
  readonly plugins: PluginMap;

  constructor(
    name: string,
    triggers: TriggerCollection,
    plugins: PluginMap,
    send: (command: string) => void,
    private readonly runWorkflow: WorkflowRunner,
  ) {
    super(`W(${name})`, triggers, send);
    this.plugins = createPluginsGetter(plugins, this.log.bind(this));
  }

  invokeWorkflow<T>(name: string, params: any[] = []) {
    this.log(`Invoke workflow ${name} with`, ...params);
    return this.runWorkflow<T>(name, params);
  }
}

function createPluginsGetter(source: PluginMap, log: Function) {
  return new Proxy(source, {
    get(target, key: string) {
      if (!(key in target)) {
        log(`Failed to get plugin ${key}`);
        throw new MissingPluginError(`Plugin ${key} is not registered.`);
      }

      log(`Requires plugin ${key}`);
      return target[key as keyof typeof target];
    },
  });
}
