import { PluginContext } from '../engine/PluginContext';
import { chatPlugin } from './ChatPlugin';
import { inventoryPlugin } from './InventoryPlugin';
import { navigationPlugin } from './NavigationPlugin';
import { promptPlugin } from './PromptPlugin';

export type PluginMap = ReturnType<typeof initializePlugins>;

export function initializePlugins(
  createContext: (name: string) => PluginContext,
) {
  return {
    chat: chatPlugin(createContext('chat')),
    inventory: inventoryPlugin(createContext('inventory')),
    navigation: navigationPlugin(createContext('navigation')),
    prompt: promptPlugin(createContext('prompt')),
  };
}
