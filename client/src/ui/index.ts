import { Hamburger } from './Hamburger';
import './index.css';

import { Controls } from './Controls';
import { Sidebar } from './Sidebar';
import { Terminal } from './Terminal';
import { renderHtml } from '../util/renderHtml';

import html from './index.html';
import './index.css';

export function renderUserInterface(parent: HTMLElement) {
  const fragment = renderHtml(html);
  const main = fragment.querySelector('.container') as HTMLElement;

  const sidebar = new Sidebar();
  sidebar.render(main);

  const controls = new Controls();
  controls.render(main);

  const terminal = new Terminal();
  terminal.render(main);

  parent.appendChild(fragment);

  const hamburger = new Hamburger('ui:controls-visible');

  hamburger.onChange(x =>
    x
      ? main.classList.add('show-controls')
      : main.classList.remove('show-controls'),
  );

  hamburger.render(parent);

  return { controls, sidebar, terminal };
}
