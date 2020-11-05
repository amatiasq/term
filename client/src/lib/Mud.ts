import { emitter } from '@amatiasq/emitter';

import { login } from './login';
import { PluginContext } from './PluginContext';
import { initializePlugins, PluginMap } from './plugins/index';
import { RemoteTelnet } from './remote/RemoteTelnet';
import { TriggerCollection } from './triggers/TriggerCollection';
import { Context } from './workflow/Context';
import { Workflow } from './workflow/Workflow';
import { WorkflowNotFoundError } from './workflow/WorkflowNotFoundError';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly workflows: Record<string, Workflow> = {};
  private plugins!: PluginMap;
  private username!: string;

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  constructor(private readonly telnet: RemoteTelnet) {
    this.send = this.send.bind(this);
    this.invokeWorkflow = this.invokeWorkflow.bind(this);
    this.telnet.onData(x => this.triggers.process(removeNoise(x)));
  }

  async login(user: string, pass: string) {
    const context = new PluginContext('login', 'N/A', this.triggers, this.send);
    await login(context, user, pass);
    this.username = user;

    this.plugins = await initializePlugins(
      name => new PluginContext(name, user, this.triggers, this.send),
    );
  }

  send(text: string) {
    this.emitCommand(text);
    this.telnet.send(text);
  }

  getPlugin<Name extends keyof PluginMap>(name: Name): PluginMap[Name] {
    return this.plugins[name];
  }

  addWorkflow<Args extends any[]>(
    run: (context: Context, ...args: Args) => Promise<any> | void,
  ) {
    const workflow = new Workflow(run);
    this.workflows[workflow.name] = workflow as Workflow<any, any>;
    return workflow;
  }

  async invokeWorkflow(name: string, params: any[] = []) {
    if (!(name in this.workflows)) {
      throw new WorkflowNotFoundError(`Workflow ${name} is not registered.`);
    }

    const workflow = this.workflows[name];
    const context = this.createWorkflowContext(name);
    const result = await workflow.execute(context, ...params);
    context.dispose();
    return result;
  }

  private createWorkflowContext(name: string) {
    return new Context(
      name,
      this.username,
      this.triggers,
      this.plugins,
      this.send,
      this.invokeWorkflow,
    );
  }
}

function removeNoise(text: string) {
  return removeAsciiCodes(text).replace(/\r/g, '');
}

function removeAsciiCodes(text: string) {
  return text.replace(/\u001b\[.*?m/g, '');
}
