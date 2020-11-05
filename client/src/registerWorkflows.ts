import { Mud } from './lib/Mud';
import { drink } from './workflows/drink';
import { train } from './workflows/train';

export function registerWorkflows(mud: Mud) {
  mud.addWorkflow(drink);
  mud.addWorkflow(train);
}
